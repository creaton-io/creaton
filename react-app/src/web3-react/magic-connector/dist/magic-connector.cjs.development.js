

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
var invariant = _interopDefault(require('tiny-invariant'));

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

// A type of promise-like that resolves synchronously and supports only one observer
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = /*#__PURE__*/Symbol("Symbol.iterator")) : "@@iterator"; // Asynchronously iterate through an object's values
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = /*#__PURE__*/Symbol("Symbol.asyncIterator")) : "@@asyncIterator"; // Asynchronously iterate on a value using it's async iterator if present, or its synchronous iterator if missing

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
} // Asynchronously await a promise and pass the result to a finally continuation

var chainIdToNetwork = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  137: {
    rpcUrl: 'https://rpc-mainnet.maticvigil.com/',
    chainId: 137
  },
  80001: {
    rpcUrl: 'https://matic-mumbai--jsonrpc.datahub.figment.io/apikey/0ae5f13919ed451371d1e07481351f70/',
    chainId: 80001
  }
};
var UserRejectedRequestError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(UserRejectedRequestError, _Error);

  function UserRejectedRequestError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.name = _this.constructor.name;
    _this.message = 'The user rejected the request.';
    return _this;
  }

  return UserRejectedRequestError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var FailedVerificationError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(FailedVerificationError, _Error2);

  function FailedVerificationError() {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.name = _this2.constructor.name;
    _this2.message = 'The email verification failed.';
    return _this2;
  }

  return FailedVerificationError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var MagicLinkRateLimitError = /*#__PURE__*/function (_Error3) {
  _inheritsLoose(MagicLinkRateLimitError, _Error3);

  function MagicLinkRateLimitError() {
    var _this3;

    _this3 = _Error3.call(this) || this;
    _this3.name = _this3.constructor.name;
    _this3.message = 'The Magic rate limit has been reached.';
    return _this3;
  }

  return MagicLinkRateLimitError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var MagicLinkExpiredError = /*#__PURE__*/function (_Error4) {
  _inheritsLoose(MagicLinkExpiredError, _Error4);

  function MagicLinkExpiredError() {
    var _this4;

    _this4 = _Error4.call(this) || this;
    _this4.name = _this4.constructor.name;
    _this4.message = 'The Magic link has expired.';
    return _this4;
  }

  return MagicLinkExpiredError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var MagicConnector = /*#__PURE__*/function (_AbstractConnector) {
  _inheritsLoose(MagicConnector, _AbstractConnector);

  function MagicConnector(_ref) {
    var _this5;

    var apiKey = _ref.apiKey,
        chainId = _ref.chainId,
        email = _ref.email;
    !Object.keys(chainIdToNetwork).includes(chainId.toString()) ?  invariant(false, "Unsupported chainId " + chainId)  : void 0;
    !(email && email.includes('@')) ?  invariant(false, "Invalid email: " + email)  : void 0;
    _this5 = _AbstractConnector.call(this, {
      supportedChainIds: [chainId]
    }) || this;
    _this5.apiKey = apiKey;
    _this5.chainId = chainId;
    _this5.email = email;
    return _this5;
  }

  var _proto = MagicConnector.prototype;

  _proto.activate = function activate() {
    try {
      var _this7 = this;

      return Promise.resolve(new Promise(function (resolve) { resolve(_interopNamespace(require('magic-sdk'))); }).then(function (m) {
        var _m$default;

        return (_m$default = m == null ? void 0 : m["default"]) != null ? _m$default : m;
      })).then(function (MagicSDK) {
        var Magic = MagicSDK.Magic,
            RPCError = MagicSDK.RPCError,
            RPCErrorCode = MagicSDK.RPCErrorCode;

        if (!_this7.magic) {
          _this7.magic = new Magic(_this7.apiKey, {
            network: chainIdToNetwork[_this7.chainId]
          });
        }

        return Promise.resolve(_this7.magic.user.isLoggedIn()).then(function (isLoggedIn) {
          function _temp5(_this6$magic$user$get) {
            function _temp4() {
              var _exit = false;

              function _temp2(_result2) {
                if (_exit) return _result2;
                var provider = _this7.magic.rpcProvider;
                return Promise.resolve(provider.enable().then(function (accounts) {
                  return accounts[0];
                })).then(function (account) {
                  return {
                    provider: provider,
                    chainId: _this7.chainId,
                    account: account
                  };
                });
              }

              var _temp = function () {
                if (!isLoggedIn) {
                  return _catch(function () {
                    return Promise.resolve(_this7.magic.auth.loginWithMagicLink({
                      email: _this7.email
                    })).then(function () {});
                  }, function (err) {
                    if (!(err instanceof RPCError)) {
                      throw err;
                    }

                    if (err.code === RPCErrorCode.MagicLinkFailedVerification) {
                      throw new FailedVerificationError();
                    }

                    if (err.code === RPCErrorCode.MagicLinkExpired) {
                      throw new MagicLinkExpiredError();
                    }

                    if (err.code === RPCErrorCode.MagicLinkRateLimited) {
                      throw new MagicLinkRateLimitError();
                    } // This error gets thrown when users close the login window.
                    // -32603 = JSON-RPC InternalError


                    if (err.code === -32603) {
                      throw new UserRejectedRequestError();
                    }
                  });
                }
              }();

              return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
            }

            var loggedInEmail = isLoggedIn ? _this6$magic$user$get.email : _this6$magic$user$get;

            var _temp3 = function () {
              if (isLoggedIn && loggedInEmail !== _this7.email) {
                return Promise.resolve(_this7.magic.user.logout()).then(function () {});
              }
            }();

            return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
          }

          return isLoggedIn ? Promise.resolve(_this7.magic.user.getMetadata()).then(_temp5) : _temp5(null);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getProvider = function getProvider() {
    try {
      var _this9 = this;

      return Promise.resolve(_this9.magic.rpcProvider);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getChainId = function getChainId() {
    try {
      var _this11 = this;

      return Promise.resolve(_this11.chainId);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getAccount = function getAccount() {
    try {
      var _this13 = this;

      return Promise.resolve(_this13.magic.rpcProvider.send('eth_accounts').then(function (accounts) {
        return accounts[0];
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.deactivate = function deactivate() {};

  _proto.close = function close() {
    try {
      var _this15 = this;

      return Promise.resolve(_this15.magic.user.logout()).then(function () {
        _this15.emitDeactivate();
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return MagicConnector;
}(abstractConnector.AbstractConnector);

exports.FailedVerificationError = FailedVerificationError;
exports.MagicConnector = MagicConnector;
exports.MagicLinkExpiredError = MagicLinkExpiredError;
exports.MagicLinkRateLimitError = MagicLinkRateLimitError;
exports.UserRejectedRequestError = UserRejectedRequestError;
//# sourceMappingURL=magic-connector.cjs.development.js.map
