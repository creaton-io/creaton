const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {deploy, execute} = deployments;
  const SuperfluidSDK = require('@superfluid-finance/js-sdk');
  //const network = await hre.ethers.provider.getNetwork();
  //TODO change on demand for mumbai or mainnet
  const sf = new SuperfluidSDK.Framework({
    ethers: ethers.provider,
    version: 'v1',
    tokens: ['fUSDC'],
  });
  await sf.initialize();
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  // TODO don't forget to change this on demand, different trustedForwarder for each network
  const trustedforwarder = '0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b';
  const beaconContract = await hre.deployments.get('CreatorBeacon');
  //const nftFactory = await hre.deployments.get('NFTFactory');
  //const paymasterContract = await hre.deployments.get('CreatonPaymaster');
  const treasuryFee = 98;
  //const usdcx = sf.tokens.USDCx; //todo: real Matic USDC on mainnet https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
  //console.log('usdcx Address:', usdcx.address);
  //const CreatonAdmin = await ethers.getContractFactory('CreatonAdmin');
  console.log('Deploying admin proxy...');

  console.log('NFTFactory Deploy');
  const nftFactory = await deploy('NFTFactory', {
    from: admin,
    log: true,
  });

  await hre.tenderly.verify({
    name: 'NFTFactory',
    address: nftFactory.address,
  });

  console.log('CreatorV1');
  let implementationContract = await deploy('CreatorV1', {
    from: admin,
    log: true,
  });

  console.log('CreatorBeaconnnn');
  await deploy('CreatorBeacon', {
    from: admin,
    args: [implementationContract.address],
    log: true,
  });

  console.log('CreatorAdmin');
  const creatonAdmin = await deploy('CreatonAdmin', {
    from: admin,
    args: [
      sf.host.address,
      sf.agreements.cfa.address,
      '0x42bb40bF79730451B11f6De1CbA222F17b87Afd7', //accepted token ($CREATE)
      treasury,
      treasuryFee,
      beaconContract.address,
      nftFactory.address,
      trustedforwarder,
    ],
    log: true,
  });

  console.log('CreatorAdmin deployed');

  await hre.tenderly.verify({
    name: 'CreatonAdmin',
    address: creatonAdmin.address,
  });

  await hre.tenderly.push({
    name: 'CreatonAdmin',
    address: creatonAdmin.address,
  });
};

module.exports = func;
func.id = '04_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
