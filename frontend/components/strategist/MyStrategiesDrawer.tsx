'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CopiedStrategySnapshot } from '../../lib/api';
import { getConfiguredProofNetwork, getExplorerTxUrl } from '../../lib/contract';
import { listCopiedStrategySnapshots } from '../../lib/storage';

type MyStrategiesDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onRetry: (snapshot: CopiedStrategySnapshot) => void | Promise<void>;
  retryingSnapshotId?: string | null;
  highlightSnapshotId?: string | null;
  refreshToken?: number;
};

function statusClass(status: CopiedStrategySnapshot['onchain_proof_status']) {
  if (status === 'confirmed') return 'strategist-badge strategist-badge-positive';
  if (status === 'failed') return 'strategist-badge strategist-badge-danger';
  return 'strategist-badge strategist-badge-neutral';
}

function statusLabel(status: CopiedStrategySnapshot['onchain_proof_status']) {
  if (status === 'confirmed') return 'Proof confirmed';
  if (status === 'failed') return 'Proof failed';
  return 'Proof pending';
}

function formatCopiedAt(value: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function MyStrategiesDrawer({
  isOpen,
  onClose,
  onRetry,
  retryingSnapshotId,
  highlightSnapshotId,
  refreshToken = 0,
}: MyStrategiesDrawerProps) {
  const [snapshots, setSnapshots] = useState<CopiedStrategySnapshot[]>([]);
  const proofNetwork = getConfiguredProofNetwork();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSnapshots(listCopiedStrategySnapshots());
  }, [isOpen, refreshToken]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const rows = useMemo(() => snapshots, [snapshots]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="strategist-overlay" role="presentation">
      <button type="button" className="strategist-overlay-dismiss" aria-label="Close My Strategies drawer" onClick={onClose} />
      <aside className="strategist-drawer" role="dialog" aria-modal="true" aria-labelledby="my-strategies-title">
        <div className="strategist-sheet-header">
          <div>
            <p className="strategist-kicker text-brand-blue">Local activity</p>
            <h2 id="my-strategies-title" className="mt-1 text-2xl font-semibold text-brand-ink">
              My Strategies
            </h2>
            <p className="mt-2 text-sm strategist-quiet">
              Saved strategy decisions stay local first. Confirmed rows include the onchain proof link for the configured proof network.
            </p>
          </div>
          <button type="button" className="strategist-button-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="strategist-divider" />
        <div className="strategist-drawer-content">
          {rows.length === 0 ? (
            <div className="strategist-empty-state">
              <p className="text-sm font-medium text-brand-ink">No copied strategies have been saved yet.</p>
              <p className="mt-1 text-sm strategist-quiet">Use Copy Strategy from inspect to create the first local snapshot and record proof onchain.</p>
            </div>
          ) : (
            rows.map((snapshot) => {
              const explorerUrl = snapshot.tx_hash ? getExplorerTxUrl(snapshot.tx_hash, proofNetwork) : null;
              const isHighlighted = snapshot.id === highlightSnapshotId;
              const isRetrying = snapshot.id === retryingSnapshotId;

              return (
                <article
                  key={snapshot.id}
                  className={[
                    'strategist-drawer-row',
                    isHighlighted ? 'strategist-drawer-row-highlighted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-brand-ink">{snapshot.strategy_name}</span>
                        <span className="strategist-badge strategist-badge-neutral">{snapshot.protocol}</span>
                        <span className="strategist-badge strategist-badge-neutral">{snapshot.network}</span>
                        <span className={statusClass(snapshot.onchain_proof_status)}>{statusLabel(snapshot.onchain_proof_status)}</span>
                      </div>
                      <dl className="strategist-detail-grid text-sm">
                        <div>
                          <dt className="strategist-quiet">Copied</dt>
                          <dd className="mt-1 font-medium text-brand-ink">{formatCopiedAt(snapshot.copied_at)}</dd>
                        </div>
                        <div>
                          <dt className="strategist-quiet">Horizon</dt>
                          <dd className="mt-1 font-medium text-brand-ink">{snapshot.selected_horizon} day</dd>
                        </div>
                        <div>
                          <dt className="strategist-quiet">Expected return</dt>
                          <dd className="mt-1 font-medium text-brand-green">{snapshot.expected_return}</dd>
                        </div>
                      </dl>
                      {snapshot.onchain_proof_error ? (
                        <p className="text-sm text-brand-red">{snapshot.onchain_proof_error}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3 md:justify-end">
                      {explorerUrl ? (
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="strategist-button-ghost">
                          View explorer proof
                        </a>
                      ) : null}
                      {snapshot.onchain_proof_status === 'failed' ? (
                        <button
                          type="button"
                          className="strategist-button-secondary"
                          onClick={() => onRetry(snapshot)}
                          disabled={isRetrying}
                        >
                          {isRetrying ? 'Retrying…' : 'Retry onchain proof'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
