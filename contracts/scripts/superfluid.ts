/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */


const Superfluid_ABI = require('./abi.js');
const SuperfluidSDK = require('@superfluid-finance/js-sdk');
const { wad4human } = require("@decentral.ee/web3-helpers");
import {parseUnits, parseEther} from '@ethersproject/units';
import {defaultAbiCoder} from '@ethersproject/abi'

const hre = require('hardhat');
const ethers = hre.ethers;

let sf: any, usdc: any, usdcx: any, app: any, usdcBalance, usdcxBalance, usdcApproved;
let sender: any;
let contractAddr = '0x7ea0C73e43aba7F0c823175d769b4520428dF221';
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
  usdcx = sf.tokens.fUSDCx
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

async function mint() {
  await waitFor(usdc.mint(subscriber, parseUnits('1000', 18), {from: subscriber}));
  console.log('minted', wad4human(await usdc.balanceOf(subscriber)), 'usdc');
}

async function approveUSDC() {
  const tx = await waitFor(usdc.approve(usdcx.address, parseUnits('900', 18), {from: subscriber,}));
  usdcApproved = await usdc.allowance(subscriber, usdcx.address);
  console.log('approved', wad4human(usdcApproved), 'usdc');
}

async function convertUSDCx() {
  const tx = await usdcx.upgrade(parseUnits('900', 18), {from: subscriber});
  usdcxBalance = wad4human(await usdcx.balanceOf(subscriber));
  console.log('converted', usdcxBalance, 'usdc to usdcx');
}

async function sendusdcx() {
  const tx = await usdcx.transfer(contractAddr, parseUnits('100', 18), {from: subscriber});
  console.log('creator contract has', wad4human(await usdcx.balanceOf(contractAddr), 'usdcx'));
}

async function support(){
  let call;
  let MINIMUM_GAME_FLOW_RATE = parseUnits('2', 18).div(3600 * 24 * 30);
  call = [
    [
      201, // create constant flow (10/mo)
      sf.agreements.cfa.address,
      sf.web3.eth.abi.encodeParameters(
        ['bytes', 'bytes'],
        [
          sf.agreements.cfa.contract.methods.createFlow(
            usdcx.address,
            contractAddr,
            MINIMUM_GAME_FLOW_RATE.toString(),
            '0x',
          ).encodeABI(),
          defaultAbiCoder.encode(
            ['string', 'string'],
            ['creaton', 'rules']
          )
        ]
      ),
    ],
  ];
  const tx = await sf.host.batchCall(call, {from: subscriber});
  console.log(await app.subscribers('0x1022aF857d2154Bc98D63051FbBa12DD44257246'));
}

async function subscribe(){
  // await mint();
  // await approveUSDC();
  // await convertUSDCx();
  // await sendusdcx()
  await support();
}

async function main(){
  await loadAdmin();
  // const tx = await waitFor(adminContract.deployCreator('test metadata', 3));
  // console.log(tx);
  await loadSuperfluid();
  await subscribe();
}

main()
  .then(() => {
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  
