const func = async function (bre) {
  let { deployer } = await bre.getNamedAccounts();
  const { deploy } = bre.deployments;
  const useProxy = !bre.network.live;

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy('Creator', {
    from: deployer,
    proxy: useProxy,
    args: [],
    log: true,
  });

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};

module.exports = func;
