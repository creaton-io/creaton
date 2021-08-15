import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";

const timeTravel = async (time: number) => {
    const startBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
    await network.provider.send("evm_increaseTime", [time]);
    await network.provider.send("evm_mine");
    const endBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());

    console.log(`\tTime Travelled ${time} (sec) => FROM ${startBlock.timestamp} TO ${endBlock.timestamp}`);
};  

describe("Reaction Tokens", function () {
    let owner: SignerWithAddress,
        alice: SignerWithAddress,
        bob: SignerWithAddress,
        addrs: SignerWithAddress[];

    let erc20Contract: Contract;
    let erc721Contract: Contract;

    // SuperFluid config
    const sfHost: Address = process.env.SUPERFLUID_HOST || '';
    const sfCfa: Address = process.env.SUPERFLUID_CFA || '';
    const sfSuperTokenFactory: Address = process.env.SUPERFLUID_SUPERTOKENFACTORY || '';
    const sfResolver: Address = process.env.SUPERFLUID_RESOLVER || '';
    const sfVersion: string = process.env.SUPERFLUID_VERSION || '';
    const tokenMetadataURI: string = "https://gateway.pinata.cloud/ipfs/QmbVsqnwUrDJBBdbr1wjC4FZNKdN5i2jQoBJyGoea5bYy9";

    beforeEach(async function () {
        // Get some signers
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        // Deploy a dummy ERC20 token to be used later
        const dummyErc20Name = "DummyErc20";
        const contractFactory = await ethers.getContractFactory(dummyErc20Name);
        erc20Contract = await contractFactory.deploy(ethers.utils.parseEther("10000"));

        expect(erc20Contract.address).to.be.properAddress;
        expect(await erc20Contract.name()).to.be.equal(dummyErc20Name);

        // Deploy a dummy ERC721(nft) token to be used later
        const dummyErc721Name = "DummyErc721";
        const contractNftFactory = await ethers.getContractFactory(dummyErc721Name);
        erc721Contract = await contractNftFactory.deploy();
        await erc721Contract.mint(23);

        expect(erc721Contract.address).to.be.properAddress;
        expect(await erc721Contract.name()).to.be.equal(dummyErc721Name);
    });

    it("Should deploy a new Reaction Factory Contract", async function () {
        // Deploy Reaction Factory
        const contractFactory = await ethers.getContractFactory("ReactionFactory");
        let reactionFactoryContract: Contract = await contractFactory.deploy();
        expect(reactionFactoryContract.address).to.be.properAddress;

        // Init Factory
        await expect(reactionFactoryContract.initialize(sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion))
            .to.emit(reactionFactoryContract, "Initialized");

        // Deploy new Reaction Token
        const reactionTokenName: string = 'Like';
        const reactionTokenSymbol: string = 'LIKE';

        let tx = await reactionFactoryContract.deployReaction(reactionTokenName, reactionTokenSymbol, tokenMetadataURI);
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "ReactionDeployed"})[0];
        
        expect(receipt.args.creator).to.be.equal(owner.address);
        expect(receipt.args.reactionContractAddr).to.be.properAddress;
        expect(receipt.args.reactionTokenName).to.be.equal(reactionTokenName);
        expect(receipt.args.reactionTokenSymbol).to.be.equal(reactionTokenSymbol);
        expect(receipt.args.tokenMetadataURI).to.be.equal(tokenMetadataURI);
    });
    
    it("Should create & get superTokens on the Reaction Factory", async function () {
        // Deploy Reaction Factory
        const contractFactory = await ethers.getContractFactory("ReactionFactory");
        let reactionFactoryContract: Contract = await contractFactory.deploy();
        expect(reactionFactoryContract.address).to.be.properAddress;

        // Init Factory
        await expect(reactionFactoryContract.initialize(sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion))
            .to.emit(reactionFactoryContract, "Initialized");

        expect(await reactionFactoryContract.isSuperToken(erc20Contract.address)).to.be.false;
        expect(await reactionFactoryContract.getSuperToken(erc20Contract.address)).to.be.equal("0x0000000000000000000000000000000000000000");

        // Create the SuperToken
        let tx = await reactionFactoryContract.createSuperToken(erc20Contract.address);
        await tx.wait();

        const superToken = await reactionFactoryContract.getSuperToken(erc20Contract.address);
        expect(superToken).to.be.properAddress;
        expect(superToken).to.be.not.equal("0x0000000000000000000000000000000000000000");
        expect(await reactionFactoryContract.isSuperToken(superToken)).to.be.true;
        await expect(reactionFactoryContract.createSuperToken(superToken)).to.be.revertedWith("ReactionFactory: Token is already a SuperToken");
        expect(await reactionFactoryContract.getSuperToken(superToken)).to.be.equal(superToken);
    });

    it("Should Stake & Mint some reaction tokens", async function () {
        // Deploy Reaction Factory
        const contractFactory = await ethers.getContractFactory("ReactionFactory");
        const reactionFactoryContract: Contract = await contractFactory.deploy();

        // Init Factory
        await expect(reactionFactoryContract.initialize(sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion))
            .to.emit(reactionFactoryContract, "Initialized");

        // Deploy new Reaction Token
        const reactionTokenName: string = 'Like';
        const reactionTokenSymbol: string = 'LIKE';
        
        let tx = await reactionFactoryContract.deployReaction(reactionTokenName, reactionTokenSymbol, tokenMetadataURI);
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "ReactionDeployed"})[0];

        let reactionTokenContractAddr: Address = receipt.args.reactionContractAddr;
        expect(reactionTokenContractAddr).to.be.properAddress;

        const reactionTokenContract = await ethers.getContractAt("ReactionToken", reactionTokenContractAddr);
                
        // Approve tokens sending
        const stakingAmount: BigNumber = ethers.utils.parseEther("1000");
        await expect(erc20Contract.approve(reactionTokenContract.address, stakingAmount))
            .to.emit(erc20Contract, "Approval");

        // Staking
        tx = await reactionTokenContract.stakeAndMint(stakingAmount, erc20Contract.address, erc721Contract.address, 1);
        receipt = await tx.wait();
        let stakedReceipt = receipt.events?.filter((x: any) => {return x.event == "Staked"})[0];
        expect(stakedReceipt.args.author).to.be.equal(owner.address);
        expect(stakedReceipt.args.stakingTokenAddress).to.be.equal(erc20Contract.address);

        let flowReceipt = receipt.events?.filter((x: any) => {return x.event == "Flowed"})[0];
        expect(flowReceipt.args.flow).to.be.properAddress;
        expect(flowReceipt.args.amount).to.be.equal(stakingAmount);
        expect(flowReceipt.args.stakingTokenAddress).to.be.equal(erc20Contract.address);
        expect(flowReceipt.args.recipient).to.be.equal(owner.address);
        expect(flowReceipt.args.stakingSuperTokenAddress).to.be.properAddress;

        const firstSuperTokenAddress = flowReceipt.args.stakingSuperTokenAddress;

        expect(await reactionTokenContract.balanceOf(erc721Contract.address)).to.equal(stakingAmount);

        const superTokenContract = await ethers.getContractAt("@superfluid-finance_1/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol:ISuperToken", firstSuperTokenAddress);

        await timeTravel(3600); // ONE HOUR LATER ... 🐙
        const secondsInAMonth = 2592000;
        const expectedInOneHour = stakingAmount.div(secondsInAMonth).mul(3600);
        expect(+(await superTokenContract.balanceOf(owner.address)).toString()).to.be.closeTo(+expectedInOneHour.toString(), +ethers.utils.parseEther("1").toString());

        // Staking with no approval
        await expect(reactionTokenContract.stakeAndMint(stakingAmount, erc20Contract.address, erc721Contract.address, 1)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

        // Staking a bit more
        await expect(erc20Contract.approve(reactionTokenContract.address, stakingAmount))
            .to.emit(erc20Contract, "Approval");
        await expect(reactionTokenContract.stakeAndMint(stakingAmount, erc20Contract.address, erc721Contract.address, 1))
            .to.emit(reactionTokenContract, "Staked");

        await timeTravel(3600*24*30); // ABOUT A MONTH LATER ... 🐙
        expect(+(await superTokenContract.balanceOf(owner.address)).toString()).to.be.closeTo(+stakingAmount.mul(2).toString(), +ethers.utils.parseEther("2").toString());

        // Staking & Mint with a different erc20
        const contractFactory2 = await ethers.getContractFactory("DummyErc20");
        const diffErc20Contract = await contractFactory2.deploy(ethers.utils.parseEther("10000"));
        await expect(diffErc20Contract.approve(reactionTokenContract.address, stakingAmount))
            .to.emit(diffErc20Contract, "Approval");

        // Staking
        tx = await reactionTokenContract.stakeAndMint(stakingAmount, diffErc20Contract.address, erc721Contract.address, 1);
        receipt = await tx.wait();
        stakedReceipt = receipt.events?.filter((x: any) => {return x.event == "Staked"})[0];
        expect(stakedReceipt.args.author).to.be.equal(owner.address);
        expect(stakedReceipt.args.stakingTokenAddress).to.be.equal(diffErc20Contract.address);
        
        flowReceipt = receipt.events?.filter((x: any) => {return x.event == "Flowed"})[0];
        expect(flowReceipt.args.flow).to.be.properAddress;
        expect(flowReceipt.args.amount).to.be.equal(stakingAmount);
        expect(flowReceipt.args.stakingTokenAddress).to.be.equal(diffErc20Contract.address);
        expect(flowReceipt.args.recipient).to.be.equal(owner.address);
        expect(flowReceipt.args.stakingSuperTokenAddress).to.be.properAddress;

        expect(flowReceipt.args.stakingSuperTokenAddress).to.be.not.equal(firstSuperTokenAddress);

        // Check the final reaction token balance
        expect(await reactionTokenContract.balanceOf(erc721Contract.address)).to.equal(stakingAmount.mul(3));
    });

    it("Should Stake & Mint some reaction tokens using a SuperToken", async function () {
        // Deploy Reaction Factory
        const contractFactory = await ethers.getContractFactory("ReactionFactory");
        const reactionFactoryContract: Contract = await contractFactory.deploy();

        // Init Factory
        await expect(reactionFactoryContract.initialize(sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion))
            .to.emit(reactionFactoryContract, "Initialized");

        // Deploy new Reaction Token
        const reactionTokenName: string = 'Like';
        const reactionTokenSymbol: string = 'LIKE';
        
        let tx = await reactionFactoryContract.deployReaction(reactionTokenName, reactionTokenSymbol, tokenMetadataURI);
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "ReactionDeployed"})[0];

        let reactionTokenContractAddr: Address = receipt.args.reactionContractAddr;
        expect(reactionTokenContractAddr).to.be.properAddress;

        const reactionTokenContract = await ethers.getContractAt("ReactionToken", reactionTokenContractAddr);
                
        // Approve tokens sending
        const stakingAmount: BigNumber = ethers.utils.parseEther("1000");
        await expect(erc20Contract.approve(reactionTokenContract.address, stakingAmount))
            .to.emit(erc20Contract, "Approval");
        // Staking
        tx = await reactionTokenContract.stakeAndMint(stakingAmount, erc20Contract.address, erc721Contract.address, 1);
        receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "Flowed"})[0];

        const superTokenContract = await ethers.getContractAt("@superfluid-finance_1/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol:ISuperToken", receipt.args.stakingSuperTokenAddress);

        await timeTravel(3600*24*14); // ABOUT 2 WEEKS LATER ... 🐙

        // Transfer the supertokens to someone else just in case...
        const superTokenStakingAmount: BigNumber = (await superTokenContract.balanceOf(owner.address));

        await expect(superTokenContract.transferFrom(owner.address, alice.address, superTokenStakingAmount))
            .to.emit(superTokenContract, "Transfer");

        // Staking & Mint with the SuperToken
        await expect(superTokenContract.connect(alice).approve(reactionTokenContract.address, superTokenStakingAmount))
            .to.emit(superTokenContract, "Approval");

        // Staking
        tx = await reactionTokenContract.connect(alice).stakeAndMint(superTokenStakingAmount, superTokenContract.address, erc721Contract.address, 1);
        receipt = await tx.wait();
        let receiptStaked = receipt.events?.filter((x: any) => {return x.event == "Staked"})[0];
        let receiptFlow = receipt.events?.filter((x: any) => {return x.event == "Flowed"})[0];
        expect(receiptStaked.args.stakingTokenAddress).to.be.equal(superTokenContract.address);
        expect(receiptFlow.args.stakingSuperTokenAddress).to.be.equal(superTokenContract.address);
    });

    it("Should emit Reacted when Stake & Mint", async function () {
        // Deploy Reaction Factory
        const contractFactory = await ethers.getContractFactory("ReactionFactory");
        const reactionFactoryContract: Contract = await contractFactory.deploy();

        // Init Factory
        await expect(reactionFactoryContract.initialize(sfHost, sfCfa, sfSuperTokenFactory, sfResolver, sfVersion))
            .to.emit(reactionFactoryContract, "Initialized");

        // Deploy new Reaction Token
        const reactionTokenName: string = 'Like';
        const reactionTokenSymbol: string = 'LIKE';
        
        let tx = await reactionFactoryContract.deployReaction(reactionTokenName, reactionTokenSymbol, tokenMetadataURI);
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "ReactionDeployed"})[0];

        let reactionTokenContractAddr: Address = receipt.args.reactionContractAddr;
        expect(reactionTokenContractAddr).to.be.properAddress;

        const reactionTokenContract = await ethers.getContractAt("ReactionToken", reactionTokenContractAddr);
                
        // Approve tokens sending
        const stakingAmount: BigNumber = ethers.utils.parseEther("1000");
        await expect(erc20Contract.approve(reactionTokenContract.address, stakingAmount))
            .to.emit(erc20Contract, "Approval");

        // Staking
        const tokenId = 3;
        await expect(reactionTokenContract.stakeAndMint(stakingAmount, erc20Contract.address, erc721Contract.address, tokenId))
        .to.emit(reactionTokenContract, "Reacted")
        .withArgs(
            owner.address,
            erc721Contract.address,
            tokenId,
            reactionTokenContract.address,
            stakingAmount,
            reactionTokenName,
            reactionTokenSymbol
        );
    });
});