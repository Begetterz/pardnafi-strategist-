import { BrowserProvider, Contract, isAddress } from 'ethers';

const STRATEGY_REGISTRY_ABI = ['function copyStrategy(uint256 strategyId)'];

type InjectedWindow = Window & {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  };
};

function getInjectedProvider() {
  if (typeof window === 'undefined') {
    throw new Error('Wallet actions are only available in the browser.');
  }

  const injectedWindow = window as InjectedWindow;
  if (!injectedWindow.ethereum) {
    throw new Error('No injected wallet was found.');
  }

  return injectedWindow.ethereum;
}

function getRegistryAddress() {
  const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;

  if (!registryAddress || !isAddress(registryAddress)) {
    throw new Error('NEXT_PUBLIC_REGISTRY_ADDRESS is not configured correctly.');
  }

  return registryAddress;
}

export function getConfiguredProofNetwork() {
  return process.env.NEXT_PUBLIC_REGISTRY_NETWORK ?? 'BSC';
}

export async function getConnectedWalletAddress(): Promise<string | undefined> {
  const provider = getInjectedProvider();
  const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];
  return accounts[0];
}

export async function requestWalletAddress(): Promise<string> {
  const provider = getInjectedProvider();
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];

  if (!accounts[0]) {
    throw new Error('Wallet connection was not approved.');
  }

  return accounts[0];
}

export async function copyStrategyOnchain(registryId: number): Promise<{ txHash: string }> {
  if (!Number.isInteger(registryId) || registryId <= 0) {
    throw new Error('A valid registry ID is required before recording proof onchain.');
  }

  const injectedProvider = getInjectedProvider();
  await requestWalletAddress();

  const provider = new BrowserProvider(injectedProvider);
  const signer = await provider.getSigner();
  const contract = new Contract(getRegistryAddress(), STRATEGY_REGISTRY_ABI, signer);
  const transaction = await contract.copyStrategy(BigInt(registryId));

  if (!transaction?.hash) {
    throw new Error('The wallet did not return a transaction hash.');
  }

  return { txHash: transaction.hash as string };
}

export function getExplorerTxUrl(txHash: string, network: string): string | null {
  const normalizedNetwork = network.trim().toLowerCase();

  if (normalizedNetwork === 'bsc') {
    return `https://bscscan.com/tx/${txHash}`;
  }

  if (normalizedNetwork === 'opbnb') {
    return `https://opbnbscan.com/tx/${txHash}`;
  }

  if (normalizedNetwork === 'bsc testnet' || normalizedNetwork === 'bnb smart chain testnet') {
    return `https://testnet.bscscan.com/tx/${txHash}`;
  }

  if (normalizedNetwork === 'opbnb testnet') {
    return `https://testnet.opbnbscan.com/tx/${txHash}`;
  }

  return null;
}
