import type { CopiedStrategySnapshot } from './api';

export const COPIED_STRATEGIES_STORAGE_KEY = 'pardnafi_copied_strategies_v1';

type SnapshotInput = Omit<CopiedStrategySnapshot, 'id'> & {
  id?: string;
};

function createSnapshotId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `copied-strategy-${Date.now()}`;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readSnapshots(): CopiedStrategySnapshot[] {
  if (!canUseStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(COPIED_STRATEGIES_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as CopiedStrategySnapshot[];
  } catch {
    return [];
  }
}

function writeSnapshots(snapshots: CopiedStrategySnapshot[]) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(COPIED_STRATEGIES_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown localStorage failure.';
    throw new Error(`Unable to persist copied strategies locally. ${message}`);
  }
}

function assertSnapshotInput(snapshot: SnapshotInput): asserts snapshot is SnapshotInput {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('A copied strategy snapshot payload is required.');
  }

  if (!snapshot.strategy_id || !snapshot.strategy_name || !snapshot.protocol || !snapshot.network) {
    throw new Error('Copied strategy snapshot is missing identity fields.');
  }

  if (!Number.isInteger(snapshot.registry_id) || snapshot.registry_id <= 0) {
    throw new Error('Copied strategy snapshot is missing a valid registry_id.');
  }

  if (snapshot.selected_horizon !== 30 && snapshot.selected_horizon !== 90 && snapshot.selected_horizon !== 180) {
    throw new Error('Copied strategy snapshot is missing a valid selected_horizon.');
  }

  if (!snapshot.copied_at) {
    throw new Error('Copied strategy snapshot is missing copied_at.');
  }
}

function mutateSnapshot(
  snapshotId: string,
  updater: (snapshot: CopiedStrategySnapshot) => CopiedStrategySnapshot,
): boolean {
  const snapshots = readSnapshots();
  const found = snapshots.some((snapshot) => snapshot.id === snapshotId);
  if (!found) {
    return false;
  }

  const nextSnapshots = snapshots.map((snapshot) => (snapshot.id === snapshotId ? updater(snapshot) : snapshot));
  writeSnapshots(nextSnapshots);
  return true;
}

export function saveCopiedStrategySnapshot(snapshot: SnapshotInput): string {
  assertSnapshotInput(snapshot);

  const snapshotId = snapshot.id ?? createSnapshotId();
  const snapshots = readSnapshots();
  writeSnapshots(
    [{ ...snapshot, id: snapshotId }, ...snapshots].sort(
      (left, right) => Date.parse(right.copied_at) - Date.parse(left.copied_at),
    ),
  );
  return snapshotId;
}

export function updateCopiedStrategyTxHash(snapshotId: string, txHash: string, walletAddress?: string): boolean {
  return mutateSnapshot(snapshotId, (snapshot) => ({
    ...snapshot,
    tx_hash: txHash,
    wallet_address: walletAddress ?? snapshot.wallet_address,
    onchain_proof_status: 'confirmed',
    onchain_proof_error: undefined,
  }));
}

export function markOnchainProofPending(snapshotId: string, walletAddress?: string): boolean {
  return mutateSnapshot(snapshotId, (snapshot) => ({
    ...snapshot,
    wallet_address: walletAddress ?? snapshot.wallet_address,
    onchain_proof_status: 'pending',
    onchain_proof_error: undefined,
  }));
}

export function markOnchainProofFailed(snapshotId: string, error: string): boolean {
  return mutateSnapshot(snapshotId, (snapshot) => ({
    ...snapshot,
    onchain_proof_status: 'failed',
    onchain_proof_error: error,
  }));
}

export function listCopiedStrategySnapshots(): CopiedStrategySnapshot[] {
  return readSnapshots().sort((left, right) => Date.parse(right.copied_at) - Date.parse(left.copied_at));
}
