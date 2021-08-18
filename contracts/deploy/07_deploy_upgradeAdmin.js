const func = async function (hre) {
  /*
  const {ethers, upgrades} = hre;

  const CreatonAdmin = await ethers.getContractFactory('CreatonAdmin');
  const currentProxy = '0xEA5F6A57747082Ad6D9B50BcE8D7334A34bd4799'; //0x3cC1BEE862d48971808C2dA0207056bf0950E1de

  console.log('Upgrading admin proxy...');
  const newProxy = await upgrades.upgradeProxy(currentProxy, CreatonAdmin);
  console.log('Admin was upgraded!');
*/
};

module.exports = func;
func.id = '07_deploy_upgradeAdmin'; // id required to prevent reexecution
func.tags = ['UpgradeAdmin'];
