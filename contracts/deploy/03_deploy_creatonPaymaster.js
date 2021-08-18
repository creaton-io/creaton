const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deploy, execute} = hre.deployments;

  //const stakingContract = await hre.deployments.get('MetatxStaking');
  //const creatonStaking = await hre.deployments.get('MetatxStaking');

  //const relayHub = '0x6C28AfC105e65782D9Ea6F2cA68df84C9e7d750d';
  const trustedforwarder = '0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d';
  /*
  console.log('test1');
  let creatonPaymaster = await deploy('CreatonPaymaster', {
    from: admin,
    args: [],
    log: true,
  });
  console.log('test2');
  console.log('Add paymaster to relayhub...');
  let relayHubReceipt = await execute('CreatonPaymaster', {from: admin}, 'setRelayHub', relayHub);
  console.log(relayHubReceipt.transactionHash);


  console.log('Set trusted forwarder...');
  let trustedForwarderReceipt = await execute(
    'CreatonPaymaster',
    {from: admin},
    'setTrustedForwarder',
    trustedforwarder
  );
  console.log(trustedForwarderReceipt.transactionHash);
    */
};

module.exports = func;
func.id = '03_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonPaymaster'];
