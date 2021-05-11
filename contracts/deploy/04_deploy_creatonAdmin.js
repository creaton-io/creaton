const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {deployments, ethers} = hre;
  const {deploy, execute} = deployments;
  // const useProxy = !hre.network.live;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  //Superfluid, work in progress
  //1820 contract not necesarry on goerli

  const sf = new SuperfluidSDK.Framework({
    chainId: 5,
    version: 'v1',
    web3Provider: await hre.web3.currentProvider,
    tokens: ['fUSDC'],
  });
  await sf.initialize();

  // TODO don't forget to change this on demand
  const trustedforwarder = "0xE041608922d06a4F26C0d4c27d8bCD01daf1f792";
  const paymasterContract = await hre.deployments.get("CreatonPaymaster")
  const usdcx = sf.tokens.fUSDCx;

  await deploy('NFTFactory', {
    from: admin,
    log:true
  });

  let implemetationContract = await deploy ('CreatorV1', {
    from: admin,
    log: true
  });

  await deploy ('CreatorBeacon', {
    from: admin,
    args: [implemetationContract.address],
    log: true
  });

  await deploy('CreatonAdminV1', {
    from: admin,
    log: true
  });


};

module.exports = func;
func.id = '02_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
