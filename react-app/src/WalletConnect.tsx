import React from 'react';
import {Web3ReactProvider, useWeb3React, UnsupportedChainIdError} from './web3-react/core';
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector';
import {FrameConnector, UserRejectedRequestError as UserRejectedRequestErrorFrame} from '@web3-react/frame-connector';
import {Web3Provider} from '@ethersproject/providers';

// import { useEagerConnect, useInactiveListener } from '../hooks'
// import {
//   injected,
//   network,
//   walletconnect,
//   walletlink,
//   ledger,
//   trezor,
//   lattice,
//   frame,
//   authereum,
//   fortmatic,
//   magic,
//   portis,
//   torus
// } from '../connectors'

const RPC_URLS: {[chainId: number]: string} = {
  1: process.env.RPC_URL_1 as string,
  4: process.env.RPC_URL_4 as string,
};
const injected = new InjectedConnector({supportedChainIds: [1, 3, 4, 5, 42, 137, 80001]});
const walletconnect = new WalletConnectConnector({
  rpc: {1: RPC_URLS[1]},
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000,
});
const frame = new FrameConnector({supportedChainIds: [1]});

enum ConnectorNames {
  Injected = 'Injected',
  WalletConnect = 'WalletConnect',
  Frame = 'Frame',
}

const connectorsByName: {[connectorName in ConnectorNames]: any} = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.Frame]: frame,
};

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    error instanceof UserRejectedRequestErrorFrame
  ) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

function ChainId() {
  const {chainId} = useWeb3React();

  return (
    <>
      <span>Chain Id</span>
      <span role="img" aria-label="chain">
        ⛓
      </span>
      <span>{chainId ?? ''}</span>
    </>
  );
}

function Account() {
  const {account} = useWeb3React();

  return (
    <>
      <span>Account</span>
      <span role="img" aria-label="robot">
        🤖
      </span>
      <span>
        {account === null
          ? '-'
          : account
          ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
          : ''}
      </span>
    </>
  );
}

function Header() {
  return (
    <>
      <h3
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr min-content 1fr',
          maxWidth: '20rem',
          lineHeight: '2rem',
          margin: 'auto',
        }}
      >
        <ChainId />
        <Account />
      </h3>
    </>
  );
}

function WalletConnect() {
  const context = useWeb3React<Web3Provider>();
  const {connector, library, chainId, account, activate, deactivate, active, error} = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  // const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  // useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <>
      <Header />
      <hr style={{margin: '2rem'}} />
      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '20rem',
          margin: 'auto',
        }}
      >
        {Object.keys(connectorsByName).map((name) => {
          const currentConnector = connectorsByName[name];
          const activating = currentConnector === activatingConnector;
          const connected = currentConnector === connector;
          const disabled = !!activatingConnector || connected || !!error;

          return (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
                cursor: disabled ? 'unset' : 'pointer',
                position: 'relative',
              }}
              disabled={disabled}
              key={name}
              onClick={() => {
                setActivatingConnector(currentConnector);
                activate(connectorsByName[name]);
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                  margin: '0 0 0 1rem',
                }}
              >
                {activating && <span>Activating</span>}
                {connected && (
                  <span role="img" aria-label="check">
                    ✅
                  </span>
                )}
              </div>
              {name}
            </button>
          );
        })}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {(active || error) && (
          <button
            style={{
              height: '3rem',
              marginTop: '2rem',
              borderRadius: '1rem',
              borderColor: 'red',
              cursor: 'pointer',
            }}
            onClick={() => {
              deactivate();
            }}
          >
            Deactivate
          </button>
        )}

        {!!error && <h4 style={{marginTop: '1rem', marginBottom: '0'}}>{getErrorMessage(error)}</h4>}
      </div>

      <hr style={{margin: '2rem'}} />

      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: 'fit-content',
          maxWidth: '20rem',
          margin: 'auto',
        }}
      >
        {!!(library && account) && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => {
              library
                .getSigner(account)
                .signMessage('👋')
                .then((signature: any) => {
                  window.alert(`Success!\n\n${signature}`);
                })
                .catch((error: any) => {
                  window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''));
                });
            }}
          >
            Sign Message
          </button>
        )}
        {connector === connectorsByName[ConnectorNames.WalletConnect] && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => {
              (connector as any).close();
            }}
          >
            Kill WalletConnect Session
          </button>
        )}
      </div>
    </>
  );
}

export default function () {
  return <WalletConnect />;
}
