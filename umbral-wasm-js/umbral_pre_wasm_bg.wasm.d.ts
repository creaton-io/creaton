/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_secretkey_free(a: number): void;
export function secretkey_random(): number;
export function secretkey_to_array(a: number, b: number): void;
export function secretkey_from_array(a: number, b: number): number;
export function __wbg_publickey_free(a: number): void;
export function publickey_from_secret_key(a: number): number;
export function publickey_to_array(a: number, b: number): void;
export function publickey_from_array(a: number, b: number): number;
export function __wbg_parameters_free(a: number): void;
export function parameters_new(): number;
export function __wbg_capsule_free(a: number): void;
export function capsule_with_cfrag(a: number, b: number): number;
export function capsule_from_array(a: number, b: number): number;
export function capsule_to_array(a: number, b: number): void;
export function __wbg_capsulefrag_free(a: number): void;
export function capsulefrag_verify(a: number, b: number, c: number, d: number, e: number): number;
export function capsulefrag_from_array(a: number, b: number): number;
export function capsulefrag_to_array(a: number, b: number): void;
export function __wbg_capsulewithfrags_free(a: number): void;
export function capsulewithfrags_with_cfrag(a: number, b: number): number;
export function capsulewithfrags_decrypt_reencrypted(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function __wbg_encryptionresult_free(a: number): void;
export function __wbg_get_encryptionresult_capsule(a: number): number;
export function __wbg_set_encryptionresult_capsule(a: number, b: number): void;
export function encryptionresult_ciphertext(a: number, b: number): void;
export function encrypt(a: number, b: number, c: number, d: number): number;
export function decrypt_original(a: number, b: number, c: number, d: number, e: number): void;
export function __wbg_keyfrag_free(a: number): void;
export function keyfrag_verify(a: number, b: number): number;
export function keyfrag_verify_with_delegating_key(a: number, b: number, c: number): number;
export function keyfrag_verify_with_receiving_key(a: number, b: number, c: number): number;
export function keyfrag_verify_with_delegating_and_receiving_keys(a: number, b: number, c: number, d: number): number;
export function keyfrag_from_array(a: number, b: number): number;
export function keyfrag_to_array(a: number, b: number): void;
export function generate_kfrags(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number): void;
export function reencrypt(a: number, b: number, c: number, d: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_exn_store(a: number): void;
