/* eslint-disable react-hooks/rules-of-hooks */
import ThreeIdProvider from '3id-did-provider'
import type { DIDProvider } from 'dids'
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import {useWeb3React} from "../../web3-react/core";

import { randomBytes } from '@stablelib/random'

import React, {useContext, useEffect, useRef, useState} from 'react';
import {Web3Provider} from "@ethersproject/providers";

function clipAddress(address) {
  return address.slice(0, 8) + '...' + address.slice(36, 42)
}

export async function getProvider(): Promise<DIDProvider> {
  //const ethProvider = await web3Modal.connect() //our own stuff
  
  //const seed = randomBytes(32)

  const threeIdConnect = new ThreeIdConnect() 
  const provider = new EthereumAuthProvider(window.ethereum, "0xE6C9Ea928c0BA8fF32ab877D8F89C6cD1c47c515")
  
  //or const signer = context.library.getSigner(); const userAddress = await signer.getAddress();
  
  await threeIdConnect.connect(provider)

  // const did = new DID({
  // provider: threeIdConnect.getDidProvider(),
  // resolver: {
  // ...ThreeIdResolver.getResolver(ceramic)
  // }
  // })

  // ceramic.setDID(did)
  // await ceramic.did.authenticate()
  // const idx = new IDX({ ceramic })
  // await idx.set('basicProfile', {
  // name,
  // avatar: image
  // })
  // console.log("Profile updated!")
  // }

  // @ts-ignore
  return threeIdConnect.getDidProvider()
}
