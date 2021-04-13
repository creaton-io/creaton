module.exports = async function (hre) {
    let {admin} = await hre.getNamedAccounts();
    const {deploy, execute} = hre.deployments;

    // all goerli addresses atm
    let jobId = '735df7cd5c394410b1e52758621268df';
    let chainlinkNodeAddress = '0x9d8F26cC17c41fcD1d54D0Ae98264978E50a0b50';
    const trustedforwarder = "0xd9c1a99e9263B98F3f633a9f1A201FA0AFC2A1c2";
    let adminContract = await hre.deployments.get('CreatonAdmin')

    let LinkToken = await deploy('LinkToken', {
      from: admin,
      log: true
    });

    let linkContract = LinkToken.address;

    let oracle = await deploy('Oracle', {
      from: admin,
      args: [
        linkContract
      ],
      log: true
    });

    let setChainlinkNode = await execute(
      'Oracle',
      {from: admin},
      "setFulfillmentPermission",
      chainlinkNodeAddress,
      true);
    console.log(setChainlinkNode.transactionHash);


    let twitterVerification = await deploy('TwitterVerification', {
      from: admin,
      args: [
        linkContract,
        oracle.address,
        jobId,
        trustedforwarder,
        adminContract.address
      ],
      log: true
    });

    let addTwitterVerification = await execute(
      'CreatonPaymaster',
      {from: admin},
      "addTwitterVerification",
      twitterVerification.address
    );
  console.log(addTwitterVerification.transactionHash);

}

module.exports.tags = ['TwitterVerification'];
