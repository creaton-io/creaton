import ThreeIdProvider from '3id-did-provider'
import type { DIDProvider } from 'dids'

import { randomBytes } from '@stablelib/random'


export async function getProvider(): Promise<DIDProvider> {
  //const ethProvider = await web3Modal.connect() //our own stuff
  
  //const seed = randomBytes(32)

  const authId = 'localsession' // a name of the auth method, use NuCypher for this?
  const authSecret = randomBytes(32)

  const getPermission = async (request) => {
    return request.payload.paths
  }

/*
const getPermission = {
  type: 'authenticate',
  origin: 'https://creaton.io',
  payload: {
      paths: ['/path/1', '/path/2']
  }
}*/

  // @ts-ignore
  const threeId = await ThreeIdProvider.create({ getPermission, authSecret, authId })

  return threeId.getDidProvider()
}
