import { BigNumber } from "ethers";
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
    const STAKING_ERC20_ADDRESS = "0x4154d85B05792b421ff1CAFFC76b764eBe7aA831";
    const MIN_JURY_SIZE: number = 3;
    const JUROR_MAX_DAYS_DECIDING: number = 2;
    const JUROR_PENALTY_PERCENTAGE: number = 5;
    const JUROR_PROFIT_PERCENTAGE: number = 5;
    const REPORTER_PENALTY_PERCENTAGE: number = 5;
    const REPORTER_PROFIT_PERCENTAGE: number = 5;
    const CASE_STAKED_THRESHOLD: BigNumber = ethers.utils.parseEther("5000");
    const MIN_JUROR_STAKE: BigNumber = ethers.utils.parseEther("50");

    await deployContract(
        "Moderation",
        "0xdF83f67321635C8c2Df962C0FB2ab9C8c92dBaB1",
        [   
            STAKING_ERC20_ADDRESS, 
            CASE_STAKED_THRESHOLD, 
            MIN_JURY_SIZE, 
            MIN_JUROR_STAKE, 
            JUROR_MAX_DAYS_DECIDING, 
            JUROR_PENALTY_PERCENTAGE,
            JUROR_PROFIT_PERCENTAGE,
            REPORTER_PENALTY_PERCENTAGE,
            REPORTER_PROFIT_PERCENTAGE,
            BICONOMY_FORWARDED_MUMBAI
        ]
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