import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";

describe("Creator Voting", function () {
    let owner: SignerWithAddress,
        alice: SignerWithAddress,
        bob: SignerWithAddress,
        addrs: SignerWithAddress[];

    let erc20Contract: Contract,
        anotherErc20Contract: Contract;

    beforeEach(async function () {
        // Get some signers
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        // Deploy a dummy ERC20 token to be used later
        const dummyErc20Name = "DummyErc20";
        let contractFactory = await ethers.getContractFactory(dummyErc20Name);
        erc20Contract = await contractFactory.deploy(ethers.utils.parseEther("10000"));
        expect(erc20Contract.address).to.be.properAddress;
        expect(await erc20Contract.name()).to.be.equal(dummyErc20Name);

        // Deploy a another ERC20 token to be used later
        contractFactory = await ethers.getContractFactory(dummyErc20Name);
        anotherErc20Contract = await contractFactory.deploy(ethers.utils.parseEther("10000"));
        expect(anotherErc20Contract.address).to.be.properAddress;
    });

    it("Should deploy a new voting contract questionnaire and accept votes", async function () {
        const creatorVotingFactory = await ethers.getContractFactory("VotingFactory");
        
        const question: string = "Is this a test question?";
        const description: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at quam ut dui varius finibus. Ut in scelerisque augue. Etiam euismod eget nisi vitae mollis. Fusce maximus faucibus libero. Quisque imperdiet, arcu ac fringilla feugiat, nulla elit consequat dui, vel vulputate nunc eros sit amet lectus. Nam nec metus finibus eros suscipit gravida. Proin vehicula nibh ac semper bibendum. In hac habitasse platea dictumst. Suspendisse blandit erat et nibh bibendum, sed malesuada dui euismod. Morbi id leo sapien. Morbi quis lacus blandit, malesuada purus et, molestie erat. Donec posuere augue nisi, sed interdum justo finibus ut. Cras aliquet sit amet velit ac efficitur.";
        const uri: string = "";
        const answers: string[] = ["yes", "no", "maybe"];
        const acceptedERC20: Address[] = [erc20Contract.address, anotherErc20Contract.address];
        const creatorVotingContract: Contract = await creatorVotingFactory.deploy();
        expect(creatorVotingContract.address).to.be.properAddress;

        // Init Factory
        await expect(creatorVotingContract.initialize())
            .to.emit(creatorVotingContract, "Initialized");

        let tx = await creatorVotingContract.createVotingProcess(question, description, uri, answers, acceptedERC20);
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "VotingProcessDeployed"})[0];
        expect(receipt.args.creator).to.be.equal(owner.address);
        expect(receipt.args.votingProcessAddress).to.be.properAddress;
        expect(receipt.args.question).to.be.equal(question);
        expect(receipt.args.description).to.be.equal(description);
        expect(receipt.args.uri).to.be.equal(uri);
        expect(receipt.args.answers).to.be.deep.equal(answers);
        expect(receipt.args.acceptedERC20).to.be.deep.equal(acceptedERC20);

        let votingProcessContractAddr: Address = receipt.args.votingProcessAddress;

        const votingProcessContract = await ethers.getContractAt("VotingProcess", votingProcessContractAddr);

        const questionnaireDetails = await votingProcessContract.getDetails();
        expect(questionnaireDetails[0]).to.be.equal(question);
        expect(questionnaireDetails[1]).to.be.equal(description);
        expect(questionnaireDetails[2]).to.be.deep.equal(answers);
        expect(questionnaireDetails[3]).to.be.deep.equal(acceptedERC20);

        // Voting
        const answerId = 0;
        const votingToken = erc20Contract.address;
        const votingAmount = 23;
        const answerId2 = 2;
        const votingToken2 = anotherErc20Contract.address;
        const votingAmount2 = 666;

        // Expected Allowance failure
        await expect(votingProcessContract.vote(answerId, votingToken, votingAmount)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

        await expect(erc20Contract.approve(votingProcessContract.address, votingAmount)).to.emit(erc20Contract, "Approval");
        await expect(anotherErc20Contract.approve(votingProcessContract.address, votingAmount2)).to.emit(anotherErc20Contract, "Approval");

        await expect(votingProcessContract.vote(answerId, votingToken, votingAmount))
            .to.emit(votingProcessContract, "Voted")
            .withArgs(answerId, votingToken, votingAmount);

        await expect(votingProcessContract.vote(answerId2, votingToken2, votingAmount2))
            .to.emit(votingProcessContract, "Voted")
            .withArgs(answerId2, votingToken2, votingAmount2);

        // Check the votes amount
        expect(await votingProcessContract.balanceOf(votingProcessContract.address, answerId)).to.be.equal(votingAmount);
        expect(await votingProcessContract.balanceOf(votingProcessContract.address, answerId2)).to.be.equal(votingAmount2);

        // Check the erc20 balance
        expect(await erc20Contract.balanceOf(votingProcessContract.address)).to.be.equal(votingAmount);
        expect(await anotherErc20Contract.balanceOf(votingProcessContract.address)).to.be.equal(votingAmount2);

        // Voting Results
        const votingResults = await votingProcessContract.results();
        expect(votingResults.length).to.be.equal(answers.length);
        expect(votingResults[answerId].toNumber()).to.be.equal(votingAmount);
        expect(votingResults[1].toNumber()).to.be.equal(0);
        expect(votingResults[answerId2].toNumber()).to.be.equal(votingAmount2);
    });

    it("Should fail in multiple circumstances", async function () {
        const creatorVotingFactory = await ethers.getContractFactory("VotingFactory");

        const question: string = "Is this a test question?";
        const description: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at quam ut dui varius finibus. Ut in scelerisque augue. Etiam euismod eget nisi vitae mollis. Fusce maximus faucibus libero. Quisque imperdiet, arcu ac fringilla feugiat, nulla elit consequat dui, vel vulputate nunc eros sit amet lectus. Nam nec metus finibus eros suscipit gravida. Proin vehicula nibh ac semper bibendum. In hac habitasse platea dictumst. Suspendisse blandit erat et nibh bibendum, sed malesuada dui euismod. Morbi id leo sapien. Morbi quis lacus blandit, malesuada purus et, molestie erat. Donec posuere augue nisi, sed interdum justo finibus ut. Cras aliquet sit amet velit ac efficitur.";
        const uri: string = "";
        const answers: string[] = ["yes", "no", "maybe"];
        const acceptedERC20: Address[] = [erc20Contract.address];
        const creatorVotingContract: Contract = await creatorVotingFactory.deploy();
        expect(creatorVotingContract.address).to.be.properAddress;

        // Init Factory
        await expect(creatorVotingContract.initialize())
            .to.emit(creatorVotingContract, "Initialized");

        let tx = await creatorVotingContract.createVotingProcess(question, description, uri, answers, acceptedERC20);
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "VotingProcessDeployed"})[0];
        expect(receipt.args.creator).to.be.equal(owner.address);

        let votingProcessContractAddr: Address = receipt.args.votingProcessAddress;

        const votingProcessContract = await ethers.getContractAt("VotingProcess", votingProcessContractAddr);

        const answerId = 0;
        const votingToken = erc20Contract.address;
        const votingAmount = 23;
        await expect(erc20Contract.approve(votingProcessContract.address, votingAmount)).to.emit(erc20Contract, "Approval");

        // Wrong AnswerId
        await expect(votingProcessContract.vote(4, votingToken, votingAmount)).to.be.revertedWith("VotingProcess: answerId must exist");

        // Wrong tokenId (not accepted)
        await expect(votingProcessContract.vote(answerId, anotherErc20Contract.address, votingAmount)).to.be.revertedWith("VotingProcess: votingToken Address not allowed");

        // Wrong tokenId 0x
        await expect(votingProcessContract.vote(answerId, '0x0000000000000000000000000000000000000000', votingAmount)).to.be.revertedWith("VotingProcess: votingToken Address can't be 0x");

        // Wrong Amount
        await expect(votingProcessContract.vote(answerId, erc20Contract.address, 0)).to.be.revertedWith("VotingProcess: votingAmount must be > 0");
    });
});