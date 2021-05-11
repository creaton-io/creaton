const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deployments} = hre;
  const {deploy} = deployments;

  await deploy('NFTFactory', {
    from: admin,
    log:true
  });

  let implemetationContract = await deploy ('CreatorV1', {
    from: admin,
    log: true
  });

  await deploy ('CreatorBeacon', {
    from: admin,
    args: [implemetationContract.address],
    log: true
  });

  await deploy('CreatonAdmin', {
    from: admin,
    log: true
  });

};

module.exports = func;
func.id = '04_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonAdmin'];
