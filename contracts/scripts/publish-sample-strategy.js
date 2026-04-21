const hre = require('hardhat');
const { ethers } = require('ethers');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function main() {
  const { ethers: hardhatEthers, network } = hre;
  const [publisher] = await hardhatEthers.getSigners();
  if (!publisher) {
    throw new Error('No publisher signer available. Check DEPLOYER_PRIVATE_KEY and RPC URL env vars.');
  }

  const registryAddress = requireEnv('REGISTRY_ADDRESS');
  const contract = await hardhatEthers.getContractAt('StrategyRegistry', registryAddress, publisher);

  const protocol = process.env.PROTOCOL_NAME || 'Venus';
  const expectedApyBps = Number.parseInt(process.env.EXPECTED_APY_BPS || '820', 10);
  const riskScore = Number.parseInt(process.env.RISK_SCORE || '2', 10);
  const strategyChainId = Number.parseInt(
    process.env.STRATEGY_CHAIN_ID || String(network.config.chainId || 0),
    10,
  );
  const strategySeed = process.env.STRATEGY_HASH_SEED || `${network.name}:${protocol}:sample-strategy`;
  const strategyHash = ethers.keccak256(ethers.toUtf8Bytes(strategySeed));

  if (!Number.isInteger(expectedApyBps) || expectedApyBps < 0) {
    throw new Error('EXPECTED_APY_BPS must be a non-negative integer.');
  }

  if (!Number.isInteger(riskScore) || riskScore < 0 || riskScore > 255) {
    throw new Error('RISK_SCORE must be an integer between 0 and 255.');
  }

  const tx = await contract.publishStrategy(
    strategyHash,
    strategyChainId,
    protocol,
    expectedApyBps,
    riskScore,
  );

  const receipt = await tx.wait();
  const strategyCount = await contract.strategyCount();

  console.log(JSON.stringify({
    action: 'publish-sample-strategy',
    network: network.name,
    registryAddress,
    publisher: publisher.address,
    txHash: tx.hash,
    blockNumber: receipt ? receipt.blockNumber : null,
    strategyId: Number(strategyCount),
    strategy: {
      strategyHash,
      chainId: strategyChainId,
      protocol,
      expectedApyBps,
      riskScore,
    },
    backendReminder: 'Map your backend inspect payload registry_id to this strategyId before testing Copy Strategy.',
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
