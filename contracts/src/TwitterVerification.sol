//pragma solidity ^0.6.6;
//
//import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/ChainlinkClient.sol";
//import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/vendor/Ownable.sol";
//
//import './CreatonAdmin.sol';
//
//contract TwitterVerification is ChainlinkClient, Ownable {
//    uint256 constant private ORACLE_PAYMENT = 1 * LINK;
//
//    event RequestTwitterVerificationFulfilled(
//        bytes32 indexed requestId,
//        bytes32 indexed username
//    );
//
//    address private _oracle;
//    address private _jobId;
//
//    constructor(address link, address oracle, string memory jobId) public Ownable() {
//        setChainlinkToken(link);
//        _oracle = oracle;
//        _jobId = jobId;
//    }
//
//    function requestTwitterVerification(address _oracle, string memory _jobId, string memory hashtag)
//    public
//    {
//    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfillVerification.selector);
//    req.add("hashtag", hashtag);
//    // req.add("path", "USD");
//    // req.addInt("times", 100);
//    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
//    }
//
//    function requestEthereumChange(address _oracle, string memory _jobId)
//    public
//    onlyOwner
//    {
//    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfillEthereumChange.selector);
//    req.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
//    req.add("path", "RAW.ETH.USD.CHANGEPCTDAY");
//    req.addInt("times", 1000000000);
//    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
//    }
//
//    function requestEthereumLastMarket(address _oracle, string memory _jobId)
//    public
//    onlyOwner
//    {
//    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfillEthereumLastMarket.selector);
//    req.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
//    string[] memory path = new string[](4);
//    path[0] = "RAW";
//    path[1] = "ETH";
//    path[2] = "USD";
//    path[3] = "LASTMARKET";
//    req.addStringArray("path", path);
//    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
//    }
//
//    function fulfillVerification(bytes32 _requestId, bytes32 _username)
//    public
//    recordChainlinkFulfillment(_requestId)
//    {
//    emit RequestTwitterVerificationFulfilled(_requestId, _username);
//    }
//
//    function fulfillEthereumChange(bytes32 _requestId, int256 _change)
//    public
//    recordChainlinkFulfillment(_requestId)
//    {
//    emit RequestEthereumChangeFulfilled(_requestId, _change);
//    changeDay = _change;
//    }
//
//    function fulfillEthereumLastMarket(bytes32 _requestId, bytes32 _market)
//    public
//    recordChainlinkFulfillment(_requestId)
//    {
//    emit RequestEthereumLastMarket(_requestId, _market);
//    lastMarket = _market;
//    }
//
//    function getChainlinkToken() public view returns (address) {
//    return chainlinkTokenAddress();
//    }
//
//    function withdrawLink() public onlyOwner {
//    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
//    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
//    }
//
//    function cancelRequest(
//    bytes32 _requestId,
//    uint256 _payment,
//    bytes4 _callbackFunctionId,
//    uint256 _expiration
//    )
//    public
//    onlyOwner
//    {
//    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
//    }
//
//    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
//    bytes memory tempEmptyStringTest = bytes(source);
//    if (tempEmptyStringTest.length == 0) {
//      return 0x0;
//    }
//
//    assembly { // solhint-disable-line no-inline-assembly
//      result := mload(add(source, 32))
//    }
//    }
//}
