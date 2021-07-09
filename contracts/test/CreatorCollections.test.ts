import { expect } from "./chai-setup";
import { ethers,deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


let FCA: SignerWithAddress;
let FAC2: SignerWithAddress;
let FAC3: SignerWithAddress;
let FCtoken;
let FCtoken2;
let hardhatToken: Contract;
let hht: Contract;


describe('FanCollectible tokens', function(){
    beforeEach(async function(){
        [FCA,FAC2,FAC3] = await ethers.getSigners();
        FCtoken = await ethers.getContractFactory('FanCollectible');
        hardhatToken = await FCtoken.deploy('Pyrocoin');
    });
    it('Check minter\'s address', async function(){
        //hardhatToken.transferMinter(FCA.address);
        expect(await hardhatToken.owner()).to.equal(FCA.address);
    });
    it('Check if create works', async function(){
        const lol1 = (await hardhatToken.getCurrentTokenID()).toString();
        const Tid = await hardhatToken.create(10,5,'Pyrocoin',"0x00");
        const lol2 = (await hardhatToken.getCurrentTokenID()).toString();
        //console.log(Tid);
        expect(lol1).to.equal(lol2);
    });
});
describe('TestingToken', function(){
    beforeEach(async function(){
        const TestingToken = await ethers.getContractFactory('TestingToken');
        const token2 = await TestingToken.deploy(6);
        FCtoken2 = await ethers.getContractFactory('CreatorCollections');
        hht = await FCtoken2.deploy(FCA.address,FCA.address,FAC3.address);

    });
    it('Check initial supply', async function(){
        expect (await hht.totalSupply()).to.equal(0);
    });
});

