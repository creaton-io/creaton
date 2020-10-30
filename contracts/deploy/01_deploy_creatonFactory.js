const func = async function (bre) {
  let { deployer } = await bre.getNamedAccounts();
  const { deploy } = bre.deployments;
  const useProxy = !bre.network.live;

  console.log('deployer: ', deployer);

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy('CreatonFactory', { from: deployer, proxy: useProxy, args: [], log: true });
  // await deploy('Creator', {
  //   from: deployer,
  //   proxy: useProxy && 'init',
  //   args: ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'ETHGlobal', 5],
  //   log: true,
  // });

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};

module.exports = func;
