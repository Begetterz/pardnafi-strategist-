import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InspectResponse } from '../../lib/api';
import { COPIED_STRATEGIES_STORAGE_KEY } from '../../lib/storage';

const contractMocks = vi.hoisted(() => ({
  copyStrategyOnchain: vi.fn(),
  getConnectedWalletAddress: vi.fn(),
  getConfiguredProofNetwork: vi.fn(() => 'BSC'),
  getExplorerTxUrl: vi.fn((txHash: string) => `https://bscscan.com/tx/${txHash}`),
}));

vi.mock('../../lib/contract', () => contractMocks);

import StrategyInspectPanel from './StrategyInspectPanel';

function makeInspect(overrides: Partial<InspectResponse> = {}): InspectResponse {
  return {
    strategy_id: 'venus-usdt-stability',
    registry_id: 22,
    strategy_name: 'Stable Lending Strategy',
    protocol: 'Venus',
    network: 'BSC',
    selected_horizon: 180,
    expected_return: '+6.25%',
    current_risk_level: 'Low risk',
    selected_live_metrics: { utilization: 52 },
    simulation: {
      selected_horizon: 180,
      scenarios: [
        { horizon: 30, projected_return: '+0.81%', key_assumption: 'Short-term stable demand.' },
        { horizon: 90, projected_return: '+2.92%', key_assumption: 'Base-case utilization persists.' },
        { horizon: 180, projected_return: '+6.25%', key_assumption: 'Higher utilization carries through.' },
      ],
    },
    explanation: [
      { id: 'what-could-go-wrong', title: 'What could go wrong', body: 'Rates may compress.', tone: 'caution' },
    ],
    assumptions: ['Stable utilization remains healthy.'],
    assets: ['USDT', 'USDC'],
    ...overrides,
  };
}

function readSnapshots() {
  return JSON.parse(window.localStorage.getItem(COPIED_STRATEGIES_STORAGE_KEY) ?? '[]') as Array<Record<string, unknown>>;
}

describe('StrategyInspectPanel copy flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    window.localStorage.clear();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('panel-snapshot-1');
    contractMocks.getConnectedWalletAddress.mockResolvedValue('0x2222222222222222222222222222222222222222');
    contractMocks.copyStrategyOnchain.mockResolvedValue({ txHash: '0xinspecttx' });
  });

  it('renders backend-driven inspect data and persists the same evaluated state into copy flow', async () => {
    const user = userEvent.setup();
    render(React.createElement(StrategyInspectPanel, { initialInspect: makeInspect() }));

    expect(screen.getAllByText('+6.25%').length).toBeGreaterThan(0);
    expect(screen.getByText('Stable Lending Strategy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('52')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copy Strategy' }));
    await user.click(screen.getByRole('button', { name: 'Confirm Copy' }));

    await waitFor(() => {
      expect(screen.getByText('Strategy copied successfully')).toBeInTheDocument();
    });

    expect(readSnapshots()).toEqual([
      expect.objectContaining({
        id: 'panel-snapshot-1',
        strategy_id: 'venus-usdt-stability',
        selected_horizon: 180,
        expected_return: '+6.25%',
        selected_live_metrics: { utilization: 52 },
        tx_hash: '0xinspecttx',
        onchain_proof_status: 'confirmed',
      }),
    ]);
  });
});
