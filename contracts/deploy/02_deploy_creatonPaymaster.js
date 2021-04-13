module.exports = async function (hre) {
    let {admin} = await hre.getNamedAccounts();
    const {deploy, execute} = hre.deployments;

    let creatonPaymaster = await deploy('CreatonPaymaster', {
      from: admin,
      log: true
    });

    let relayHubReceipt = await execute(
      'CreatonPaymaster',
      {from: admin},
      "setRelayHub",
      "0x1F3d1C33977957EA41bEdFDcBf7fF64Fd3A3985e");

    let trustedForwarderReceipt = await execute(
      'CreatonPaymaster',
      {from: admin},
      "setTrustedForwarder",
      "0xd9c1a99e9263B98F3f633a9f1A201FA0AFC2A1c2");

    let twitterContractReceipt = await execute(
      'CreatonPaymaster',
      {from: admin},
      "addTwitterVerification",
      "0x43edd0335fE94980F3852Ddb19A5E140e3dd55ce"
    )

}

module.exports.tags = ['CreatonPaymaster'];
