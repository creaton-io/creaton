import { expect } from "./chai-setup";
import { ethers,deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { Console } from "node:console";
import { Test } from "mocha";


let OwnerAccount: SignerWithAddress;
let TestingAccount1: SignerWithAddress;
let TestingAccount2: SignerWithAddress;
let CollectibleFactory;
let CollectionsFactory;
let CollectibleContract: Contract;
let CollectionsContract: Contract;
let TestingToken: ContractFactory;
let TestingTokenContract: Contract;
let id;
describe('FanCollectible tokens', function(){
    beforeEach(async function(){
        [OwnerAccount,TestingAccount1,TestingAccount2] = await ethers.getSigners();
        CollectibleFactory = await ethers.getContractFactory('FanCollectible');
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');
    });
    it('Check minter\'s address', async function(){
         CollectibleContract.transferMinter(OwnerAccount.address);
        expect(await CollectibleContract.owner()).to.equal(OwnerAccount.address);
    });
    it('Check if create works', async function(){
        CollectibleContract.transferMinter(OwnerAccount.address);
        const initialId = (await CollectibleContract.getCurrentTokenID()).toString();
        const TokenID = await CollectibleContract.create('Pyrocoin',"0x00");
        const finalId = (await CollectibleContract.getCurrentTokenID()).toString();
        
        expect(initialId).to.not.equal(finalId);
    });
});

describe('CreatorCollections', function(){
    beforeEach(async function(){
        TestingToken = await ethers.getContractFactory('TestingToken');
        TestingTokenContract = await TestingToken.deploy(6);
        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.deploy(OwnerAccount.address, CollectibleContract.address , TestingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);

    });
    it('Check initial supply', async function(){
        expect (await CollectionsContract.totalSupply()).to.equal(0);
    });
    it('Create a pool', async function(){
        id = (await CollectionsContract.createPool(1,Math.floor(Date.now() / 1000),ethers.utils.parseEther("10000"),OwnerAccount.address, "My first collection"));
       
        const poolsArray = await CollectionsContract.getPoolsForArtist(OwnerAccount.address);
        console.log(poolsArray);
        expect (await poolsArray.length).to.greaterThan(0);
    });
    it ('Testing Create Card', async function(){
        id = (await CollectionsContract.createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("10000"), OwnerAccount.address, "My first collection"));
        (await CollectionsContract.createPool(1, Math.floor(Date.now() / 1000), ethers.utils.parseEther("10000"), OwnerAccount.address, "My second collection"));
        const poolsArray = await CollectionsContract.getPoolsForArtist(OwnerAccount.address);
        console.log(poolsArray);

        const TokenId = await CollectionsContract.createCard(0, 10, ethers.utils.parseEther("10000"), Math.floor(Date.now() / 1000));
        await CollectionsContract.createCard(1, 10, ethers.utils.parseEther("10000"), Math.floor(Date.now() / 1000));

        const cArray = await  CollectionsContract.getCardsArray(0);
        console.log(cArray);
        expect (await cArray.length).to.greaterThan(0);
    });
});
describe('Purchasing.', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount,artistAccount,fanAccount] = await ethers.getSigners();
        
        // make the testing currency 
        TestingToken = await ethers.getContractFactory('TestingToken');
        TestingTokenContract = await TestingToken.deploy(6);

        //give the accounts some money
        await TestingTokenContract.connect(artistAccount).faucet();
        await TestingTokenContract.connect(fanAccount).faucet();
        // await TestingTokenContract.connect(fanAccount).faucet();
        // await TestingTokenContract.connect(fanAccount).faucet();
        // await TestingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.deploy(OwnerAccount.address, CollectibleContract.address , TestingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });
    it('Single Purchase', async function(){
        console.log(await (await artistAccount.getBalance()).toString());
        console.log(await fanAccount.getBalance().toString());
        const id = (await CollectionsContract.connect(OwnerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const TokenId = await CollectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));
        
        //pretending that this is the web team writing this.
        const artistPools = await CollectionsContract.getPoolsForArtist(artistAccount.address);
        console.log("hi Pyro, look at the next number");
        console.log(await artistPools);
        console.log((await TestingTokenContract.balanceOf(fanAccount.address)/1e18).toLocaleString());
        console.log(await TestingTokenContract.balanceOf(artistAccount.address)>= ethers.utils.parseEther("1"));

        expect (await artistPools.length).to.equal(1);
        await CollectionsContract.connect(fanAccount).stake(0, 1);
        // console.log(CollectionsContract._poolBalances[0]);
        // console.log(CollectionsContract._accountBalances[fanAccount.address]);
        await CollectionsContract.connect(fanAccount).redeem(0, TokenId);
        // await CollectibleContract.connect(fanAccount).stake(0, 1e18);
        // await CollectibleContract.connect(fanAccount).redeem(0, TokenId);
    });

});
