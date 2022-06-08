import 'react-app-polyfill/ie11';
import {useWeb3React} from '@web3-react/core';
import {TransactionRequest, Web3Provider} from '@ethersproject/providers';
import {Contract} from 'ethers';
import creaton_contracts from './Contracts';
import {useCurrentCreator, useCurrentProfile} from './Utils';
import {useContext, useEffect, useState} from 'react';
import {NotificationHandlerContext} from './ErrorHandler';
import {Button} from './elements/button';
import {Input} from './elements/input';
import {Web3UtilsContext, Web3UtilsProviderContext} from './Web3Utils';
import {Transaction} from '@ethereumjs/tx';
import Common from '@ethereumjs/common';
import {Deferrable} from '@ethersproject/properties';
import { ProfileEdit } from './ProfileEdit';
import { BICONOMY_SIGNUP_ENABLED } from './Config';
import { useMetaTx } from './hooks/metatx';

const CreatonAdminContract = creaton_contracts.CreatonAdmin;

interface Values {
  creatorName: string;
  subscriptionPrice: number;
}

const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi);
const SignUp = () => {
  const web3utils = useContext(Web3UtilsContext);
  const notificationHandler = useContext(NotificationHandlerContext);
  const context = useWeb3React();
  const [signedup, setSignedup] = useState<any>(false);
  const {currentCreator} = useCurrentCreator();
  const {currentProfile} = useCurrentProfile();
  const {executeMetaTx} = useMetaTx();

  const [creatorName, setCreatorName] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState('5');
  const [collectionName, setCollectionName] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');
  const [errorMsg, setErrorMsg] = useState<any>();

  const CreatorContract = creaton_contracts.Creator;
  const {biconomyProvider, setBiconomyProvider} = useContext(Web3UtilsProviderContext);

  useEffect(() => {
    let error: any = undefined;
    if (!context.isActive) error = <div>Please connect your wallet</div>;
    if (currentCreator !== undefined) error = <div>Congratulation you just signed up on creaton!</div>;
    if (signedup) error = <div>{signedup}</div>;

    setErrorMsg(error);
  }, [context, currentCreator, signedup]);

  function submitForm(event) {
    event.preventDefault();

    if(BICONOMY_SIGNUP_ENABLED){
      executeMetaTx("CreatonAdmin", "deployCreator", [creatorName, subscriptionPrice, collectionName, collectionSymbol], undefined, async() => {
        web3utils.setIsWaiting(true);
        setSignedup('Waiting for your signup to be confirmed on the blockchain...');
        web3utils.setIsWaiting(false);
        notificationHandler.setNotification({
          description: 'Signed up successfully, welcome to Creaton!',
          type: 'success',
        });
      })
    }else{
      const provider = context.provider as Web3Provider;
      const connectedContract = creatorFactoryContract.connect(provider.getSigner());
      connectedContract
      .deployCreator(creatorName, subscriptionPrice, collectionName, collectionSymbol, {
        gasLimit: 3000000
      })
      .then(async function (response) {
        setSignedup('Waiting for your signup to be confirmed on the blockchain...');
        web3utils.setIsWaiting(true);
        await response.wait(1);
        web3utils.setIsWaiting(false);
        notificationHandler.setNotification({
          description: 'Signed up successfully, welcome to Creaton!',
          type: 'success',
        });
      })
      .catch(function (error) {
        notificationHandler.setNotification({description: 'Failed to signup. ' + error.message, type: 'error'});
      });
    }
  }

  return (
    <>
      {errorMsg}

      {!errorMsg && currentProfile === undefined ? <ProfileEdit /> : (
        <div className="grid grid-cols-1 place-items-center m-auto text-white">
          <p className="text-5xl pt-12 pb-6 pl-6">Sign Up As Creator!</p>
          <p className="text-xl opacity-50 pl-6">
            Setup your creator profile so you can upload content and start earning!
          </p>
          <form onSubmit={submitForm} className="py-10">
            <Input
              className="bg-gray-900"
              type="text"
              label="Bio"
              placeholder="Artist/Painter/..."
              value={creatorName}
              onChange={(event) => {
                setCreatorName(event.target.value);
              }}
            ></Input>

            <Input
              className="bg-gray-900"
              type="number"
              label="Subscription Price per Month"
              min="1"
              value={subscriptionPrice}
              onChange={(event) => {
                setSubscriptionPrice(event.target.value);
              }}
              tooltip="Each subscriber will stream this amount of USDC per month"
            ></Input>

            <Input
              className="bg-gray-900"
              type="text"
              label="Collection Name"
              placeholder="My exclusive content"
              value={collectionName}
              onChange={(event) => {
                setCollectionName(event.target.value);
              }}
              tooltip="This would be the name of your NFT contract"
            ></Input>

            <Input
              className="bg-gray-900"
              type="text"
              label="Collection Symbol"
              placeholder="MYART"
              value={collectionSymbol}
              onChange={(event) => {
                setCollectionSymbol(event.target.value);
              }}
              tooltip="This would be the symbol of your NFT contract"
            ></Input>

            <Button className="mt-6 py-3 mb-16" type="submit" label="Become a Creator"></Button>
          </form>
        </div>
      )}
    </>
  );
};

export default SignUp;
