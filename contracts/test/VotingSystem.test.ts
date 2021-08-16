import { expect } from "./chai-setup";
import { ethers, deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { Console } from "node:console";
import { Test } from "mocha";

let CollectibleFactory;
let CollectibleContract: Contract;
let OwnerAccount: SignerWithAddress;
let TestingAccount1: SignerWithAddress;
let TestingAccount2: SignerWithAddress;

describe('VotingSystem works', function () {
    beforeEach(async function () {
        [OwnerAccount, TestingAccount1, TestingAccount2] = await ethers.getSigners();
        CollectibleFactory = await ethers.getContractFactory('VoteCreators');
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');
    });
    it('Check ability to vote', async function () {
        console.log('works');

    })
});
