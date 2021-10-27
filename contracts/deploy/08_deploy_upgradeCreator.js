const func = async function (hre) {
  // let {admin} = await hre.getNamedAccounts();
  // const CreatorBeacon = await ethers.getContractFactory('CreatorBeacon');
  // console.log('Preparing Upgrade...' + admin);
  // const {deploy} = deployments;
  // const implementationContract = await deploy('CreatorV1', {
  //   from: admin,
  //   log: true,
  // });
  // console.log('Upgrading...');
  // CreatorBeacon.upgradeTo(implementationContract.address);
};

module.exports = func;
func.id = '08_deploy_upgradeCreator'; // id required to prevent reexecution
func.tags = ['UpgradeCreator'];
