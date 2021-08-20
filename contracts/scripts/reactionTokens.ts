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

const deployReactionFactory = async () => {
    const sfHost: Address = process.env.SUPERFLUID_HOST || '';
    const sfCfa: Address = process.env.SUPERFLUID_CFA || '';
    const sfSuperTokenFactory: Address = process.env.SUPERFLUID_SUPERTOKENFACTORY || '';
    const sfResolver: Address = process.env.SUPERFLUID_RESOLVER || '';
    const sfVersion: string = process.env.SUPERFLUID_VERSION || '';

    await deployContract(
        "ReactionFactory",
        "0xdF83f67321635C8c2Df962C0FB2ab9C8c92dBaB1",
        [sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion]
    );
};

const upgradeReactionFactory = async (contractCurrentDeployedAddress: Address) =>
    await upgradeContract(
        "ReactionFactory",
        contractCurrentDeployedAddress,
    );

// Deployment
deployReactionFactory().then(console.log).catch(console.error);
// upgradeReactionFactory().then(console.log).catch(console.error);