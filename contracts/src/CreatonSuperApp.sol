// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "hardhat/console.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperAgreement,
    ISuperApp,
    SuperAppDefinitions
} from "./superfluid/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "./superfluid/interfaces/agreements/IConstantFlowAgreementV1.sol";

import "@openzeppelin/contracts/utils/EnumerableSet.sol";

contract CreatonSuperApp is ISuperApp {
    string private constant _ERR_STR_NO_STREAMER = "CreatonSuperApp: need to stream to become supporter";
    string private constant _ERR_STR_LOW_FLOW_RATE = "CreatonSuperApp: flow rate too low";
    string
        private constant _ERR_STR_UNFINISHED_SUPPORT = "CreatonSuperApp: support the membership you payed collateral for first";

    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token

    EnumerableSet.AddressSet private _supportersSet;
    //EnumerableSet.AddressSet private _streamersSet; //streamers are who started streaming but didnt join as supporter yet
    EnumerableSet.AddressSet private _membershipSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // -----------------------------------------
    // Events
    // -----------------------------------------

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    /// @dev Minimum flow rate to participate (hardcoded to $5 / mo)
    int96 private constant _MINIMUM_FLOW_RATE = int96(uint256(5e18) / uint256(3600 * 24 * 30));

    /// @dev Streamers (that are a)
    mapping(address => address) public streamers;
    mapping(address => uint256) public membershipPrice;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    //function init(string memory _creatorTitle, int96 _subscriptionPrice) public proxied {
    //    creatorTitle = _creatorTitle;
    //    subscriptionPrice = _subscriptionPrice;
    //}

    // function postUpgrade(uint256 id) public proxied {}

    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken
    ) {
        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        uint256 configWord = SuperAppDefinitions.TYPE_APP_FINAL;

        _host.registerApp(configWord);
    }

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    /// @dev Take collateral fee from the potential supporter and add them acceptable streamers
    function collateral(address membership, bytes calldata ctx) external {
        // msg sender is encoded in the Context
        (, , address sender, , ) = _host.decodeCtx(ctx);

        uint256 collateralFee = membershipPrice[membership];
        _acceptedToken.transferFrom(sender, membership, collateralFee);
        streamers[sender] = membership;
    }

    /// @dev Check requirements before letting the streamer become a supporter
    function _beforeSupport(bytes calldata ctx) private view returns (bytes memory cbdata) {
        (, , address sender, , ) = _host.decodeCtx(ctx);
        address collateralMembership = streamers[sender]; //membership the streamer has payed collateral for
        //require(streamers[sender] > 0, _ERR_STR_NO_STREAMER);

        //check if streamer is going to support the membership they payed collateral for
        require(collateralMembership == collateralMembership, _ERR_STR_UNFINISHED_SUPPORT); //TODO: actually check it
        cbdata = abi.encode(sender);
    }

    /// @dev Support the creator
    function _support(
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) private returns (bytes memory newCtx) {
        (address streamer, address membership) = abi.decode(cbdata, (address, address));
        (, int96 flowRate, , ) = IConstantFlowAgreementV1(agreementClass).getFlowByID(_acceptedToken, agreementId);
        //int96 subscriptionPrice = membershipPrice[streamer];
        //require(flowRate >= int96(uint256(5e18) / uint256(3600 * 24 * 30)), _ERR_STR_LOW_FLOW_RATE); //TODO: make dynamic subscriptionPrice + e18
        require(flowRate >= _MINIMUM_FLOW_RATE, _ERR_STR_LOW_FLOW_RATE);
        delete streamers[streamer];
        //make streamer a supporter
        _supportersSet.add(streamer); //not doing anything with this for now, delete it if not needed

        return _streamCollateral(streamer, ctx);
    }

    /// @dev Quit supporting
    function _quit(bytes calldata ctx) private returns (bytes memory newCtx) {
        (, , address supporter, , ) = _host.decodeCtx(ctx);

        _supportersSet.remove(supporter);
    }

    function _streamCollateral(address streamer, bytes calldata ctx) private returns (bytes memory newCtx) {
        address membership = streamers[streamer];
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.createFlow.selector,
                _acceptedToken,
                streamer,
                _cfa.getNetFlow(_acceptedToken, membership),
                new bytes(0)
            ),
            newCtx
        );
    }

    /**************************************************************************
     * Setters
     *************************************************************************/

    //let new ERC-1155 membership tiers add their price to the list
    function setMembershipPrice(uint256 price) public {
        membershipPrice[msg.sender] = price;
    }

    /**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    function beforeAgreementCreated(
        ISuperToken superToken,
        bytes calldata ctx,
        address agreementClass,
        bytes32 /*agreementId*/
    ) external view override onlyHost onlyExpected(superToken, agreementClass) returns (bytes memory cbdata) {
        cbdata = _beforeSupport(ctx);
    }

    function afterAgreementCreated(
        ISuperToken, /* superToken */
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) external override onlyHost returns (bytes memory newCtx) {
        return _support(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementUpdated(
        ISuperToken superToken,
        bytes calldata ctx,
        address agreementClass,
        bytes32 /*agreementId*/
    ) external view override onlyHost onlyExpected(superToken, agreementClass) returns (bytes memory cbdata) {
        cbdata = _beforeSupport(ctx);
    }

    function afterAgreementUpdated(
        ISuperToken, /* superToken */
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) external override onlyHost returns (bytes memory newCtx) {
        return _support(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementTerminated(
        ISuperToken superToken,
        bytes calldata, /*ctx*/
        address agreementClass,
        bytes32 /*agreementId*/
    ) external view override onlyHost returns (bytes memory cbdata) {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isSameToken(superToken) || !_isCFAv1(agreementClass)) return abi.encode(true);
        return abi.encode(false);
    }

    ///
    function afterAgreementTerminated(
        ISuperToken, /* superToken */
        bytes calldata ctx,
        address, /* agreementClass */
        bytes32, /* agreementId */
        bytes calldata cbdata
    ) external override onlyHost returns (bytes memory newCtx) {
        // According to the app basic law, we should never revert in a termination callback
        bool shouldIgnore = abi.decode(cbdata, (bool));
        if (shouldIgnore) return ctx;
        return _quit(ctx);
    }

    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address agreementClass) private pure returns (bool) {
        return
            ISuperAgreement(agreementClass).agreementType() ==
            keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(_host), "CreatonSuperApp: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "CreatonSuperApp: not accepted token");
        require(_isCFAv1(agreementClass), "CreatonSuperApp: only CFAv1 supported");
        _;
    }
}
