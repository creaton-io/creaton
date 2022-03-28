import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";

const BICONOMY_FORWARDED_MUMBAI = "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b";

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

    return await deployContract(
        "ReactionFactory",
        "0xdF83f67321635C8c2Df962C0FB2ab9C8c92dBaB1",
        [sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion, BICONOMY_FORWARDED_MUMBAI]
    );
};

const upgradeReactionFactory = async (contractCurrentDeployedAddress: Address) =>
    await upgradeContract(
        "ReactionFactory",
        contractCurrentDeployedAddress,
    );

const deployReactionToken = async(reactionFactoryAddress: Address) => {
  const contractFactory = await ethers.getContractFactory("ReactionFactory");
  const contract: Contract = contractFactory.attach(reactionFactoryAddress);

  const reactionTokenName: string = 'Like';
  const reactionTokenSymbol: string = 'LIKE';
  const stakingTokenAddress: string = '0x0000000000000000000000000000000000000000';
  const tokenMetadataURI: string = "https://gateway.pinata.cloud/ipfs/QmbVsqnwUrDJBBdbr1wjC4FZNKdN5i2jQoBJyGoea5bYy9";
  const monthDistributionPercentage: number = 100;
  let tx = await contract.deployReaction(reactionTokenName, reactionTokenSymbol, tokenMetadataURI, stakingTokenAddress, monthDistributionPercentage);
  let receipt = await tx.wait();
  receipt = receipt.events?.filter((x: any) => {return x.event == "ReactionDeployed"})[0];
  return receipt.args;
}

  
// Deployment
// deployReactionFactory().then(console.log).catch(console.error);
// upgradeReactionFactory().then(console.log).catch(console.error);

deployReactionToken("0xECD17187d641dEe69Ff9417d072EC0C8DC36A2B1").then(console.log).catch(console.error);