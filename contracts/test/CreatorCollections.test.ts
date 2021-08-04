import "@nomiclabs/hardhat-ethers";
import { expect } from "./chai-setup";
import { ethers, network } from "hardhat";
import { BigNumber, ContractFactory, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import { Console } from "node:console";



let ownerAccount: SignerWithAddress;
let collectibleFactory;
let collectionsFactory;
let collectibleContract: Contract;
let collectionsContract: Contract;
let testingToken: ContractFactory;
let testingTokenContract: Contract;

describe('FanCollectible tokens', function(){
    let ownerAccount: SignerWithAddress;
    beforeEach(async function(){
        [ownerAccount] = await ethers.getSigners();
        collectibleFactory = await ethers.getContractFactory('FanCollectible');
        collectibleContract = await collectibleFactory.deploy('Pyrocoin');
    });
    it('Check minter\'s address', async function(){
         collectibleContract.transferMinter(ownerAccount.address);
        expect(await collectibleContract.owner()).to.equal(ownerAccount.address);
    });
    it('Check if create works', async function(){
        collectibleContract.transferMinter(ownerAccount.address);
        const initialId = (await collectibleContract.getCurrentTokenID()).toString();
        const TokenID = await collectibleContract.create('Pyrocoin',"0x00");
        const finalId = (await collectibleContract.getCurrentTokenID()).toString();
        
        expect(initialId).to.not.equal(finalId);
    });
});

describe('CreatorCollections', function(){
    let ownerAccount: SignerWithAddress;
    beforeEach(async function(){
        [ownerAccount] = await ethers.getSigners();
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.deploy(6);
        collectionsFactory = await ethers.getContractFactory('CreatorCollections');
        collectionsContract = await collectionsFactory.deploy(ownerAccount.address, collectibleContract.address , testingTokenContract.address);
        await collectibleContract.transferMinter(collectionsContract.address);

    });
    it('Check initial supply', async function(){
        expect (await collectionsContract.totalSupply()).to.equal(0);
    });
    it('Create a pool', async function(){
        id = (await collectionsContract.createPool(1,Math.floor(Date.now() / 1000),ethers.utils.parseEther("10000"),ownerAccount.address, "My first collection"));
       
        const poolsArray = await collectionsContract.getPoolsForArtist(ownerAccount.address);
        console.log(poolsArray);
        expect (await poolsArray.length).to.greaterThan(0);
    });
    it ('Testing Create Card', async function(){
        let id = (await collectionsContract.createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("10000"), ownerAccount.address, "My first collection"));
        (await collectionsContract.createPool(1, Math.floor(Date.now() / 1000), ethers.utils.parseEther("10000"), ownerAccount.address, "My second collection"));
        const poolsArray = await collectionsContract.getPoolsForArtist(ownerAccount.address);
        console.log(poolsArray);

        const TokenId = await collectionsContract.createCard(0, 10, ethers.utils.parseEther("10000"), Math.floor(Date.now() / 1000));
        await collectionsContract.createCard(1, 10, ethers.utils.parseEther("10000"), Math.floor(Date.now() / 1000));

        const cArray = await  collectionsContract.getCardsArray(0);
        console.log(cArray);
        expect (await cArray.length).to.greaterThan(0);
    });
});
describe('Purchasing single', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [ownerAccount,artistAccount,fanAccount, brokeAccount] = await ethers.getSigners();
        
        // make the testing currency 
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.deploy(6);

        //give the accounts some money
        await testingTokenContract.connect(artistAccount).faucet();
        await testingTokenContract.connect(fanAccount).faucet();

        collectionsFactory = await ethers.getContractFactory('CreatorCollections');
        collectionsContract = await collectionsFactory.deploy(ownerAccount.address, collectibleContract.address , testingTokenContract.address);
        await collectibleContract.transferMinter(collectionsContract.address);
    });
    it('Single Purchase', async function(){
        //where everything goes well!
        console.log(await (await artistAccount.getBalance()).toString());
        console.log(await fanAccount.getBalance().toString());
        const id = (await collectionsContract.connect(ownerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const cardID = await collectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));
        
        //pretending that this is the web team writing this.
        const artistPools = await collectionsContract.getPoolsForArtist(artistAccount.address);
        

        console.log((await testingTokenContract.balanceOf(fanAccount.address)/1e18).toLocaleString());
        

        expect (await artistPools.length).to.equal(1);

        await testingTokenContract.connect(fanAccount).approve(collectionsContract.address, ethers.utils.parseEther("10"));
        await collectionsContract.connect(fanAccount).stake(0, ethers.utils.parseEther("1"));

        const fanID = await collectionsContract.connect(fanAccount).redeem(0, 0);
        await fanID.wait();
        console.log(fanID.value);
        console.log("fanId is");
        console.log(fanID);
        await collectibleContract.connect(fanAccount).setRequestData(BigNumber.from(22), "Hello World Image! Please and thank you!");

    });
    it('Single Purchase with wrong amount staked', async function(){
        console.log(await (await artistAccount.getBalance()).toString());
        console.log(await fanAccount.getBalance().toString());
        const id = (await collectionsContract.connect(ownerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const cardID = await collectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));
        
        //pretending that this is the web team writing this.
        const artistPools = await collectionsContract.getPoolsForArtist(artistAccount.address);
        

        console.log((await testingTokenContract.balanceOf(fanAccount.address)/1e18).toLocaleString());
        

        expect (await artistPools.length).to.equal(1);

        await testingTokenContract.connect(fanAccount).approve(collectionsContract.address, ethers.utils.parseEther("10"));
        await collectionsContract.connect(fanAccount).stake(0, ethers.utils.parseEther("0"));
        //expect this to throw the error "not enough tokens stakes".
        await expect(collectionsContract.connect(fanAccount).redeem(0, 0)).to.revertedWith("not enough tokens stakes");

        // await collectionsContract.connect(fanAccount).redeem(0, 0).to.be.revertedWith("not enough tokens stakes");

    });
    it('Single stake without funds', async function(){
        const id = (await collectionsContract.connect(ownerAccount).createPool(0, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection"));
        const cardID = await collectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000));

        console.log((await testingTokenContract.balanceOf(brokeAccount.address)/1e18).toLocaleString());
        expect(await testingTokenContract.balanceOf(brokeAccount.address)).to.equal(0);

        await testingTokenContract.connect(brokeAccount).approve(collectionsContract.address, ethers.utils.parseEther("10"));
        await expect(collectionsContract.connect(brokeAccount).stake(0, ethers.utils.parseEther("1"))).to.revertedWith("VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance");

    });
});
describe('Purchasing multiples', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [ownerAccount,artistAccount,fanAccount, brokeAccount] = await ethers.getSigners();
        
        // make the testing currency 
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.deploy(6);

        //give the accounts some money
        await testingTokenContract.connect(artistAccount).faucet();
        await testingTokenContract.connect(fanAccount).faucet();

        collectionsFactory = await ethers.getContractFactory('CreatorCollections');
        collectionsContract = await collectionsFactory.deploy(ownerAccount.address, collectibleContract.address , testingTokenContract.address);
        await collectibleContract.transferMinter(collectionsContract.address);
    });
    it('100 of 5 cards, 1 pool, 0 Purchased', async function(){
        const poolId = await collectionsContract.connect(ownerAccount).createPool(1, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 5; i++){
            cardsIds.push(await collectionsContract.connect(artistAccount).createCard(1, 100, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000)));
        }
        expect(cardsIds.length).to.equal(5);
        // expect(collectionsContract.getCardsArray[1].length().should.equal(5));
    });
    it('5 of 100 cards, 1 pool, 0 purchased', async function(){
        const poolId = await collectionsContract.connect(ownerAccount).createPool(1, Math.floor(Date.now() / 1000), ethers.utils.parseEther("1000000"), artistAccount.address, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 100; i++){
            cardsIds.push(await collectionsContract.connect(artistAccount).createCard(1, 5, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000)));
        }
        expect(cardsIds.length).to.equal(100);
    });
});