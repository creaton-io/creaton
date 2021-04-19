import {Base64} from "js-base64";
import {utils} from "ethers";
import {REENCRYPTION_URI} from "./Config";

export class Umbral {
  umbral
  masterKey

  constructor(umbral) {
    this.umbral = umbral
  }

  public async initMasterkey(signer, address, isContractAddress) {
    const keyAddress = 'masterkey-' + address
    let item = localStorage.getItem(keyAddress);
    if (!item) {
      let message = 'For encryption/decryption of content in creaton, we need to generate additional secret keys.\nWe generate these keys based on your wallet so that you can recover them later in another device.\nTo continue please sign this message.';
      if (isContractAddress)
        message = message + '\n Creator contract address:' + address
      const signature = await signer.signMessage(message)
      this.masterKey = utils.arrayify(signature)
      localStorage.setItem(keyAddress, Base64.fromUint8Array(this.masterKey))
    } else {
      this.masterKey = Base64.toUint8Array(item)
    }
  }

  protected getPrivatePublic(bytes: Uint8Array){
    const privateKey = this.umbral.SecretKey.from_array(bytes)
    const publicKey = this.umbral.PublicKey.from_secret_key(privateKey)
    return [privateKey, publicKey];
  }

}

export class UmbralCreator extends Umbral {
  contractAddress

  constructor(umbral, contractAddress) {
    super(umbral);
    this.contractAddress = contractAddress
  }

  private getSecretKey() {
    return this.getPrivatePublic(this.masterKey.slice(0, 32))
  }

  private getSigningSecretKey() {
    return this.getPrivatePublic(this.masterKey.slice(32, 64))
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

  public decrypt(ciphertext: string, capsule: string) {
    let [alice_sk, alice_pk] = this.getSecretKey()
    const capsule_obj = this.umbral.Capsule.from_array(Base64.toUint8Array(capsule))
    const ciphertext_obj = Base64.toUint8Array(ciphertext)
    return this.umbral.decrypt_original(alice_sk, capsule_obj, ciphertext_obj)
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
    const ethers_signing_sk = new utils.SigningKey(utils.hexlify(signing_sk.to_array()))
    const signature = ethers_signing_sk.signDigest(utils.keccak256(kfrags[0].to_array()))
    const json_payload = {
      signing_pk: Base64.fromUint8Array(signing_pk.to_array()),
      kfrag: Base64.fromUint8Array(kfrags[0].to_array()),
      bob_pk: bob_pk_base64,
      signature: signature,
      contract_address: this.contractAddress
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

  public async revoke(bob_pk_base64: string) {
    let [signing_sk, signing_pk] = this.getSigningSecretKey()
    const ethers_signing_sk = new utils.SigningKey(utils.hexlify(signing_sk.to_array()))
    const signature = ethers_signing_sk.signDigest(utils.keccak256(Base64.toUint8Array(bob_pk_base64)))
    const json_payload = {
      signing_pk: Base64.fromUint8Array(signing_pk.to_array()),
      bob_pk: bob_pk_base64,
      signature: signature,
      contract_address: this.contractAddress
    }
    const response = await fetch(REENCRYPTION_URI+'/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json_payload)
    })
    console.log(response)
  }


}

export class UmbralSubscriber extends Umbral {

  private getSecretKey() {
    return this.getPrivatePublic(this.masterKey.slice(0, 32))
  }

  public getPublicKeyBase64() {
    let [bob_sk, bob_pk] = this.getSecretKey()
    return Base64.fromUint8Array(bob_pk.to_array())
  }

  private async getCFrag(ciphertext: string, capsule: string, signing_pk: string, alice_pk: string, contractAddress: string) {
    let [bob_sk, bob_pk] = this.getSecretKey()
    const ethers_bob_sk = new utils.SigningKey(utils.hexlify(bob_sk.to_array()))
    const signature = ethers_bob_sk.signDigest(utils.keccak256(Base64.toUint8Array(capsule)))
    const json_payload = {
      signing_pk: signing_pk,
      capsule: capsule,
      alice_pk: alice_pk,
      signature: signature,
      contract_address: contractAddress,
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


  public async decrypt(ciphertext: string, capsule: string, signing_pk: string, alice_pk: string, contractAddress: string) {
    let [bob_sk, bob_pk] = this.getSecretKey()
    const cfrag = await this.getCFrag(ciphertext, capsule, signing_pk, alice_pk, contractAddress)
    const capsule_obj = this.umbral.Capsule.from_array(Base64.toUint8Array(capsule))
    const alice_pk_obj = this.umbral.PublicKey.from_array(Base64.toUint8Array(alice_pk))
    const ciphertext_obj = Base64.toUint8Array(ciphertext)
    let plaintext_bob = capsule_obj.with_cfrag(cfrag).decrypt_reencrypted(bob_sk, alice_pk_obj, ciphertext_obj)
    return plaintext_bob
  }
}
