import type {WalletStore} from 'web3w';
import {Buckets, KeyInfo, PrivateKey, WithKeyInfoOptions, Users} from '@textile/hub';
const Box = require('3box');

export interface FileMetadata {
  cid: string;
  path: string;
  name: string;
  date: string;
}

export interface EncFile {
  
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

    const buck = await buckets.getOrCreate('creaton', undefined, false);
    const privBuck = await buckets.getOrCreate('creaton-keys', undefined, true);

    if (!buck.root || !privBuck.root) {
      throw new Error('Failed to get or create bucket');
    }

    this.bucketInfo = {
      bucket: buckets,
      bucketKey: buck.root.key,
      privBucketKey: privBuck.root.key
    };
  }

  public async uploadFile(file: File, path: string): Promise<FileMetadata> {
    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const location = `${path}${uploadName}`;

    const encKey = this.encryptFile(file);
    const raw = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, location, file.stream());

    return {
      cid: raw.path.cid.toString(),
      name: fileName,
      path: location,
      date: now.toString(),
    };
  }
 
public encryptFile(file: File): EncFile{
  
}

}