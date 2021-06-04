pragma solidity 0.8.0;


import TokenStaking from './StakeIt.sol';


// Creators can mint x amount of tokens in repution token smart contract

// Allow the subscribers to stream an amount based on... 
// ... how much original tokens they are staking. 



contract BasicStreamingToken is ERC20 { 
    uint256 public totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping (address => mapping (address => uint256)) internal allowed;

    enum AccountType { Default, Concentrator, Deconcentrator }

    mapping (address => AccountType) accountTypes;

    uint public constant Default_Acc_Max_Incoming_Streams = 10; 
    uint public constant Defailt_Acc_Max_Outgoing_Streams = 10; 

    // using uint to take advantage of struct packing 
    struct Stream {
        address sender; 
        address receiver; 
        uint256 flowrate; 
        uint256 startTime; 
        uint256 outStreamsBackRef; 
    }

    // Closed streams result in "empty holes" 
    Stream[] public stream; 

    // Array of outgoing stream ids per account 
    mapping(address => uint[]) public outStreamsOf; 

    // Array of incoming stream ids per account 
    mapping(address => uint[]) public inStreamsOf; 

    // Snapshots are an optimization for deconcentrator accounts: 
    // on every stream state change, the snapshot of the sending...
    // ...deconcentrator is updated.
    struct Snapshot {

        // Time of last update of the snapshot 
        uint256 timestamp; 

        // Cumulated expected balance of open streams 
        uint256 cumulatedExpStreamBalance; 

        // cumulated expected flowrate 
        uint256 cumulatedExpFlorate;

    }

    mapping(address => Snapshot) deconcentratorSnapshots; 

    constructor(uint256 initialSupply, string memory _name, string memory _symbol, uint8 _decimals) public {
        name = _name; 
        symbol = _symbol; 
        decimals = _decimals;

        staticBalances[msg.sender] = int(initialSupply);

        totalSupply = initialSupply; 

        // Empty first element for implicit null-like semantics 
        streams.push(Stream(address(0), 0, 0, 0, 0))
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(hasMinBalance(_from, _value), "insufficient funds");
        require(_value <= allowed[_from][msg.sender]);

        staticBalances[_from] -= int(_value); 
        staticBalances[_to] += int(_value);
        allowed[_from][msg.sender] -= _value; 
        emit Transfer(_from, _to, _value, TransferType.ATOMIC);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
       allowed[msg.sender][_spender] = _value; 
       emit Approval(msg.sender, _spender, _value); 
       return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender]; 
    }

    // Atomic (aka normal) transfers
    function transfer(address _to, uint256 _value) external returns (bool) {
        require (hasMinBalance(msg.sender, _value), "insufficient funds"); 

        staticBalances[msg.sender] -= int(_value);
        staticBalances[_to] += int(_value); 
        emit Transfer(msg.sender, _to, _value, TransferType.ATOMIC);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balanceOfImpl(_owner);
    }

     function canOpenStream(address from, address to, uint256 flowrate, uint256 maxAmount) public view returns(CanOpenResult) {
        if(! canStreamTo(from, to)) {
            return CanOpenResult.ERR_SENDER_RECEIVER_TUPLE;
        }
        // Default Account has limit for nr of incoming and outgoing streams
        if(accountTypes[from] == AccountType.Default) {
            if(outStreamsOf[from].length >= DEFAULT_ACCOUNT_MAX_OUTGOING_STREAMS) {
                return CanOpenResult.ERR_SENDER_QUOTA;
            }
        }
        if(accountTypes[to] == AccountType.Default) {
            if(inStreamsOf[to].length >= DEFAULT_ACCOUNT_MAX_INCOMING_STREAMS) {
                return CanOpenResult.ERR_RECEIVER_QUOTA;
            }
        }
        if(flowrate == 0) {
            return CanOpenResult.ERR_FLOWRATE;
        }
        if(maxAmount != 0) {
            return CanOpenResult.ERR_MAXAMOUNT; // TODO: implement
        }

        return CanOpenResult.OK;
    }

    function setAccountType(AccountType newType) public {
        require(inStreamsOf[msg.sender].length == 0);
        require(getOutStreamsOf(msg.sender).length == 0);
        accountTypes[msg.sender] = newType;
    }

    // returns the account type of the caller
    function getAccountType() public view returns(AccountType) {
        return accountTypes[msg.sender];
    }

    // returns the account type of a given account
    function getAccountTypeOf(address acc) public view returns(AccountType) {
        return accountTypes[acc];
    }

     /** removes a stream object and the references to it */
    function removeStream(uint256 streamId) internal {
        Stream storage s = streams[streamId];

        /* This slightly complicated construction with 2-way references allows us to avoid array iterations,
        which has the advantage of constant gas costs */

        if(s.outStreamsBackRef != outStreamsOf[s.sender].length-1) {
            // move the pointer at the end of the array to the slot being freed
            outStreamsOf[s.sender][s.outStreamsBackRef] = outStreamsOf[s.sender][outStreamsOf[s.sender].length-1];
            // adjust the back reference accordingly
            streams[outStreamsOf[s.sender][s.outStreamsBackRef]].outStreamsBackRef = s.outStreamsBackRef;
        }
        // delete last element
        outStreamsOf[s.sender].length -= 1;

        if(s.inStreamsBackRef != inStreamsOf[s.receiver].length-1) {
            // move the pointer at the end of the array to the slot being freed
            inStreamsOf[s.receiver][s.inStreamsBackRef] = inStreamsOf[s.receiver][inStreamsOf[s.receiver].length-1];
            // adjust the back reference accordingly
            streams[inStreamsOf[s.receiver][s.inStreamsBackRef]].inStreamsBackRef = s.inStreamsBackRef;
        }
        // delete last element
        inStreamsOf[s.receiver].length -= 1;

        // remove entry from global array
        delete streams[streamId];
    }


}




















