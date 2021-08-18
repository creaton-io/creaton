// scripts/transfer-ownership.ts

const hre = require('hardhat');
const ethers = hre.ethers;

async function main() {
  const gnosisSafe = '0xFb2C6465654024c03DC564d237713F620d1E9491';

  console.log('Transferring ownership of ProxyAdmin...');
  // The owner of the ProxyAdmin can upgrade our contracts
  await hre.upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
  console.log('Transferred ownership of ProxyAdmin to:', gnosisSafe);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
