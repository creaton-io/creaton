import { expect } from "chai";
import { ethers,deployments } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { Test } from "mocha";
import { Address } from "hardhat-deploy/dist/types";

//"0x0000014d00000000000000000000000000000000000000000000000000000000" For every $1.00 tipped.
//aka, calculateEquationFormatting([0, 333])
//"0x0000014d00000000000000000000000000000000000000000000000000000000"
//"0x00000d0500000000000000000000000000000000000000000000000000000000" For every $10.00 tipped.
async function levelToMax(artistAddress:Address, tippingAccount:SignerWithAddress, marketPoints:Contract){
    while (await marketPoints.canLevelUp(artistAddress, tippingAccount.address)){
        await marketPoints.connect(tippingAccount).levelUp(artistAddress);
    }
}

/**
 * @dev This function takes the equation parameters and formats for the contract.
 * @param values array of int16s.
 * @returns the hex string of the formatted values. (bytes32)
 */
function calculateEquationFormatting(values:number[]){
    //TODO: i think theres a bug with negative numbers being converted with twos complement.
    let formattedValues = "0x";
    for (let i = 0; i < values.length; i++){
        formattedValues += values[i].toString(16).padStart(4, "0");
    }
    formattedValues = formattedValues.padEnd(66, "0");
    return formattedValues;
}

function calculateDesmosFormatting(values: String){
    values = values.replace("0x", "");
    let ans = "f(x) = ";
    for (let i = 0; i < 64; i+=4) {
        let temp = values.substring(i, i+4);
        console.log(temp);
        console.log(parseInt("0x"+temp, 16));
        ans += parseInt("0x"+temp, 16).toString();
        for(let j = 0; j < i/4; j++){
            ans += "*x";
        }
        ans += " + ";
    }
    return ans;
}

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
    it("test that reaching level 1 works correctly", async function(){
        await testingToken.connect(tippingAccount).faucet();
        //should be set to level the user every $1 they tip!
        await marketPoints.connect(artistAccount).setArtistLevels(calculateEquationFormatting([0, 333])); 
        console.log("the next line is the tipping accounts level");

        // console.log(await marketPoints.getPointsForLevel(artistAccount.address, 1));
        // console.log(await marketPoints.getPointsForLevel(artistAccount.address, 100));
        expect(await marketPoints.getLevel(artistAccount.address, tippingAccount.address)).to.equal(0);

        await testingToken.connect(tippingAccount).approve(marketPoints.address, ethers.utils.parseEther("1"));
        
        await marketPoints.connect(tippingAccount).tipArtist(artistAccount.address, ethers.utils.parseEther("1"));
        expect( await marketPoints.getLevel(artistAccount.address, tippingAccount.address)).to.equal(1);
        expect (await marketPoints.getCurrentLevel(artistAccount.address, tippingAccount.address)).to.equal(0);
        
        console.log("currently at points " + await marketPoints.getCurrentPoints(artistAccount.address, tippingAccount.address));
        
        await levelToMax(artistAccount.address, tippingAccount, marketPoints);
        //should be at level 3. give or take the math truncation.
        expect (await marketPoints.getCurrentLevel(artistAccount.address, tippingAccount.address)).to.equal(1);

    });
    
});
describe('Leveling by tipping', function(){
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
    it("$10, for $10/level", async function(){
        await testingToken.connect(tippingAccount).faucet();

        await marketPoints.connect(artistAccount).setArtistLevels(calculateEquationFormatting([0, 3333])); 
        console.log("the next line is the tipping accounts level");

        expect(await marketPoints.getLevel(artistAccount.address, tippingAccount.address)).to.equal(0);

        await testingToken.connect(tippingAccount).approve(marketPoints.address, ethers.utils.parseEther("10"));
        
        await marketPoints.connect(tippingAccount).tipArtist(artistAccount.address, ethers.utils.parseEther("10"));
        expect( await marketPoints.getLevel(artistAccount.address, tippingAccount.address)).to.equal(1);
        expect (await marketPoints.getCurrentLevel(artistAccount.address, tippingAccount.address)).to.equal(0);
        
        
        await levelToMax(artistAccount.address, tippingAccount, marketPoints);
        //should be at level 3. give or take the math truncation.
        expect (await marketPoints.getCurrentLevel(artistAccount.address, tippingAccount.address)).to.equal(1);
    });
    it("$100, for $10/level", async function(){
        await testingToken.connect(tippingAccount).faucet();

        await marketPoints.connect(artistAccount).setArtistLevels(calculateEquationFormatting([0, 3333])); 

        expect(await marketPoints.getLevel(artistAccount.address, tippingAccount.address)).to.equal(0);

        await testingToken.connect(tippingAccount).approve(marketPoints.address, ethers.utils.parseEther("100"));
        
        await marketPoints.connect(tippingAccount).tipArtist(artistAccount.address, ethers.utils.parseEther("100"));
        
        await levelToMax(artistAccount.address, tippingAccount, marketPoints);
        
        expect (await marketPoints.getCurrentLevel(artistAccount.address, tippingAccount.address)).to.equal(10);
        console.log(calculateDesmosFormatting(calculateEquationFormatting([-10, 333])));
    });

});
