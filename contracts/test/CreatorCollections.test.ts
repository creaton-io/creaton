import { expect } from "./chai-setup";
import { ethers,deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
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
describe('Purchasing single', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount,artistAccount,fanAccount, brokeAccount] = await ethers.getSigners();
        
        // make the testing currency 
        TestingToken = await ethers.getContractFactory('TestingToken');
        TestingTokenContract = await TestingToken.deploy(6);

        //give the accounts some money
        await TestingTokenContract.connect(artistAccount).faucet();
        await TestingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.deploy(OwnerAccount.address, CollectibleContract.address , TestingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });
    it('Single Purchase', async function(){
        //where everything goes well!
        console.log(await (await artistAccount.getBalance()).toString());
        console.log(await fanAccount.getBalance().toString());
        const id = (await CollectionsContract.connect(OwnerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const cardID = await CollectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));
        
        //pretending that this is the web team writing this.
        const artistPools = await CollectionsContract.getPoolsForArtist(artistAccount.address);
        

        console.log((await TestingTokenContract.balanceOf(fanAccount.address)/1e18).toLocaleString());
        

        expect (await artistPools.length).to.equal(1);

        await TestingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await CollectionsContract.connect(fanAccount).stake(0, ethers.utils.parseEther("1"));

        const fanID = await CollectionsContract.connect(fanAccount).redeem(0, 0);
        await fanID.wait();
        console.log(fanID.value);
        console.log("fanId is");
        console.log(fanID);
        await CollectibleContract.connect(fanAccount).setRequestData(BigNumber.from(22), "Hello World Image! Please and thank you!");

    });
    it('Single Purchase with wrong amount staked', async function(){
        console.log(await (await artistAccount.getBalance()).toString());
        console.log(await fanAccount.getBalance().toString());
        const id = (await CollectionsContract.connect(OwnerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const cardID = await CollectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));
        
        //pretending that this is the web team writing this.
        const artistPools = await CollectionsContract.getPoolsForArtist(artistAccount.address);
        

        console.log((await TestingTokenContract.balanceOf(fanAccount.address)/1e18).toLocaleString());
        

        expect (await artistPools.length).to.equal(1);

        await TestingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await CollectionsContract.connect(fanAccount).stake(0, ethers.utils.parseEther("0"));
        //expect this to throw the error "not enough tokens stakes".
        await expect(CollectionsContract.connect(fanAccount).redeem(0, 0)).to.revertedWith("not enough tokens stakes");

        // await CollectionsContract.connect(fanAccount).redeem(0, 0).to.be.revertedWith("not enough tokens stakes");

    });
    it('Single stake without funds', async function(){
        const id = (await CollectionsContract.connect(OwnerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const cardID = await CollectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));

        console.log((await TestingTokenContract.balanceOf(brokeAccount.address)/1e18).toLocaleString());
        expect(await TestingTokenContract.balanceOf(brokeAccount.address)).to.equal(0);

        await TestingTokenContract.connect(brokeAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(brokeAccount).stake(0, ethers.utils.parseEther("1"))).to.revertedWith("VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance");

    });
});
describe('Purchasing multiples', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount, artistAccount, fanAccount, brokeAccount] = await ethers.getSigners();
        
        // make the testing currency 
        TestingToken = await ethers.getContractFactory('TestingToken');
        TestingTokenContract = await TestingToken.connect(fanAccount).deploy(6);

        //give the accounts some money
        await TestingTokenContract.connect(artistAccount).faucet();
        await TestingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.deploy(OwnerAccount.address, CollectibleContract.address , TestingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });
    it('100 of 5 cards, 1 pool, 0 Purchased', async function(){
        const poolId = await CollectionsContract.connect(OwnerAccount).createPool(1, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 5; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(1, 100, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000)));
        }
        expect(cardsIds.length).to.equal(5);
        // expect(CollectionsContract.getCardsArray[1].length().should.equal(5));
    });
    it('5 of 100 cards, 1 pool, 0 purchased', async function(){
        const poolId = await CollectionsContract.connect(OwnerAccount).createPool(1, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 100; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(1, 5, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000)));
        }
        expect(cardsIds.length).to.equal(100);
    });
    it('1 of 1 cards, 1 pool, 1 purchased', async function(){
        const poolId = await CollectionsContract.connect(OwnerAccount).createPool(3, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 1; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(3, 1, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000)));
        }
        expect(cardsIds.length).to.equal(1);
        await TestingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        console.log(await CollectionsContract.connect(fanAccount).purchase(3, 0));
    });
    it('5 of 5 cards, 1 pool, 2 purchased', async function(){
        const poolId = await CollectionsContract.connect(OwnerAccount).createPool(3, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 5; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(3, 5, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000)));
        }
        expect(cardsIds.length).to.equal(5);
        await TestingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        console.log(await CollectionsContract.connect(fanAccount).purchase(3, 0));
        console.log(await CollectionsContract.connect(fanAccount).purchase(3, 1));

    });
});
