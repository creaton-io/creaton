const func = async function (hre) {
  /*
  const CreatorBeacon = await ethers.getContractFactory('CreatonBeacon');
  console.log('Preparing Upgrade...');

  const implementationContract = await deploy('CreatorV1', {
    from: admin,
    log: true,
  });

  CreatorBeacon.upgradeTo(implementationContract.address);
*/
};

module.exports = func;
func.id = '08_deploy_upgradeCreator'; // id required to prevent reexecution
func.tags = ['UpgradeCreator'];
