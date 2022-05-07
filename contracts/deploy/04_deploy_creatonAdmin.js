const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deployments} = hre;
  const {deploy} = deployments;

    // let {admin, treasury} = await hre.getNamedAccounts();
  // const {ethers, deployments, upgrades} = hre;
  // const {execute} = deployments;

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

  // console.log('NFTFactory Deploy');
  // const nftFactory = await deploy('NFTFactory', {
  //   from: admin,
  //   log: true,
  // });

  // await hre.tenderly.verify({
  //   name: 'NFTFactory',
  //   address: nftFactory.address,
  // });

  console.log('ReactionFactory Deploy');
  const reactionFactory = await deploy('ReactionFactory', {
    from: admin,
    log: true,
  });

  // await hre.tenderly.verify({
  //   name: 'ReactionFactory',
  //   address: reactionFactory.address,
  // });

  // console.log('NFTLance Deploy');
  // const nftLanceFactory = await deploy('NFTLance', {
  //   from: admin,
  //   log: true,
  // });

  // await hre.tenderly.verify({
  //   name: 'NFTLance',
  //   address: nftLanceFactory.address,
  // });

  console.log('CreatorV1');
  let implementationContract = await deploy('CreatorV1', {
    from: admin,
    log: true,
  });

  // console.log('CreatorBeaconnnn');
  // await deploy('CreatorBeacon', {
  //   from: admin,
  //   args: [implementationContract.address],
  //   log: true,
  // });

  // console.log('CreatorAdmin');
  // const creatonAdmin = await deploy('CreatonAdmin', {
  //   from: admin,
  //   log: true,
  // });
   await sleep(3000);

  const trustedforwarder =
    network.chainId === 137
      ? '0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8'
      : '0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b'; //testnet USDCx
  const beaconContract = await hre.deployments.get('CreatorBeacon');
  const nftFactory = await hre.deployments.get('NFTFactory');
  const reactionFactoryDeploy = await hre.deployments.get('ReactionFactory');
  const treasuryFee = 96;

  console.log('CreatorAdmin');
  const creatonAdmin = await deploy('CreatonAdmin', {
    from: admin,
    args: [
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
      reactionFactoryDeploy.address
    ],
    log: true,
  });

  console.log('CreatorAdmin deployed');


  // console.log('CreatorAdmin deployed');

  // await hre.tenderly.verify({
  //   name: 'CreatonAdmin',
  //   address: creatonAdmin.address,
  // });

  // await hre.tenderly.push({
  //   name: 'CreatonAdmin',
  //   address: creatonAdmin.address,
  // });
};

module.exports = func;
func.id = '04_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
