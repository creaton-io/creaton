const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {ethers, deployments, upgrades} = hre;
  const {execute} = deployments;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');
  //const network = await hre.ethers.provider.getNetwork();

  const sf = new SuperfluidSDK.Framework({
    ethers: ethers.provider,
    version: 'v1',
    tokens: ['USDC'],
  });
  await sf.initialize();

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // TODO don't forget to change this on demand, different trustedForwarder for each network
  const trustedforwarder = '0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d';
  const beaconContract = await hre.deployments.get('CreatorBeacon');
  const nftFactory = await hre.deployments.get('NFTFactory');
  const paymasterContract = await hre.deployments.get('CreatonPaymaster');
  const treasuryFee = 98;
  //const usdcx = sf.tokens.USDCx; //todo: real Matic USDC on mainnet https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

  //console.log('usdcx Address:', usdcx.address);

  const CreatonAdmin = await ethers.getContractFactory('CreatonAdmin');
  console.log('Deploying admin proxy...');
  let adminContract = await upgrades.deployProxy(
    CreatonAdmin,
    [
      sf.host.address,
      sf.agreements.cfa.address,
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      treasury,
      treasuryFee,
      beaconContract.address,
      nftFactory.address,
      trustedforwarder,
      paymasterContract.address,
    ],
    {kind: 'uups'}
  );
  console.log('admin proxy deployed at:', adminContract.address);
  await sleep(10000);
  console.log('Add creaton admin to paymaster...');
  let relayHubReceipt = await execute('CreatonPaymaster', {from: admin}, 'setAdmin', adminContract.address);
  await sleep(10000);
  console.log(relayHubReceipt.transactionHash);
};

module.exports = func;
func.id = '05_deploy_adminProxy'; // id required to prevent reexecution
func.tags = ['CreatonAdminProxy'];
