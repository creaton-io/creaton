/* eslint-disable no-undef */


var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require("ethers"),
    ethers = _require.ethers;

var _require2 = require("./config"),
    config = _require2.config;

var ZERO_ADDRESS = config.ZERO_ADDRESS;

var buildForwardTxRequest = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(account, to, gasLimitNum, data, biconomyForwarder) {
    var newBatch,
        batchId,
        batchNonce,
        req,
        _args = arguments;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            newBatch = _args.length > 5 && _args[5] !== undefined ? _args[5] : false;

            if (biconomyForwarder) {
              _context.next = 3;
              break;
            }

            throw new Error("Biconomy Forwarder is not defined for current network");

          case 3:
            if (!newBatch) {
              _context.next = 9;
              break;
            }

            _context.next = 6;
            return biconomyForwarder.getBatch(userAddress);

          case 6:
            _context.t0 = _context.sent;
            _context.next = 10;
            break;

          case 9:
            _context.t0 = 0;

          case 10:
            batchId = _context.t0;
            _context.next = 13;
            return biconomyForwarder.getNonce(account, batchId);

          case 13:
            batchNonce = _context.sent;
            req = {
              from: account,
              to: to,
              token: ZERO_ADDRESS,
              txGas: gasLimitNum,
              tokenGasPrice: "0",
              batchId: batchId,
              batchNonce: parseInt(batchNonce),
              deadline: Math.floor(Date.now() / 1000 + 3600),
              data: data
            };
            return _context.abrupt("return", {
              request: req
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function buildForwardTxRequest(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

var getDomainSeperator = function getDomainSeperator(biconomyForwarderDomainData) {
  var domainSeparator = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["bytes32", "bytes32", "bytes32", "address", "bytes32"], [ethers.utils.id("EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)"), ethers.utils.id(biconomyForwarderDomainData.name), ethers.utils.id(biconomyForwarderDomainData.version), biconomyForwarderDomainData.verifyingContract, biconomyForwarderDomainData.salt]));
  return domainSeparator;
};

module.exports = {
  buildForwardTxRequest: buildForwardTxRequest,
  getDomainSeperator: getDomainSeperator
};
