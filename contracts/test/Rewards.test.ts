import { expect } from "chai";
import { ethers, network} from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { promisify } from "util";
  
describe('test rewards', function(){
    let ownerAccount: SignerWithAddress;
    let testingTokenFactory: ContractFactory;
    let pretendCreate: Contract;
    let rewardsFactory: ContractFactory;
    let rewards: Contract;
    beforeEach(async function() {
        [ownerAccount] = await ethers.getSigners();
        testingTokenFactory = await ethers.getContractFactory('TestingToken');
        pretendCreate = await testingTokenFactory.connect(ownerAccount).deploy(ethers.utils.parseEther("0"));
        pretendCreate.connect(ownerAccount).fund(ethers.utils.parseEther("100000"));
        rewardsFactory = await ethers.getContractFactory('Rewards');
        rewards = await rewardsFactory.connect(ownerAccount).deploy(pretendCreate.address);
    });
    it('should be able to create a new rewards contract', async function(){
        expect(await rewards.owner()).to.equal(ownerAccount.address);
        await pretendCreate.transfer(rewards.address, ethers.utils.parseEther('1000'));
        expect(await pretendCreate.balanceOf(rewards.address)).to.equal(ethers.utils.parseEther('1000'));
    });
    it('able to add 1 user rewards', async function() {
        let testingAccount: SignerWithAddress;
        [ownerAccount, testingAccount] = await ethers.getSigners();
        console.log(testingAccount.address);
        console.log(ownerAccount.address);
        console.log(await pretendCreate.balanceOf(ownerAccount.address));

        expect(await pretendCreate.balanceOf(testingAccount.address)).to.equal(ethers.utils.parseEther('0'));

        await pretendCreate.connect(ownerAccount).transfer(rewards.address, ethers.utils.parseEther('100'));
        await rewards.connect(ownerAccount).setRewards(testingAccount.address, ethers.utils.parseEther('10'));
        expect(await rewards.getRewards(testingAccount.address)).to.equal(ethers.utils.parseEther('10'));
        await rewards.redeem(testingAccount.address);
        expect(await pretendCreate.balanceOf(testingAccount.address)).to.equal(ethers.utils.parseEther('10'));
    });
    it('able to add 100 user rewards', async function(){
        const numberOfUsers = 10;
        const tokenPerUser = 10;
        let testAccounts = new Array<SignerWithAddress>(numberOfUsers); //the owner account is still the singer

        [ownerAccount] = await ethers.getSigners();
        testAccounts = await (await ethers.getSigners()).slice(1, numberOfUsers+1);
        
        console.log(testAccounts.length);
        await pretendCreate.connect(ownerAccount).transfer(rewards.address, ethers.utils.parseEther((numberOfUsers * tokenPerUser + 1).toString()));
        
        for (const i in testAccounts) {
            const x = testAccounts[i];
            await rewards.setRewards(x.address, ethers.utils.parseEther(tokenPerUser.toString()));
        };

        for (const i in testAccounts) {
            const x = testAccounts[i];
            await rewards.redeem(x.address);
            console.log("hi")
            
            expect(await pretendCreate.balanceOf(x.address)).to.equal(ethers.utils.parseEther(tokenPerUser.toString()));
        };

        
    });
});