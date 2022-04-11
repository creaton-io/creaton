import {WalletConnectConnector} from '@web3-react/walletconnect-connector';
import {WCURLS} from '../chains';

export const walletConnect = new WalletConnectConnector({
  rpc: WCURLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});
