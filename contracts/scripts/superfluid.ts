/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */


const Superfluid_ABI = require('./abi.js');
const SuperfluidSDK = require('@superfluid-finance/js-sdk');
const { wad4human } = require("@decentral.ee/web3-helpers");
const hre = require('hardhat');
const ethers = hre.ethers;

let sf, usdc, usdcx, app, usdcBalance, usdcxBalance, usdcApproved;
let sender: any, contractAddr: any;
let adminContract: any;
let creator: any, subscriber: any;

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function loadSuperfluid(){
  sf = new SuperfluidSDK.Framework({
    web3Provider: hre.web3.currentProvider,
    version: 'v1',
    chainId: 5,
    tokens: ["fUSDC"],
  });
  await sf.initialize();

  const usdcAddress = await sf.resolver.get('tokens.fUSDC');
  usdc = await ethers.getContractAt(Superfluid_ABI.TestToken, usdcAddress, subscriber);
  usdcx = sf.tokens.fUSDCx;
  // usdcx = await sf.getERC20Wrapper(usdc);
  app = await ethers.getContractAt('Creator', contractAddr, subscriber);
  usdcBalance = wad4human(await usdc.balanceOf(subscriber));
  usdcxBalance = wad4human(await usdcx.balanceOf(subscriber));
  usdcApproved = wad4human(await usdc.allowance(subscriber, usdc.address));
  console.log('user has', usdcBalance, 'usdc');
}

async function loadAdmin(){
  console.log('load admin');
  ({creator, subscriber} = await hre.getNamedAccounts());
  adminContract = await ethers.getContract('CreatonAdmin', creator);
  adminContract.on('CreatorDeployed', (...response: any[]) => {
    [sender, contractAddr] = response;
    console.log(sender, 'made this contract', contractAddr);
  });
}

async function main(){
  await loadAdmin();
  const tx = await waitFor(adminContract.deployCreator('test metadata', 3));
  // console.log(tx);
  await loadSuperfluid();
}

main()
  .then(() => {
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  
