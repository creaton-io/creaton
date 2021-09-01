'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

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

var RequestError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(RequestError, _Error);

  function RequestError(message, code, data) {
    var _this;

    _this = _Error.call(this) || this;
    _this.code = code;
    _this.data = data;
    _this.name = _this.constructor.name;
    _this.message = message;
    return _this;
  }

  return RequestError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var MiniRpcProvider = function MiniRpcProvider(chainId, url) {
  var _this3 = this;

  var _this2 = this;

  this.isMetaMask = false;

  this.sendAsync = function (request, callback) {
    console.log('sendAsync', request.method, request.params);

    _this2.request(request.method, request.params).then(function (result) {
      return callback(null, {
        jsonrpc: '2.0',
        id: request.id,
        result: result
      });
    })["catch"](function (error) {
      return callback(error, null);
    });
  };

  this.request = function (method, params) {
    try {
      if (typeof method !== 'string') {
        params = method.params;
        method = method.method;
      }

      return Promise.resolve(fetch(_this3.url, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: method,
          params: params
        })
      })).then(function (response) {
        if (!response.ok) throw new RequestError(response.status + ": " + response.statusText, -32000);
        return Promise.resolve(response.json()).then(function (body) {
          if ('error' in body) {
            var _body$error, _body$error2, _body$error3;

            throw new RequestError(body == null ? void 0 : (_body$error = body.error) == null ? void 0 : _body$error.message, body == null ? void 0 : (_body$error2 = body.error) == null ? void 0 : _body$error2.code, body == null ? void 0 : (_body$error3 = body.error) == null ? void 0 : _body$error3.data);
          } else if ('result' in body) {
            return body.result;
          } else {
            throw new RequestError("Received unexpected JSON-RPC response to " + method + " request.", -32000, body);
          }
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  this.chainId = chainId;
  this.url = url;
  var parsed = new URL(url);
  this.host = parsed.host;
  this.path = parsed.pathname;
};

var NetworkConnector = /*#__PURE__*/function (_AbstractConnector) {
  _inheritsLoose(NetworkConnector, _AbstractConnector);

  function NetworkConnector(_ref) {
    var _this4;

    var urls = _ref.urls,
        defaultChainId = _ref.defaultChainId;
    !(defaultChainId || Object.keys(urls).length === 1) ?  invariant(false, 'defaultChainId is a required argument with >1 url')  : void 0;
    _this4 = _AbstractConnector.call(this, {
      supportedChainIds: Object.keys(urls).map(function (k) {
        return Number(k);
      })
    }) || this;
    _this4.currentChainId = defaultChainId || Number(Object.keys(urls)[0]);
    _this4.providers = Object.keys(urls).reduce(function (accumulator, chainId) {
      accumulator[Number(chainId)] = new MiniRpcProvider(Number(chainId), urls[Number(chainId)]);
      return accumulator;
    }, {});
    return _this4;
  }

  var _proto = NetworkConnector.prototype;

  _proto.activate = function activate() {
    try {
      var _this6 = this;

      return Promise.resolve({
        provider: _this6.providers[_this6.currentChainId],
        chainId: _this6.currentChainId,
        account: null
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getProvider = function getProvider() {
    try {
      var _this8 = this;

      return Promise.resolve(_this8.providers[_this8.currentChainId]);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getChainId = function getChainId() {
    try {
      var _this10 = this;

      return Promise.resolve(_this10.currentChainId);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getAccount = function getAccount() {
    return Promise.resolve(null);
  };

  _proto.deactivate = function deactivate() {
    return;
  };

  _proto.changeChainId = function changeChainId(chainId) {
    !Object.keys(this.providers).includes(chainId.toString()) ?  invariant(false, "No url found for chainId " + chainId)  : void 0;
    this.currentChainId = chainId;
    this.emitUpdate({
      provider: this.providers[this.currentChainId],
      chainId: chainId
    });
  };

  return NetworkConnector;
}(abstractConnector.AbstractConnector);

exports.NetworkConnector = NetworkConnector;
exports.RequestError = RequestError;
//# sourceMappingURL=network-connector.cjs.development.js.map
