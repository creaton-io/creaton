import { expect } from "chai";
import { ethers, network } from "hardhat";
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
const now = Math.floor(Date.now()/1000) -50;

const timeTravel = async (time: number) => {
    const startBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
    await network.provider.send("evm_increaseTime", [time]);
    await network.provider.send("evm_mine");
    const endBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());

    console.log(`\tTime Travelled ${time} (sec) => FROM ${startBlock.timestamp} TO ${endBlock.timestamp}`);
};

describe('FanCollectible tokens', function(){
    beforeEach(async function(){
        [OwnerAccount,TestingAccount1,TestingAccount2] = await ethers.getSigners();
        CollectibleFactory = await ethers.getContractFactory('FanCollectible');
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');
    });

    it('Check minter\'s and owner\'s address', async function(){
        expect(await CollectibleContract.owner()).to.equal(OwnerAccount.address);
        expect(await CollectibleContract.minter()).to.equal(OwnerAccount.address);
        
        await CollectibleContract.transferMinter(TestingAccount1.address);
        expect(await CollectibleContract.minter()).to.equal(TestingAccount1.address);
        expect(await CollectibleContract.owner()).to.equal(OwnerAccount.address);

        await CollectibleContract.transferOwnership(TestingAccount1.address);
        expect(await CollectibleContract.owner()).to.equal(TestingAccount1.address);
    });

    it('Check if create works', async function(){
        const initialId = (await CollectibleContract.getCurrentTokenID()).toString();
        await CollectibleContract.create('Pyrocoin',"0x00");
        const finalId = (await CollectibleContract.getCurrentTokenID()).toString();
        expect(initialId).to.not.equal(finalId);
    });
});

describe('CreatorCollections', function(){
    beforeEach(async function(){
        [OwnerAccount,TestingAccount1,TestingAccount2] = await ethers.getSigners();

        testingToken = await ethers.getContractFactory('TestingToken');
        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectibleFactory = await ethers.getContractFactory('FanCollectible');

        testingTokenContract = await testingToken.deploy(6);
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');

        CollectionsContract = await CollectionsFactory.deploy(CollectibleContract.address , testingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
        expect(await CollectibleContract.minter()).to.equal(CollectionsContract.address);
    });

    it('Check initial supply', async function(){
        expect(await CollectionsContract.totalSupply()).to.equal(0);
    });

    it ('Testing Create Card', async function(){
        // Catalog Creation
        let expectedFCollectionId = 0;
        let fCatalogTitle = "My first collection";
        let fCatalogDescription = "The catalog description";
        await expect(CollectionsContract.createCatalog(fCatalogTitle, fCatalogDescription)).to.emit(CollectionsContract, "CatalogAdded");

        let fCreatedCatalog = await CollectionsContract.catalogs(expectedFCollectionId);
        expect(fCreatedCatalog.title).to.be.equal(fCatalogTitle);
        expect(fCreatedCatalog.description).to.be.equal(fCatalogDescription);
        expect(fCreatedCatalog.artist).to.be.equal(OwnerAccount.address);
        expect(fCreatedCatalog.cardsInCatalog).to.be.equal(0);
        expect(fCreatedCatalog.feesCollected).to.be.equal(0);

        let expectedSCollectionId = 1;
        let sCatalogTitle = "My second collection";
        let sCatalogDescription = "Another catalog description";
        await expect(CollectionsContract.createCatalog(sCatalogTitle, sCatalogDescription)).to.emit(CollectionsContract, "CatalogAdded");

        let sCreatedCatalog = await CollectionsContract.catalogs(expectedSCollectionId);
        expect(sCreatedCatalog.title).to.be.equal(sCatalogTitle);
        expect(sCreatedCatalog.description).to.be.equal(sCatalogDescription);
        expect(sCreatedCatalog.artist).to.be.equal(OwnerAccount.address);
        expect(sCreatedCatalog.cardsInCatalog).to.be.equal(0);
        expect(sCreatedCatalog.feesCollected).to.be.equal(0);

        // Cards Creation
        await CollectionsContract.createCard(expectedFCollectionId, 10, ethers.utils.parseEther("10000"), now);
        fCreatedCatalog = await CollectionsContract.catalogs(expectedFCollectionId);
        expect(fCreatedCatalog.cardsInCatalog).to.be.equal(1);

        await CollectionsContract.createCard(expectedSCollectionId, 10, ethers.utils.parseEther("10000"), now);
        sCreatedCatalog = await CollectionsContract.catalogs(expectedSCollectionId);
        expect(sCreatedCatalog.cardsInCatalog).to.be.equal(1);

        const fCatalogCards = await CollectionsContract.getCardsArray(expectedFCollectionId);
        expect(fCatalogCards.length).to.be.equal(1);
        expect(fCatalogCards[0].price).to.be.equal(ethers.utils.parseEther("10000"));
        expect(fCatalogCards[0].releaseTime).to.be.equal(now);

        const sCatalogCards = await CollectionsContract.getCardsArray(expectedSCollectionId);
        expect(sCatalogCards.length).to.be.equal(1);
        expect(sCatalogCards[0].price).to.be.equal(ethers.utils.parseEther("10000"));
        expect(sCatalogCards[0].releaseTime).to.be.equal(now);
    });

    it ('Failing Create Catalog and Card', async function(){
        [OwnerAccount,TestingAccount1,TestingAccount2] = await ethers.getSigners();

        let collectionId = 666;
        await expect(CollectionsContract.createCard(collectionId, 10, ethers.utils.parseEther("10000"), now))
            .to.be.revertedWith("catalog does not exists");

        await expect(CollectionsContract.createCatalog("Catalog Title", "Desc"))
            .to.emit(CollectionsContract, "CatalogAdded");

        await expect(CollectionsContract.connect(TestingAccount1).createCard(collectionId, 10, ethers.utils.parseEther("10000"), now))
            .to.be.revertedWith("You Do Not Have Authorization To Change This");
    });
});

describe('Purchasing single', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount,artistAccount,fanAccount, brokeAccount] = await ethers.getSigners();

        CollectibleFactory = await ethers.getContractFactory('FanCollectible');
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');

        // make the testing currency 
        testingToken = await ethers.getContractFactory('TestingToken');
        testingTokenContract = await testingToken.deploy(6);

        //give the accounts some money
        await testingTokenContract.connect(artistAccount).faucet();
        await testingTokenContract.connect(fanAccount).faucet();

        CollectionsFactory = await ethers.getContractFactory('CreatorCollections');
        CollectionsContract = await CollectionsFactory.deploy(CollectibleContract.address , testingTokenContract.address);
        await CollectibleContract.transferMinter(CollectionsContract.address);
    });

    it('Single Purchase', async function(){
        const expectedCatalogId = 0;
        const cardPrice = ethers.utils.parseEther("1");

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");
        await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, 10, cardPrice, now);

        await timeTravel(30);
        
        const catalogCards = await CollectionsContract.getCardsArray(expectedCatalogId);

        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0))
            .to.emit(CollectionsContract,"Redeemed")
            .withArgs(fanAccount.address, expectedCatalogId, cardPrice);
        
        await CollectibleContract.connect(fanAccount).setRequestData(catalogCards[expectedCatalogId].ids[0], "Hello World Image! Please and thank you!");
    });

    it('Single purchase with errors', async function(){
        const expectedCatalogId = 0;
        const releaseTime = Math.floor(Date.now()/1000);
        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");
        await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, 1, ethers.utils.parseEther("1"), releaseTime);

        // Card not for sale yet
        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.revertedWith("card not open");
        
        timeTravel(100);

        // No funds
        expect(await testingTokenContract.balanceOf(brokeAccount.address)).to.equal(0);
        await testingTokenContract.connect(brokeAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(brokeAccount).purchase(expectedCatalogId, 0)).to.be.revertedWith("ERC20: transfer amount exceeds balance");

        // Card sold out
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.emit(CollectionsContract, "Redeemed");
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.be.revertedWith("Card Is Sold Out");
    });
});

describe('Purchasing multiples', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount, artistAccount, fanAccount, brokeAccount] = await ethers.getSigners();

        CollectibleFactory = await ethers.getContractFactory('FanCollectible');
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');

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
        const expectedCatalogId = 0;
        const cardsSupply = 100;
        const cardsAmount = 5;

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");

        for(let i = 0; i < cardsAmount; i++){
            await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, cardsSupply, ethers.utils.parseEther("1"), now);
        }

        const cardsArray = await CollectionsContract.getCardsArray(expectedCatalogId);
        expect(cardsArray.length).to.be.equal(cardsAmount);
        for(let i = 0; i < cardsAmount; i++){
            expect(cardsArray[i].ids.length).to.be.equal(cardsSupply);
        }
    });

    it('5 of 100 cards, 1 catalog, 0 purchased', async function(){
        const expectedCatalogId = 0;
        const cardsSupply = 5;
        const cardsAmount = 100;

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");

        for(let i = 0; i < cardsAmount; i++){
            await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, cardsSupply, ethers.utils.parseEther("1"), now);
        }

        const cardsArray = await CollectionsContract.getCardsArray(expectedCatalogId);
        expect(cardsArray.length).to.be.equal(cardsAmount);
        for(let i = 0; i < cardsAmount; i++){
            expect(cardsArray[i].ids.length).to.be.equal(cardsSupply);
        }
    });

    it('1 of 1 cards, 1 catalog, 1 purchased', async function(){
        const expectedCatalogId = 0;
        const cardsSupply = 1;
        const cardsAmount = 1;

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");

        for(let i = 0; i < cardsAmount; i++){
            await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, cardsSupply, ethers.utils.parseEther("1"), now);
        }

        const cardsArray = await CollectionsContract.getCardsArray(expectedCatalogId);
        expect(cardsArray.length).to.be.equal(cardsAmount);

        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.emit(CollectionsContract, "Redeemed");
    });

    it('5 of 5 cards, 1 catalog, 2 purchased', async function(){
        const expectedCatalogId = 0;
        const cardsSupply = 5;
        const cardsAmount = 5;

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");

        for(let i = 0; i < cardsAmount; i++){
            await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, cardsSupply, ethers.utils.parseEther("1"), now);
        }

        const cardsArray = await CollectionsContract.getCardsArray(expectedCatalogId);
        expect(cardsArray.length).to.be.equal(cardsAmount);

        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));

        for(let i = 0; i < cardsAmount; i++){
            await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, i)).to.emit(CollectionsContract, "Redeemed");
        }
    });

    it('1 of 1 cards, 1 catalog, purchased failing', async function(){
        const expectedCatalogId = 0;
        const cardsSupply = 1;
        const cardsAmount = 1;

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");

        for(let i = 0; i < cardsAmount; i++){
            await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, cardsSupply, ethers.utils.parseEther("1"), now);
        }

        const cardsArray = await CollectionsContract.getCardsArray(expectedCatalogId);
        expect(cardsArray.length).to.be.equal(cardsAmount);

        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));

        // Failed because unexisting card
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 23)).to.be.revertedWith("card may not exist");

        // Failed because pause/unpause
        await expect(CollectionsContract.connect(artistAccount).pause()).to.be.revertedWith("Ownable: caller is not the owner");
        await CollectionsContract.pause();
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.be.revertedWith("Pausable: paused");
        await expect(CollectionsContract.connect(artistAccount).unpause()).to.be.revertedWith("Ownable: caller is not the owner");
        await CollectionsContract.unpause();
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.emit(CollectionsContract, "Redeemed");
    });
});

describe('Checking Payment to artist works correctly', function(){
    let artistAccount: SignerWithAddress;
    let fanAccount: SignerWithAddress;
    let brokeAccount: SignerWithAddress;
    beforeEach(async function(){
        [OwnerAccount, artistAccount, fanAccount, brokeAccount] = await ethers.getSigners();
        
        CollectibleFactory = await ethers.getContractFactory('FanCollectible');
        CollectibleContract = await CollectibleFactory.deploy('Pyrocoin');

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
        const expectedCatalogId = 0;
        const cardsSupply = 5;

        let startingArtistBalance = await testingTokenContract.balanceOf(artistAccount.address);
        let startingFanBalance = await testingTokenContract.balanceOf(fanAccount.address);

        await CollectionsContract.connect(artistAccount).createCatalog("My first collection", "Desc");
        await CollectionsContract.connect(artistAccount).createCard(expectedCatalogId, cardsSupply, ethers.utils.parseEther("1"), now);
        timeTravel(60);

        await testingTokenContract.connect(fanAccount).approve(CollectionsContract.address, ethers.utils.parseEther("10"));
        await expect(CollectionsContract.connect(fanAccount).purchase(expectedCatalogId, 0)).to.emit(CollectionsContract, "Redeemed");

        expect(await testingTokenContract.balanceOf(fanAccount.address)).to.be.below(startingFanBalance);
        expect(await testingTokenContract.balanceOf(artistAccount.address)).to.be.equal(startingArtistBalance);

        const catalogCards = await CollectionsContract.getCardsArray(expectedCatalogId);

        //1068 *should* be gotten by the Graph API, but instead it is hardcoded to whatever the ID would be after running this code.
        await expect(CollectibleContract.connect(brokeAccount).setRequestData(catalogCards[expectedCatalogId].ids[0], "hello world"))
            .to.be.revertedWith("Token not owned by sender");

        await expect(CollectibleContract.connect(fanAccount).setRequestData(catalogCards[expectedCatalogId].ids[0], "hello world"))
            .to.emit(CollectibleContract, "RequestDataSet");
        await expect(CollectionsContract.connect(fanAccount).setFanCollectibleData(expectedCatalogId, catalogCards[expectedCatalogId].ids[0], "0xabcdef"))
            .to.be.revertedWith("not the artist");
        await CollectionsContract.connect(artistAccount).setFanCollectibleData(expectedCatalogId, catalogCards[expectedCatalogId].ids[0], "0xabcdef");

        await expect(CollectibleContract.connect(fanAccount).setRequestData(catalogCards[expectedCatalogId].ids[0], "hello world"))
            .to.be.revertedWith("Token has already been finalized");

        //testing that artists get their money
        await CollectionsContract.connect(artistAccount).withdrawFee();
        expect(await testingTokenContract.balanceOf(artistAccount.address)).to.equal(startingArtistBalance.add(ethers.utils.parseEther("0.98")));

        //check the ownerAccount balance is .2 testing tokens more than starting balance
        await CollectionsContract.connect(OwnerAccount).getCreatonCut(OwnerAccount.address);
        expect(await testingTokenContract.balanceOf(OwnerAccount.address)).to.equal(ethers.utils.parseEther("0.02"));
    });
});