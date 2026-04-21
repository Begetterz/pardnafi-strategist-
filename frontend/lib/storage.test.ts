import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CopiedStrategySnapshot } from './api';
import {
  COPIED_STRATEGIES_STORAGE_KEY,
  listCopiedStrategySnapshots,
  markOnchainProofFailed,
  saveCopiedStrategySnapshot,
  updateCopiedStrategyTxHash,
} from './storage';

function makeSnapshot(overrides: Partial<CopiedStrategySnapshot> = {}): CopiedStrategySnapshot {
  return {
    id: 'snapshot-1',
    strategy_id: 'venus-usdt-stability',
    registry_id: 11,
    strategy_name: 'Stable Lending Strategy',
    protocol: 'Venus',
    network: 'BSC',
    selected_horizon: 90,
    expected_return: '+2.18%',
    current_risk_level: 'Low risk',
    selected_live_metrics: { utilization: 48 },
    simulation_snapshot: {
      selected_horizon: 90,
      scenarios: [
        { horizon: 30, projected_return: '+0.67%' },
        { horizon: 90, projected_return: '+2.18%' },
        { horizon: 180, projected_return: '+4.44%' },
      ],
    },
    explanation_snapshot: [
      { id: 'why-it-ranks-here', title: 'Why it ranks here', body: 'Because it is stable.' },
    ],
    copied_at: '2026-04-21T10:00:00.000Z',
    onchain_proof_status: 'pending',
    ...overrides,
  };
}

describe('storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves a full snapshot and returns a generated id when one is not supplied', () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('generated-snapshot-id');
    const snapshot = makeSnapshot({ id: undefined as unknown as string });
    delete (snapshot as Partial<CopiedStrategySnapshot>).id;

    const id = saveCopiedStrategySnapshot(snapshot);

    expect(id).toBe('generated-snapshot-id');
    expect(listCopiedStrategySnapshots()).toEqual([
      expect.objectContaining({
        id: 'generated-snapshot-id',
        strategy_id: 'venus-usdt-stability',
        registry_id: 11,
      }),
    ]);
  });

  it('stores newest snapshots first', () => {
    saveCopiedStrategySnapshot(makeSnapshot({ id: 'older', copied_at: '2026-04-20T10:00:00.000Z' }));
    saveCopiedStrategySnapshot(makeSnapshot({ id: 'newer', copied_at: '2026-04-21T10:00:00.000Z' }));

    expect(listCopiedStrategySnapshots().map((snapshot) => snapshot.id)).toEqual(['newer', 'older']);
  });

  it('updates only the matching snapshot tx hash and marks it confirmed', () => {
    saveCopiedStrategySnapshot(makeSnapshot({ id: 'first' }));
    saveCopiedStrategySnapshot(makeSnapshot({ id: 'second', registry_id: 12 }));

    const updated = updateCopiedStrategyTxHash('first', '0xtxhash', '0xwallet');

    expect(updated).toBe(true);
    const snapshots = listCopiedStrategySnapshots();
    expect(snapshots).toHaveLength(2);
    expect(snapshots.find((snapshot) => snapshot.id === 'first')).toEqual(
      expect.objectContaining({ id: 'first', tx_hash: '0xtxhash', wallet_address: '0xwallet', onchain_proof_status: 'confirmed' }),
    );
    expect(snapshots.find((snapshot) => snapshot.id === 'second')).toEqual(
      expect.objectContaining({ id: 'second', onchain_proof_status: 'pending' }),
    );
  });

  it('marks proof failures without mutating the rest of the snapshot', () => {
    saveCopiedStrategySnapshot(makeSnapshot({ id: 'failure-target' }));

    const updated = markOnchainProofFailed('failure-target', 'User rejected the transaction');

    expect(updated).toBe(true);
    expect(listCopiedStrategySnapshots()[0]).toEqual(
      expect.objectContaining({
        id: 'failure-target',
        onchain_proof_status: 'failed',
        onchain_proof_error: 'User rejected the transaction',
        strategy_name: 'Stable Lending Strategy',
      }),
    );
  });

  it('gracefully resets when localStorage contains corrupted JSON', () => {
    window.localStorage.setItem(COPIED_STRATEGIES_STORAGE_KEY, '{bad json');

    expect(listCopiedStrategySnapshots()).toEqual([]);
    expect(() => saveCopiedStrategySnapshot(makeSnapshot({ id: 'after-reset' }))).not.toThrow();
    expect(listCopiedStrategySnapshots()).toHaveLength(1);
  });

  it('throws a controlled error when local persistence fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => saveCopiedStrategySnapshot(makeSnapshot({ id: 'quota' }))).toThrow(
      'Unable to persist copied strategies locally. QuotaExceededError',
    );
  });

  it('returns false instead of crashing when updating a missing snapshot id', () => {
    saveCopiedStrategySnapshot(makeSnapshot({ id: 'existing' }));

    expect(updateCopiedStrategyTxHash('missing', '0xdeadbeef')).toBe(false);
    expect(markOnchainProofFailed('missing', 'no match')).toBe(false);
  });

  it('rejects malformed snapshot payloads at runtime', () => {
    expect(() =>
      saveCopiedStrategySnapshot({
        strategy_id: '',
        registry_id: 0,
      } as unknown as CopiedStrategySnapshot),
    ).toThrow();
  });
});
