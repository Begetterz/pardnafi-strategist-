'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CopiedStrategySnapshot, InspectResponse } from '../lib/api';
import {
  copyStrategyOnchain,
  getConfiguredProofNetwork,
  getConnectedWalletAddress,
  getExplorerTxUrl,
} from '../lib/contract';
import {
  listCopiedStrategySnapshots,
  markOnchainProofFailed,
  markOnchainProofPending,
  saveCopiedStrategySnapshot,
  updateCopiedStrategyTxHash,
} from '../lib/storage';
import MyStrategiesDrawer from './strategist/MyStrategiesDrawer';

type CopyStrategyButtonProps = {
  inspect: Pick<
    InspectResponse,
    | 'strategy_id'
    | 'registry_id'
    | 'strategy_name'
    | 'protocol'
    | 'network'
    | 'selected_horizon'
    | 'expected_return'
    | 'current_risk_level'
    | 'selected_live_metrics'
    | 'simulation'
    | 'explanation'
    | 'assumptions'
  >;
  disabled?: boolean;
  disabledReason?: string | null;
};

type FlowState =
  | 'idle'
  | 'confirm_open'
  | 'saving_local'
  | 'awaiting_wallet'
  | 'tx_pending'
  | 'tx_confirmed'
  | 'tx_failed';

function createSnapshotId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `strategy-${Date.now()}`;
}

function truncateHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function humanizeMetricKey(metricKey: string) {
  return metricKey
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildSnapshot(
  inspect: CopyStrategyButtonProps['inspect'],
  walletAddress?: string,
): CopiedStrategySnapshot {
  return {
    id: createSnapshotId(),
    strategy_id: inspect.strategy_id,
    registry_id: inspect.registry_id,
    strategy_name: inspect.strategy_name,
    protocol: inspect.protocol,
    network: inspect.network,
    selected_horizon: inspect.selected_horizon,
    expected_return: inspect.expected_return,
    current_risk_level: inspect.current_risk_level,
    selected_live_metrics: { ...inspect.selected_live_metrics },
    simulation_snapshot: inspect.simulation,
    explanation_snapshot: inspect.explanation,
    copied_at: new Date().toISOString(),
    wallet_address: walletAddress,
    onchain_proof_status: 'pending',
  };
}

function latestSnapshotById(snapshotId: string | null) {
  if (!snapshotId) {
    return undefined;
  }

  return listCopiedStrategySnapshots().find((snapshot) => snapshot.id === snapshotId);
}

function getInspectEligibilityReason(inspect: CopyStrategyButtonProps['inspect']) {
  if (!inspect.strategy_name || !inspect.protocol || !inspect.network) {
    return 'Strategy identity is incomplete, so this evaluated state cannot be copied yet.';
  }

  if (!inspect.expected_return) {
    return 'Expected return is missing from the evaluated payload, so copy is blocked.';
  }

  if (!Number.isInteger(inspect.registry_id) || inspect.registry_id <= 0) {
    return 'A valid registry ID is required before this strategy can be copied.';
  }

  return null;
}

export default function CopyStrategyButton({ inspect, disabled = false, disabledReason }: CopyStrategyButtonProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [retryingSnapshotId, setRetryingSnapshotId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const submitInFlightRef = useRef(false);
  const proofNetwork = getConfiguredProofNetwork();

  const explorerUrl = useMemo(() => {
    if (!latestTxHash) {
      return null;
    }

    return getExplorerTxUrl(latestTxHash, proofNetwork);
  }, [latestTxHash, proofNetwork]);

  useEffect(() => {
    if (!isSheetOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (
          flowState === 'saving_local' ||
          flowState === 'awaiting_wallet' ||
          flowState === 'tx_pending'
        ) {
          return;
        }

        setIsSheetOpen(false);
        setFlowState('idle');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [flowState, isSheetOpen]);

  const inspectEligibilityReason = getInspectEligibilityReason(inspect);
  const copyBlocked = disabled || Boolean(inspectEligibilityReason);
  const effectiveDisabledReason = copyBlocked
    ? disabledReason ?? inspectEligibilityReason ?? 'A valid evaluated state is required before this strategy can be copied.'
    : null;
  const sheetBusy =
    flowState === 'saving_local' ||
    flowState === 'awaiting_wallet' ||
    flowState === 'tx_pending';

  function dismissSheet() {
    if (sheetBusy) {
      return;
    }

    setIsSheetOpen(false);
    setFlowState('idle');
  }

  async function runOnchainProof(snapshotId: string, registryId: number) {
    setFlowState('awaiting_wallet');
    setFeedbackError(null);

    try {
      setFlowState('tx_pending');
      const { txHash } = await copyStrategyOnchain(registryId);
      const connectedWallet = await getConnectedWalletAddress().catch(() => undefined);
      updateCopiedStrategyTxHash(snapshotId, txHash, connectedWallet);
      setWalletAddress(connectedWallet);
      setLatestTxHash(txHash);
      setFlowState('tx_confirmed');
      setRefreshToken((value) => value + 1);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to record proof onchain.';
      markOnchainProofFailed(snapshotId, message);
      setFeedbackError(message);
      setFlowState('tx_failed');
      setRefreshToken((value) => value + 1);
      return false;
    } finally {
      submitInFlightRef.current = false;
    }
  }

  async function handleConfirmCopy() {
    if (submitInFlightRef.current || copyBlocked) {
      return;
    }

    submitInFlightRef.current = true;
    setFlowState('saving_local');
    setFeedbackError(null);
    setLatestTxHash(null);

    try {
      const connectedWallet = await getConnectedWalletAddress().catch(() => undefined);
      const snapshot = buildSnapshot(inspect, connectedWallet);
      const snapshotId = saveCopiedStrategySnapshot(snapshot);

      setWalletAddress(connectedWallet);
      setActiveSnapshotId(snapshotId);
      setRefreshToken((value) => value + 1);

      await runOnchainProof(snapshotId, inspect.registry_id);
    } catch (error) {
      submitInFlightRef.current = false;
      setFlowState('tx_failed');
      setFeedbackError(error instanceof Error ? error.message : 'Unable to save the strategy locally.');
    }
  }

  async function retryOnchainProof(snapshot: CopiedStrategySnapshot) {
    if (submitInFlightRef.current) {
      return;
    }

    submitInFlightRef.current = true;
    setRetryingSnapshotId(snapshot.id);
    setActiveSnapshotId(snapshot.id);
    setLatestTxHash(snapshot.tx_hash ?? null);
    setIsSheetOpen(true);
    setFlowState('confirm_open');

    try {
      const connectedWallet = await getConnectedWalletAddress().catch(() => undefined);
      markOnchainProofPending(snapshot.id, connectedWallet);
      setWalletAddress(connectedWallet);
      setRefreshToken((value) => value + 1);

      await runOnchainProof(snapshot.id, snapshot.registry_id);
    } catch (error) {
      submitInFlightRef.current = false;
      setFlowState('tx_failed');
      setFeedbackError(error instanceof Error ? error.message : 'Unable to retry the onchain proof.');
    } finally {
      setRetryingSnapshotId(null);
    }
  }

  const latestSnapshot = latestSnapshotById(activeSnapshotId);

  return (
    <>
      <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
        <p className="strategist-kicker text-brand-blue">Decision record</p>
        <h2 className="mt-2 text-xl font-semibold text-brand-ink">Copy this evaluated strategy state.</h2>
        <p className="mt-3 text-sm leading-6 strategist-quiet">
          Save this evaluated strategy and record proof onchain. This does not move funds. This records your decision only.
        </p>
        {effectiveDisabledReason ? <p className="mt-3 text-sm text-brand-amber">{effectiveDisabledReason}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="strategist-button"
            onClick={() => {
              if (copyBlocked) {
                return;
              }
              setIsSheetOpen(true);
              setFlowState('confirm_open');
              setFeedbackError(null);
            }}
            disabled={copyBlocked}
          >
            Copy Strategy
          </button>
          <button type="button" className="strategist-button-ghost" onClick={() => setIsDrawerOpen(true)}>
            My Strategies
          </button>
        </div>
      </section>

      {isSheetOpen ? (
        <div className="strategist-overlay" role="presentation">
          <button type="button" className="strategist-overlay-dismiss" aria-label="Close copy strategy sheet" onClick={dismissSheet} />
          <aside className="strategist-sheet" role="dialog" aria-modal="true" aria-labelledby="copy-strategy-title">
            <div className="strategist-sheet-header">
              <div>
                <p className="strategist-kicker text-brand-blue">Decision recording</p>
                <h2 id="copy-strategy-title" className="mt-1 text-2xl font-semibold text-brand-ink">
                  Copy Strategy
                </h2>
                <p className="mt-2 text-sm strategist-quiet">
                  Save this evaluated strategy and record proof onchain. This does not move funds. This records your decision only.
                </p>
              </div>
              <button type="button" className="strategist-button-ghost" onClick={dismissSheet} disabled={sheetBusy}>
                Close
              </button>
            </div>

            <div className="strategist-divider" />

            <div className="strategist-sheet-content strategist-stack">
              <section className="strategist-panel strategist-panel-contrast p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="strategist-badge strategist-badge-neutral">{inspect.protocol}</span>
                  <span className="strategist-badge strategist-badge-neutral">{inspect.network}</span>
                  <span className="strategist-badge strategist-badge-neutral">{inspect.current_risk_level}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-brand-ink">{inspect.strategy_name}</h3>
                <dl className="mt-4 strategist-detail-grid text-sm">
                  <div>
                    <dt className="strategist-quiet">Selected horizon</dt>
                    <dd className="mt-1 font-medium text-brand-ink">{inspect.selected_horizon} day</dd>
                  </div>
                  <div>
                    <dt className="strategist-quiet">Expected return</dt>
                    <dd className="mt-1 font-medium text-brand-green">{inspect.expected_return}</dd>
                  </div>
                  <div>
                    <dt className="strategist-quiet">Registry ID</dt>
                    <dd className="mt-1 font-medium text-brand-ink">{inspect.registry_id}</dd>
                  </div>
                  <div>
                    <dt className="strategist-quiet">Proof network</dt>
                    <dd className="mt-1 font-medium text-brand-ink">{proofNetwork}</dd>
                  </div>
                </dl>
              </section>

              <section className="strategist-panel strategist-panel-contrast p-5">
                <p className="text-sm font-semibold text-brand-ink">Live metric overrides</p>
                <div className="mt-4 strategist-sheet-list">
                  {Object.keys(inspect.selected_live_metrics).length > 0 ? (
                    Object.entries(inspect.selected_live_metrics).map(([key, value]) => (
                      <div key={key} className="strategist-detail-row">
                        <span className="strategist-quiet">{humanizeMetricKey(key)}</span>
                        <span className="font-medium text-brand-ink">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm strategist-quiet">No live overrides are active in this evaluated state.</p>
                  )}
                </div>
                {inspect.assumptions.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-brand-ink">Assumptions</p>
                    <ul className="mt-3 strategist-bullet-list text-sm strategist-quiet">
                      {inspect.assumptions.map((assumption) => (
                        <li key={assumption}>{assumption}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              {flowState === 'tx_confirmed' ? (
                <section className="strategist-status-panel strategist-status-panel-success">
                  <p className="text-sm font-semibold text-brand-green">Strategy copied successfully</p>
                  <h3 className="mt-2 text-xl font-semibold text-brand-ink">Decision recorded onchain</h3>
                  {latestTxHash ? <p className="mt-3 strategist-inline-code">{truncateHash(latestTxHash)}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {explorerUrl ? (
                      <a href={explorerUrl} target="_blank" rel="noreferrer" className="strategist-button-secondary">
                        View explorer proof
                      </a>
                    ) : null}
                    <button type="button" className="strategist-button-ghost" onClick={() => setIsDrawerOpen(true)}>
                      View My Strategies
                    </button>
                  </div>
                </section>
              ) : null}

              {flowState === 'tx_failed' ? (
                <section className="strategist-status-panel strategist-status-panel-failure">
                  <p className="text-sm font-semibold text-brand-red">Strategy saved locally, but onchain recording failed</p>
                  <h3 className="mt-2 text-xl font-semibold text-brand-ink">Retry onchain proof</h3>
                  <p className="mt-2 text-sm strategist-quiet">{feedbackError ?? latestSnapshot?.onchain_proof_error ?? 'The wallet write did not complete.'}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {latestSnapshot ? (
                      <button type="button" className="strategist-button-secondary" onClick={() => retryOnchainProof(latestSnapshot)}>
                        Retry onchain proof
                      </button>
                    ) : null}
                    <button type="button" className="strategist-button-ghost" onClick={() => setIsDrawerOpen(true)}>
                      View My Strategies
                    </button>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="strategist-divider" />

            <div className="strategist-sheet-actions">
              <div className="text-sm strategist-quiet">
                {walletAddress ? `Wallet: ${walletAddress}` : 'Wallet will be requested by the injected provider when you confirm the copy.'}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="strategist-button-ghost" onClick={dismissSheet} disabled={sheetBusy}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="strategist-button"
                  onClick={handleConfirmCopy}
                  disabled={flowState === 'saving_local' || flowState === 'awaiting_wallet' || flowState === 'tx_pending' || flowState === 'tx_confirmed'}
                >
                  {flowState === 'saving_local'
                    ? 'Saving locally…'
                    : flowState === 'awaiting_wallet'
                      ? 'Awaiting wallet…'
                      : flowState === 'tx_pending'
                        ? 'Recording onchain…'
                        : 'Confirm Copy'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <MyStrategiesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRetry={retryOnchainProof}
        retryingSnapshotId={retryingSnapshotId}
        highlightSnapshotId={activeSnapshotId}
        refreshToken={refreshToken}
      />
    </>
  );
}
