const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {deploy, execute} = hre.deployments;
  // const useProxy = !hre.network.live;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  //Superfluid, work in progress
  //1820 contract not necesarry on goerli

  const version = process.env.RELEASE_VERSION || 'v1';

  const sf = new SuperfluidSDK.Framework({
    chainId: 5,
    version: 'v1',
    web3Provider: await hre.web3.currentProvider,
    tokens: ['fUSDC'],
  });
  await sf.initialize();

  // TODO don't forget to change this on demand
  const trustedforwarder = "0xd9c1a99e9263B98F3f633a9f1A201FA0AFC2A1c2";
  const paymasterContract = await hre.deployments.get("CreatonPaymaster")
  const usdcx = sf.tokens.fUSDCx;

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  // let result = await deploy('CreatonAdmin', {
  //   from: admin,
  //   args: [sf.host.address, sf.agreements.cfa.address, usdcx.address, treasury, 90, biconomyTrustedforwarder],
  //   log: true,
  // });
  // console.log("result of running tx", result);
  // when live network, record the script as executed to prevent rexecution

  let nftFactory = await deploy('NFTFactory', {
    from: admin,
    log:true
  });

  let implemetationContract = await deploy ('CreatorV1', {
    from: admin,
    log: true
  });

  let beaconContract = await deploy ('CreatorBeacon', {
    from: admin,
    args: [implemetationContract.address],
    log: true
  });

  let adminContract = await deploy('CreatonAdmin', {
    from: admin,
    args: [
      sf.host.address,
      sf.agreements.cfa.address,
      usdcx.address,
      treasury,
      90,
      beaconContract.address,
      nftFactory.address,
      trustedforwarder,
      paymasterContract.address],
    log: true
  });

  console.log('Add creaton admin to paymaster')
  let relayHubReceipt = await execute(
      'CreatonPaymaster',
      {from: admin},
      "setAdmin",
      adminContract.address);
  console.log(relayHubReceipt.transactionHash);

};

module.exports = func;
func.id = '02_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
