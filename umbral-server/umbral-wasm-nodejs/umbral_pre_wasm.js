let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(String.raw`util`);

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @param {Parameters} params
* @param {PublicKey} alice_pubkey
* @param {Uint8Array} plaintext
* @returns {EncryptionResult | undefined}
*/
module.exports.encrypt = function(params, alice_pubkey, plaintext) {
    _assertClass(params, Parameters);
    _assertClass(alice_pubkey, PublicKey);
    var ptr0 = passArray8ToWasm0(plaintext, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.encrypt(params.ptr, alice_pubkey.ptr, ptr0, len0);
    return ret === 0 ? undefined : EncryptionResult.__wrap(ret);
};

/**
* @param {SecretKey} decrypting_key
* @param {Capsule} capsule
* @param {Uint8Array} ciphertext
* @returns {Uint8Array}
*/
module.exports.decrypt_original = function(decrypting_key, capsule, ciphertext) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(decrypting_key, SecretKey);
        _assertClass(capsule, Capsule);
        var ptr0 = passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.decrypt_original(retptr, decrypting_key.ptr, capsule.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}
/**
* @param {Parameters} params
* @param {SecretKey} delegating_sk
* @param {PublicKey} receiving_pubkey
* @param {SecretKey} signing_sk
* @param {number} threshold
* @param {number} num_kfrags
* @param {boolean} sign_delegating_key
* @param {boolean} sign_receiving_key
* @returns {any[]}
*/
module.exports.generate_kfrags = function(params, delegating_sk, receiving_pubkey, signing_sk, threshold, num_kfrags, sign_delegating_key, sign_receiving_key) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(params, Parameters);
        _assertClass(delegating_sk, SecretKey);
        _assertClass(receiving_pubkey, PublicKey);
        _assertClass(signing_sk, SecretKey);
        wasm.generate_kfrags(retptr, params.ptr, delegating_sk.ptr, receiving_pubkey.ptr, signing_sk.ptr, threshold, num_kfrags, sign_delegating_key, sign_receiving_key);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4);
        return v0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

function isLikeNone(x) {
    return x === undefined || x === null;
}
/**
* @param {Capsule} capsule
* @param {KeyFrag} kfrag
* @param {Uint8Array | undefined} metadata
* @returns {CapsuleFrag}
*/
module.exports.reencrypt = function(capsule, kfrag, metadata) {
    _assertClass(capsule, Capsule);
    _assertClass(kfrag, KeyFrag);
    var ptr0 = isLikeNone(metadata) ? 0 : passArray8ToWasm0(metadata, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.reencrypt(capsule.ptr, kfrag.ptr, ptr0, len0);
    return CapsuleFrag.__wrap(ret);
};

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}
/**
*/
class Capsule {

    static __wrap(ptr) {
        const obj = Object.create(Capsule.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_capsule_free(ptr);
    }
    /**
    * @param {CapsuleFrag} cfrag
    * @returns {CapsuleWithFrags}
    */
    with_cfrag(cfrag) {
        _assertClass(cfrag, CapsuleFrag);
        var ret = wasm.capsule_with_cfrag(this.ptr, cfrag.ptr);
        return CapsuleWithFrags.__wrap(ret);
    }
    /**
    * @param {Uint8Array} arr
    * @returns {Capsule}
    */
    static from_array(arr) {
        var ptr0 = passArray8ToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.capsule_from_array(ptr0, len0);
        return Capsule.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.capsule_to_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Capsule = Capsule;
/**
*/
class CapsuleFrag {

    static __wrap(ptr) {
        const obj = Object.create(CapsuleFrag.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_capsulefrag_free(ptr);
    }
    /**
    * @param {Capsule} capsule
    * @param {PublicKey} signing_pubkey
    * @param {PublicKey} delegating_pubkey
    * @param {PublicKey} receiving_pubkey
    * @returns {boolean}
    */
    verify(capsule, signing_pubkey, delegating_pubkey, receiving_pubkey) {
        _assertClass(capsule, Capsule);
        _assertClass(signing_pubkey, PublicKey);
        _assertClass(delegating_pubkey, PublicKey);
        _assertClass(receiving_pubkey, PublicKey);
        var ret = wasm.capsulefrag_verify(this.ptr, capsule.ptr, signing_pubkey.ptr, delegating_pubkey.ptr, receiving_pubkey.ptr);
        return ret !== 0;
    }
    /**
    * @param {Uint8Array} arr
    * @returns {CapsuleFrag}
    */
    static from_array(arr) {
        var ptr0 = passArray8ToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.capsulefrag_from_array(ptr0, len0);
        return CapsuleFrag.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.capsulefrag_to_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.CapsuleFrag = CapsuleFrag;
/**
*/
class CapsuleWithFrags {

    static __wrap(ptr) {
        const obj = Object.create(CapsuleWithFrags.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_capsulewithfrags_free(ptr);
    }
    /**
    * @param {CapsuleFrag} cfrag
    * @returns {CapsuleWithFrags}
    */
    with_cfrag(cfrag) {
        _assertClass(cfrag, CapsuleFrag);
        var ret = wasm.capsulewithfrags_with_cfrag(this.ptr, cfrag.ptr);
        return CapsuleWithFrags.__wrap(ret);
    }
    /**
    * @param {SecretKey} decrypting_key
    * @param {PublicKey} delegating_pk
    * @param {Uint8Array} ciphertext
    * @returns {Uint8Array | undefined}
    */
    decrypt_reencrypted(decrypting_key, delegating_pk, ciphertext) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(decrypting_key, SecretKey);
            _assertClass(delegating_pk, PublicKey);
            var ptr0 = passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.capsulewithfrags_decrypt_reencrypted(retptr, this.ptr, decrypting_key.ptr, delegating_pk.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.CapsuleWithFrags = CapsuleWithFrags;
/**
*/
class EncryptionResult {

    static __wrap(ptr) {
        const obj = Object.create(EncryptionResult.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_encryptionresult_free(ptr);
    }
    /**
    * @returns {Capsule}
    */
    get capsule() {
        var ret = wasm.__wbg_get_encryptionresult_capsule(this.ptr);
        return Capsule.__wrap(ret);
    }
    /**
    * @param {Capsule} arg0
    */
    set capsule(arg0) {
        _assertClass(arg0, Capsule);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_encryptionresult_capsule(this.ptr, ptr0);
    }
    /**
    * @returns {Uint8Array}
    */
    get ciphertext() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.encryptionresult_ciphertext(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.EncryptionResult = EncryptionResult;
/**
*/
class KeyFrag {

    static __wrap(ptr) {
        const obj = Object.create(KeyFrag.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_keyfrag_free(ptr);
    }
    /**
    * @param {PublicKey} signing_pubkey
    * @returns {boolean}
    */
    verify(signing_pubkey) {
        _assertClass(signing_pubkey, PublicKey);
        var ret = wasm.keyfrag_verify(this.ptr, signing_pubkey.ptr);
        return ret !== 0;
    }
    /**
    * @param {PublicKey} signing_pubkey
    * @param {PublicKey} delegating_pubkey
    * @returns {boolean}
    */
    verify_with_delegating_key(signing_pubkey, delegating_pubkey) {
        _assertClass(signing_pubkey, PublicKey);
        _assertClass(delegating_pubkey, PublicKey);
        var ret = wasm.keyfrag_verify_with_delegating_key(this.ptr, signing_pubkey.ptr, delegating_pubkey.ptr);
        return ret !== 0;
    }
    /**
    * @param {PublicKey} signing_pubkey
    * @param {PublicKey} receiving_pubkey
    * @returns {boolean}
    */
    verify_with_receiving_key(signing_pubkey, receiving_pubkey) {
        _assertClass(signing_pubkey, PublicKey);
        _assertClass(receiving_pubkey, PublicKey);
        var ret = wasm.keyfrag_verify_with_receiving_key(this.ptr, signing_pubkey.ptr, receiving_pubkey.ptr);
        return ret !== 0;
    }
    /**
    * @param {PublicKey} signing_pubkey
    * @param {PublicKey} delegating_pubkey
    * @param {PublicKey} receiving_pubkey
    * @returns {boolean}
    */
    verify_with_delegating_and_receiving_keys(signing_pubkey, delegating_pubkey, receiving_pubkey) {
        _assertClass(signing_pubkey, PublicKey);
        _assertClass(delegating_pubkey, PublicKey);
        _assertClass(receiving_pubkey, PublicKey);
        var ret = wasm.keyfrag_verify_with_delegating_and_receiving_keys(this.ptr, signing_pubkey.ptr, delegating_pubkey.ptr, receiving_pubkey.ptr);
        return ret !== 0;
    }
    /**
    * @param {Uint8Array} arr
    * @returns {KeyFrag}
    */
    static from_array(arr) {
        var ptr0 = passArray8ToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.keyfrag_from_array(ptr0, len0);
        return KeyFrag.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.keyfrag_to_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.KeyFrag = KeyFrag;
/**
*/
class Parameters {

    static __wrap(ptr) {
        const obj = Object.create(Parameters.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_parameters_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.parameters_new();
        return Parameters.__wrap(ret);
    }
}
module.exports.Parameters = Parameters;
/**
*/
class PublicKey {

    static __wrap(ptr) {
        const obj = Object.create(PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickey_free(ptr);
    }
    /**
    * Generates a secret key using the default RNG and returns it.
    * @param {SecretKey} secret_key
    * @returns {PublicKey}
    */
    static from_secret_key(secret_key) {
        _assertClass(secret_key, SecretKey);
        var ret = wasm.publickey_from_secret_key(secret_key.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.publickey_to_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} arr
    * @returns {PublicKey}
    */
    static from_array(arr) {
        var ptr0 = passArray8ToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.publickey_from_array(ptr0, len0);
        return PublicKey.__wrap(ret);
    }
}
module.exports.PublicKey = PublicKey;
/**
*/
class SecretKey {

    static __wrap(ptr) {
        const obj = Object.create(SecretKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_secretkey_free(ptr);
    }
    /**
    * Generates a secret key using the default RNG and returns it.
    * @returns {SecretKey}
    */
    static random() {
        var ret = wasm.secretkey_random();
        return SecretKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_array() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.secretkey_to_array(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} arr
    * @returns {SecretKey}
    */
    static from_array(arr) {
        var ptr0 = passArray8ToWasm0(arr, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.secretkey_from_array(ptr0, len0);
        return SecretKey.__wrap(ret);
    }
}
module.exports.SecretKey = SecretKey;

module.exports.__wbg_keyfrag_new = function(arg0) {
    var ret = KeyFrag.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

module.exports.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbg_self_86b4b13392c7af56 = handleError(function() {
    var ret = self.self;
    return addHeapObject(ret);
});

module.exports.__wbg_static_accessor_MODULE_452b4680e8614c81 = function() {
    var ret = module;
    return addHeapObject(ret);
};

module.exports.__wbg_require_f5521a5b85ad2542 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
};

module.exports.__wbg_crypto_b8c92eaac23d0d80 = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_9ad6677321a08dd8 = function(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_getRandomValues_dd27e6b0652b3236 = function(arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_e57c9b75ddead065 = function(arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
};

module.exports.__wbg_randomFillSync_d2ba53160aec6aba = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

module.exports.__wbg_buffer_e35e010c3ba9f945 = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_length_2cfa674c2a529bc1 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_new_139e70222494b1ff = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_set_d771848e3c7935bb = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_newwithlength_e0c461e90217842c = function(arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_subarray_8a52f1c1a11c02a8 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'umbral_pre_wasm_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

