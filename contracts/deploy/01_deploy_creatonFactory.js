const func = async function (hre) {
  let {creator} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;
  const useProxy = !hre.network.live;

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy('CreatonFactory', {from: creator, proxy: useProxy, args: [], log: true});

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};

module.exports = func;
func.id = '01_deploy_creatonFactory'; // id required to prevent reexecution
func.tags = ['Creatonfactory'];
