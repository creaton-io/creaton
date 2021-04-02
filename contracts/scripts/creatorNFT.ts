/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */

const hre = require('hardhat');
const ethers = hre.ethers;

let creator: any, subscriber: any;
let adminContract: any;
let sender: any, contractAddr: any;

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function loadAdmin(){
  console.log('load admin');
  ({creator, subscriber} = await hre.getNamedAccounts());
  console.log(creator);
  adminContract = await ethers.getContract('CreatonAdmin', creator);
  adminContract.on('CreatorDeployed', (...response: any[]) => {
    [sender, contractAddr] = response;
    console.log(sender, 'made this contract', contractAddr);
  });
}

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(){
  await loadAdmin();
  const tx = await waitFor(adminContract.deployCreator('first nft', 3));
  console.log(tx);
  console.log("brrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
  await sleep(1000);
  console.log(contractAddr);
  let creatorContract = await ethers.getContractAt('CreatorV1', contractAddr, creator);
  const tx2 = await waitFor(creatorContract.createFreeTier("Creaton", "CRT"));
  console.log(tx2);
  console.log("brrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
  let nftAddress = creatorContract.publicPostNFT();
  await sleep(1000);
  console.log("here", nftAddress);
  const tx3 = await waitFor(creatorContract.upload("QmVqvrvqrHWEXpy8dsRqXGuBgUXqgfPmtvNhnh2zusiFuo"));
  console.log(tx3);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

