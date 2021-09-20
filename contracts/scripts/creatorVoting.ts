import { ethers, upgrades } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";

const deployContract = async (
  contractName: string,
  finalOwnerAddress: Address,
  initializerArgs?: any[]
): Promise<string> => {
  const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  console.log("Deploying contract with the account:", owner.address);

  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(
    ContractFactory,
    initializerArgs
  );

  console.log(`${contractName} deployed to:`, contract.address);

//   await contract.transferOwnership(finalOwnerAddress);
//   console.log("Ownership transfered to:", finalOwnerAddress);

  return contract.address;
};

const upgradeContract = async (
  contractName: string,
  contractCurrentDeployedAddress: Address
) => {
  const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  console.log("Upgrading contract with the account:", owner.address);

  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await upgrades.upgradeProxy(
    contractCurrentDeployedAddress,
    ContractFactory
  );

  console.log(`${contractName} upgraded, address:`, contract.address);
};

const deployVotingFactory = async () => {
    await deployContract(
        "VotingFactory",
        "0xdF83f67321635C8c2Df962C0FB2ab9C8c92dBaB1",
        []
    );
};

const upgradeVotingFactory = async (contractCurrentDeployedAddress: Address) =>
    await upgradeContract(
        "VotingFactory",
        contractCurrentDeployedAddress,
    );

// Deployment
deployVotingFactory().then(console.log).catch(console.error);
// upgradeVotingFactory().then(console.log).catch(console.error);