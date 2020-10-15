import type {WalletStore} from 'web3w';
import {Buckets, KeyInfo, PrivateKey, WithKeyInfoOptions, Users} from '@textile/hub';
const Box = require('3box');

export interface FileMetadata {
  cid: string;
  path: string;
  name: string;
  date: string;
}

export interface EncryptedFileMetadata {
  encryptedFile: FileMetadata;
  exportedKey: FileMetadata;
}

interface EncryptedMetadata {
  file: ArrayBuffer;
  key: ArrayBuffer;
  counter: Uint8Array;
}

export class TextileStore {
  private wallet: WalletStore;
  private identity: PrivateKey;
  private box;
  private keyInfo: KeyInfo;
  private api: Users;
  private keyInfoOptions: WithKeyInfoOptions;
  private bucketInfo: {
    bucket: Buckets;
    bucketKey: string;
    privBucketKey: string;
  };

  constructor(wallet: WalletStore) {
    this.wallet = wallet;
    this.keyInfo = {
      key: process.env.TEXTILE_HUB_API_KEY as string,
    };
    this.keyInfoOptions = {
      debug: false,
    };
  }

  public async authenticate(): Promise<void> {
    this.box = await Box.create(this.wallet.web3Provider);
    const address = this.wallet.address;
    await this.box.auth([], {address});

    const space = await this.box.openSpace('io-textile-3box-demo');
    await this.box.syncDone;
    let identity: PrivateKey;

    try {
      const storedIdent = await space.private.get('ed25519-identity');
      if (storedIdent === null) {
        throw new Error('No identity');
      }
      identity = PrivateKey.fromString(storedIdent);
      this.identity = identity;
    } catch (e) {
      try {
        identity = PrivateKey.fromRandom();
        const identityString = identity.toString();
        await space.private.set('ed25519-identity', identityString);
      } catch (err) {
        return err.message;
      }
    }
    this.identity = identity;
    this.setupAPI();
    this.setupMailBox();
  }

  public async setupAPI(): Promise<void> {
    this.api = await Users.withKeyInfo(this.keyInfo);
    await this.api.getToken(this.identity);
  }

  public async setupMailBox(): Promise<void> {
    await this.api.setupMailbox();
  }

  public async initBucket(): Promise<void> {
    if (!this.identity || !this.keyInfo) {
      throw new Error('Identity or API key not set');
    }

    const buckets = await Buckets.withKeyInfo(this.keyInfo, this.keyInfoOptions);
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(this.identity);

    const buck = await buckets.getOrCreate('creaton');
    const privBuck = await buckets.getOrCreate('creaton-keys', undefined, true);

    if (!buck.root || !privBuck.root) {
      throw new Error('Failed to get or create bucket');
    }

    this.bucketInfo = {
      bucket: buckets,
      bucketKey: buck.root.key,
      privBucketKey: privBuck.root.key,
    };
  }

  public async uploadFile(file: File): Promise<EncryptedFileMetadata> {
    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const fileLocation = `contents/${uploadName}`;
    const keyLocation = `keys/${uploadName}`;

    const encMetadata = await this.encryptFile(file);

    // TODO: Append the counter to the encrypted file.
    const rawFile = await this.bucketInfo.bucket.pushPath(
      this.bucketInfo.bucketKey,
      fileLocation,
      this.arrayBufferToBase64(encMetadata.file)
    );

    const rawKey = await this.bucketInfo.bucket.pushPath(
      this.bucketInfo.privBucketKey,
      keyLocation,
      this.arrayBufferToBase64(encMetadata.key)
    );

    return {
      encryptedFile: {
        cid: rawFile.path.cid.toString(),
        name: fileName,
        path: fileLocation,
        date: now.toString(),
      },
      exportedKey: {
        cid: rawKey.path.cid.toString(),
        name: fileName,
        path: keyLocation,
        date: now.toString(),
      },
    };
  }

  public async encryptFile(file: File): Promise<EncryptedMetadata> {
    const buf = await file.arrayBuffer();
    const key = await this.generateKey();
    const counter = window.crypto.getRandomValues(new Uint8Array(16));

    const encryptedFile = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CTR',
        counter: counter,
        length: 128,
      },
      key,
      buf
    );

    const exportedKey = await window.crypto.subtle.exportKey('raw', key);

    return {
      file: encryptedFile,
      key: exportedKey,
      counter: counter,
    };
  }

  public async decryptRawFile(content: ArrayBuffer, key: ArrayBuffer, counter: Uint8Array): Promise<ArrayBuffer> {
    const decryptKey = await this.importKey(key);
    return await window.crypto.subtle.decrypt(
      {
        name: 'AES-CTR',
        counter: counter,
        length: 128,
      },
      decryptKey,
      content
    );
  }

  public async getEncryptionKeys(path: string): Promise<ArrayBuffer> {
    const metadata = await this.bucketInfo.bucket.pullPath(this.bucketInfo.bucketKey, path);

    const {value} = await metadata.next();
    const str = new TextDecoder().decode(value);

    return this.base64ToArrayBuffer(str);
  }

  private async importKey(key: ArrayBuffer): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
      'raw',
      key,
      {
        name: 'AES-CTR',
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async generateKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-CTR',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    const binary = new TextDecoder().decode(bytes);

    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string) {
    const str = window.atob(base64);
    const bytes = new TextEncoder().encode(str);

    return bytes.buffer;
  }
}
