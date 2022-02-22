import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";

const MIN_JURY_SIZE: number = 3;
const JUROR_MAX_DAYS_DECIDING: number = 2;
const JUROR_SLASHING_PENALY: number = 5;
const CASE_STAKED_THRESHOLD: BigNumber = ethers.utils.parseEther("5000");

const sampleContentId: string = "0x17f6989baf123ec9571adaafccf0b69ae6b1ef3a-0";

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
        erc20Contract = await contractFactory.deploy(ethers.utils.parseEther("100000"));

        expect(erc20Contract.address).to.be.properAddress;
        expect(await erc20Contract.name()).to.be.equal(dummyErc20Name);

        // Send some funds to alice and bob
        await erc20Contract.transfer(alice.address, ethers.utils.parseEther("10000"));
        await erc20Contract.transfer(bob.address, ethers.utils.parseEther("10000"));
        await erc20Contract.transfer(addrs[0].address, ethers.utils.parseEther("10000"));
        await erc20Contract.transfer(addrs[1].address, ethers.utils.parseEther("10000"));
        await erc20Contract.transfer(addrs[2].address, ethers.utils.parseEther("10000"));

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

        await expect(moderationContract.initialize(erc20Contract.address, CASE_STAKED_THRESHOLD, MIN_JURY_SIZE, JUROR_MAX_DAYS_DECIDING, JUROR_SLASHING_PENALY))
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

        it("Should fail removing a juror", async () => {
            const stake: BigNumber = ethers.utils.parseEther("1000");
           
            // Not a Juror
            await expect(moderationContract.removeJuror()).to.be.revertedWith("Moderation: Address is not a Juror");

            // Juror status is not active
            // await expect(moderationContract.removeJuror()).to.be.revertedWith("Moderation: Juror must be idle");
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
            expect((await moderationContract.jurors(owner.address)).staked).to.be.equal(stake);
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
            expect((await moderationContract.jurors(owner.address)).staked).to.be.equal(0);
        });
    });

    describe("Cases", async () => {
        it("Should report content", async () => {
            const stake: BigNumber = ethers.utils.parseEther("1000");
            const contentId: string = sampleContentId;

            await erc20Contract.approve(moderationContract.address, stake.mul(2));
            await expect(moderationContract.reportContent(contentId, stake))
                .to.emit(moderationContract, "ContentReported")
                .withArgs(owner.address, contentId, stake);

            await expect(moderationContract.reportContent(contentId, stake))
                .to.emit(moderationContract, "ContentReported")
            expect(await moderationContract.reported(contentId)).to.be.equal(stake.mul(2));
        });

        it("Should set to dispute the content and assign jurors once threshold is hit and there's enough jurors", async () => {
            // Report with no jurors
            const stake: BigNumber = ethers.utils.parseEther("5000");
            const contentId: string = sampleContentId;

            await erc20Contract.approve(moderationContract.address, stake);
            await expect(moderationContract.reportContent(contentId, stake))
                .to.emit(moderationContract, "CaseBuilt")
                .withArgs(contentId);

            // Add some jurors
            const jurorStake: BigNumber = ethers.utils.parseEther("1000");
            await expect(erc20Contract.approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(alice).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(bob).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(moderationContract.addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(alice).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(bob).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");

            // Report again an check there's a jury assigned
            await erc20Contract.connect(alice).approve(moderationContract.address, stake);
            let tx = await moderationContract.connect(alice).reportContent(contentId, stake);
            let receipt = await tx.wait();
            receipt = receipt.events?.filter((x: any) => {return x.event == "JuryAssigned"})[0];
            expect(receipt.args.contentId).to.be.equal(contentId);
            expect(receipt.args.jury).to.have.lengthOf(MIN_JURY_SIZE);
            for(let i=0; i<MIN_JURY_SIZE; i++){
                expect(receipt.args.jury[i]).to.be.a.properAddress;
            }
        });

        it("Should fail reporting content", async () => {
            const stake: BigNumber = ethers.utils.parseEther("5000");
            const contentId: string = sampleContentId;

            // Not enough allowance
            await expect(moderationContract.reportContent(contentId, stake)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

            // Reassigning a jury when not assigned
            await expect(moderationContract.reassignInactiveJurors(contentId)).to.be.revertedWith("Moderation: Case status must be ASSIGNED");
        });

        it("Should pick up a new juror if a juror didn't rule the dispute on deadline", async () => {
            // Add some jurors
            const jurorStake: BigNumber = ethers.utils.parseEther("1000");
            await expect(erc20Contract.approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(alice).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(bob).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(addrs[0]).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(addrs[1]).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(addrs[2]).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(moderationContract.addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(alice).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(bob).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(addrs[0]).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(addrs[1]).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(addrs[2]).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");

            // Report
            const stake: BigNumber = ethers.utils.parseEther("5000");
            const contentId: string = sampleContentId;
            await erc20Contract.approve(moderationContract.address, stake);
            let tx = await moderationContract.reportContent(contentId, stake);
            let receipt = await tx.wait();
            receipt = receipt.events?.filter((x: any) => {return x.event == "JuryAssigned"})[0];
            expect(receipt.args.contentId).to.be.equal(contentId);
            expect(receipt.args.jury).to.have.lengthOf(MIN_JURY_SIZE);
            for(let i=0; i<MIN_JURY_SIZE; i++){
                expect(receipt.args.jury[i]).to.be.a.properAddress;
            }

            await timeTravel(3600 * 24 * JUROR_MAX_DAYS_DECIDING * 2);

            // Reassign Jury
            let tx2 = await moderationContract.reassignInactiveJurors(contentId);
            let receipt2 = await tx2.wait();
            receipt2 = receipt2.events?.filter((x: any) => {return x.event == "JuryReassigned"})[0];
            expect(receipt2.args.contentId).to.be.equal(contentId);
            expect(receipt2.args.jury).to.have.lengthOf(MIN_JURY_SIZE);
            for(let i=0; i<MIN_JURY_SIZE; i++){
                expect(receipt2.args.jury[i]).to.be.a.properAddress;
            }

            expect(receipt.args.jury).to.not.be.deep.equal(receipt2.args.jury);
        });
    });

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