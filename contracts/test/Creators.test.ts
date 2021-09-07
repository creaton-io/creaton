import "@nomiclabs/hardhat-ethers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";

describe("Creators", function () {
    let owner: SignerWithAddress,
        alice: SignerWithAddress,
        bob: SignerWithAddress,
        addrs: SignerWithAddress[];

    beforeEach(async function () {
        // Get some signers
        [owner, alice, bob, ...addrs] = await ethers.getSigners();
    });

    it("Should deploy contracts and create a new Creator", async function () {
        const creatonAdminFactory = await ethers.getContractFactory("CreatonAdmin");
        let creatonAdminContract: Contract = await creatonAdminFactory.deploy();
        expect(creatonAdminContract.address).to.be.properAddress;

        const nftFactoryFactory = await ethers.getContractFactory("NFTFactory");
        let nftFactoryContract: Contract = await nftFactoryFactory.deploy();
        expect(nftFactoryContract.address).to.be.properAddress;

        const host: Address = process.env.SUPERFLUID_HOST || '';
        const cfa: Address = process.env.SUPERFLUID_CFA || '';    
        const acceptedToken: Address = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const treasury = "0x122a9DeaB5d599FE1deb12079a31ec284b83bf9A";
        const treasuryFee: number = 98; 
        const creatorBeacon: Address = "0x74F8820c91cdDC2d0630B63c22294b7Ab2A856DC";
        // const nftFactory: Address = "0x96a0cA3988a5d85e70a52864B4913F0911c12B70";
        const nftFactory: Address = nftFactoryContract.address;

        const trustedForwarder: Address = "0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d"; 
        const paymaster: Address = "0x7Ccaa86fBCb4EEE3915FB83d0066faAc9C2aA26C";
        await creatonAdminContract.initialize(host, cfa, acceptedToken, treasury, treasuryFee, creatorBeacon, nftFactory, trustedForwarder, paymaster);

        // Lets deploy a creator
        const creatorDescription: string = 'yo! this is the creator description';
        const creatorSubscriptionPrice: number = 500;
        const creatorNftName: string = 'True Metal';
        const creatorNftSymbol: string = 'METAL';
        await creatonAdminContract.deployCreator(creatorDescription, creatorSubscriptionPrice, creatorNftName, creatorNftSymbol)
    });
});