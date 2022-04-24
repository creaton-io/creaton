const func = async function (hre) {


  let {admin} = await hre.getNamedAccounts();
  const {deploy, execute} = hre.deployments;
  // const useProxy = !hre.network.live;

  /// @dev Load contract from truffle built artifacts
function builtTruffleContractLoader(name) {
  try {
      const directoryPath = path.join(__dirname, "../../build/contracts");
      const builtContract = require(path.join(directoryPath, name + ".json"));
      return builtContract;
  } catch (e) {
      throw new Error(
          `Cannot load built truffle contract ${name}. Have you built?`
      );
  }
}

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');
  const Superfluid_ABI = require('@superfluid-finance/js-sdk/src/abi');
  const { LedgerSigner } = require("@anders-t/ethers-ledger");

  const abi = Superfluid_ABI.IERC20;
  let tokenName = 'Creaton';
  let tokenSymbol = 'CREATE';
  const network = await hre.ethers.provider.getNetwork();

  const ledger = new LedgerSigner(hre.ethers.provider);

  const childChainManager = "0xb5505a6d998549090530911180f38aC5130101c6"; //"0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"

  const sf = new SuperfluidSDK.Framework({
    chainId: network.chainId,
    ethers: ethers.provider,
    version: 'v1',
    web3Provider: await hre.web3.currentProvider,
    // contractLoader: builtTruffleContractLoader,
  });
  await sf.initialize();

  // const {MaticBridgedNativeSuperTokenProxy, IMaticBridgedNativeSuperToken} =
  //   sf.contracts;

  // console.log(MaticBridgedNativeSuperTokenProxy); 
  
  const maticBridged = await ethers.getContractAt(Superfluid_ABI.MaticBridgedNativeSuperTokenProxy, MaticBridgedNativeSuperTokenProxy.address, admin);

  let maticBridgedProxy = await maticBridged.connect(ledger);

  const proxy = maticBridgedProxy.new(childChainManager);

  const token = await IMaticBridgedNativeSuperToken.at(proxy.address);  

  // This has to be called just once
  //console.log('Invoking initializeCustomSuperToken...');
  //await superTokenFactory.initializeCustomSuperToken(token.address);


  // console.log("Invoking initialize...");
  // await token.initialize(ZERO_ADDRESS, 18, superTokenName, superTokenSymbol); 

  // console.log('Invoking initialize...');
  //  let receipt = await execute(
  //    'CreatonToken',
  //    {from: admin},
  //    'initialize',
  //    ZERO_ADDRESS, 
  //    18,
  //    tokenName,
  //    tokenSymbol,
  //  );

  // console.log("Deploying MaticBridgedNativeSuperTokenProxy...");
  // const proxy = await MaticBridgedNativeSuperTokenProxy.new( // need to call this 'new' with execute() most likely
  //     childChainManager
  // );  

  // const token = await IMaticBridgedNativeSuperToken.at(proxy.address);  

  // // This has to be called just once
  // console.log('Invoking initializeCustomSuperToken...');
  // await superTokenFactory.initializeCustomSuperToken(token.address);


  // // console.log("Invoking initialize...");
  // // await token.initialize(ZERO_ADDRESS, 18, superTokenName, superTokenSymbol); 

  // const tokenProxy = hre.ethers.getContractFactory

  // await tokenProxy.connec

  // console.log('Invoking initialize...');
  // let receipt = await execute(
  //   'CreatonToken',
  //   {from: admin},
  //   'initialize',
  //   ZERO_ADDRESS, 
  //   18,
  //   tokenName,
  //   tokenSymbol,
  // );

  // console.log(`Matic Bridged Native SuperToken deployed at ${token.address}`);
  // console.log(receipt.transactionHash);

};

module.exports = func;
func.id = '09_deploy_maticToken'; // id required to prevent reexecution
func.tags = ['CreatonMaticToken'];






// Skip to content
// Search or jump to…
// Pull requests
// Issues
// Marketplace
// Explore
 
// @Aeroxander 
// superfluid-finance
// /
// protocol-monorepo
// Public
// Code
// Issues
// 56
// Pull requests
// 11
// Actions
// Wiki
// Security
// Insights
// protocol-monorepo/packages/ethereum-contracts/scripts/deploy-matic-bridged-native-super-token.js /
// @kasparkallas
// kasparkallas SDK-Redux (#465)
// Latest commit 16594f6 on Dec 1, 2021
//  History
//  3 contributors
// @d10r@hellwolf@kasparkallas
//  74 lines (62 sloc)  2.7 KB
   
// const SuperfluidSDK = require("@superfluid-finance/js-sdk");

// const {
//     getScriptRunnerFactory: S,
//     extractWeb3Options,
//     builtTruffleContractLoader,
//     ZERO_ADDRESS,
// } = require("./libs/common");

// /**
//  * @dev Deploy unlisted native super token to the network.
//  * @param {Array} argv Overriding command line arguments
//  * @param {boolean} options.isTruffle Whether the script is used within native truffle framework
//  * @param {Web3} options.web3  Injected web3 instance
//  * @param {Address} options.from Address to deploy contracts from
//  * @param {boolean} options.protocolReleaseVersion Specify the protocol release version to be used
//  *
//  * Usage: npx truffle exec scripts/deploy-matic-bridged-native-super-token.js : {NAME} {SYMBOL} {CHILD_CHAIN_MANAGER}
//  *        CHILD_CHAIN_MANAGER is the bridge contract account calling the deposit function which mints tokens
//  */
// module.exports = eval(`(${S.toString()})()`)(async function (
//     args,
//     options = {}
// ) {
//     console.log("== Deploying unlisted Matic bridged native super token ==");
//     let {protocolReleaseVersion} = options;

//     if (args.length !== 3) {
//         throw new Error("Wrong number of arguments");
//     }
//     const childChainManager = args.pop();
//     const superTokenSymbol = args.pop();
//     const superTokenName = args.pop();
//     console.log("Super token name", superTokenName);
//     console.log("Super token symbol", superTokenSymbol);

//     if (!web3.utils.isAddress(childChainManager)) {
//         throw new Error(`not a valid address: ${childChainManager}`);
//     }
//     console.log("Child chain manager", childChainManager);

//     const sf = new SuperfluidSDK.Framework({
//         ...extractWeb3Options(options),
//         version: protocolReleaseVersion,
//         additionalContracts: [
//             "MaticBridgedNativeSuperTokenProxy",
//             "IMaticBridgedNativeSuperToken",
//         ],
//         contractLoader: builtTruffleContractLoader,
//     });
//     await sf.initialize();

//     const {MaticBridgedNativeSuperTokenProxy, IMaticBridgedNativeSuperToken} =
//         sf.contracts;

//     const superTokenFactory = await sf.contracts.ISuperTokenFactory.at(
//         await sf.host.getSuperTokenFactory.call()
//     );

//     console.log("Deploying MaticBridgedNativeSuperTokenProxy...");
//     const proxy = await MaticBridgedNativeSuperTokenProxy.new(
//         childChainManager
//     );

//     const token = await IMaticBridgedNativeSuperToken.at(proxy.address);

//     console.log("Invoking initializeCustomSuperToken...");
//     await superTokenFactory.initializeCustomSuperToken(token.address);

//     console.log("Invoking initialize...");
//     await token.initialize(ZERO_ADDRESS, 18, superTokenName, superTokenSymbol);

//     console.log(`Matic Bridged Native SuperToken deployed at ${token.address}`);
// });
// © 2022 GitHub, Inc.
// Terms
// Privacy
// Security
// Status
// Docs
// Contact GitHub
// Pricing
// API
// Training
// Blog
// About
