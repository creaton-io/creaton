const func = async function (hre) {
  const {ethers, upgrades} = hre;

  const CreatonAdmin = await ethers.getContractFactory('CreatonAdmin');
  const currentProxy = '0x9f4781fFFD8c22f24A1AF3d6993D80fD9795d0e6'; //'0xEA5F6A57747082Ad6D9B50BcE8D7334A34bd4799'; //0x3cC1BEE862d48971808C2dA0207056bf0950E1de
  console.log(CreatonAdmin.address);
  console.log('Upgrading admin proxy...');
  const newProxy = await upgrades.upgradeProxy(currentProxy, CreatonAdmin);
  console.log('Admin was upgraded:', newProxy.address);
};

module.exports = func;
func.id = '07_deploy_upgradeAdmin'; // id required to prevent reexecution
func.tags = ['UpgradeAdmin'];
