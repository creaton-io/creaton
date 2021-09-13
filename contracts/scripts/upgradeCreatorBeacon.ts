// scripts/upgradeCreatorBeacon.ts
import {network, getUnnamedAccounts, ethers, getChainId} from 'hardhat';

async function main() {
  const CreatorBeacon = await ethers.getContractFactory('CreatonBeacon');
  console.log('Preparing Upgrade...');

  const {deployments} = hre;
  const {deploy} = deployments;

  const implementationContract = await deploy('CreatorV1', {
    from: admin,
    log: true,
  });

  CreatorBeacon.upgradeTo(implementationContract.address);
  console.log('Upgraded Beacon');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
