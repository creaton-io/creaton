"use strict";
exports.id = 730;
exports.ids = [730];
exports.modules = {

/***/ 9311:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.cancelIdleCallback = exports.requestIdleCallback = void 0;
const requestIdleCallback = typeof self !== 'undefined' && self.requestIdleCallback && self.requestIdleCallback.bind(window) || function(cb) {
    let start = Date.now();
    return setTimeout(function() {
        cb({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};
exports.requestIdleCallback = requestIdleCallback;
const cancelIdleCallback = typeof self !== 'undefined' && self.cancelIdleCallback && self.cancelIdleCallback.bind(window) || function(id) {
    return clearTimeout(id);
};
exports.cancelIdleCallback = cancelIdleCallback; //# sourceMappingURL=request-idle-callback.js.map


/***/ }),

/***/ 676:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["default"] = isError;
function isError(err) {
    return typeof err === 'object' && err !== null && 'name' in err && 'message' in err;
}

//# sourceMappingURL=is-error.js.map

/***/ })

};
;