import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";

let OwnerAccount: SignerWithAddress;
let TestingAccount1: SignerWithAddress;
let TestingAccount2: SignerWithAddress;
let CollectibleFactory;
let CollectionsFactory;
let CollectibleContract: Contract;
let CollectionsContract: Contract;
let testingToken: ContractFactory;
let testingTokenContract: Contract;
let id;
const now = Math.floor(Date.now()/1000) -50;
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
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.deploy(6);
        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.connect(OwnerAccount).deploy(CollectibleContract.address , testingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);

    });
    it('Check initial supply', async function(){
        expect (await CollectionsContract.totalSupply()).to.equal(0);
    });
    it ('Testing Create Card', async function(){
        id = (await CollectionsContract.connect(OwnerAccount).createCatalog(0, "My first collection"));
        (await CollectionsContract.connect(OwnerAccount).createCatalog(1, "My second collection"));

        const TokenId = await CollectionsContract.createCard(0, 10, ethers.utils.parseEther("10000"), now);
        await CollectionsContract.createCard(1, 10, ethers.utils.parseEther("10000"), now);

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
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.deploy(6);

        //give the accounts some money
        await testingTokenContract.connect(artistAccount).faucet();
        await testingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        
        CollectionsContract = await CollectionsFactory.connect(OwnerAccount).deploy(CollectibleContract.address , testingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });
    it('Single Purchase', async function(){
        //where everything goes well!
        console.log(await (await artistAccount.getBalance()).toString());
        console.log(await fanAccount.getBalance().toString());
        const id = (await CollectionsContract.connect(artistAccount).createCatalog(0, "My first collection"));
        const cardID = await CollectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), now);

        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await CollectionsContract.connect(fanAccount).purchase(0, 0);

        await CollectibleContract.connect(fanAccount).setRequestData(BigNumber.from(22), "Hello World Image! Please and thank you!");

    });
    it('Single stake without funds', async function(){
        const id = (await CollectionsContract.connect(artistAccount).createCatalog(0, "My first collection"));
        const cardID = await CollectionsContract.connect(artistAccount).createCard(0, 10, ethers.utils.parseEther("1"), now);

        (await testingTokenContract.balanceOf(brokeAccount.address)/1e18).toLocaleString();
        expect(await testingTokenContract.balanceOf(brokeAccount.address)).to.equal(0);

        await testingTokenContract.connect(brokeAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(brokeAccount).purchase(0, 0)).to.revertedWith("ERC20: transfer amount exceeds balance");

    });
});
describe('Purchasing multiples', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount, artistAccount, fanAccount, brokeAccount] = await ethers.getSigners();
        
        // make the testing currency 
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.connect(fanAccount).deploy(6);

        //give the accounts some money
        await testingTokenContract.connect(artistAccount).faucet();
        await testingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.connect(OwnerAccount).deploy(CollectibleContract.address , testingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });
    it('100 of 5 cards, 1 catalog, 0 Purchased', async function(){
        const catalogId = await CollectionsContract.connect(artistAccount).createCatalog(1, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 5; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(1, 100, ethers.utils.parseEther("1"), now));
        }
        expect(cardsIds.length).to.equal(5);
        // expect(CollectionsContract.getCardsArray[1].length().should.equal(5));
    });
    it('5 of 100 cards, 1 catalog, 0 purchased', async function(){
        const catalogId = await CollectionsContract.connect(artistAccount).createCatalog(1, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 100; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(1, 5, ethers.utils.parseEther("1"), now));
        }
        expect(cardsIds.length).to.equal(100);
    });
    it('1 of 1 cards, 1 catalog, 1 purchased', async function(){
        const catalogId = await CollectionsContract.connect(artistAccount).createCatalog(3, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 1; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(3, 1, ethers.utils.parseEther("1"), now));
        }
        expect(cardsIds.length).to.equal(1);
        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await CollectionsContract.connect(fanAccount).purchase(3, 0);
    });
    it('5 of 5 cards, 1 catalog, 2 purchased', async function(){
        const catalogId = await CollectionsContract.connect(artistAccount).createCatalog(3, "My first collection");
        const cardsIds = [];
        for(let i = 0; i < 5; i++){
            cardsIds.push(await CollectionsContract.connect(artistAccount).createCard(3, 5, ethers.utils.parseEther("1"), now));
        }
        expect(cardsIds.length).to.equal(5);
        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await CollectionsContract.connect(fanAccount).purchase(3, 0);
        await CollectionsContract.connect(fanAccount).purchase(3, 1);

    });
});
describe('Checking Payment to artist works correctly', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount, artistAccount, fanAccount, brokeAccount] = await ethers.getSigners();
        
        // make the testing currency 
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.connect(fanAccount).deploy(6);

        //give the accounts some money
        await testingTokenContract.connect(artistAccount).faucet();
        await testingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.connect(OwnerAccount).deploy(CollectibleContract.address , testingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });
    it('1 fulfilled purchase', async function(){
        let startingArtistBalance = await testingTokenContract.balanceOf(artistAccount.address);
        let startingFanBalance = await testingTokenContract.balanceOf(fanAccount.address);
        await CollectionsContract.connect(artistAccount).createCatalog(3, "My first collection");
        await CollectionsContract.connect(artistAccount).createCard(3, 5, ethers.utils.parseEther("1"), now);
        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await CollectionsContract.connect(fanAccount).purchase(3, 0);
        expect(await testingTokenContract.balanceOf(fanAccount.address) < startingFanBalance);
        expect(await testingTokenContract.balanceOf(artistAccount.address) == startingArtistBalance);
        //1068 *should* be gotten by the Graph API, but instead it is hardcoded to whatever the ID would be after running this code.
        await CollectibleContract.connect(fanAccount).setRequestData(1068, "hello world");
        await CollectionsContract.connect(artistAccount).setFanCollectibleData(3, 1068, "0xabcdef");

        //testing that artists get their money
        await CollectionsContract.connect(artistAccount).withdrawFee();
        expect(await testingTokenContract.balanceOf(artistAccount.address)).to.equal(startingArtistBalance.add(ethers.utils.parseEther("0.98")));

        //check the ownerAccount balance is .2 testing tokens more than starting balance
        await CollectionsContract.connect(OwnerAccount).getCreatonCut(OwnerAccount.address);
        expect(await testingTokenContract.balanceOf(OwnerAccount.address)).to.equal(ethers.utils.parseEther("0.02"));
    });
});