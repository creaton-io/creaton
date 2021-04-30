module.exports = async function (hre) {
    let {admin} = await hre.getNamedAccounts();
    const {deploy, execute} = hre.deployments;

    const createToken = await hre.deployments.get("CreatonToken")
    const stakingContract = await hre.deployments.get("MetatxStaking")
    const relayHub = "0x1F3d1C33977957EA41bEdFDcBf7fF64Fd3A3985e"
    const trustedforwarder = "0xd9c1a99e9263B98F3f633a9f1A201FA0AFC2A1c2"

    let creatonPaymaster = await deploy('CreatonPaymaster', {
      from: admin,
      args: [
        createToken.address,
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
