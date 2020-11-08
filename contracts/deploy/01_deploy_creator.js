const func = async function (hre) {
  let { creator } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy('Creator', {
    from: creator,
    proxy: useProxy,
    args: [],
    log: true,
  });

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};

module.exports = func;
