import { initializeConnector } from '@web3-react/core'
import { Actions } from '@web3-react/types';
import { WalletConnect } from '@web3-react/walletconnect'
import { URLS } from '../chains'

export const [walletConnect, hooks] = initializeConnector(
  (actions) =>
    new WalletConnect(actions, {
      rpc: URLS,
    }),
  Object.keys(URLS).map((chainId) => Number(chainId))
)
