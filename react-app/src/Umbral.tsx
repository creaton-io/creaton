import {Base64} from "js-base64";

let REENCRYPTION_URI
if (process.env.NODE_ENV === 'development')
  REENCRYPTION_URI = 'http://localhost:3010'
else
  REENCRYPTION_URI = 'https://creaton.m30m.me'

export class Umbral {
  address
  umbral

  constructor(umbral, etherum_address: string) {
    this.umbral = umbral
    this.address = etherum_address.toLowerCase()
  }


  protected getKeyOrCreate(keyAddress: string) {
    let item = localStorage.getItem(keyAddress);
    let privateKey
    if (!item) {
      privateKey = this.umbral.SecretKey.random()
      localStorage.setItem(keyAddress, Base64.fromUint8Array(privateKey.to_array()))
    } else {
      privateKey = this.umbral.SecretKey.from_array(Base64.toUint8Array(item))
    }
    const publicKey = this.umbral.PublicKey.from_secret_key(privateKey)
    return [privateKey, publicKey];
  }


}

export class UmbralAlice extends Umbral {
  private getSecretKey() {
    return this.getKeyOrCreate('sk-' + this.address);
  }

  private getSigningSecretKey() {
    return this.getKeyOrCreate('signing-sk-' + this.address);
  }

  public encrypt(file_content: Uint8Array) {
    let params = new this.umbral.Parameters()
    let [alice_sk, alice_pk] = this.getSecretKey()
    let [signing_sk, signing_pk] = this.getSigningSecretKey()
    let result = this.umbral.encrypt(params, alice_pk, file_content)
    return {
      ciphertext: Base64.fromUint8Array(result!.ciphertext),
      capsule: Base64.fromUint8Array(result!.capsule.to_array()),
      alice_pk: Base64.fromUint8Array(alice_pk.to_array()),
      signing_pk: Base64.fromUint8Array(signing_pk.to_array()),
    }
  }

  public async grant(bob_pk_base64: string) {
    let n = 3 // how many fragments to create
    let m = 1 // how many should be enough to decrypt
    let params = new this.umbral.Parameters()
    let [alice_sk, alice_pk] = this.getSecretKey()
    let [signing_sk, signing_pk] = this.getSigningSecretKey()
    let bob_pk = this.umbral.PublicKey.from_array(Base64.toUint8Array(bob_pk_base64))
    let kfrags = this.umbral.generate_kfrags(
      params, alice_sk, bob_pk, signing_sk, m, n,
      true, // add the delegating key (alice_pk) to the signature
      true, // add the receiving key (bob_pk) to the signature
    )
    console.log('kfrags', kfrags)
    console.log(kfrags[0].to_array())
    const json_payload = {
      signing_pk: Base64.fromUint8Array(signing_pk.to_array()),
      kfrag: Base64.fromUint8Array(kfrags[0].to_array()),
      bob_pk: bob_pk_base64
    }
    const response = await fetch(REENCRYPTION_URI+'/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json_payload)
    })
    console.log(response)
  }


}

export class UmbralBob extends Umbral {

  private getSecretKey() {
    return this.getKeyOrCreate('bob-' + this.address);
  }

  public getPublicKeyBase64() {
    let [bob_sk, bob_pk] = this.getSecretKey()
    return Base64.fromUint8Array(bob_pk.to_array())
  }

  private async getCFrag(ciphertext: string, capsule: string, signing_pk: string, alice_pk: string){
    let [bob_sk, bob_pk] = this.getSecretKey()
    const json_payload = {
      signing_pk: signing_pk,
      capsule: capsule,
      alice_pk: alice_pk,
      bob_pk: Base64.fromUint8Array(bob_pk.to_array())
    }
    const response = await fetch(REENCRYPTION_URI+'/reencrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json_payload)
    })
    let cfrag = await response.text();
    return this.umbral.CapsuleFrag.from_array(Base64.toUint8Array(cfrag))
  }


  public async decrypt(ciphertext: string, capsule: string, signing_pk: string, alice_pk: string) {
    let [bob_sk, bob_pk] = this.getSecretKey()
    const cfrag = await this.getCFrag(ciphertext,capsule,signing_pk,alice_pk)
    const capsule_obj = this.umbral.Capsule.from_array(Base64.toUint8Array(capsule))
    const alice_pk_obj = this.umbral.PublicKey.from_array(Base64.toUint8Array(alice_pk))
    const ciphertext_obj = Base64.toUint8Array(ciphertext)
    let plaintext_bob = capsule_obj.with_cfrag(cfrag).decrypt_reencrypted(bob_sk, alice_pk_obj, ciphertext_obj)
    return plaintext_bob

  }
}
