'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var abstractConnector = require('@web3-react/abstract-connector');
var Web3ProviderEngine = _interopDefault(require('web3-provider-engine'));
var src = require('@0x/subproviders/lib/src');
var ledger = require('@0x/subproviders/lib/src/subproviders/ledger');
var CacheSubprovider = _interopDefault(require('web3-provider-engine/subproviders/cache.js'));
var rpc_subprovider = require('@0x/subproviders/lib/src/subproviders/rpc_subprovider');

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var LedgerConnector = /*#__PURE__*/function (_AbstractConnector) {
  _inheritsLoose(LedgerConnector, _AbstractConnector);

  function LedgerConnector(_ref) {
    var _this;

    var chainId = _ref.chainId,
        url = _ref.url,
        pollingInterval = _ref.pollingInterval,
        requestTimeoutMs = _ref.requestTimeoutMs,
        accountFetchingConfigs = _ref.accountFetchingConfigs,
        baseDerivationPath = _ref.baseDerivationPath;
    _this = _AbstractConnector.call(this, {
      supportedChainIds: [chainId]
    }) || this;
    _this.chainId = chainId;
    _this.url = url;
    _this.pollingInterval = pollingInterval;
    _this.requestTimeoutMs = requestTimeoutMs;
    _this.accountFetchingConfigs = accountFetchingConfigs;
    _this.baseDerivationPath = baseDerivationPath;
    return _this;
  }

  var _proto = LedgerConnector.prototype;

  _proto.activate = function activate() {
    try {
      var _this3 = this;

      if (!_this3.provider) {
        var engine = new Web3ProviderEngine({
          pollingInterval: _this3.pollingInterval
        });
        engine.addProvider(new ledger.LedgerSubprovider({
          networkId: _this3.chainId,
          ledgerEthereumClientFactoryAsync: src.ledgerEthereumBrowserClientFactoryAsync,
          accountFetchingConfigs: _this3.accountFetchingConfigs,
          baseDerivationPath: _this3.baseDerivationPath
        }));
        engine.addProvider(new CacheSubprovider());
        engine.addProvider(new rpc_subprovider.RPCSubprovider(_this3.url, _this3.requestTimeoutMs));
        _this3.provider = engine;
      }

      _this3.provider.start();

      return Promise.resolve({
        provider: _this3.provider,
        chainId: _this3.chainId
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getProvider = function getProvider() {
    try {
      var _this5 = this;

      return Promise.resolve(_this5.provider);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getChainId = function getChainId() {
    try {
      var _this7 = this;

      return Promise.resolve(_this7.chainId);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getAccount = function getAccount() {
    try {
      var _this9 = this;

      return Promise.resolve(_this9.provider._providers[0].getAccountsAsync(1).then(function (accounts) {
        return accounts[0];
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.deactivate = function deactivate() {
    this.provider.stop();
  };

  return LedgerConnector;
}(abstractConnector.AbstractConnector);

exports.LedgerConnector = LedgerConnector;
//# sourceMappingURL=ledger-connector.cjs.development.js.map
