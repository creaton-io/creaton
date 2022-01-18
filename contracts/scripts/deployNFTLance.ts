import { ethers } from "hardhat";

async function main(contractName: string, constructorArgs: any[], finalOwner: string) {
  const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log(
    `Owner [${owner.address}] Balance:`,
    ethers.utils.formatEther(await owner.getBalance()).toString()
  );
  
  const Contract = await ethers.getContractFactory(contractName);
  const deployed = await Contract.deploy(...constructorArgs);
  
  console.log(`${contractName} deployed to:`, deployed.address);
  
  await deployed.transferOwnership(finalOwner);
  console.log("Ownership transfered to:", finalOwner);
}

main("NFTLance", [], "0xdF83f67321635C8c2Df962C0FB2ab9C8c92dBaB1")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
