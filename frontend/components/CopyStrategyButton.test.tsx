import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InspectResponse } from '../lib/api';
import { COPIED_STRATEGIES_STORAGE_KEY } from '../lib/storage';

const contractMocks = vi.hoisted(() => ({
  copyStrategyOnchain: vi.fn(),
  getConnectedWalletAddress: vi.fn(),
  getConfiguredProofNetwork: vi.fn(() => 'BSC'),
  getExplorerTxUrl: vi.fn((txHash: string) => `https://bscscan.com/tx/${txHash}`),
}));

vi.mock('../lib/contract', () => contractMocks);

import CopyStrategyButton from './CopyStrategyButton';

function makeInspect(overrides: Partial<InspectResponse> = {}): InspectResponse {
  return {
    strategy_id: 'venus-usdt-stability',
    registry_id: 22,
    strategy_name: 'Stable Lending Strategy',
    protocol: 'Venus',
    network: 'BSC',
    selected_horizon: 90,
    expected_return: '+2.18%',
    current_risk_level: 'Low risk',
    selected_live_metrics: { utilization: 48, reward_haircut: 8 },
    simulation: {
      selected_horizon: 90,
      scenarios: [
        { horizon: 30, projected_return: '+0.67%', key_assumption: 'Short-term stable demand.' },
        { horizon: 90, projected_return: '+2.18%', key_assumption: 'Base-case utilization persists.' },
        { horizon: 180, projected_return: '+4.44%', key_assumption: 'Rates compress slightly.' },
      ],
    },
    explanation: [
      { id: 'why-it-ranks-here', title: 'Why it ranks here', body: 'Readable risk-adjusted stable yield.' },
      { id: 'what-could-go-wrong', title: 'What could go wrong', body: 'Rates may compress.', tone: 'caution' },
    ],
    assumptions: ['Stable utilization remains healthy.', 'Reward emissions taper modestly.'],
    assets: ['USDT', 'USDC'],
    ...overrides,
  };
}

function readSnapshots() {
  return JSON.parse(window.localStorage.getItem(COPIED_STRATEGIES_STORAGE_KEY) ?? '[]') as Array<Record<string, unknown>>;
}

describe('CopyStrategyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('snapshot-1');
    contractMocks.getConnectedWalletAddress.mockResolvedValue('0x2222222222222222222222222222222222222222');
    contractMocks.copyStrategyOnchain.mockResolvedValue({ txHash: '0xcopyhash' });
  });

  it('opens the confirmation sheet with the evaluated strategy context', async () => {
    const user = userEvent.setup();
    render(React.createElement(CopyStrategyButton, { inspect: makeInspect() }));

    await user.click(screen.getByRole('button', { name: 'Copy Strategy' }));

    expect(screen.getByRole('dialog', { name: 'Copy Strategy' })).toBeInTheDocument();
    expect(screen.getByText('Stable Lending Strategy')).toBeInTheDocument();
    expect(screen.getByText('Venus')).toBeInTheDocument();
    expect(screen.getAllByText('BSC').length).toBeGreaterThan(0);
    expect(screen.getByText('+2.18%')).toBeInTheDocument();
    expect(screen.getByText('Low risk')).toBeInTheDocument();
    expect(screen.getByText('Stable utilization remains healthy.')).toBeInTheDocument();
    expect(screen.getByText('Reward Haircut')).toBeInTheDocument();
  });

  it('cancels without writing locally or calling onchain proof', async () => {
    const user = userEvent.setup();
    render(React.createElement(CopyStrategyButton, { inspect: makeInspect() }));

    await user.click(screen.getByRole('button', { name: 'Copy Strategy' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Copy Strategy' })).not.toBeInTheDocument();
    expect(readSnapshots()).toEqual([]);
    expect(contractMocks.copyStrategyOnchain).not.toHaveBeenCalled();
  });

  it('saves locally first, records proof onchain, and renders success with explorer link', async () => {
    const user = userEvent.setup();
    render(React.createElement(CopyStrategyButton, { inspect: makeInspect() }));

    await user.click(screen.getByRole('button', { name: 'Copy Strategy' }));
    await user.click(screen.getByRole('button', { name: 'Confirm Copy' }));

    await waitFor(() => {
      expect(screen.getByText('Strategy copied successfully')).toBeInTheDocument();
    });

    expect(contractMocks.copyStrategyOnchain).toHaveBeenCalledWith(22);
    expect(screen.getByRole('link', { name: 'View explorer proof' })).toHaveAttribute('href', 'https://bscscan.com/tx/0xcopyhash');

    expect(readSnapshots()).toEqual([
      expect.objectContaining({
        id: 'snapshot-1',
        strategy_id: 'venus-usdt-stability',
        tx_hash: '0xcopyhash',
        wallet_address: '0x2222222222222222222222222222222222222222',
        onchain_proof_status: 'confirmed',
      }),
    ]);
  });

  it('preserves the local snapshot on failure and retries without creating a duplicate', async () => {
    const user = userEvent.setup();
    contractMocks.copyStrategyOnchain.mockRejectedValueOnce(new Error('User rejected the transaction'));
    render(React.createElement(CopyStrategyButton, { inspect: makeInspect() }));

    await user.click(screen.getByRole('button', { name: 'Copy Strategy' }));
    await user.click(screen.getByRole('button', { name: 'Confirm Copy' }));

    await waitFor(() => {
      expect(screen.getByText('Strategy saved locally, but onchain recording failed')).toBeInTheDocument();
    });

    expect(readSnapshots()).toEqual([
      expect.objectContaining({
        id: 'snapshot-1',
        onchain_proof_status: 'failed',
        onchain_proof_error: 'User rejected the transaction',
      }),
    ]);

    contractMocks.copyStrategyOnchain.mockResolvedValueOnce({ txHash: '0xretryhash' });
    await user.click(screen.getByRole('button', { name: 'Retry onchain proof' }));

    await waitFor(() => {
      expect(screen.getByText('Strategy copied successfully')).toBeInTheDocument();
    });

    const snapshots = readSnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toEqual(
      expect.objectContaining({
        id: 'snapshot-1',
        tx_hash: '0xretryhash',
        onchain_proof_status: 'confirmed',
      }),
    );
  });

  it('prevents duplicate submits and controlled dismissal while the proof write is pending', async () => {
    const user = userEvent.setup();
    let resolveProof: ((value: { txHash: string }) => void) | undefined;
    contractMocks.copyStrategyOnchain.mockImplementation(
      () =>
        new Promise<{ txHash: string }>((resolve) => {
          resolveProof = resolve;
        }),
    );

    render(React.createElement(CopyStrategyButton, { inspect: makeInspect() }));
    await user.click(screen.getByRole('button', { name: 'Copy Strategy' }));
    const confirmButton = screen.getByRole('button', { name: 'Confirm Copy' });
    await user.dblClick(confirmButton);

    expect(contractMocks.copyStrategyOnchain).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();

    resolveProof?.({ txHash: '0xpendinghash' });

    await waitFor(() => {
      expect(screen.getByText('Strategy copied successfully')).toBeInTheDocument();
    });
  });

  it('blocks copy when required inspect fields are missing and shows a friendly reason', () => {
    render(
      React.createElement(CopyStrategyButton, {
        inspect: makeInspect({
          registry_id: 0,
          strategy_name: '',
        }),
      }),
    );

    expect(screen.getByRole('button', { name: 'Copy Strategy' })).toBeDisabled();
    expect(screen.getByText(/cannot be copied/i)).toBeInTheDocument();
  });
});
