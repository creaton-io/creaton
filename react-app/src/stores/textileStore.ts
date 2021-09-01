import {
  Buckets,
  Client,
  KeyInfo,
  PrivateKey,
  PublicKey,
  ThreadID,
  UserMessage,
  Users,
  Where,
  WithKeyInfoOptions,
} from '@textile/hub';

import {utils} from 'ethers'

import fetch from 'isomorphic-fetch';

export interface FileMetadata {
  ipfsPath: string;
  name: string;
  type: string;
  date: string;
}

export interface EncryptedFileMetadata {
  encryptedFile: FileMetadata;
}

export interface DecryptedInbox {
  id: string;
  body: string;
  from: string;
  sent: number;
  readAt?: number;
}

export interface EncryptedMetadata {
  file: ArrayBuffer;
  key: ArrayBuffer;
}

export interface CidKey {
  cid: string;
  key: string;
}

export interface EncryptedObject {
  ciphertext: string;
  capsule: string;
  signing_pk: string;
  alice_pk: string;
  type: string;
}


export class TextileStore {
  private identity!: PrivateKey;
  private keyInfo: KeyInfo;
  private user!: Users;
  private client!: Client;
  private keyInfoOptions: WithKeyInfoOptions;
  private bucketInfo!: {
    bucket: Buckets;
    bucketKey: string;
    privBucketKey: string;
  };
  private threadID!: ThreadID;
  private ipfsGateway = 'https://hub.textile.io';

  constructor() {
    this.keyInfo = {
      key: 'b5d3fve3faiiyy6w6jtedbzpkk4',
    };
    this.keyInfoOptions = {
      debug: true,
    };

  }

  public async authenticate(): Promise<void> {
    this.identity = await this.getIdentity();
    await this.initialize();
    console.log('textile authenticated ' + this.identity.public.toString());
  }

  private async getIdentity(): Promise<PrivateKey> {
    try {
      const storedIdent = localStorage.getItem('identity-creaton');
      if (storedIdent === null) {
        throw new Error('No identity');
      }
      const restored = PrivateKey.fromString(storedIdent);
      return restored;
    } catch (e) {
      /**
       * If any error, create a new identity.
       */
      try {
        const identity = PrivateKey.fromRandom();
        const identityString = identity.toString();
        localStorage.setItem('identity-creaton', identityString);
        return identity;
      } catch (err: any) {
        return err.message;
      }
    }
  }

  private async initialize(): Promise<void> {
    if (!this.identity || !this.keyInfo) {
      throw new Error('Identity or API key not set');
    }
    // alert("hi");
    const buckets = await Buckets.withKeyInfo(this.keyInfo);
    // alert("hi key info");
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(this.identity);
    // alert('hi!');
    const buck = await buckets.getOrCreate('creaton');
    // alert("hi!!");
    const privBuck = await buckets.getOrCreate('creaton-keys');

    if (!buck.root || !privBuck.root) {
      throw new Error('Failed to get or create bucket');
    }
    // alert("buckets?");
    this.bucketInfo = {
      bucket: buckets,
      bucketKey: buck.root.key,
      privBucketKey: privBuck.root.key,
    };
    // alert(this.bucketInfo.bucketKey.toString());
    // alert(this.bucketInfo.privBucketKey.toString());
    await this.setupAPI();
    await this.setupMailbox();
  }

  private async setupMailbox() {
    try {
      await this.user.getMailboxID();
    } catch (error) {
      await this.user.setupMailbox();
    }
  }

  private async setupAPI(): Promise<void> {
    this.user = await Users.withKeyInfo(this.keyInfo);
    this.client = await Client.withKeyInfo(this.keyInfo);
    await this.user.getToken(this.identity);
    await this.client.getToken(this.identity);
  }

  public async pushFile(
    file: File,
    encObject: Buffer
  ): Promise<FileMetadata> {
    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const fileLocation = `contents/${uploadName}`;

    const rawFile = await this.bucketInfo.bucket.pushPath(
      this.bucketInfo.bucketKey,
      fileLocation,
      encObject
    );

    return {
      ipfsPath: rawFile.path.path.toString(),
      name: fileName,
      type: file.type,
      date: now.toString(),
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

    const tmp = new Uint8Array(counter.byteLength + encryptedFile.byteLength);
    tmp.set(counter, 0);
    tmp.set(new Uint8Array(encryptedFile), counter.byteLength);
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);

    return {
      file: tmp.buffer,
      key: exportedKey,
    };
  }

  public async downloadEncryptedFile(path): Promise<EncryptedObject>{
    const file = await this.bucketInfo.bucket.pullIpfsPath(path);
    let binary = '';
    for await (const value of file) {
      const len = value.byteLength;
      // console.log(len);
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(value[i]);
      }
    }

    // console.log(binary);
    return JSON.parse(binary)
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

  public arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  public base64ToArrayBuffer(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public async messageDecoder(message: UserMessage): Promise<DecryptedInbox> {
    const bytes = await this.identity.decrypt(message.body);
    const body = new TextDecoder().decode(bytes);
    const {from} = message;
    const {readAt} = message;
    const {createdAt} = message;
    const {id} = message;
    return {body, from, readAt, sent: createdAt, id};
  }

  public async getKeysFromCreator(): Promise<void> {
    const messages = await this.user.listInboxMessages();
    for (const msg of messages) {
      const decryptedInbox = await this.messageDecoder(msg);
      const keyPair: CidKey = JSON.parse(decryptedInbox.body);
      //encrypt key and store
      const encKey = await this.identity.public.encrypt(new Uint8Array(this.base64ToArrayBuffer(keyPair.key)));
      const pair: CidKey = {
        cid: keyPair.cid,
        key: this.arrayBufferToBase64(encKey.buffer),
      };
      await this.client.create(this.threadID, 'subscriber', [pair]);
    }
  }

  //from contract
  public async getSubscribers(): Promise<CidKey[]> {
    return new Array({cid: 'cid', key: 'pubKey'});
  }


  public async sendKeysToSubscribers(cid: string, key: string): Promise<void> {
    const subscribers = new Array({cid: cid, key: key});

    for (const sub of subscribers) {
      const query = new Where('cid').eq(sub.cid);
      const result = await this.client.find<CidKey>(this.threadID, 'creator', query);
      const pair = result[0];
      const keyBuffer = await this.identity.decrypt(new Uint8Array(this.base64ToArrayBuffer(pair.key)));

      const message = '{"cid": "' + sub.cid + '", "key": "' + this.arrayBufferToBase64(keyBuffer) + '"}';
      const pubKey = PublicKey.fromString(sub.key);
      await this.sendMailBox(this.identity, pubKey, message);
    }
  }

  public async sendMailBox(from: PrivateKey, to: PublicKey, message: string): Promise<UserMessage> {
    const encoder = new TextEncoder();
    const body = encoder.encode(message);
    return this.user.sendMessage(from, to, body);
  }
}
