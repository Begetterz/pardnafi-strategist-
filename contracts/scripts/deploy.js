const hre = require('hardhat');

async function main() {
  const { ethers, network } = hre;

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error('No deployer signer available. Check DEPLOYER_PRIVATE_KEY and RPC URL env vars.');
  }

  const registryFactory = await ethers.getContractFactory('StrategyRegistry', deployer);
  const registry = await registryFactory.deploy();
  await registry.waitForDeployment();

  const deploymentTx = registry.deploymentTransaction();
  const registryAddress = await registry.getAddress();
  const networkLabel = network.name === 'opBNBTestnet' ? 'opBNB' : 'BSC';

  console.log(JSON.stringify({
    action: 'deploy-strategy-registry',
    network: network.name,
    chainId: Number(network.config.chainId || 0),
    deployer: deployer.address,
    contract: {
      name: 'StrategyRegistry',
      address: registryAddress,
    },
    txHash: deploymentTx ? deploymentTx.hash : null,
    frontendEnv: {
      NEXT_PUBLIC_REGISTRY_ADDRESS: registryAddress,
      NEXT_PUBLIC_REGISTRY_NETWORK: networkLabel,
    },
    nextStep: 'Publish at least one strategy before calling copyStrategy.',
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
