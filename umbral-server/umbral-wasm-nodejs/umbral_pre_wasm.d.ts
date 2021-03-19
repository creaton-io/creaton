/* tslint:disable */
/* eslint-disable */
/**
* @param {Parameters} params
* @param {PublicKey} alice_pubkey
* @param {Uint8Array} plaintext
* @returns {EncryptionResult | undefined}
*/
export function encrypt(params: Parameters, alice_pubkey: PublicKey, plaintext: Uint8Array): EncryptionResult | undefined;
/**
* @param {SecretKey} decrypting_key
* @param {Capsule} capsule
* @param {Uint8Array} ciphertext
* @returns {Uint8Array}
*/
export function decrypt_original(decrypting_key: SecretKey, capsule: Capsule, ciphertext: Uint8Array): Uint8Array;
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
export function generate_kfrags(params: Parameters, delegating_sk: SecretKey, receiving_pubkey: PublicKey, signing_sk: SecretKey, threshold: number, num_kfrags: number, sign_delegating_key: boolean, sign_receiving_key: boolean): any[];
/**
* @param {Capsule} capsule
* @param {KeyFrag} kfrag
* @param {Uint8Array | undefined} metadata
* @returns {CapsuleFrag}
*/
export function reencrypt(capsule: Capsule, kfrag: KeyFrag, metadata?: Uint8Array): CapsuleFrag;
/**
*/
export class Capsule {
  free(): void;
/**
* @param {CapsuleFrag} cfrag
* @returns {CapsuleWithFrags}
*/
  with_cfrag(cfrag: CapsuleFrag): CapsuleWithFrags;
/**
* @param {Uint8Array} arr
* @returns {Capsule}
*/
  static from_array(arr: Uint8Array): Capsule;
/**
* @returns {Uint8Array}
*/
  to_array(): Uint8Array;
}
/**
*/
export class CapsuleFrag {
  free(): void;
/**
* @param {Capsule} capsule
* @param {PublicKey} signing_pubkey
* @param {PublicKey} delegating_pubkey
* @param {PublicKey} receiving_pubkey
* @returns {boolean}
*/
  verify(capsule: Capsule, signing_pubkey: PublicKey, delegating_pubkey: PublicKey, receiving_pubkey: PublicKey): boolean;
/**
* @param {Uint8Array} arr
* @returns {CapsuleFrag}
*/
  static from_array(arr: Uint8Array): CapsuleFrag;
/**
* @returns {Uint8Array}
*/
  to_array(): Uint8Array;
}
/**
*/
export class CapsuleWithFrags {
  free(): void;
/**
* @param {CapsuleFrag} cfrag
* @returns {CapsuleWithFrags}
*/
  with_cfrag(cfrag: CapsuleFrag): CapsuleWithFrags;
/**
* @param {SecretKey} decrypting_key
* @param {PublicKey} delegating_pk
* @param {Uint8Array} ciphertext
* @returns {Uint8Array | undefined}
*/
  decrypt_reencrypted(decrypting_key: SecretKey, delegating_pk: PublicKey, ciphertext: Uint8Array): Uint8Array | undefined;
}
/**
*/
export class EncryptionResult {
  free(): void;
/**
* @returns {Capsule}
*/
  capsule: Capsule;
/**
* @returns {Uint8Array}
*/
  readonly ciphertext: Uint8Array;
}
/**
*/
export class KeyFrag {
  free(): void;
/**
* @param {PublicKey} signing_pubkey
* @returns {boolean}
*/
  verify(signing_pubkey: PublicKey): boolean;
/**
* @param {PublicKey} signing_pubkey
* @param {PublicKey} delegating_pubkey
* @returns {boolean}
*/
  verify_with_delegating_key(signing_pubkey: PublicKey, delegating_pubkey: PublicKey): boolean;
/**
* @param {PublicKey} signing_pubkey
* @param {PublicKey} receiving_pubkey
* @returns {boolean}
*/
  verify_with_receiving_key(signing_pubkey: PublicKey, receiving_pubkey: PublicKey): boolean;
/**
* @param {PublicKey} signing_pubkey
* @param {PublicKey} delegating_pubkey
* @param {PublicKey} receiving_pubkey
* @returns {boolean}
*/
  verify_with_delegating_and_receiving_keys(signing_pubkey: PublicKey, delegating_pubkey: PublicKey, receiving_pubkey: PublicKey): boolean;
/**
* @param {Uint8Array} arr
* @returns {KeyFrag}
*/
  static from_array(arr: Uint8Array): KeyFrag;
/**
* @returns {Uint8Array}
*/
  to_array(): Uint8Array;
}
/**
*/
export class Parameters {
  free(): void;
/**
*/
  constructor();
}
/**
*/
export class PublicKey {
  free(): void;
/**
* Generates a secret key using the default RNG and returns it.
* @param {SecretKey} secret_key
* @returns {PublicKey}
*/
  static from_secret_key(secret_key: SecretKey): PublicKey;
/**
* @returns {Uint8Array}
*/
  to_array(): Uint8Array;
/**
* @param {Uint8Array} arr
* @returns {PublicKey}
*/
  static from_array(arr: Uint8Array): PublicKey;
}
/**
*/
export class SecretKey {
  free(): void;
/**
* Generates a secret key using the default RNG and returns it.
* @returns {SecretKey}
*/
  static random(): SecretKey;
/**
* @returns {Uint8Array}
*/
  to_array(): Uint8Array;
/**
* @param {Uint8Array} arr
* @returns {SecretKey}
*/
  static from_array(arr: Uint8Array): SecretKey;
}
