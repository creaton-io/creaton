/*
import {
  Buckets,
  KeyInfo,
  PrivateKey,
  WithKeyInfoOptions,
  Users,
  Client,
  Where,
  UserMessage,
  PublicKey,
  ThreadID,
} from '@textile/hub';

const Box = require('3box');

export interface FileMetadata {
  cid: string;
  path: string;
  name: string;
  date: string;
}

export interface EncryptedFileMetadata {
  encryptedFile: FileMetadata;
}

interface DecryptedInbox {
  id: string;
  body: string;
  from: string;
  sent: number;
  readAt?: number;
}

interface EncryptedMetadata {
  file: ArrayBuffer;
  key: ArrayBuffer;
}

interface CidKey {
  cid: string;
  key: string;
}

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Keys',
  type: 'object',
  required: ['cid', 'key'],
  properties: {
    cid: {type: 'string'},
    key: {type: 'string'},
  },
};

export class TextileStore {
  private wallet: WalletStore;
  private identity: PrivateKey;
  private box;
  private keyInfo: KeyInfo;
  private user: Users;
  private client: Client;
  private keyInfoOptions: WithKeyInfoOptions;
  private bucketInfo: {
    bucket: Buckets;
    bucketKey: string;
    privBucketKey: string;
  };
  private threadID;

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
      /**
       * If any error, create a new identity.
       *//*
      try {
        identity = PrivateKey.fromRandom();
        const identityString = identity.toString();
        await space.private.set('ed25519-identity', identityString);
      } catch (err) {
        return err.message;
      }
    }
    this.identity = identity;
  }

  public async initialize(): Promise<void> {
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

    await this.setupAPI();
    await this.setupMailbox();
    await this.create_thread();
  }

  private async setupMailbox() {
    const mailId = await this.user.getMailboxID();
    if (!mailId) {
      await this.user.setupMailbox();
    }
  }

  private async setupAPI(): Promise<void> {
    this.user = await Users.withKeyInfo(this.keyInfo);
    this.client = await Client.withKeyInfo(this.keyInfo);
    await this.user.getToken(this.identity);
    await this.client.getToken(this.identity);
  }

  private async create_thread(): Promise<void> {
    // const threadResponse = await this.client.listThreads();
    // const threadList = threadResponse.listList;
    // const thread = threadList.find((obj) => obj.name == 'creaton');
    // if (!thread) {
    //   this.threadID = await this.client.newDB(undefined, 'creaton');
    // } else {
    //   this.threadID = thread.id;
    // }

    let threadId = await this.getThreadId();
    if (threadId === undefined) {
      threadId = await this.client.newDB(undefined, 'creaton');
      await this.client.newCollection(threadId, {name: 'creator', schema: schema});
      await this.client.newCollection(threadId, {name: 'subscriber', schema: schema});
    }

    this.threadID = threadId;
    await this.bucketInfo.bucket.pushPath(this.bucketInfo.privBucketKey, 'keys/threadid.txt', threadId.toString());
  }

  private async getThreadId(): Promise<ThreadID | undefined> {
    try {
      const metadata = await this.bucketInfo.bucket.pullPath(this.bucketInfo.privBucketKey, 'keys/threadid.txt');
      const {value} = await metadata.next();
      ThreadID.fromString(new TextDecoder().decode(value));
    } catch (error) {
      return undefined;
    }
  }

  public async uploadFile(file: File): Promise<EncryptedFileMetadata> {
    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const fileLocation = `contents/${uploadName}`;

    const encMetadata = await this.encryptFile(file);

    const rawFile = await this.bucketInfo.bucket.pushPath(
      this.bucketInfo.bucketKey,
      fileLocation,
      this.arrayBufferToBase64(encMetadata.file)
    );

    // encrypt this key with creator public key to store in creator collection
    const encKey = await this.identity.public.encrypt(new Uint8Array(encMetadata.key));
    const pair: CidKey = {
      cid: rawFile.path.cid.toString(),
      key: this.arrayBufferToBase64(encKey.buffer),
    };

    await this.client.create(this.threadID, 'creator', [pair]);

    return {
      encryptedFile: {
        cid: rawFile.path.cid.toString(),
        name: fileName,
        path: fileLocation,
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

    const tmp = new Uint8Array(counter.byteLength + encryptedFile.byteLength);
    tmp.set(counter, 0);
    tmp.set(new Uint8Array(encryptedFile), counter.byteLength);
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);

    return {
      file: tmp.buffer,
      key: exportedKey,
    };
  }

  /**
   * Decrypts a file given the relative bucket path and
   * its cid to retrieve its corresponding keys from DB.
   * @param path The relative path in bucket
   * @param cid CID of the content to receive
   *//*
  public async decryptFile(path: string, cid: string): Promise<ArrayBuffer> {
    // get content from path on ipfs
    const metadata = await this.bucketInfo.bucket.pullPath(this.bucketInfo.bucketKey, path);
    const {value} = await metadata.next();
    const content = this.base64ToArrayBuffer(value);

    // TODO get key if subscriber has been given, has to handle error when no key is available
    // i.e. when query fails
    const query = new Where('cid').eq(cid);
    const result = await this.client.find<CidKey>(this.threadID, 'subscriber', query);
    const pair = result[0];
    const keyBuffer = await this.identity.decrypt(new Uint8Array(this.base64ToArrayBuffer(pair.key)));
    const decryptKey = await this.importKey(keyBuffer.buffer);

    return await window.crypto.subtle.decrypt(
      {
        name: 'AES-CTR',
        counter: content.slice(0, 16),
        length: 128,
      },
      decryptKey,
      content.slice(16, content.byteLength)
    );
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
      // encrypt key and store
      const encKey = await this.identity.public.encrypt(new Uint8Array(this.base64ToArrayBuffer(keyPair.key)));
      const pair: CidKey = {
        cid: keyPair.cid,
        key: this.arrayBufferToBase64(encKey.buffer),
      };
      await this.client.create(this.threadID, 'subscriber', [pair]);
    }
  }

  // from contract
  public async getSubscribers(): Promise<CidKey[]> {
    return new Array({cid: 'cid', key: 'pubKey'});
  }

  public async sendKeysToSubscribers(): Promise<void> {
    const subscribers = await this.getSubscribers();

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
*/
