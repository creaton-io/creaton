import { initializeConnector } from '@web3-react/core'
import { Magic } from '@web3-react/magic'

const customNodeOptions = {
  rpcUrl: 'https://polygon-rpc.com', // Polygon RPC URL
  chainId: 137 // Polygon chain id
}

export const [magic, hooks] = initializeConnector<Magic>((actions) => new Magic(actions, {apiKey: 'pk_live_55D93A0BD91B3D6E', network: customNodeOptions}));
