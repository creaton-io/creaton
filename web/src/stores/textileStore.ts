global.Buffer = Buffer;
import {title} from '@curi/router';
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
import {Buffer} from 'buffer';

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

export interface Tmap {
  cid: string;
  tmap: string;
}

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Keys',
  type: 'object',
  required: ['cid', 'tmap'],
  properties: {
    _id: {
      type: 'string',
      description: "The instance's id.",
    },
    cid: {type: 'string'},
    tmap: {type: 'string'},
  },
};

export class TextileStore {
  public identity: PrivateKey;
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
      key: 'brrcfgkugkiuieiao6icc4fzkya',
    };
    this.keyInfoOptions = {
      debug: true,
    };
  }

  public async authenticate(): Promise<void> {
    this.identity = await this.getIdentity();
    await this.initialize();
    console.log(this.identity.public.toString());
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

  public async uploadFile(
    file: File,
    contractAddress: string,
    creatorAddress: string,
    nuPassword: string
  ): Promise<EncryptedFileMetadata> {
    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const fileLocation = `contents/${uploadName}`;

    const encObject = await this.encryptFileNu(file, contractAddress, creatorAddress, nuPassword);

    const rawFile = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, fileLocation, encObject);

    return {
      encryptedFile: {
        ipfsPath: rawFile.path.path.toString(),
        name: fileName,
        type: file.type,
        date: now.toString(),
      },
    };
  }

  private async encryptFileNu(
    file: File,
    contractAddress: string,
    creatorAddress: string,
    nuPassword: string
  ): Promise<string> {
    const buf = await file.arrayBuffer();
    const b64File = this.arrayBufferToBase64(buf);
    const data = {file_content: b64File, label: contractAddress, address: creatorAddress, password: nuPassword};
    const form_data = new FormData();
    for (const key in data) {
      form_data.append(key, data[key]);
    }
    const response = await fetch('http://127.0.0.1:5000/encrypt', {method: 'POST', body: form_data});
    return response.text();
  }

  public async uploadTier(tier: any, imageFile: File): Promise<string> {
    const now = new Date().getTime();
    const uploadName = `${tier.name}_${now}_metadata.json`;
    const uploadImageName = `${now}_${imageFile.name}`;

    const fileLocation = `tier/${uploadName}`;
    const imageLocation = `image/${uploadImageName}`;

    const rawImage = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, imageLocation, imageFile);

    const jsonTier = {
      title: 'Creaton Tier Metadata',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: tier.name,
        },
        description: {
          type: 'string',
          description: tier.description,
        },
        image: {
          type: 'string',
          description: `${this.ipfsGateway}/ipfs/${rawImage.path.cid.toString()}`,
        },
      },
    };

    const rawFile = await this.bucketInfo.bucket.pushPath(
      this.bucketInfo.bucketKey,
      fileLocation,
      Buffer.from(JSON.stringify(jsonTier))
    );

    return `${this.ipfsGateway}/ipfs/${rawFile.path.cid.toString()}`;
  }

  /**
   * Decrypts a file given the relative bucket path and
   * its cid to retrieve its corresponding keys from DB.
   * @param path The relative path in bucket
   */
  public async decryptFile(
    path: string,
    contractAddress: string,
    subscriberAddress: string,
    nuPassword: string
  ): Promise<ArrayBuffer> {
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
    const encObject = JSON.parse(binary);
    console.log('encObject', encObject);
    const policy_pubkey = encObject['policy_pubkey'];
    const alice_sig_pubkey = encObject['alice_sig_pubkey'];
    const content = encObject['enc_file_content'];

    // TODO get key if subscriber has been given, has to handle error when no key is available
    // i.e.when query fails
    const query = new Where('cid').eq(contractAddress);
    const result = await this.client.find<Tmap>(this.threadID, 'subscriber', query);
    console.log('result query', result);
    const pair = result[0];
    console.log('first query result', pair);
    // const keyBuffer = await this.identity.decrypt(new Uint8Array(this.base64ToArrayBuffer(pair.key)));
    // const decryptKey = await this.importKey(keyBuffer.buffer);
    const tmap = pair.tmap;

    const data = {
      enc_file_content: content,
      label: contractAddress,
      policy_pubkey: policy_pubkey,
      creator_pubkey: alice_sig_pubkey,
      address: subscriberAddress,
      password: nuPassword,
      tmap: tmap,
    };
    const form_data = new FormData();
    for (const key in data) {
      form_data.append(key, data[key]);
    }
    const response = await fetch('http://127.0.0.1:5000/decrypt', {method: 'POST', body: form_data});
    const res = await response.text();
    console.log('enc_file', res);
    return this.base64ToArrayBuffer(JSON.parse(res)['decrypted_content']);
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

  public async getTmapFromCreator(contractAddress: string): Promise<void> {
    console.log('get tmap from textile');
    const messages = await this.user.listInboxMessages();
    console.log('inbox messages', messages);
    for (const msg of messages) {
      console.log('textile tmap', msg);
      const decryptedInbox = await this.messageDecoder(msg);
      const tmapPair: Tmap = JSON.parse(decryptedInbox.body);
      const tmap: Tmap = {
        cid: tmapPair.cid,
        tmap: tmapPair.tmap,
      };
      console.log(tmap);
      await this.client.create(this.threadID, 'subscriber', [tmap]);
    }
  }

  public async sendTmapToSubscribers(textilePubKey: string, cid: string, tmap: string): Promise<void> {
    const pubKey = PublicKey.fromString(textilePubKey);
    const message = '{"cid": "' + cid + '", "tmap": "' + tmap + '"}';
    console.log(message);
    await this.sendMailBox(this.identity, pubKey, message);
  }

  public async sendMailBox(from: PrivateKey, to: PublicKey, message: string): Promise<UserMessage> {
    const encoder = new TextEncoder();
    const body = encoder.encode(message);
    return this.user.sendMessage(from, to, body);
  }
}
