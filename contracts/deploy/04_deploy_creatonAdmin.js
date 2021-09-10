const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deployments} = hre;
  const {deploy} = deployments;

  console.log('NFTFactory Deploy');
  const nftFactory = await deploy('NFTFactory', {
    from: admin,
    log: true,
  });

  await hre.tenderly.verify({
    name: 'NFTFactory',
    address: nftFactory.address,
  });

  console.log('CreatorV1');
  let implementationContract = await deploy('CreatorV1', {
    from: admin,
    log: true,
  });

  console.log('CreatorBeaconnnn');
  await deploy('CreatorBeacon', {
    from: admin,
    args: [implementationContract.address],
    log: true,
  });

  console.log('CreatorAdmin');
  const creatonAdmin = await deploy('CreatonAdmin', {
    from: admin,
    log: true,
  });

  console.log('CreatorAdmin deployed');

  await hre.tenderly.verify({
    name: 'CreatonAdmin',
    address: creatonAdmin.address,
  });

  await hre.tenderly.push({
    name: 'CreatonAdmin',
    address: creatonAdmin.address,
  });
};

module.exports = func;
func.id = '04_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
