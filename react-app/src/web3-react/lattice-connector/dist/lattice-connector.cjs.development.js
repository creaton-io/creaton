'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
  if (e && e.__esModule) { return e; } else {
    var n = {};
    if (e) {
      Object.keys(e).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      });
    }
    n['default'] = e;
    return n;
  }
}

var abstractConnector = require('@web3-react/abstract-connector');
var Web3ProviderEngine = _interopDefault(require('web3-provider-engine'));
var lattice = require('@0x/subproviders/lib/src/subproviders/lattice');
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

var LatticeConnector = /*#__PURE__*/function (_AbstractConnector) {
  _inheritsLoose(LatticeConnector, _AbstractConnector);

  function LatticeConnector(_ref) {
    var _this;

    var chainId = _ref.chainId,
        url = _ref.url,
        pollingInterval = _ref.pollingInterval,
        requestTimeoutMs = _ref.requestTimeoutMs,
        appName = _ref.appName;
    _this = _AbstractConnector.call(this, {
      supportedChainIds: [chainId]
    }) || this;
    _this.chainId = chainId;
    _this.url = url;
    _this.pollingInterval = pollingInterval;
    _this.requestTimeoutMs = requestTimeoutMs;
    _this.appName = appName;
    return _this;
  }

  var _proto = LatticeConnector.prototype;

  _proto.activate = function activate() {
    try {
      var _this3 = this;

      var _temp3 = function _temp3() {
        _this3.provider.start();

        return {
          provider: _this3.provider,
          chainId: _this3.chainId
        };
      };

      var _temp4 = function () {
        if (!_this3.provider) {
          return Promise.resolve(new Promise(function (resolve) { resolve(_interopNamespace(require('eth-lattice-keyring'))); }).then(function (m) {
            var _m$default;

            return (_m$default = m == null ? void 0 : m["default"]) != null ? _m$default : m;
          })).then(function (LatticeKeyring) {
            var engine = new Web3ProviderEngine({
              pollingInterval: _this3.pollingInterval
            });
            var opts = {
              appName: _this3.appName,
              latticeConnectClient: LatticeKeyring,
              networkId: _this3.chainId
            };
            engine.addProvider(new lattice.LatticeSubprovider(opts));
            engine.addProvider(new CacheSubprovider());
            engine.addProvider(new rpc_subprovider.RPCSubprovider(_this3.url, _this3.requestTimeoutMs));
            _this3.provider = engine;
          });
        }
      }();

      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
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

  _proto.close = function close() {
    try {
      var _this11 = this;

      _this11.emitDeactivate(); // Due to limitations in the LatticeSubprovider API, we use this code with `getAccounts`
      // as a hack to allow us to close out the connection and forget data.
      // It will get handled in `eth-lattice-keyring`, which will forget the device and return
      // an empty array (whose first element will be null/undefined)


      var CLOSE_CODE = -1000;
      return Promise.resolve(_this11.provider._providers[0].getAccountsAsync(CLOSE_CODE).then(function (accounts) {
        return accounts[0];
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return LatticeConnector;
}(abstractConnector.AbstractConnector);

exports.LatticeConnector = LatticeConnector;
//# sourceMappingURL=lattice-connector.cjs.development.js.map
