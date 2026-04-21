require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
require('dotenv').config();

function normalizePrivateKey(value) {
  if (!value) return undefined;
  return value.startsWith('0x') ? value : `0x${value}`;
}

const deployerPrivateKey = normalizePrivateKey(process.env.DEPLOYER_PRIVATE_KEY);
const opBnbVerifyApiKey = process.env.OPBNBSCAN_API_KEY || process.env.BSCSCAN_API_KEY || 'YOUR_NODEREAL_API_KEY';

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './src',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL || '',
      chainId: 97,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    opBNBTestnet: {
      url: process.env.OPBNB_TESTNET_RPC_URL || '',
      chainId: 5611,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || '',
      opBNBTestnet: process.env.OPBNBSCAN_API_KEY || process.env.BSCSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'opBNBTestnet',
        chainId: 5611,
        urls: {
          apiURL: `https://open-platform.nodereal.io/${opBnbVerifyApiKey}/op-bnb-testnet/contract/`,
          browserURL: 'https://testnet.opbnbscan.com/',
        },
      },
    ],
  },
};
