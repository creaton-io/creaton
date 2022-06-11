import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import SuperfluidSDK from '@superfluid-finance/js-sdk';

let owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    addrs: SignerWithAddress[];

let creatonAdmin: Contract,
    creator: Contract;

async function startStreaming(creatorContractAddress: string, subscriber: SignerWithAddress) {
    const sf = new SuperfluidSDK.Framework({
        ethers: hre.ethers.provider,
        tokens: ['fUSDC'],
    });
    await sf.initialize();

    // const sfSubscriber = sf.user({address: subscriber.address, token: sf.tokens.fUSDCx})

    // console.log('SF details', sfSubscriber.details());

    // const creatorContract = await ethers.getContractAt('CreatorV1', creatorContractAddress);
    // let MINIMUM_FLOW_RATE = ethers.utils.parseUnits(await creatorContract.subscriptionPrice(), 18).div(3600 * 24 * 30);

    // sfSubscriber.flow({recipient: creatorContractAddress, flowRate: MINIMUM_FLOW_RATE.toString() })

    // console.log('Streaming to: ', creatorContractAddress);
}

describe('Creaton Admin Tests',async () => {
    beforeEach(async () => {
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        const SFHOST = "0xEB796bdb90fFA0f28255275e16936D25d3418603";
        const SFCFA = "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873";
        const SFACCEPTEDTOKEN = "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7";
        const TREASURY = "0xC2Be769Df80AA18aA7982B5ecA0AaE037460891d";
        const TREASURYFEE = "96";
        const CREATONBEACON = "0x34c17Ef019A232383cD6CDBBCcAE53C70c722F79";
        const NFTFACTORY = "0xE3d1dEbC90F5715A00229fe6Af9DaFEE8D4Db11A";
        const TRUSTEDFORWARDER = "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b";

        const contractFactory = await ethers.getContractFactory("CreatonAdmin");
        creatonAdmin = await contractFactory.deploy(SFHOST,SFCFA,SFACCEPTEDTOKEN,TREASURY,TREASURYFEE,CREATONBEACON,NFTFACTORY,TRUSTEDFORWARDER);
        await creatonAdmin.deployed();
    });

    it("Should be able to deploy a new Creator", async () => {
        const description = "Hi! This is the Creator Test";
        const subscriptionPrice = 1;
        const nftName = "Testing";
        const nftSymbol = "TST";
        await expect(creatonAdmin.deployCreator(description, subscriptionPrice, nftName, nftSymbol)).to.emit(creatonAdmin, "CreatorDeployed");
    });

    // it("Should be able to subscribe to a new Creator", async () => {
    //     const description = "Hi! This is the Creator Test";
    //     const subscriptionPrice = 1;
    //     const nftName = "Testing";
    //     const nftSymbol = "TST";
    //     let tx = await creatonAdmin.deployCreator(description, subscriptionPrice, nftName, nftSymbol);
    //     let receipt = await tx.wait();
    //     receipt = receipt.events?.filter((x: any) => {return x.event == "CreatorDeployed"})[0];

    //     const creatorContractAddress = receipt.args.creatorContract;
    //     expect(creatorContractAddress).to.be.properAddress;

    //     await startStreaming(creatorContractAddress, alice);
    // });
});