const func = async function (hre) {
  let {admin} = await hre.getNamedAccounts();
  const {deploy, execute} = hre.deployments;
  // const useProxy = !hre.network.live;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');
  const Superfluid_ABI = require('@superfluid-finance/js-sdk/src/abi');

  const abi = Superfluid_ABI.IERC20;
  let tokenName = "Create";
  let tokenSymbol = "CRT";
  let initialSupply = 20000000;
  const network = await hre.ethers.provider.getNetwork()

  const sf = new SuperfluidSDK.Framework({
    chainId: network.chainId,
    version: 'v1',
    web3Provider: await hre.web3.currentProvider,
    tokens: ['fUSDC'],
  });
  await sf.initialize();

  const superTokenFactory = await sf.contracts.ISuperTokenFactory.at(
            await sf.host.getSuperTokenFactory.call()
  );

  let tokenProxy = await deploy('CreatonToken', {
    from: admin,
    log: true
  })

  // This has to be called just once
  console.log("Invoking initializeCustomSuperToken...");
  await superTokenFactory.initializeCustomSuperToken(tokenProxy.address);

  console.log("Invoking initialize...");
  let receipt = await execute(
      'CreatonToken',
      {from: admin},
      "initialize",
      tokenName,
      tokenSymbol,
      web3.utils.toWei(String(initialSupply))
  );
  console.log(receipt.transactionHash);

};

module.exports = func;
func.id = '01_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['CreatonToken'];
