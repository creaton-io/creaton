const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deployments} = hre;
  const {deploy} = deployments;

  console.log('NFTFactory Deploy');
  await deploy('NFTFactory', {
    from: admin,
    log: true,
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
  await deploy('CreatonAdmin', {
    from: admin,
    log: true,
  });

  console.log('CreatorAdmin deployed');
};

module.exports = func;
func.id = '04_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
