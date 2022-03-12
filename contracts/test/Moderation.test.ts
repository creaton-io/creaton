import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const MIN_JURY_SIZE: number = 3;
const JUROR_MAX_DAYS_DECIDING: number = 2;
const JUROR_PENALTY_PERCENTAGE: number = 5;
const JUROR_PROFIT_PERCENTAGE: number = 5;
const REPORTER_PENALTY_PERCENTAGE: number = 5;
const REPORTER_PROFIT_PERCENTAGE: number = 5;
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
        erc20Contract = await contractFactory.deploy(ethers.utils.parseEther("10000000"));

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

        await expect(moderationContract.initialize(
            erc20Contract.address, 
            CASE_STAKED_THRESHOLD, 
            MIN_JURY_SIZE, 
            JUROR_MAX_DAYS_DECIDING, 
            JUROR_PENALTY_PERCENTAGE,
            JUROR_PROFIT_PERCENTAGE,
            REPORTER_PENALTY_PERCENTAGE,
            REPORTER_PROFIT_PERCENTAGE
        ))
        .to.emit(moderationContract, "Initialized");
    });

    describe("Court formation", async () => {
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

    describe("Content reporting and Cases formation", async () => {
        it("Should report content", async () => {
            const stake: BigNumber = ethers.utils.parseEther("1000");
            const contentId: string = sampleContentId;

            await erc20Contract.approve(moderationContract.address, stake.mul(2));
            await expect(moderationContract.reportContent(contentId, stake, 'https://arweave.net/hX29IJLEl6PFY-CxHqEJjrQ8FYALJ54wGc1f7LOQ6lA'))
                .to.emit(moderationContract, "ContentReported")
                .withArgs(owner.address, contentId, stake, 'https://arweave.net/hX29IJLEl6PFY-CxHqEJjrQ8FYALJ54wGc1f7LOQ6lA');

            await expect(moderationContract.reportContent(contentId, stake, ''))
                .to.emit(moderationContract, "ContentReported")

            let reported = await moderationContract.reported(contentId);
            expect(reported.staked).to.be.equal(stake.mul(2));
            expect(reported.reportersSize).to.be.equal(1);
            expect(await moderationContract.getUserReportStakedByContent(contentId, owner.address)).to.be.equal(stake.mul(2));

            await erc20Contract.connect(alice).approve(moderationContract.address, stake);
            await expect(moderationContract.connect(alice).reportContent(contentId, stake, ''))
            .to.emit(moderationContract, "ContentReported");
            
            reported = await moderationContract.reported(contentId);
            expect(reported.staked).to.be.equal(stake.mul(3));
            expect(reported.reportersSize).to.be.equal(2);
            expect(await moderationContract.getUserReportStakedByContent(contentId, alice.address)).to.be.equal(stake); 
        });

        it("Should set to dispute the content and assign jurors once threshold is hit and there's enough jurors", async () => {
            // Report with no jurors
            const stake: BigNumber = ethers.utils.parseEther("5000");
            const contentId: string = sampleContentId;

            await erc20Contract.approve(moderationContract.address, stake);
            await expect(moderationContract.reportContent(contentId, stake, ''))
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
            let tx = await moderationContract.connect(alice).reportContent(contentId, stake, '');
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
            await expect(moderationContract.reportContent(contentId, stake, '')).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

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
            let tx = await moderationContract.reportContent(contentId, stake, '');
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
            let foundReceipt = receipt2.events?.filter((x: any) => {return x.event == "JuryReassigned"})[0];
            expect(foundReceipt.args.contentId).to.be.equal(contentId);
            expect(foundReceipt.args.jury).to.have.lengthOf(MIN_JURY_SIZE);
            for(let i=0; i<MIN_JURY_SIZE; i++){
                expect(foundReceipt.args.jury[i]).to.be.a.properAddress;
            }
            expect(receipt.args.jury).to.not.be.deep.equal(foundReceipt.args.jury);

            // Testing withdraw for the penalty balance
            await expect(moderationContract.withdraw())
                .to.emit(erc20Contract, "Transfer")
                .withArgs(moderationContract.address, owner.address, jurorStake.mul(5).div(100).mul(3));
        });
    });

    describe("Ruling", async () => {
        beforeEach(async function () {
            // Add some jurors
            const jurorStake: BigNumber = ethers.utils.parseEther("1000");
            await expect(erc20Contract.approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(alice).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(erc20Contract.connect(bob).approve(moderationContract.address, jurorStake)).to.emit(erc20Contract, "Approval");
            await expect(moderationContract.addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(alice).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");
            await expect(moderationContract.connect(bob).addJuror(jurorStake)).to.emit(moderationContract, "JurorAdded");

            // Report
            const stake: BigNumber = ethers.utils.parseEther("5000");
            const contentId: string = sampleContentId;
            await erc20Contract.connect(addrs[0]).approve(moderationContract.address, stake);
            await expect(moderationContract.connect(addrs[0]).reportContent(contentId, stake, '')).to.emit(moderationContract, "JuryAssigned");
        });

        it("Jurors should be able to vote and case should conclude once the jury ruled", async () => {
            const contentId: string = sampleContentId;
            const voteOK: number = 2;
            const voteKO: number = 3;
            await expect(moderationContract.vote(contentId, voteOK))
                .to.emit(moderationContract, "JurorVoted")
                .withArgs(owner.address, contentId, voteOK);

            await expect(moderationContract.connect(alice).vote(contentId, voteKO))
                .to.emit(moderationContract, "JurorVoted")
                .withArgs(alice.address, contentId, voteKO);
            
            const fundingAmount = ethers.utils.parseEther("100000");
            await expect(erc20Contract.approve(moderationContract.address, fundingAmount)).to.emit(erc20Contract, "Approval");
            await moderationContract.fundTreasury(fundingAmount);

            await expect(moderationContract.connect(bob).vote(contentId, voteKO))
                .to.emit(moderationContract, "CaseClosed");

            let error: any;
            try {
                await moderationContract.closeCase(contentId);
            } catch(e){
                error = e;
            }
            expect(error.message).to.be.equal("VM Exception while processing transaction: reverted with reason string 'Moderation: Case status must be ASSIGNED'");
        });

        it("Should fail voting a non-juror or a wrong vote", async () => {
            const contentId: string = sampleContentId;
            const voteOK: number = 2;
            
            await expect(moderationContract.connect(addrs[0]).vote(contentId, voteOK))
                    .to.be.revertedWith("Moderation: Address is not a Juror");
            
            const voteINVALID: number = 200;
            await expect(moderationContract.vote(contentId, voteINVALID))
                    .to.be.revertedWith("Moderation: Invalid vote value");

            const wrongContentId: string = "0x2300089baf123ec9571adaafccf0b69ae6b1ef4b-9";
            await expect(moderationContract.vote(wrongContentId, voteOK))
                    .to.be.revertedWith("Moderation: Case status must be ASSIGNED");
        });

        it("Should fail rewarding if there is no balance in the treasury", async () => {
            const contentId: string = sampleContentId;
            const voteOK: number = 2;
            const voteKO: number = 3;
            await expect(moderationContract.vote(contentId, voteOK))
                .to.emit(moderationContract, "JurorVoted");
            await expect(moderationContract.connect(alice).vote(contentId, voteKO))
                .to.emit(moderationContract, "JurorVoted");
            
            let error: any;
            try {
                await expect(moderationContract.connect(bob).vote(contentId, voteKO))
                    .to.emit(moderationContract, "CaseClosed");
            } catch(e){
                error = e;
            }
            expect(error.message).to.be.equal("VM Exception while processing transaction: reverted with reason string 'Not enough balance in the treasury'");
        });

        it("Jurors should get rewarded and reporters penalized if OK", async () => {
            const contentId: string = sampleContentId;
            const voteOK: number = 2;

            const ownerInitialBalance = (await moderationContract.jurors(owner.address)).staked;
            const aliceInitialBalance = (await moderationContract.jurors(alice.address)).staked;
            const bobInitialBalance = (await moderationContract.jurors(bob.address)).staked;
            const reporterInitialBalance = await moderationContract.getUserReportStakedByContent(contentId, addrs[0].address);

            await expect(moderationContract.vote(contentId, voteOK))
                .to.emit(moderationContract, "JurorVoted");
            await expect(moderationContract.connect(alice).vote(contentId, voteOK))
                .to.emit(moderationContract, "JurorVoted");
            
            const fundingAmount = ethers.utils.parseEther("100000");
            await expect(erc20Contract.approve(moderationContract.address, fundingAmount))
                .to.emit(erc20Contract, "Approval");
            await moderationContract.fundTreasury(fundingAmount);

            await expect(moderationContract.connect(bob).vote(contentId, voteOK))
                .to.emit(moderationContract, "CaseClosed");

            const ownerFinalBalance = (await moderationContract.jurors(owner.address)).staked;
            const aliceFinalBalance = (await moderationContract.jurors(alice.address)).staked;
            const bobFinalBalance = (await moderationContract.jurors(bob.address)).staked;
            const reporterFinalBalance = await moderationContract.getUserReportStakedByContent(contentId, addrs[0].address);

            expect(ownerInitialBalance.add(ownerInitialBalance.mul(JUROR_PROFIT_PERCENTAGE).div(100))).to.be.equal(ownerFinalBalance);
            expect(aliceInitialBalance.add(aliceInitialBalance.mul(JUROR_PROFIT_PERCENTAGE).div(100))).to.be.equal(aliceFinalBalance);
            expect(bobInitialBalance.add(bobInitialBalance.mul(JUROR_PROFIT_PERCENTAGE).div(100))).to.be.equal(bobFinalBalance);

            expect(reporterInitialBalance.sub(reporterInitialBalance.mul(REPORTER_PENALTY_PERCENTAGE).div(100))).to.be.equal(reporterFinalBalance);
        });

        it("Jurors ands Reporters should get rewarded if KO", async () => {
            const contentId: string = sampleContentId;
            const voteKO: number = 3;

            const ownerInitialBalance = (await moderationContract.jurors(owner.address)).staked;
            const aliceInitialBalance = (await moderationContract.jurors(alice.address)).staked;
            const bobInitialBalance = (await moderationContract.jurors(bob.address)).staked;
            const reporterInitialBalance = await moderationContract.getUserReportStakedByContent(contentId, addrs[0].address);

            await expect(moderationContract.vote(contentId, voteKO))
                .to.emit(moderationContract, "JurorVoted");
            await expect(moderationContract.connect(alice).vote(contentId, voteKO))
                .to.emit(moderationContract, "JurorVoted");
            
            const fundingAmount = ethers.utils.parseEther("100000");
            await expect(erc20Contract.approve(moderationContract.address, fundingAmount))
                .to.emit(erc20Contract, "Approval");
            await moderationContract.fundTreasury(fundingAmount);

            await expect(moderationContract.connect(bob).vote(contentId, voteKO))
                .to.emit(moderationContract, "CaseClosed");

            const ownerFinalBalance = (await moderationContract.jurors(owner.address)).staked;
            const aliceFinalBalance = (await moderationContract.jurors(alice.address)).staked;
            const bobFinalBalance = (await moderationContract.jurors(bob.address)).staked;
            const reporterFinalBalance = await moderationContract.getUserReportStakedByContent(contentId, addrs[0].address);

            expect(ownerInitialBalance.add(ownerInitialBalance.mul(JUROR_PROFIT_PERCENTAGE).div(100))).to.be.equal(ownerFinalBalance);
            expect(aliceInitialBalance.add(aliceInitialBalance.mul(JUROR_PROFIT_PERCENTAGE).div(100))).to.be.equal(aliceFinalBalance);
            expect(bobInitialBalance.add(bobInitialBalance.mul(JUROR_PROFIT_PERCENTAGE).div(100))).to.be.equal(bobFinalBalance);

            expect(reporterInitialBalance.add(reporterInitialBalance.mul(REPORTER_PROFIT_PERCENTAGE).div(100))).to.be.equal(reporterFinalBalance);
        });
    });
    
});