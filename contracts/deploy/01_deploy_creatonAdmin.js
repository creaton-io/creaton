const func = async function (hre) {
  let {admin, treasury} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;
  // const useProxy = !hre.network.live;

  const SuperfluidSDK = require('@superfluid-finance/js-sdk');

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  //Superfluid, work in progress
  //1820 contract not necesarry on goerli
  /*
  console.log('Static erc1820 deployment initiated');
  const rawTx = {
    nonce: 0,
    gasPrice: 10000,
    value: 0,
    data: '0x' + require('../src/superfluid/introspection/ERC1820Registry.json').bin,
    gasLimit: 800000,
    v: 27,
    r: '0x1820182018201820182018201820182018201820182018201820182018201820',
    s: '0x1820182018201820182018201820182018201820182018201820182018201820',
  };

  console.log('test');
  //const tx = new Transaction(rawTx);


  const signer = await ethers.getSigners();
  const res = {
    sender: ethUtils.toChecksumAddress('0x' + tx.getSenderAddress().toString('hex')),
    rawTx: '0x' + tx.serialize().toString('hex'),
    contractAddr: ethUtils.toChecksumAddress(
      '0x' + ethUtils.generateAddress(tx.getSenderAddress(), ethUtils.toBuffer(0)).toString('hex')
    ),
  };

  const tx1 = await signer[0].sendTransaction({
    to: res.sender,
    value: ethers.utils.parseEther('0.08'), //ethers.utils.parseEther("0.08"),
  });
  await tx1.wait();
  console.log('erc1820 target address funded');
  const tx2 = await ethers.provider.sendTransaction(res.rawTx);
  await tx2.wait();
  console.log('successful erc1820 deploy!');*/

  const version = process.env.RELEASE_VERSION || 'v1';
  console.log('release version:', version);
  // console.log('chain id', network.config.chainId);

  const sf = new SuperfluidSDK.Framework({
    chainId: 80001,
    version: 'v1',
    web3Provider: await hre.web3.currentProvider,
    tokens: ['fUSDC'],
  });
  await sf.initialize();

  const biconomyTrustedforwarder = '0x2B99251eC9650e507936fa9530D11dE4d6C9C05c';

  const usdcx = sf.tokens.fUSDCx;
  //console.log('usdc', sf.tokens.fUSDC.address);
  //console.log('usdcx', usdc.address);
  //const usdcx = await sf.contracts.ISuperToken.at(sf.tokens.fUSDC);

  // proxy only in non-live network (localhost and hardhat) enabling HCR (Hot Contract Replaement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy('CreatonAdmin', {
    from: admin,
    args: [sf.host.address, sf.agreements.cfa.address, usdcx.address, treasury, 90, biconomyTrustedforwarder],
    log: true,
  });
  // when live network, record the script as executed to prevent rexecution
};

module.exports = func;
func.id = '01_deploy_creatonAdmin'; // id required to prevent reexecution
func.tags = ['Creatonadmin'];
