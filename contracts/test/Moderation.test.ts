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

describe("Moderation system", () => {
    let owner: SignerWithAddress,
        alice: SignerWithAddress,
        bob: SignerWithAddress,
        addrs: SignerWithAddress[];

    let erc20Contract: Contract;
    let erc721Contract: Contract;
    let moderationContract: Contract;

    beforeEach(async () => {
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

        // Deploy Moderation
        const contractModerationFactory = await ethers.getContractFactory("Moderation");
        moderationContract = await contractModerationFactory.deploy();
        expect(moderationContract.address).to.be.properAddress;

        await expect(moderationContract.initialize(erc20Contract.address))
            .to.emit(moderationContract, "Initialized");
    });

    describe("Court", async () => {
        it("Should fail accepting a juror", async () => {
            const stake: BigNumber = ethers.utils.parseEther("1000");

            // Not enough allowance
            await expect(moderationContract.addJuror(stake)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
            
            // Already a Juror
            await expect(erc20Contract.approve(moderationContract.address, stake.mul(2))).to.emit(erc20Contract, "Approval");
            await expect(moderationContract.addJuror(stake))
                    .to.emit(moderationContract, "JurorAdded")
                    .withArgs(owner.address, stake);
            await expect(moderationContract.addJuror(stake)).to.be.revertedWith("Moderation: MsgSender is already a Juror");
        });

        it("Should accept a juror when staking", async () => {
            const stake: BigNumber = ethers.utils.parseEther("1000");
            const initialBalance: BigNumber = await erc20Contract.balanceOf(owner.address);
            const expectedBalance = initialBalance.sub(stake);

            await expect(erc20Contract.approve(moderationContract.address, stake)).to.emit(erc20Contract, "Approval");
            await expect(moderationContract.addJuror(stake))
                    .to.emit(moderationContract, "JurorAdded")
                    .withArgs(owner.address, stake);

            expect(await erc20Contract.balanceOf(moderationContract.address)).to.be.equal(stake);
            expect(await erc20Contract.balanceOf(owner.address)).to.be.equal(expectedBalance);
            expect(await moderationContract.jurors(owner.address)).to.be.equal(stake);
        });

        it("Should remove jurors and return the stake", async () => {
            const stake: BigNumber = ethers.utils.parseEther("1000");
            const initialBalance: BigNumber = await erc20Contract.balanceOf(owner.address);

            await erc20Contract.approve(moderationContract.address, stake);
            await moderationContract.addJuror(stake);

            await expect(moderationContract.removeJuror())
                    .to.emit(moderationContract, "JurorRemoved")
                    .withArgs(owner.address, stake);

            expect(await erc20Contract.balanceOf(moderationContract.address)).to.be.equal(0);
            expect(await erc20Contract.balanceOf(owner.address)).to.be.equal(initialBalance);
            expect(await moderationContract.jurors(owner.address)).to.be.equal(0);
        });
    });

    // describe("Cases", async () => {
    //     beforeEach(async function () {
    //     });

    //     it("Should accept reported content", async () => {
    //         expect(false).to.be.true;
    //     });

    //     it("Should return staked to reporter after deadline", async () => {
    //         expect(false).to.be.true;
    //     });

    //     it("Should set to dispute the content and assign jurors once threshold is hit", async () => {
    //         expect(false).to.be.true;
    //     });
        
    //     it("Should pick up a new juror if a juror didn't rule the dispute on deadline", async () => {
    //         expect(false).to.be.true;
    //     });
    // });

    // describe("Ruling", async () => {
    //     beforeEach(async function () {
    //     });

    //     it("Should set the content to remove if ruled", async () => {
    //         expect(false).to.be.true;
    //     });

    //     it("Should auto-compound rewards to juror when ruled and staked to reporters", async () => {
    //         expect(false).to.be.true;
    //     });
    // });
    
});