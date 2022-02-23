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

    // await contract.transferOwnership(finalOwnerAddress);
    // console.log("Ownership transfered to:", finalOwnerAddress);

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

const deployModeration = async () => {
    const stakingErc20Address = "0xf6f765F4B7128602A93CB3B059A784d00a6D3D4e";
    const stakedThreshold = ethers.utils.parseEther("5000");
    const minJurySize = 3;
    const jurorMaxDaysDeciding = 2;
    const jurorSlashingPenalty = 5;

    await deployContract(
        "Moderation",
        "0xdF83f67321635C8c2Df962C0FB2ab9C8c92dBaB1",
        [stakingErc20Address, stakedThreshold, minJurySize, jurorMaxDaysDeciding, jurorSlashingPenalty]
    );
};

const upgradeModeration = async (contractCurrentDeployedAddress: Address) => {
    await upgradeContract(
        "Moderation",
        contractCurrentDeployedAddress,
    );
};

// Deployment
deployModeration().then(console.log).catch(console.error);
// upgradeModeration().then(console.log).catch(console.error);