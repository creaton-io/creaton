const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {ethers, deployments, upgrades} = hre;
  const {execute} = deployments;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');
  //const network = await hre.ethers.provider.getNetwork();

  const network = await hre.ethers.provider.getNetwork();
  const sf = new SuperfluidSDK.Framework({
    ethers: ethers.provider,
    version: 'v1',
    tokens: [network.chainId === 137 ? 'USDC' : 'fUSDC'],
  });
  await sf.initialize();

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const trustedforwarder =
    network.chainId === 137
      ? '0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8'
      : '0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b'; //testnet USDCx
  const beaconContract = await hre.deployments.get('CreatorBeacon');
  const nftFactory = await hre.deployments.get('NFTFactory');
  const reactionFactory = await hre.deployments.get('ReactionFactory');
  const treasuryFee = 98;

  const CreatonAdmin = await ethers.getContractFactory('CreatonAdmin');
  console.log('Deploying admin proxy...');
  let adminContract = await upgrades.deployProxy(
    CreatonAdmin,
    [
      sf.host.address,
      sf.agreements.cfa.address,
      network.chainId === 137
        ? '0xCAa7349CEA390F89641fe306D93591f87595dc1F'
        : '0x42bb40bF79730451B11f6De1CbA222F17b87Afd7', //testnet USDCx
      '0xC2Be769Df80AA18aA7982B5ecA0AaE037460891d',
      treasuryFee,
      beaconContract.address,
      nftFactory.address,
      trustedforwarder,
      reactionFactory.address,
    ],
    {kind: 'uups'}
  );
  console.log('admin proxy deployed at:', adminContract.address);

  console.log('sf.host.address', sf.host.address);
  console.log('sf.agreements.cfa.address', sf.agreements.cfa.address);

  await hre.tenderly.verify({
    name: 'CreatonAdmin',
    address: CreatonAdmin.address,
  });

  await hre.tenderly.verify({
    name: 'adminContractProxy',
    address: adminContract.address,
  });

  await hre.tenderly.push({
    name: 'CreatonAdmin',
    address: CreatonAdmin.address,
  });

  await hre.tenderly.push({
    name: 'adminContract Proxy',
    address: adminContract.address,
  });
};

module.exports = func;
func.id = '05_deploy_adminProxy'; // id required to prevent reexecution
func.tags = ['CreatonAdminProxy'];
