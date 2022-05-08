pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../dependency/sablier/interfaces/ISablier.sol";
import "hardhat/console.sol";

// "dependency/sablier/ISablier.sol"
// "creaton/RedeemCreate.sol"

contract RedeemCreate{
    ISablier sablier;
    address create;
    ERC20 protoTeam;
    ERC20 protoAdvisor;
    ERC20 protoAmbassador;
    ERC20 ProtoPrivate;
    ERC20 protoSeed;
    uint256 days180 = 180*86400;

    event streamStarted(address tokenType, uint256 amount, uint256 startTime, uint256 endTime, address recipient, uint256 streamId);

    constructor(address sablierAddress, address _create, address _protoTeam, address _protoAdvisor, address _protoAmbassador, address _ProtoPrivate, address _protoSeed){
        //ISablier(0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06)
        sablier = ISablier(sablierAddress);
        create = _create;
        protoTeam = ERC20(_protoTeam);
        protoAdvisor = ERC20(_protoAdvisor);
        protoAmbassador = ERC20(_protoAmbassador);
        ProtoPrivate = ERC20(_ProtoPrivate);
        protoSeed = ERC20(_protoSeed);

    }

    function startTeamStream(uint256 amountPutIn, address target) public returns (uint256 streamID){
        address sender = target;
        if (target == address(0x00)){
            address sender = msg.sender;
        }
        
        //sender, amount, create Address, now, to two years from now
        protoTeam.transferFrom(msg.sender, address(this), amountPutIn);


        uint256 roundOver = amountPutIn%(86400*365*2);
        ERC20(create).approve(address(sablier), amountPutIn);
        uint256 streamID = sablier.createStream(sender, amountPutIn - roundOver, create, block.timestamp + days180, block.timestamp + 86400*365*2 + days180);
        console.log(streamID);
        emit streamStarted(address(protoTeam), amountPutIn - roundOver, block.timestamp+days180, block.timestamp+86400*365*2+days180, sender, streamID);

        if (roundOver > 0){
            uint256 overflowStream = sablier.createStream(sender, roundOver, create, block.timestamp + 86400*365*2 + days180, block.timestamp + 86400*365*2 + days180+1);
            console.log(overflowStream);
        }
        return streamID;
    }

    function startAdvisorStream(uint256 amountPutIn, address target) public returns (uint256 streamID){
        address sender = target;
        if (target == address(0x00)){
            address sender = msg.sender;
        }

        protoAdvisor.transferFrom(msg.sender, address(this), amountPutIn);

        uint256 roundOver = amountPutIn%(86400*304);
        ERC20(create).approve(address(sablier), amountPutIn);
        uint256 streamID = sablier.createStream(sender, amountPutIn - roundOver, create, block.timestamp + days180, block.timestamp + 86400*304 + days180);
        //86400 for seconds in a day, 304 for 10 months
        console.log(streamID);
        emit streamStarted(address(protoAdvisor), amountPutIn - roundOver, block.timestamp+days180, block.timestamp+86400*304+days180, sender, streamID);

        if (roundOver > 0){
            uint256 overflowStream = sablier.createStream(sender, roundOver, create, block.timestamp+86400*304+days180, block.timestamp+86400*304+days180 + 1);
            console.log(overflowStream);
        }
        return streamID;
    }
    
    function startAmbassadorStream(uint256 amountPutIn, address target) public returns (uint256 streamID){
        address sender = target;
        if (target == address(0x00)){
            address sender = msg.sender;
        }

        protoAmbassador.transferFrom(msg.sender, address(this), amountPutIn);

        uint256 roundOver = amountPutIn%(86400*304);
        ERC20(create).approve(address(sablier), amountPutIn);
        uint256 streamID = sablier.createStream(sender, amountPutIn - roundOver, create, block.timestamp + 86400*30, block.timestamp + 86400*304 + 86400*30);
        //86400 for seconds in a day, 304 for 10 months
        console.log(streamID);
        emit streamStarted(address(protoAmbassador), amountPutIn - roundOver, block.timestamp+86400*30, block.timestamp+86400*304+86400*30, sender, streamID);

        if (roundOver>0){
            console.log(sablier.createStream(sender, roundOver, create, block.timestamp + 86400*304, block.timestamp + 86400*304+1));
        }

        return streamID;
    }

    function startSeedStream(uint256 amountPutIn, address target) public returns (uint256 streamID){
        address sender = target;
        if (target == address(0x00)){
            address sender = msg.sender;
        }

        //sender, amount, create Address, now, to two years from now
        protoSeed.transferFrom(msg.sender, address(this), amountPutIn);
        uint256 roundOver = amountPutIn%(86400*243);

        ERC20(create).approve(address(sablier), amountPutIn);
        uint256 streamID = sablier.createStream(sender, amountPutIn - roundOver, create, block.timestamp + 86400*30, block.timestamp + 86400*(243+30));
        //86400 for seconds in a day
        console.log(streamID);
        emit streamStarted(address(protoSeed), amountPutIn - roundOver, block.timestamp+86400*30, block.timestamp+86400*(243+30), sender, streamID);

        if (roundOver>0){
            emit streamStarted(
                address(protoSeed),
                roundOver,
                block.timestamp + 86400*(243+30),
                block.timestamp + 86400*(243+30)+1,
                sender, 
                sablier.createStream(
                    sender, 
                    roundOver, 
                    create, 
                    block.timestamp + 86400*(243+30), 
                    block.timestamp + 86400*(243+30)+1));
        }
        return streamID;
    }

    function startPrivateStream(uint256 amountPutIn, address target) public returns (uint256 streamID){
        address sender = target;
        if (target == address(0x00)){
            address sender = msg.sender;
        }

        //sender, amount, create Address, now, to two years from now
        ProtoPrivate.transferFrom(msg.sender, address(this), amountPutIn);

        ERC20(create).approve(address(sablier), amountPutIn);
        uint256 streamID = sablier.createStream(msg.sender, amountPutIn, create, block.timestamp + 86400*30, block.timestamp + 86400*(121+30));
        //86400 for seconds in a day, 152 for 4 months, starting one month from now.
        console.log(streamID);
        emit streamStarted(address(ProtoPrivate), amountPutIn, block.timestamp+86400*30, block.timestamp+86400*(121+30), msg.sender, streamID);
        return streamID;
    }
}
