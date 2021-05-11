module.exports = async function (hre) {
    let {admin} = await hre.getNamedAccounts();
    const {deploy, execute} = hre.deployments;

    const stakingContract = await hre.deployments.get("MetatxStaking")
    const creatonStaking = await hre.deployments.get("MetatxStaking")
    const relayHub = "0x1F3d1C33977957EA41bEdFDcBf7fF64Fd3A3985e"
    const trustedforwarder = "0xE041608922d06a4F26C0d4c27d8bCD01daf1f792"

    let creatonPaymaster = await deploy('CreatonPaymaster', {
      from: admin,
      args: [
        stakingContract.address
      ],
      log: true
    });

    console.log('Add paymaster to relayhub...')
    let relayHubReceipt = await execute(
      'CreatonPaymaster',
      {from: admin},
      "setRelayHub",
      relayHub
      );
    console.log(relayHubReceipt.transactionHash)

    console.log('Set trusted forwarder...')
    let trustedForwarderReceipt = await execute(
      'CreatonPaymaster',
      {from: admin},
      "setTrustedForwarder",
      trustedforwarder);
    console.log(trustedForwarderReceipt.transactionHash)

}

module.exports.tags = ['CreatonPaymaster'];
