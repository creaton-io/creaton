import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";

const timeTravel = async (time: number) => {
    const startBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
    await network.provider.send("evm_increaseTime", [time]);
    await network.provider.send("evm_mine");
    const endBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());

    console.log(`\tTime Travelled ${time} (sec) => FROM ${startBlock.timestamp} TO ${endBlock.timestamp}`);
};  
const secondsInAMonth = 2592000;
describe('Redeeming Create For Investors Based On Proto Create', function(){
    let teamMember : SignerWithAddress;
    let advisorMember : SignerWithAddress;
    let privateMember : SignerWithAddress;
    let seedMember : SignerWithAddress;
    let creaton: SignerWithAddress;

    let sablierContract : Contract;
    let redeemCreate: Contract;
    let create: Contract;

    let protoTeam: Contract;
    let protoAdvisor: Contract;
    let protoPrivate: Contract;
    let protoSeed: Contract;

    beforeEach(async function() {
        [creaton, teamMember, advisorMember, privateMember, seedMember] = await ethers.getSigners();
        protoTeam = await (await ethers.getContractFactory("ProtoCreateTeam")).connect(creaton).deploy();
        protoAdvisor = await (await ethers.getContractFactory("ProtoCreateAdvisor")).connect(creaton).deploy();
        protoPrivate = await (await ethers.getContractFactory("ProtoCreatePrivate")).connect(creaton).deploy();
        protoSeed = await (await ethers.getContractFactory("ProtoCreateSeed")).connect(creaton).deploy();


        create = await( await ethers.getContractFactory("TestingToken")).connect(creaton).deploy(ethers.utils.parseEther("100000000"));

        sablierContract = await (await ethers.getContractFactory("Sablier")).deploy();
        redeemCreate = await (await ethers.getContractFactory("RedeemCreate")).deploy(sablierContract.address, create.address, protoTeam.address, protoAdvisor.address, protoPrivate.address, protoSeed.address);
        

    });
    it("check that team gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("63072"));
        await protoTeam.connect(creaton).transfer(teamMember.address, ethers.utils.parseEther("63072"));

        //just confirm that it transferred correctly.
        expect(await protoTeam.balanceOf(teamMember.address)).to.equal(ethers.utils.parseEther("63072"));

        await protoTeam.connect(teamMember).approve(redeemCreate.address, ethers.utils.parseEther("63072"));
        await redeemCreate.connect(teamMember).startTeamStream(ethers.utils.parseEther("63072"));

        await timeTravel(365*2*24*60*60+ 10);//2 years
        console.log(await sablierContract.balanceOf(100000, teamMember.address));

        //100000 is the stream id, should just query the streams the user has on the graph instead.
        await sablierContract.connect(teamMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, teamMember.address));
        expect(await create.balanceOf(teamMember.address)).to.equal(ethers.utils.parseEther("63072"));
    });

    // it("check that Advisors gets tokens", async function(){
    //     await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("262656"));
    //     await protoAdvisor.connect(creaton).transfer(advisorMember.address, ethers.utils.parseEther("262656"));
    //     console.log("hi");
    //     //just confirm that it transferred correctly.
    //     expect(await protoAdvisor.balanceOf(advisorMember.address)).to.equal(ethers.utils.parseEther("262656"));
    //     console.log("hi");
    //     await protoAdvisor.connect(advisorMember).approve(redeemCreate.address, ethers.utils.parseEther("262656"));
    //     await redeemCreate.connect(advisorMember).startAdvisorStream(ethers.utils.parseEther("262656"));
    //     console.log("hi");
    //     await timeTravel(365*2*24*60*60+ 10);//2 years
    //     console.log(await sablierContract.balanceOf(100000, advisorMember.address));
        
    //     await sablierContract.withdrawFromStream(100000, await sablierContract.balanceOf(100000, advisorMember.address));
    //     expect(await create.balanceOf(advisorMember.address)).to.equal(ethers.utils.parseEther("262656"));
    // });

});