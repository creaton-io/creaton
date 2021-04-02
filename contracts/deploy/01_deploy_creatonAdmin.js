const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;
  // const useProxy = !hre.network.live;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  //Superfluid, work in progress
  //1820 contract not necesarry on goerli

  const version = process.env.RELEASE_VERSION || 'v1';

  const sf = new SuperfluidSDK.Framework({
    chainId: 80001,
    version: 'v1',
    web3Provider: await hre.web3.currentProvider,
    tokens: ['fUSDC'],
  });
  await sf.initialize();

  const biconomyTrustedforwarder = '0x2B99251eC9650e507936fa9530D11dE4d6C9C05c';
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
      biconomyTrustedforwarder,
      beaconContract.address,
      nftFactory.address]
  });

};

module.exports = func;
func.id = '01_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['Creatonadmin'];
