import { expect } from "./chai-setup";
import { ethers,deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { Test } from "mocha";


describe('Market Points Tipping', function(){
    let artistAccount: SignerWithAddress;
    let tippingAccount: SignerWithAddress;
    let testingTokenFactory: ContractFactory;
    let testingToken: Contract;
    let marketPointsFactory: ContractFactory;
    let marketPoints: Contract;

    beforeEach(async function() {
        [artistAccount, tippingAccount] = await ethers.getSigners();
        testingTokenFactory = await ethers.getContractFactory('TestingToken');
        testingToken = await testingTokenFactory.deploy(0);

        marketPointsFactory = await ethers.getContractFactory('MarketPoints')
        marketPoints = await marketPointsFactory.deploy(testingToken.address);
        
    });
    it("all going well", async function() {
        //give the fan account MONEY
        await testingToken.connect(tippingAccount).faucet();

        //check that the artist is starting out without funds
        
        // console.log(artistAccount.address)
        // console.log(tippingAccount.address)
        // console.log(ethers.utils.parseEther("1"))

        expect(await testingToken.balanceOf(artistAccount.address)).to.equal(ethers.utils.parseEther("0"));

        await testingToken.connect(tippingAccount).approve(marketPoints.address, ethers.utils.parseEther("1"));
        
        await marketPoints.connect(tippingAccount).tipArtist(artistAccount.address, ethers.utils.parseEther("1"));
        expect(await testingToken.balanceOf(artistAccount.address)).to.equal(ethers.utils.parseEther("1"));
    });
    it("not Enough Funds", async function(){
        expect(await testingToken.balanceOf(artistAccount.address)).to.equal(ethers.utils.parseEther("0"));

        await testingToken.connect(tippingAccount).approve(marketPoints.address, ethers.utils.parseEther("1"));
        await expect(marketPoints.connect(tippingAccount).tipArtist(artistAccount.address, ethers.utils.parseEther("1"))).to.revertedWith("ERC20: transfer amount exceeds balance");
        expect(await testingToken.balanceOf(artistAccount.address)).to.equal(ethers.utils.parseEther("0"));
    });
    it("test that next level works correctly", async function(){
        await testingToken.connect(tippingAccount).faucet();
        //should be set to level the user every $1 they tip!
        await marketPoints.connect(artistAccount).setArtistLevels("0x00010000000000000000000000000000"); 
        console.log("the next line is the tipping accounts level");

        console.log(await marketPoints.getPointsForLevel(artistAccount.address, 1));
        console.log(await marketPoints.getPointsForLevel(artistAccount.address, 100));
        expect(await marketPoints.getLevel(artistAccount.address, tippingAccount.address)).to.equal(0);

        await testingToken.connect(tippingAccount).approve(marketPoints.address, ethers.utils.parseEther("1"));
        
        await marketPoints.connect(tippingAccount).tipArtist(artistAccount.address, ethers.utils.parseEther("1"));

    });
    
    
});