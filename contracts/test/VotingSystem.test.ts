import { expect } from "./chai-setup";
import { ethers, deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { Console } from "node:console";
import { Test } from "mocha";

let voteFactory;
let voteContract: Contract;

let testingAccount1: SignerWithAddress;
let testingAccount2: SignerWithAddress;

describe('Deploying coin', function () {
    beforeEach(async function () {
        let testingTokenFactory = await ethers.getContractFactory('TestingToken');
        let testingToken = await testingTokenFactory.deploy(6);
        // let testingTokenAddress = testingToken.address();

        [testingAccount1, testingAccount2] = await ethers.getSigners();
        voteFactory = await ethers.getContractFactory('VoteCreators');
        voteContract = await voteFactory.deploy();
        await voteContract.initialize(testingToken.address);
    });
    it('Check ability to vote', async function () {
        console.log('works');
        expect(true);//Temp test case
    })
});


describe('Vote with coin', function () {
    let testingToken: Contract;
    let num: number;
    beforeEach(async function () {
        let testingTokenFactory = await ethers.getContractFactory('TestingToken');
        testingToken = await testingTokenFactory.deploy(0);
        // let testingTokenAddress = testingToken.address();


        [testingAccount1, testingAccount2] = await ethers.getSigners();
        voteFactory = await ethers.getContractFactory('VoteCreators');
        voteContract = await voteFactory.deploy();
        await voteContract.initialize(testingToken.address);
    });

    it('Vote with 1 coin', async function () {
        //needs superfluid to see if it worked
        await testingToken.connect(testingAccount1).faucet();
        expect(await testingToken.balanceOf(testingAccount1.address)).to.equal(ethers.utils.parseEther('1000'));

        console.log(await testingToken.balanceOf(testingAccount1.address));


    })

});


describe('Vote with no coin', function () {
    let testingToken: Contract;

    beforeEach(async function () {
        let testingTokenFactory = await ethers.getContractFactory('TestingToken');
        testingToken = await testingTokenFactory.deploy(0);
        // let testingTokenAddress = testingToken.address();


        [testingAccount1, testingAccount2] = await ethers.getSigners();
        voteFactory = await ethers.getContractFactory('VoteCreators');
        voteContract = await voteFactory.deploy();
        await voteContract.initialize(testingToken.address);
    });

    it('Try to vote with no coins', async function () {
        // expect(await testingToken.totalSupply()).to.equal(0);
        // await testingToken.connect(testingAccount2).faucet();
        // console.log(await testingToken.balanceOf(testingAccount2.address));
        expect(await testingToken.balanceOf(testingAccount2.address)).to.equal(ethers.utils.parseEther("0.0")); //For some reason this is true


        console.log(await testingToken.balanceOf(testingAccount1.address));
        console.log((await testingAccount2.getBalance()).toString());
        console.log(await testingToken.value);


        // expect(true);//Temp test case
    })
});

describe('Unvote', function () {
    let testingToken: Contract;

    beforeEach(async function () {
        let testingTokenFactory = await ethers.getContractFactory('TestingToken');
        testingToken = await testingTokenFactory.deploy(6);
        // let testingTokenAddress = testingToken.address();


        [testingAccount1, testingAccount2] = await ethers.getSigners();
        voteFactory = await ethers.getContractFactory('VoteCreators');
        voteContract = await voteFactory.deploy();
        await voteContract.initialize(testingToken.address);
    });

    it('unvote 1 coin', async function () {
        await testingToken.connect(testingAccount1).faucet();
        console.log(await testingToken.balanceOf(testingAccount1.address));

        expect(testingToken.balanceOf(testingAccount1.address) - 1);
        console.log(await testingToken.balanceOf(testingAccount1.address) - 1);
        // expect(true);//Temp test case
    })
});