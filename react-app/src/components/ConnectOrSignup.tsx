import {useWeb3React} from '../web3-react/core';
import {Link} from 'react-router-dom';
import {Button} from '../elements/button';
import {Avatar} from './avatar';
import WalletModal from './walletModal';
import {useCurrentProfile} from '../Utils';

const ConnectOrSignup = ({onAvatarClick}) => {
  const {active, account} = useWeb3React();
  const {currentProfile} = useCurrentProfile();
  return (
    <>
      {currentProfile && account && !active ? (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            onAvatarClick();
          }}
        >
          <Avatar size="menu" src={currentProfile.image} />
        </a>
      ) : currentProfile && account && active ? (
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
            <Avatar size="menu" src={''} />
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
