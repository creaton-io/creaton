/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */

// const hre = require('hardhat');
// const ethers = hre.ethers;

// @ts-ignore
let creator: any;
// @ts-ignore
let stakingContract: any, create: any;
// let abi = [{"inputs": [
//         {
//           "internalType": "address",
//           "name": "spender",
//           "type": "address"
//         },
//         {
//           "internalType": "uint256",
//           "name": "amount",
//           "type": "uint256"
//         }
//       ],
//       "name": "approve",
//       "outputs": [
//         {
//           "internalType": "bool",
//           "name": "",
//           "type": "bool"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     }]

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function loadAdmin(){
  console.log('load staker');
  ({creator} = await hre.getNamedAccounts());
  console.log(creator);
  stakingContract = await ethers.getContract('MetatxStaking', creator);
  // create = await ethers.getContractAt(abi, "0x76ADB8ea0bfB53242046AD1D6BeE2dDb3C6a866E", creator);
}


function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(){
  await loadAdmin();
  while (true){
    let reward = await stakingContract.earned(creator)
    console.log(reward.toNumber())
    await sleep(1000)
  }
  // console.log("Approving the staking contract...")
  // const tx1 = await waitFor(create.approve(stakingContract.address, ethers.BigNumber.from(2).pow(256).sub(1)));
  // console.log(tx1);
  // console.log("stake 5 CRTs...")
  // const tx2 = await waitFor(stakingContract.stake(ethers.utils.parseUnits("5", 18)));
  // console.log(tx2);

}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

