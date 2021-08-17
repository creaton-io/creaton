import { expect } from "./chai-setup";
import { ethers, deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { Console } from "node:console";
import { Test } from "mocha";

let collectibleFactory;
let collectibleContract: Contract;
let ownerAccount: SignerWithAddress;
let testingAccount1: SignerWithAddress;
let testingAccount2: SignerWithAddress;

describe('Deploying coin', function () {
    beforeEach(async function () {
        let testingTokenFactory = await ethers.getContractFactory('TestingToken');
        let testingToken = await testingTokenFactory.deploy(6);
        // let testingTokenAddress = testingToken.address();

        [ownerAccount, testingAccount1, testingAccount2] = await ethers.getSigners();
        collectibleFactory = await ethers.getContractFactory('VoteCreators');
        collectibleContract = await collectibleFactory.deploy();
        await collectibleContract.initialize(testingToken.address);
    });
    it('Check ability to vote', async function () {
        console.log('works');
        expect(true);//Temp test case
    })
});


describe('Vote with coin', function () {
    let testingToken: Contract;

    beforeEach(async function () {
        let testingTokenFactory = await ethers.getContractFactory('TestingToken');
        testingToken = await testingTokenFactory.deploy(6);
        // let testingTokenAddress = testingToken.address();

        [ownerAccount, testingAccount1, testingAccount2] = await ethers.getSigners();
        collectibleFactory = await ethers.getContractFactory('VoteCreators');
        collectibleContract = await collectibleFactory.deploy();
        await collectibleContract.initialize(testingToken.address);
    });
    it('Vote with 1 coin', async function () {
        await testingToken.connect(testingAccount1).faucet();
        expect(await testingToken.balanceOf(testingAccount1.address) > 0);

        console.log('works');
        // expect(true);//Temp test case
    })
});