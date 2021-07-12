import { expect } from "./chai-setup";
import { ethers,deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { Console } from "node:console";


let FCA: SignerWithAddress; //rename
let FAC2: SignerWithAddress; //what are these
let FAC3: SignerWithAddress; //names
let FCtoken; //they mean nothing
let FCtoken2; //to me
let hardhatToken: Contract; //and i have to mess with this
let hht: Contract; //what is the difference between this and ^
let TestingToken: ContractFactory; //this one genuenly makes sense
let token2: Contract; // and then???
let id;
describe('FanCollectible tokens', function(){
    beforeEach(async function(){
        [FCA,FAC2,FAC3] = await ethers.getSigners();
        FCtoken = await ethers.getContractFactory('FanCollectible');
        hardhatToken = await FCtoken.deploy('Pyrocoin');
    });
    it('Check minter\'s address', async function(){
        // hardhatToken.transferMinter(FCA.address);
        expect(await hardhatToken.owner()).to.equal(FCA.address);
    });
    it('Check if create works', async function(){
        hardhatToken.transferMinter(FCA.address);
        const lol1 = (await hardhatToken.getCurrentTokenID()).toString();
        const Tid = await hardhatToken.create(1,'Pyrocoin',"0x00");
        const lol2 = (await hardhatToken.getCurrentTokenID()).toString();
        //console.log(Tid);
        expect(lol1).to.not.equal(lol2);
    });
});
describe('CreatorCollections', function(){
    beforeEach(async function(){
        TestingToken = await ethers.getContractFactory('TestingToken');
        token2 = await TestingToken.deploy(6);
        FCtoken2 = await ethers.getContractFactory('CreatorCollections');
        hht = await FCtoken2.deploy(FCA.address,hardhatToken.owner(),FCA.address);

    });
    it('Check initial supply', async function(){
        expect (await hht.totalSupply()).to.equal(0);
    });
    it('Create a pool', async function(){
        id = (await hht.createPool(1,Math.floor(Date.now() / 1000),ethers.utils.parseEther("10000"),FCA.address, "My first collection"));
       
        const poolsArray = await hht.getPoolsForArtist(FCA.address);
        console.log(poolsArray);
        expect (await poolsArray.length).to.greaterThan(0);
    });
    it ('Testing Create Card', async function(){
        expect(await hardhatToken.owner()).to.equal(FCA.address);
        id = (await hht.createPool(1,Math.floor(Date.now() / 1000),ethers.utils.parseEther("10000"),FCA.address, "My first collection"));
        const poolsArray = await hht.getPoolsForArtist(FCA.address);
        console.log(poolsArray);
        //expect (await FCA.address).to.equal(hht.collectible);
        const TokenId = await hht.createCard(1,10,ethers.utils.parseEther("10000"),Math.floor(Date.now() / 1000));
        const cArray = await  hht.getCardsArray(1);
        console.log(cArray);
        expect (await cArray.length).to.greaterThan(0);
    });
});

