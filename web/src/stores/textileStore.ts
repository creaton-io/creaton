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

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Keys',
  type: 'object',
  required: ['cid', 'key'],
  properties: {
    _id: {
      type: 'string',
      description: "The instance's id.",
    },
    cid: {type: 'string'},
    key: {type: 'string'},
  },
};

export class TextileStore {
  private identity: PrivateKey;
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
  private ipfsGateway = 'https://hub.textile.io';

  constructor() {
    this.keyInfo = {
      key: 'bztzcvlar4fdod24mbamtz5prne',
    };
    this.keyInfoOptions = {
      debug: true,
    };
  }

  public async authenticate(): Promise<void> {
    this.identity = await this.getIdentity();
    await this.initialize();
    // console.log(this.identity.public.toString());
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
      } catch (err) {
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
    const privBuck = await buckets.getOrCreate('creaton-keys', undefined, true);

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
    await this.create_thread();
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

  private async create_thread(): Promise<void> {
    const threadResponse = await this.client.listThreads();
    const threadList = threadResponse.listList;
    const thread = threadList.find((obj) => obj.name === 'creaton');
    if (!thread) {
      this.threadID = await this.client.newDB(undefined, 'creaton');
      await this.client.newCollection(this.threadID, {name: 'creator', schema: schema});
      await this.client.newCollection(this.threadID, {name: 'subscriber', schema: schema});
    } else {
      this.threadID = ThreadID.fromString(thread.id);
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
      cid: rawFile.path.path.toString(),
      key: this.arrayBufferToBase64(encKey.buffer),
    };

    await this.client.create(this.threadID, 'creator', [pair]);

    return {
      encryptedFile: {
        ipfsPath: rawFile.path.path.toString(),
        name: fileName,
        type: file.type,
        date: now.toString(),
      },
    };
  }

  // public async uploadJSONBuffer(buf: Buffer): Promise<string> {
  //   const now = new Date().getTime();
  //   const uploadName = `${now}_metadata.json`;
  //   const fileLocation = `contents/${uploadName}`;

  //   const rawFile = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, fileLocation, buf);

  //   return `${this.ipfsGateway}/ipfs/${rawFile.path.cid.toString()}`;
  // }

  // public async uploadJSONFile(file: File): Promise<EncryptedFileMetadata> {
  //   const now = new Date().getTime();
  //   const fileName = `${file.name}`;
  //   const uploadName = `${now}_metadata.json`;
  //   const fileLocation = `contents/${uploadName}`;

  //   const rawFile = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, fileLocation, file);

  //   // encrypt this key with creator public key to store in creator collection
  //   const encKey = await this.identity.public.encrypt(new Uint8Array(encMetadata.key));
  //   const pair: CidKey = {
  //     ipfsPath: rawFile.path.cid.toString(),
  //     key: this.arrayBufferToBase64(encKey.buffer),
  //   };

  //   await this.client.create(this.threadID, 'creator', [pair]);

  //   return {
  //     JSONFile: {
  //       name: fileName,
  //       path: fileLocation,
  //       date: now.toString(),
  //     },
  //   };
  // }

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
   */
  public async decryptFile(path: string): Promise<ArrayBuffer> {
    //get content from path on ipfs
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
    const content = this.base64ToArrayBuffer(binary);

    // TODO get key if subscriber has been given, has to handle error when no key is available
    // i.e.when query fails
    const query = new Where('cid').eq(path);
    const result = await this.client.find<CidKey>(this.threadID, 'subscriber', query);
    const pair = result[0];
    const keyBuffer = await this.identity.decrypt(new Uint8Array(this.base64ToArrayBuffer(pair.key)));
    const decryptKey = await this.importKey(keyBuffer.buffer);

    // await console.log(this.arrayBufferToBase64(keyBuffer.buffer));
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
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string) {
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
