import {initializeConnector, useWeb3React, Web3ReactHooks} from '@web3-react/core';
import {Link} from 'react-router-dom';
import {Button} from '../elements/button';
import {Avatar} from './avatar';
import WalletModal from './walletModal';
import {useCurrentProfile} from '../Utils';
import { MetaMask } from '@web3-react/metamask';

const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask(actions))
const {  useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks


const ConnectOrSignup = ({
  onAvatarClick,
  isActivating,
  error,
}: {
  onAvatarClick,
  chainId?: ReturnType<Web3ReactHooks['useChainId']>
  isActivating?: ReturnType<Web3ReactHooks['useIsActivating']>
  error?: ReturnType<Web3ReactHooks['useError']>
}) => {
  const {currentProfile} = useCurrentProfile();
  const accounts = useAccounts();


  const {connector, account, chainId, isActive} = useWeb3React();

  return (
    <>
      {currentProfile === undefined && account !== undefined && isActive ? (
        <div className="hidden md:flex md:space-x-10 ml-auto">
          <Link to="/signup">
            <Button label="Make Profile"></Button>
          </Link>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
            }}
          >
          </a>
        </div>
      ) : currentProfile && account && !isActive ? (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            onAvatarClick();
          }}
        >
          <Avatar size="menu" src={currentProfile.image} />
        </a>
      ) : currentProfile && account && isActive ? (
        <div className="hidden md:flex md:space-x-10 ml-auto">
          <Link to="/signup">
            <Button label="Profile"></Button>
          </Link>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              onAvatarClick();
            }}
          >
            <Avatar size="menu" src={currentProfile.image} />
          </a>
        </div>
      ) : (
        <div>
          <WalletModal></WalletModal>
        </div>
      )}
    </>
  );
};

export default ConnectOrSignup;
