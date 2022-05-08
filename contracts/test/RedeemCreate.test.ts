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
    let ambassadorMember : SignerWithAddress;
    let privateMember : SignerWithAddress;
    let seedMember : SignerWithAddress;
    let creaton: SignerWithAddress;

    let sablierContract : Contract;
    let redeemCreate: Contract;
    let create: Contract;

    let protoTeam: Contract;
    let protoAdvisor: Contract;
    let protoAmbassador: Contract;
    let protoPrivate: Contract;
    let protoSeed: Contract;

    beforeEach(async function() {
        [creaton, teamMember, advisorMember, ambassadorMember, privateMember, seedMember] = await ethers.getSigners();
        protoTeam = await (await ethers.getContractFactory("ProtoCreateTeam")).connect(creaton).deploy();
        protoAdvisor = await (await ethers.getContractFactory("ProtoCreateAdvisor")).connect(creaton).deploy();
        protoAmbassador = await (await ethers.getContractFactory("ProtoCreateAmbassador")).connect(creaton).deploy();
        protoPrivate = await (await ethers.getContractFactory("ProtoCreatePrivate")).connect(creaton).deploy();
        protoSeed = await (await ethers.getContractFactory("ProtoCreateSeed")).connect(creaton).deploy();


        create = await( await ethers.getContractFactory("TestingToken")).connect(creaton).deploy(ethers.utils.parseEther("100000000"));

        sablierContract = await (await ethers.getContractFactory("Sablier")).deploy();
        redeemCreate = await (await ethers.getContractFactory("RedeemCreate")).deploy(sablierContract.address, create.address, protoTeam.address, protoAdvisor.address, protoAmbassador.address, protoPrivate.address, protoSeed.address);
        

    });
    it("check that team gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("63072"));
        await protoTeam.connect(creaton).transfer(teamMember.address, ethers.utils.parseEther("63072"));

        //just confirm that it transferred correctly.
        expect(await protoTeam.balanceOf(teamMember.address)).to.equal(ethers.utils.parseEther("63072"));

        await protoTeam.connect(teamMember).approve(redeemCreate.address, ethers.utils.parseEther("63072"));
        await redeemCreate.connect(teamMember).startTeamStream(ethers.utils.parseEther("63072"), teamMember.address);

        await timeTravel(365*2*24*60*60+ 10 + 180*86400);//2 years
        console.log(await sablierContract.balanceOf(100000, teamMember.address));

        //100000 is the stream id, should just query the streams the user has on the graph instead.
        await sablierContract.connect(teamMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, teamMember.address));
        expect(await create.balanceOf(teamMember.address)).to.equal(ethers.utils.parseEther("63072"));
    });

    it("check that Advisors gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("262656"));
        await protoAdvisor.connect(creaton).transfer(advisorMember.address, ethers.utils.parseEther("262656"));

        //just confirm that it transferred correctly.
        expect(await protoAdvisor.balanceOf(advisorMember.address)).to.equal(ethers.utils.parseEther("262656"));
        await protoAdvisor.connect(advisorMember).approve(redeemCreate.address, ethers.utils.parseEther("262656"));
        await redeemCreate.connect(advisorMember).startAdvisorStream(ethers.utils.parseEther("262656"), advisorMember.address);

        await timeTravel(365*2*24*60*60+ 10);//2 years
        console.log(await sablierContract.balanceOf(100000, advisorMember.address));
        
        await sablierContract.connect(advisorMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, advisorMember.address));
        expect(await create.balanceOf(advisorMember.address)).to.equal(ethers.utils.parseEther("262656"));
    });

    it("check that Ambassadors gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("262656"));
        await protoAmbassador.connect(creaton).transfer(ambassadorMember.address, ethers.utils.parseEther("262656"));

        //just confirm that it transferred correctly.
        expect(await protoAmbassador.balanceOf(ambassadorMember.address)).to.equal(ethers.utils.parseEther("262656"));
        await protoAmbassador.connect(ambassadorMember).approve(redeemCreate.address, ethers.utils.parseEther("262656"));
        await redeemCreate.connect(ambassadorMember).startAmbassadorStream(ethers.utils.parseEther("262656"), ambassadorMember.address);

        await timeTravel(365*2*24*60*60+ 10);//2 years
        console.log(await sablierContract.balanceOf(100000, ambassadorMember.address));

        await sablierContract.connect(ambassadorMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, ambassadorMember.address));
        expect(await create.balanceOf(ambassadorMember.address)).to.equal(ethers.utils.parseEther("262656"));
    });

    it("check that Seed gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("209952"));
        await protoSeed.connect(creaton).transfer(seedMember.address, ethers.utils.parseEther("209952"));

        //just confirm that it transferred correctly.
        expect(await protoSeed.balanceOf(seedMember.address)).to.equal(ethers.utils.parseEther("209952"));
        await protoSeed.connect(seedMember).approve(redeemCreate.address, ethers.utils.parseEther("209952"));
        await redeemCreate.connect(seedMember).startSeedStream(ethers.utils.parseEther("209952"), seedMember.address);

        await timeTravel(365*2*24*60*60+ 10);//2 years
        console.log(await sablierContract.balanceOf(100000, seedMember.address));

        await sablierContract.connect(seedMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, seedMember.address));
        expect(await create.balanceOf(seedMember.address)).to.equal(ethers.utils.parseEther("209952"));
    });

    it("check that Private gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("104544"));
        await protoPrivate.connect(creaton).transfer(privateMember.address, ethers.utils.parseEther("104544"));

        //just confirm that it transferred correctly.
        expect(await protoPrivate.balanceOf(privateMember.address)).to.equal(ethers.utils.parseEther("104544"));
        await protoPrivate.connect(privateMember).approve(redeemCreate.address, ethers.utils.parseEther("104544"));
        await redeemCreate.connect(privateMember).startPrivateStream(ethers.utils.parseEther("104544"), privateMember.address);

        await timeTravel(365*2*24*60*60+ 10);//1 year
        console.log(await sablierContract.balanceOf(100000, privateMember.address));

        await sablierContract.connect(privateMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, privateMember.address));
        expect(await create.balanceOf(privateMember.address)).to.equal(ethers.utils.parseEther("104544"));
    });

    it("check that team gets tokens with rounding working", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("1"));
        await protoTeam.connect(creaton).transfer(teamMember.address, ethers.utils.parseEther("1"));

        //just confirm that it transferred correctly.
        expect(await protoTeam.balanceOf(teamMember.address)).to.equal(ethers.utils.parseEther("1"));

        await protoTeam.connect(teamMember).approve(redeemCreate.address, ethers.utils.parseEther("1"));
        await redeemCreate.connect(teamMember).startTeamStream(ethers.utils.parseEther("1"), teamMember.address);

        await timeTravel(365*2*24*60*60+ 10 + 180*86400);//2 years
        // console.log(await sablierContract.balanceOf(100000, teamMember.address));

        //100000 is the stream id, should just query the streams the user has on the graph instead.
        await sablierContract.connect(teamMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, teamMember.address));

        //again, dont hard code, use the graph
        await sablierContract.connect(teamMember).withdrawFromStream(100001, await sablierContract.balanceOf(100001, teamMember.address));
        expect(await create.balanceOf(teamMember.address)).to.equal(ethers.utils.parseEther("1"));
    });

    it("check that Advisors gets tokens with rounding working", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("1.5"));
        await protoAdvisor.connect(creaton).transfer(advisorMember.address, ethers.utils.parseEther("1.5"));

        //just confirm that it transferred correctly.
        expect(await protoAdvisor.balanceOf(advisorMember.address)).to.equal(ethers.utils.parseEther("1.5"));
        await protoAdvisor.connect(advisorMember).approve(redeemCreate.address, ethers.utils.parseEther("1.5"));
        await redeemCreate.connect(advisorMember).startAdvisorStream(ethers.utils.parseEther("1.5"), advisorMember.address);

        await timeTravel(365*2*24*60*60+ 10);//2 years
        // console.log(await sablierContract.balanceOf(100000, advisorMember.address));

        await sablierContract.connect(advisorMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, advisorMember.address));
        await sablierContract.connect(advisorMember).withdrawFromStream(100001, await sablierContract.balanceOf(100001, advisorMember.address));
        
        expect(await create.balanceOf(advisorMember.address)).to.equal(ethers.utils.parseEther("1.5"));
    });

    it("check that Ambassadors gets tokens with rounding", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("1.5"));
        await protoAmbassador.connect(creaton).transfer(ambassadorMember.address, ethers.utils.parseEther("1.5"));

        //just confirm that it transferred correctly.
        expect(await protoAmbassador.balanceOf(ambassadorMember.address)).to.equal(ethers.utils.parseEther("1.5"));
        await protoAmbassador.connect(ambassadorMember).approve(redeemCreate.address, ethers.utils.parseEther("1.5"));
        await redeemCreate.connect(ambassadorMember).startAmbassadorStream(ethers.utils.parseEther("1.5"), ambassadorMember.address);

        await timeTravel(365*2*24*60*60+ 10);//2 years
        console.log(await sablierContract.balanceOf(100000, ambassadorMember.address));

        await sablierContract.connect(ambassadorMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, ambassadorMember.address));
        await sablierContract.connect(ambassadorMember).withdrawFromStream(100001, await sablierContract.balanceOf(100001, ambassadorMember.address));
        expect(await create.balanceOf(ambassadorMember.address)).to.equal(ethers.utils.parseEther("1.5"));
    });

    it("check that Private gets tokens", async function(){
        await create.connect(creaton).transfer(redeemCreate.address, ethers.utils.parseEther("104544"));
        await protoPrivate.connect(creaton).transfer(privateMember.address, ethers.utils.parseEther("104544"));

        //just confirm that it transferred correctly.
        expect(await protoPrivate.balanceOf(privateMember.address)).to.equal(ethers.utils.parseEther("104544"));
        await protoPrivate.connect(privateMember).approve(redeemCreate.address, ethers.utils.parseEther("104544"));
        await redeemCreate.connect(privateMember).startPrivateStream(ethers.utils.parseEther("104544"), privateMember.address);

        await timeTravel(365*2*24*60*60+ 10);//1 year
        console.log(await sablierContract.balanceOf(100000, privateMember.address));

        await sablierContract.connect(privateMember).withdrawFromStream(100000, await sablierContract.balanceOf(100000, privateMember.address));
        expect(await create.balanceOf(privateMember.address)).to.equal(ethers.utils.parseEther("104544"));
    });

});