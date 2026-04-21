import { beforeEach, describe, expect, it, vi } from 'vitest';

const ethersMocks = vi.hoisted(() => ({
  request: vi.fn(),
  getSigner: vi.fn(),
  copyStrategy: vi.fn(),
  BrowserProvider: vi.fn(),
  Contract: vi.fn(),
  isAddress: vi.fn((value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)),
}));

vi.mock('ethers', () => ({
  BrowserProvider: ethersMocks.BrowserProvider.mockImplementation(function BrowserProviderMock() {
    return {
      getSigner: ethersMocks.getSigner,
    };
  }),
  Contract: ethersMocks.Contract.mockImplementation(function ContractMock() {
    return {
      copyStrategy: ethersMocks.copyStrategy,
    };
  }),
  isAddress: ethersMocks.isAddress,
}));

import { copyStrategyOnchain, getExplorerTxUrl, requestWalletAddress } from './contract';

describe('contract helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x1111111111111111111111111111111111111111';
    process.env.NEXT_PUBLIC_REGISTRY_NETWORK = 'BSC';
    ethersMocks.request.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') {
        return ['0x2222222222222222222222222222222222222222'];
      }

      if (method === 'eth_accounts') {
        return ['0x2222222222222222222222222222222222222222'];
      }

      return [];
    });
    ethersMocks.getSigner.mockResolvedValue({ signer: 'mock' });
    ethersMocks.copyStrategy.mockResolvedValue({ hash: '0xcopytx' });
    Object.defineProperty(window, 'ethereum', {
      configurable: true,
      value: {
        request: ethersMocks.request,
      },
    });
  });

  it('uses the configured registry address and calls copyStrategy with the backend registry id', async () => {
    const result = await copyStrategyOnchain(42);

    expect(ethersMocks.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    expect(ethersMocks.BrowserProvider).toHaveBeenCalledWith(window.ethereum);
    expect(ethersMocks.Contract).toHaveBeenCalledWith(
      '0x1111111111111111111111111111111111111111',
      ['function copyStrategy(uint256 strategyId)'],
      { signer: 'mock' },
    );
    expect(ethersMocks.copyStrategy).toHaveBeenCalledWith(42n);
    expect(result).toEqual({ txHash: '0xcopytx' });
  });

  it('builds explorer urls for BSC and opBNB and returns null for unknown networks', () => {
    expect(getExplorerTxUrl('0xabc', 'BSC')).toBe('https://bscscan.com/tx/0xabc');
    expect(getExplorerTxUrl('0xabc', 'opBNB')).toBe('https://opbnbscan.com/tx/0xabc');
    expect(getExplorerTxUrl('0xabc', 'Unknown')).toBeNull();
  });

  it('throws when the injected wallet is missing', async () => {
    Object.defineProperty(window, 'ethereum', {
      configurable: true,
      value: undefined,
    });

    await expect(copyStrategyOnchain(5)).rejects.toThrow('No injected wallet was found.');
  });

  it('throws when the wallet connection is rejected or empty', async () => {
    ethersMocks.request.mockResolvedValueOnce([]);
    await expect(requestWalletAddress()).rejects.toThrow('Wallet connection was not approved.');

    ethersMocks.request.mockRejectedValueOnce(Object.assign(new Error('Rejected'), { code: 4001 }));
    await expect(copyStrategyOnchain(7)).rejects.toThrow('Rejected');
  });

  it('throws on contract reverts and invalid registry address config', async () => {
    ethersMocks.copyStrategy.mockRejectedValueOnce(new Error('StrategyRegistry: revert'));
    await expect(copyStrategyOnchain(9)).rejects.toThrow('StrategyRegistry: revert');

    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = 'bad-address';
    await expect(copyStrategyOnchain(9)).rejects.toThrow('NEXT_PUBLIC_REGISTRY_ADDRESS is not configured correctly.');
  });

  it('blocks invalid registry ids before sending a wallet write', async () => {
    await expect(copyStrategyOnchain(0)).rejects.toThrow('A valid registry ID is required before recording proof onchain.');
    await expect(copyStrategyOnchain(Number.NaN)).rejects.toThrow('A valid registry ID is required before recording proof onchain.');
    await expect(copyStrategyOnchain(-2)).rejects.toThrow('A valid registry ID is required before recording proof onchain.');
    expect(ethersMocks.request).not.toHaveBeenCalled();
  });
});
