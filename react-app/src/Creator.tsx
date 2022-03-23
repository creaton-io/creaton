import {useParams} from 'react-router-dom';
import React, {CSSProperties, useContext, useEffect, useState} from 'react';
import Web3Modal from 'web3modal';
import {useWeb3React} from './web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import {ApolloClient, gql, InMemoryCache, useQuery} from '@apollo/client';
import {SuperfluidContext} from './Superfluid';
import {parseUnits} from '@ethersproject/units';
import {wad4human} from '@decentral.ee/web3-helpers';
import {defaultAbiCoder} from '@ethersproject/abi';
import creaton_contracts from './Contracts';
import {useCurrentCreator} from './Utils';
//import {TextileContext} from "./TextileProvider";
import {LitContext} from './LitProvider';
import {Base64} from 'js-base64';
import {Contract, ethers} from 'ethers';
import {NotificationHandlerContext} from './ErrorHandler';
import {VideoPlayer} from './VideoPlayer';
import {Button} from './elements/button';
import {Card} from './components/card';
import {Avatar} from './components/avatar';
import {REPORT_URI, REACTION_ERC20, REACTION_CONTRACT_ADDRESS, MODERATION_ENABLED, CREATE_TOKEN_ADDRESS, ARWEAVE_URI, ARWEAVE_GATEWAY} from './Config';
import {Web3UtilsContext} from './Web3Utils';
import {Link} from 'react-router-dom';
import LitJsSdk from 'lit-js-sdk';
import {Player} from '@lottiefiles/react-lottie-player';
import {Splash} from './components/splash';
import {BICONOMY_API, BICONOMY_AUTH} from './Config';
import { ConstantFlowAgreementV1Helper } from '@superfluid-finance/js-sdk';
import ScriptTag from 'react-script-tag';
import {captureRejectionSymbol} from 'stream';
import CyberConnect, {Env, Blockchain} from '@cyberlab/cyberconnect';

let web3Modal = new Web3Modal({
  network: 'polygon',
  cacheProvider: true,
});

let ethersProvider;
let cyberConnect;

function connect() {
  return new Promise((resolve, reject) => {
    web3Modal
      .connect()
      .then((modalProvider) => {
        ethersProvider = new Web3Provider(modalProvider);
        cyberConnect = new CyberConnect({
          provider: ethersProvider.provider,
          namespace: 'Creaton',
          chain: Blockchain.ETH,
          env: Env.PRODUCTION,
        });
        resolve(cyberConnect);
      })
      .catch(reject);
  });
}

connect();

interface params {
  id: string;
}

export function Creator() {
  let {id} = useParams<params>();
  const creatorContractAddress = id;

  const CONTENTS_QUERY = gql`
    query GET_CONTENTS($user: Bytes!) {
      contents(orderBy: date, orderDirection: desc, where: {creatorContract: $user}) {
        id
        name
        type
        description
        date
        ipfs
        tokenId
        tier
        hide
        link
        reported {
          id
          reporters
        }
      }
    }
  `;
  const SUBSCRIPTION_QUERY = gql`
    query GET_SUBSCRIPTION_STATUS($user: Bytes!, $creator: Bytes!) {
      subscribers(where: {user: $user, creatorContract: $creator}) {
        status
      }
    }
  `;
  const CONTRACT_INFO_QUERY = gql`
    query GET_CONTRACT($contractAddress: Bytes!) {
      creators(where: {creatorContract: $contractAddress}) {
        id
        user
        creatorContract
        description
        subscriptionPrice
        timestamp
        profile {
          data
        }
      }
    }
  `;
const REACTIONS_QUERY = gql`
query($nftAddress: Bytes!) {
  reactions(where: {reactionRecipientAddress: $nftAddress}) {
    id
    amount,
    reactionRecipientAddress,
    tokenId
    reactingUser {
      address
    }
  }
}
`;

  const FOLLOWERS_INFO_QUERY = gql`
    query GET_FOLLOWERS($walletAddress: String!) {
      identity(address: $walletAddress) {
        address
        followerCount(namespace: "Creaton")
        followingCount(namespace: "Creaton")
        followers {
          list {
            address
          }
        }
        followings {
          list {
            address
          }
        }
      }
    }
  `;

  const followersQuery = useQuery(FOLLOWERS_INFO_QUERY, {
    variables: {walletAddress: id},
    context: {clientName: 'cyberConnect'},
  });

  //const textile = useContext(TextileContext)
  const litNode = useContext(LitContext);
  const notificationHandler = useContext(NotificationHandlerContext);
  const web3utils = useContext(Web3UtilsContext);
  const context = useWeb3React<Web3Provider>();

  let isFollowing = false;
  followersQuery?.data?.identity?.followers?.list?.map((item) => {
    if (item.address === context.account) {
      isFollowing = true;
    }
    return;
  });

  const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {user: creatorContractAddress}, pollInterval: 10000});
  function updateContentsQuery() {
    //updateReactions(creatorContractAddress);
    contentsQuery.refetch({user: creatorContractAddress});
    console.log('"smart" refetch was run');
  }
  const contractQuery = useQuery(CONTRACT_INFO_QUERY, {variables: {contractAddress: creatorContractAddress}});
  const subscriptionQuery = useQuery(SUBSCRIPTION_QUERY, {
    variables: {
      user: context.account,
      creator: creatorContractAddress,
    },
    pollInterval: 10000,
  });

  const superfluid = useContext(SuperfluidContext);
  const [usdcx, setUsdcx] = useState(0);
  const {currentCreator} = useCurrentCreator();

  const [reactions, setReactions] = useState<Array<any>>();
  const [reactionErc20Available, setReactionErc20Available] = useState<string>();
  const [reactionErc20Symbol, setReactionErc20Symbol] = useState<string>();
  const [reportErc20Available, setReportErc20Available] = useState<string>();
  const [reportErc20Symbol, setReportErc20Symbol] = useState<string>();

  async function getUsdcx() {
    if (!superfluid) return;
    let {usdcx} = superfluid;
    let subscriber = context.account;
    if (!subscriber) return;
    setUsdcx(wad4human(await usdcx.balanceOf(subscriber)));
  }

  useEffect(() => {
    getUsdcx();
  }, [context, superfluid]);
  const [downloadStatus, setDownloadStatus] = useState({});
  const [downloadCache, setDownloadCache] = useState({});
  const [subscription, setSubscription] = useState('unsubscribed');
  const [isSelf, setIsSelf] = useState(false);
  useEffect(() => {
    if (currentCreator) {
      setIsSelf(currentCreator.creatorContract === creatorContractAddress);
    }
    if (subscriptionQuery.data) {
      if (subscriptionQuery.data.subscribers.length > 0) setSubscription(subscriptionQuery.data.subscribers[0].status);
      else setSubscription('unsubscribed');
    }
  }, [subscriptionQuery, context]);
  //let isSelf = currentCreator && currentCreator.creatorContract === creatorContractAddress;

  const canDecrypt = isSelf || subscription === 'subscribed';

  useEffect(() => {
    if (contentsQuery.loading || contentsQuery.error) return;
    //if (!textile) return;
    if (!canDecrypt) return;
    const contents = contentsQuery.data.contents;
    if (Object.keys(downloadStatus).length === 0 || !contents) return;
    if (contents.some((x) => downloadStatus[x.ipfs] === 'downloading')) {
      console.log('already downloading some stuff');
      return;
    }
    for (let content of contents) {
      if (content.tier == 0) continue;
      if (downloadStatus[content.ipfs] === 'pending') {
        setDownloadStatus({...downloadStatus, [content.ipfs]: 'downloading'});
        decrypt(content)
          .then((decrypted) => {
            //console.log('decrypted promise result', decrypted)
            if (decrypted !== undefined) {
              const blob = new Blob([decrypted], {type: content.type});
              const url = window.URL.createObjectURL(blob);
              setDownloadCache({...downloadCache, [content.ipfs]: url});
              setDownloadStatus({...downloadStatus, [content.ipfs]: 'cached'});
            }
          })
          .catch((e) => {
            console.log(e);
            setDownloadStatus({...downloadStatus, [content.ipfs]: 'error'});
          });
        break;
      }
    }
  }, [downloadStatus, canDecrypt]);
  
  useEffect(() => {
    (async function iife() {
      if(!context.library) return;
      const signer = context.library.getSigner()
      const userAddress = await signer.getAddress();

      const erc20Contract: Contract = new Contract(REACTION_ERC20, creaton_contracts.erc20.abi, signer);
      setReactionErc20Available((await erc20Contract.balanceOf(userAddress)).toString());
      setReactionErc20Symbol(await erc20Contract.symbol());

      const erc20Contract2: Contract = new Contract(CREATE_TOKEN_ADDRESS, creaton_contracts.erc20.abi, signer);
      setReportErc20Available((await erc20Contract2.balanceOf(userAddress)).toString());
      setReportErc20Symbol(await erc20Contract2.symbol());
    })();
  }, [contentsQuery, creatorContractAddress, context.library]);
  
  const reactionsQuery = useQuery(REACTIONS_QUERY, {
    variables: {'nftAddress': creatorContractAddress},
    pollInterval: 10000,
  });

  useEffect(() => {
    if (reactionsQuery.data) {
      setReactions(reactionsQuery.data.reactions);    
    }
  }, [reactionsQuery, context]);

  async function addGasless() {
    // const addContractData = new URLSearchParams({
    //   contractName: 'creator' + creatorContractAddress.slice(2, 6),
    //   contractAddress: creatorContractAddress,
    //   abi: JSON.stringify(creaton_contracts.Creator.abi),
    //   contractType: 'SC',
    //   metaTransactionType: 'TRUSTED_FORWARDER',
    // });

    // fetch('https://api.biconomy.io/api/v1/smart-contract/public-api/addContract', {
    //   method: 'POST', // or 'PUT'
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //      authToken: BICONOMY_AUTH,
    //      apiKey: BICONOMY_API,
    //   },
    //   body: addContractData,
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log('Success:', data);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });

    //creatonadmin 0x9AF8d7C5F8A0b6b759DF2a44f379B611849593cb
    // sf 0xEB796bdb90fFA0f28255275e16936D25d3418603
    //const superfluidABI = [{"inputs":[{"internalType":"bool","name":"nonUpgradable","type":"bool"},{"internalType":"bool","name":"appWhiteListingEnabled","type":"bool"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"agreementType","type":"bytes32"},{"indexed":false,"internalType":"address","name":"code","type":"address"}],"name":"AgreementClassRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"agreementType","type":"bytes32"},{"indexed":false,"internalType":"address","name":"code","type":"address"}],"name":"AgreementClassUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract ISuperApp","name":"app","type":"address"}],"name":"AppRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"uuid","type":"bytes32"},{"indexed":false,"internalType":"address","name":"codeAddress","type":"address"}],"name":"CodeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract ISuperfluidGovernance","name":"oldGov","type":"address"},{"indexed":false,"internalType":"contract ISuperfluidGovernance","name":"newGov","type":"address"}],"name":"GovernanceReplaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract ISuperApp","name":"app","type":"address"},{"indexed":false,"internalType":"uint256","name":"reason","type":"uint256"}],"name":"Jail","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"contract ISuperTokenFactory","name":"newFactory","type":"address"}],"name":"SuperTokenFactoryUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract ISuperToken","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"code","type":"address"}],"name":"SuperTokenLogicUpdated","type":"event"},{"inputs":[],"name":"APP_WHITE_LISTING_ENABLED","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CALLBACK_GAS_LIMIT","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_APP_LEVEL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NON_UPGRADABLE_DEPLOYMENT","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"bitmap","type":"uint256"},{"internalType":"bytes32","name":"agreementType","type":"bytes32"}],"name":"addToAgreementClassesBitmap","outputs":[{"internalType":"uint256","name":"newBitmap","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"targetApp","type":"address"}],"name":"allowCompositeApp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"ctx","type":"bytes"},{"internalType":"int256","name":"appAllowanceUsedDelta","type":"int256"}],"name":"appCallbackPop","outputs":[{"internalType":"bytes","name":"newCtx","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"ctx","type":"bytes"},{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"uint256","name":"appAllowanceGranted","type":"uint256"},{"internalType":"int256","name":"appAllowanceUsed","type":"int256"},{"internalType":"contract ISuperfluidToken","name":"appAllowanceToken","type":"address"}],"name":"appCallbackPush","outputs":[{"internalType":"bytes","name":"appCtx","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"operationType","type":"uint32"},{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ISuperfluid.Operation[]","name":"operations","type":"tuple[]"}],"name":"batchCall","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperAgreement","name":"agreementClass","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"callAgreement","outputs":[{"internalType":"bytes","name":"returnedData","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperAgreement","name":"agreementClass","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bytes","name":"userData","type":"bytes"},{"internalType":"bytes","name":"ctx","type":"bytes"}],"name":"callAgreementWithContext","outputs":[{"internalType":"bytes","name":"newCtx","type":"bytes"},{"internalType":"bytes","name":"returnedData","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"}],"name":"callAppAction","outputs":[{"internalType":"bytes","name":"returnedData","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bytes","name":"ctx","type":"bytes"}],"name":"callAppActionWithContext","outputs":[{"internalType":"bytes","name":"newCtx","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bool","name":"isTermination","type":"bool"},{"internalType":"bytes","name":"ctx","type":"bytes"}],"name":"callAppAfterCallback","outputs":[{"internalType":"bytes","name":"newCtx","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bool","name":"isTermination","type":"bool"},{"internalType":"bytes","name":"ctx","type":"bytes"}],"name":"callAppBeforeCallback","outputs":[{"internalType":"bytes","name":"cbdata","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"ctx","type":"bytes"},{"internalType":"uint256","name":"appAllowanceWantedMore","type":"uint256"},{"internalType":"int256","name":"appAllowanceUsedDelta","type":"int256"}],"name":"ctxUseAllowance","outputs":[{"internalType":"bytes","name":"newCtx","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"ctx","type":"bytes"}],"name":"decodeCtx","outputs":[{"components":[{"internalType":"uint8","name":"appLevel","type":"uint8"},{"internalType":"uint8","name":"callType","type":"uint8"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"msgSender","type":"address"},{"internalType":"bytes4","name":"agreementSelector","type":"bytes4"},{"internalType":"bytes","name":"userData","type":"bytes"},{"internalType":"uint256","name":"appAllowanceGranted","type":"uint256"},{"internalType":"uint256","name":"appAllowanceWanted","type":"uint256"},{"internalType":"int256","name":"appAllowanceUsed","type":"int256"},{"internalType":"address","name":"appAddress","type":"address"},{"internalType":"contract ISuperfluidToken","name":"appAllowanceToken","type":"address"}],"internalType":"struct ISuperfluid.Context","name":"context","type":"tuple"}],"stateMutability":"pure","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"operationType","type":"uint32"},{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ISuperfluid.Operation[]","name":"operations","type":"tuple[]"}],"name":"forwardBatchCall","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"agreementType","type":"bytes32"}],"name":"getAgreementClass","outputs":[{"internalType":"contract ISuperAgreement","name":"agreementClass","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"appAddr","type":"address"}],"name":"getAppLevel","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"}],"name":"getAppManifest","outputs":[{"internalType":"bool","name":"isSuperApp","type":"bool"},{"internalType":"bool","name":"isJailed","type":"bool"},{"internalType":"uint256","name":"noopMask","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCodeAddress","outputs":[{"internalType":"address","name":"codeAddress","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGovernance","outputs":[{"internalType":"contract ISuperfluidGovernance","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSuperTokenFactory","outputs":[{"internalType":"contract ISuperTokenFactory","name":"factory","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSuperTokenFactoryLogic","outputs":[{"internalType":"address","name":"logic","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidGovernance","name":"gov","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperAgreement","name":"agreementClass","type":"address"}],"name":"isAgreementClassListed","outputs":[{"internalType":"bool","name":"yes","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"agreementType","type":"bytes32"}],"name":"isAgreementTypeListed","outputs":[{"internalType":"bool","name":"yes","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"}],"name":"isApp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"}],"name":"isAppJailed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"contract ISuperApp","name":"targetApp","type":"address"}],"name":"isCompositeAppAllowed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"ctx","type":"bytes"}],"name":"isCtxValid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"ctx","type":"bytes"},{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"uint256","name":"reason","type":"uint256"}],"name":"jailApp","outputs":[{"internalType":"bytes","name":"newCtx","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"bitmap","type":"uint256"}],"name":"mapAgreementClasses","outputs":[{"internalType":"contract ISuperAgreement[]","name":"agreementClasses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"contract ISuperAgreement","name":"agreementClassLogic","type":"address"}],"name":"registerAgreementClass","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"configWord","type":"uint256"}],"name":"registerApp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperApp","name":"app","type":"address"},{"internalType":"uint256","name":"configWord","type":"uint256"}],"name":"registerAppByFactory","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"configWord","type":"uint256"},{"internalType":"string","name":"registrationKey","type":"string"}],"name":"registerAppWithKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"bitmap","type":"uint256"},{"internalType":"bytes32","name":"agreementType","type":"bytes32"}],"name":"removeFromAgreementClassesBitmap","outputs":[{"internalType":"uint256","name":"newBitmap","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidGovernance","name":"newGov","type":"address"}],"name":"replaceGovernance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperAgreement","name":"agreementClassLogic","type":"address"}],"name":"updateAgreementClass","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAddress","type":"address"}],"name":"updateCode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperTokenFactory","name":"newFactory","type":"address"}],"name":"updateSuperTokenFactory","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperToken","name":"token","type":"address"}],"name":"updateSuperTokenLogic","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"versionRecipient","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"}]

    // const addMethodSFData = {
    //   apiType: 'native',
    //   methodType: 'write',
    //   name: 'stream',
    //   contractAddress: '0xEB796bdb90fFA0f28255275e16936D25d3418603',
    //   method: 'forwardBatchCall',
    // };

    const addMethodData = {
      apiType: 'native',
      methodType: 'write',
      name: 'upload' + creatorContractAddress.slice(2, 6),
      contractAddress: creatorContractAddress,
      method: 'upload',
    };

    fetch('https://api.biconomy.io/api/v1/meta-api/public-api/addMethod', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authToken: BICONOMY_AUTH,
        apiKey: BICONOMY_API,
      },
      body: new URLSearchParams(addMethodData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    if(!context.library) return;
    const signer = context.library.getSigner()
    const walletAddress = await signer.getAddress();

    const signedMessage = await signer.signMessage(`Creaton: Enabling gasless transactions for ${walletAddress}`);
    const response = await fetch(`http://localhost:3333/gasless`, {
      method: "post",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({signedMessage, walletAddress, creatorContractAddress})
    });
  }

  async function mint() {
    let {sf, usdc, usdcx} = superfluid;
    let subscriber = context.account;
    console.log('minted', wad4human(await usdc.balanceOf(subscriber)), 'usdc');
    const tx = await usdc.mint(subscriber, parseUnits('1000', 18), {from: subscriber});
    await tx.wait();
    console.log('this is mint tx', tx);
    console.log('minted', wad4human(await usdc.balanceOf(subscriber)), 'usdc');
  }

  async function approveUSDC() {
    let {sf, usdc, usdcx} = superfluid;
    let subscriber = context.account;
    console.log('approved', wad4human(await usdc.allowance(subscriber, usdcx.address)), 'usdc');
    const tx = await usdc.approve(usdcx.address, parseUnits('1800', 18), {from: subscriber});
    await tx.wait();
    console.log('approved', wad4human(await usdc.allowance(subscriber, usdcx.address)), 'usdc');
  }

  async function convertUSDCx() {
    let {sf, usdc, usdcx} = superfluid;
    let subscriber = context.account;
    console.log('converted', wad4human(await usdcx.balanceOf(subscriber)), 'usdc to usdcx');
    const tx = await usdcx.upgrade(parseUnits('900', 18), {from: subscriber});
    await tx.wait();
    let usdcxBalance = wad4human(await usdcx.balanceOf(subscriber));
    setUsdcx(usdcxBalance);
    console.log('converted', usdcxBalance, 'usdc to usdcx');
  }

  async function startStreaming() {
    let call;
    const contract = contractQuery.data.creators[0];
    let MINIMUM_FLOW_RATE = parseUnits(contract.subscriptionPrice, 18).div(3600 * 24 * 30);
    let {sf, usdc, usdcx} = await superfluid;
    let subscriber = context.account;
    const creatorContract = new Contract(creatorContractAddress, creaton_contracts.Creator.abi).connect(
      context.library!.getSigner()
    );
    call = [
      [
        1, // approve the ticket fee
        usdcx.address,
        defaultAbiCoder.encode(
          ['address', 'uint256'],
          [creatorContractAddress, parseUnits(contract.subscriptionPrice, 18).toString()]
        ),
      ],
      [
        202, // callAppAction to participate
        creatorContractAddress,
        creatorContract.interface.encodeFunctionData('upfrontFee', ['0x']),
        //app.contract.methods.upfrontFee("0x").encodeABI()
        //defaultAbiCoder.encode(['address', 'uint256'], [contractAddress, parseEther('10')]
      ],
      [
        201, // create constant flow (10/mo)
        sf.agreements.cfa.address,
        defaultAbiCoder.encode(
          ['bytes', 'bytes'],
          [
            sf.agreements.cfa.contract.methods
              .createFlow(usdcx.address, creatorContractAddress, MINIMUM_FLOW_RATE.toString(), '0x')
              .encodeABI(),
            defaultAbiCoder.encode(['string'], ['']),
          ]
        ),
      ],
    ];
    const tx = await sf.host.batchCall(call, {from: subscriber});
    web3utils.setIsWaiting(true);
    await tx.wait(1);
    web3utils.setIsWaiting(false);
    console.log('subscribed');
  }

  async function stopStreaming() {
    let {sf, usdc, usdcx} = await superfluid;

    const tx = await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .deleteFlow(usdcx.address, context.account, creatorContractAddress, "0x")
        .encodeABI(),
      "0x",
      { from: context.account }
    );
    web3utils.setIsWaiting(true);
    await tx.wait(1);
    web3utils.setIsWaiting(false);

    console.log('unsubscribed');
  }

  async function decrypt(content) {
    //if (content.ipfs.startsWith('/ipfs'))
    //  encObject = await textile!.downloadEncryptedFile(content.ipfs)
    //else {//handle arweave

    const encryptedZipBlob = await (await fetch('https://arweave.net/' + content.ipfs)).blob();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'mumbai'});

    let {decryptedFile} = await LitJsSdk.decryptZipFileWithMetadata({
      authSig: authSig,
      file: encryptedZipBlob,
      litNodeClient: litNode,
    });

    let files = await decryptedFile;
    return files;
  }

  if (contentsQuery.loading || contractQuery.loading) {
    return <Splash src="https://assets5.lottiefiles.com/packages/lf20_bkmfzg9t.json"></Splash>;
  }
  if (contentsQuery.error || contractQuery.error) {
    return <div>{contentsQuery.error}</div>;
  }
  const contents = contentsQuery.data.contents;
  if (Object.keys(downloadStatus).length === 0 && contents.length > 0) {
    const status = {};
    contents.forEach((x) => {
      status[x.ipfs] = 'pending';
    });
    console.log('setting download status', status);
    setDownloadStatus(status);
  }
  const contract = contractQuery.data.creators[0];

  function getSrc(content) {
    let src;
    if (content.tier === 0) src = 'https://arweave.net/' + content.ipfs;
    else {
      if (downloadStatus[content.ipfs] !== 'cached') return;
      src = downloadCache[content.ipfs];
    }
    return src;
  }

  function showContent(content) {
    let src;
    if (content.tier === 0) src = 'https://arweave.net/' + content.ipfs;
    else {
      if (downloadStatus[content.ipfs] !== 'cached') return;
      src = 'data:' + content.type + ';base64, ' + Base64.fromUint8Array(downloadCache[content.ipfs]);
    }
    if (content.type.startsWith('image')) {
      return <img style={{maxWidth: '150px'} as CSSProperties} src={src} />;
    } else if (content.type.startsWith('video')) {
      return <video controls style={{maxWidth: '300px'} as CSSProperties} src={src} />;
    } else if (content.type === 'application/vnd.apple.mpegurl') {
      return <VideoPlayer url={src} />;
    }
  }

  function showItem(content) {
    let src = getSrc(content);
    let fileType;
    console.log('showItem', isSelf);
    if (content.type.startsWith('image')) {
      fileType = 'image';
    } else if (content.type == 'text') {
      fileType = 'text';
    } else if (content.type.startsWith('application/vnd.apple.mpegurl')) {
      fileType = 'video';
    } else {
      fileType = 'image';
    }
    console.log(content);
    if (!content.hide || isSelf) {
      return (
        <React.Fragment>
          <Card
            key={content.ipfs}
            fileUrl={src || null}
            name={content.name}
            description={content.description}
            fileType={fileType}
            date={content.date}
            avatarUrl=""
            onReport={() => {
              report(content);
            }}
            isCreator={isSelf}
            hide={content.hide}
            onHide={() => {
              hide(content.tokenId, !content.hide);
            }}
            canDecrypt={canDecrypt}
            // reactionErc20Available={reactionErc20Available}
            // reactionErc20Symbol={reactionErc20Symbol}
            //onReact={(amount, callback) => { react(content, amount, callback) }}
            // hasReacted={hasReacted(content)}
            // initialReactCount={countReacted(content)}
            hasReported={hasReported(content)}
          />
          <iframe
            src={`https://theconvo.space/embed/dt?url=${new URL('https://creaton.io')}&threadId=${content.tokenId}`}
            style={{border: 'none', width: '100%'}}
          >
            Comments
          </iframe>
        </React.Fragment>
      );
    } else return;
  }

  async function subscribe() {
    if (!web3utils.isSignedUp()) return;
    const creatorContract = new Contract(creatorContractAddress, creaton_contracts.Creator.abi).connect(
      context.library!.getSigner()
    );
    const receipt = await creatorContract.subscribe();
    web3utils.setIsWaiting(true);
    await receipt.wait(1);
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({description: 'Sent subscription request', type: 'success'});
  }

  async function reportForModeration(content, amount, file, callback){
    if(!MODERATION_ENABLED) return;
    if (!web3utils.isSignedUp()) return;

    let arweave_id = '';
    let screenshot = '';
    if(file != undefined){
      web3utils.setIsWaiting('Uploading screenshot to Arweave...');
      const formData = new FormData();
      const buf = await file.arrayBuffer();
      let bytes = new Uint8Array(buf);
      formData.append(
        'file',
        new Blob([bytes], {
          type: file.type,
        })
      );
        
      const response = await fetch(ARWEAVE_URI + '/upload', {
        method: 'POST',
        body: formData,
      });
      arweave_id = await response.text();
      screenshot = ARWEAVE_GATEWAY + arweave_id;
      web3utils.setIsWaiting(false);
    }

    try {
      // Allowance
      const signer = context.library!.getSigner()
      const userAddress = await signer.getAddress();

      const erc20Contract: Contract = new Contract(CREATE_TOKEN_ADDRESS, creaton_contracts.erc20.abi, signer);

      const preDecimals = await erc20Contract.decimals();
      const decimals = ethers.BigNumber.from(10).pow(preDecimals);
      const stakingAmount = ethers.BigNumber.from(amount).mul(decimals);

      const allowance = await erc20Contract.allowance(userAddress, creaton_contracts.moderation.address);
      if(stakingAmount.gt(allowance)){
        web3utils.setIsWaiting(true);
        let tx = await erc20Contract.approve(creaton_contracts.moderation.address, stakingAmount);
        await tx.wait();
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "Approval"})[0];
        if(receipt.length == 0){
          throw Error('Error allowing token for moderation');
        }
      }

      web3utils.setIsWaiting(true);
      const moderationTokenContract: Contract = new Contract(creaton_contracts.moderation.address, creaton_contracts.moderation.abi).connect(context.library!.getSigner());
      await moderationTokenContract.reportContent(content.id, stakingAmount, screenshot);
      moderationTokenContract.once("ContentReported", async (reporter, contentId, staked, fileProof) => {
        web3utils.setIsWaiting(false);
        notificationHandler.setNotification({description: 'Thanks for reporting!', type: 'success'});
        callback();
      });
    } catch (error: any) {
      notificationHandler.setNotification({description: 'Could not react to the content' + error.message, type: 'error'});
    }
  }

  /*
  async function react(content, amount, callback) {
    if (!web3utils.isSignedUp()) return;

    try {
      // Allowance
      const signer = context.library!.getSigner()
      const userAddress = await signer.getAddress();

      const erc20Contract: Contract = new Contract(REACTION_ERC20, creaton_contracts.erc20.abi, signer);

      const preDecimals = await erc20Contract.decimals();
      const decimals = ethers.BigNumber.from(10).pow(preDecimals);
      const stakingAmount = ethers.BigNumber.from(amount).mul(decimals);

      const allowance = await erc20Contract.allowance(userAddress, REACTION_CONTRACT_ADDRESS);
      if(stakingAmount.gt(allowance)){
        let tx = await erc20Contract.approve(REACTION_CONTRACT_ADDRESS, stakingAmount);
        await tx.wait();
        let receipt = await tx.wait();
        receipt = receipt.events?.filter((x: any) => {return x.event == "Approval"})[0];
        if(receipt.length == 0){
          throw Error('Error allowing token for reaction');
        }
      }
      const reactionTokenContract: Contract = new Contract(REACTION_CONTRACT_ADDRESS, creaton_contracts.ReactionToken.abi).connect(context.library!.getSigner());

      await reactionTokenContract.stakeAndMint(stakingAmount.toString(), REACTION_ERC20, creatorContractAddress, content.tokenId);
      reactionTokenContract.once("Staked", async (author, amount, stakingTokenAddress, stakingSuperTokenAddress) => {
        updateContentsQuery();
        callback();
      });
    } catch (error: any) {
      notificationHandler.setNotification({description: 'Could not react to the content' + error.message, type: 'error'});
    }
  }*/

  function countReacted(content): string {
    if (!reactions) return '0';
    const count = reactions
      .filter((r) => r.tokenId === content.tokenId)
      .reduce((sum, current) => sum + +current.amount, 0);
    return ethers.utils.formatEther(count.toLocaleString('fullwide', {useGrouping: false}));
  }
  function hasReacted(content) {
    if (!reactions) return false;
    return reactions.some((r) => r.tokenId === content.tokenId && r.user.address === context.account?.toLowerCase());
  }

  function hasReported(content){
    if(content.reported.length == 0) return false;
    return (content.reported[0].reporters.indexOf(context.account?.toLowerCase()) >= 0);
  }

  async function hide(tokenId, hide: boolean) {
    if (!web3utils.isSignedUp()) return;
    const creatorContract = new Contract(creatorContractAddress, creaton_contracts.Creator.abi).connect(
      context.library!.getSigner()
    );
    const receipt = await creatorContract.hidePost(tokenId, hide);
    web3utils.setIsWaiting(true);
    await receipt.wait(1);
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({
      description: hide ? 'Content hidden from public or subscribers' : 'Content visible again',
      type: 'success',
    });
  }

  async function report(content) {
    if (!web3utils.isSignedUp()) return;
    try {
      const message =
        'I want to report the content with token id ' +
        content.tokenId +
        ' in contract ' +
        creatorContractAddress +
        ' on the Creaton platform.';
      const signature = await context.library!.getSigner().signMessage(message);
      const response = await fetch(REPORT_URI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: signature,
          tokenId: content.tokenId,
          contract: creatorContractAddress,
          signer: context.account,
        }),
      });
      await response;
      notificationHandler.setNotification({
        description: 'Content reported. Thanks for contributing to the platform :)',
        type: 'success',
      });
    } catch (error: any) {
      notificationHandler.setNotification({description: 'Could not report content' + error.message, type: 'error'});
    }
  }

  function generateButton() {
    let isSelf = currentCreator && currentCreator.creatorContract === creatorContractAddress;

    return (
      <div>
        {subscription === 'unsubscribed' && !isSelf && (
          <Button
            onClick={() => {
              startStreaming();
            }}
            label={'Start $' + contract.subscriptionPrice + ' Subscription'}
          />
        )}
        {subscription === 'subscribed' && !isSelf && (
          <Button
            onClick={() => {
              stopStreaming();
            }}
            label="Stop Subscription"
          />
        )}
      </div>
    );
  }

  function getCoverPhotoUrl() {
    let cover_url = JSON.parse(contractQuery.data.creators[0].profile.data).cover;
    if (!cover_url)
      cover_url = 'https://cdn.discordapp.com/attachments/790997156353015868/839540529992958012/banner.png';
    return 'url(' + cover_url + ')';
  }

  return (
    <div>
      {/* <StickyHeader name={contractQuery.data.creators[0].profile !== null ? JSON.parse(contractQuery.data.creators[0].profile.data).username : contractQuery.data.creators[0].id} src={ contractQuery.data.creators[0].profile !== null ? JSON.parse(contractQuery.data.creators[0].profile.data).image : ""} button={generateButton()}/> */}
      <div className="relative w-full h-20 sm:h-40 bg-cover bg-center bg-gradient-to-b from-purple-500 to-purple-700 filter drop-shadow-xl">
        <div className="object-cover w-20 h-20 rounded-full my-5 mx-auto block absolute left-1/2 -translate-x-1/2 transform -bottom-20 blur-none">
          <div className="absolute p-0.5 -top-1">
            <Avatar
              size="profile"
              src={
                contractQuery.data.creators[0].profile !== null
                  ? JSON.parse(contractQuery.data.creators[0].profile.data).image
                  : ''
              }
            />
          </div>
        </div>
        <Link
          to="/signup"
          className="sm:hidden fixed right-0 filter scale-125 border-transparent text-green-500 hover:text-green-700 hover:border-green-300 w-1/5 py-5 px-1 text-center border-b-2 font-medium text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 m-auto hover-tab p-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
      <div className="flex flex-col max-w-5xl my-0 pt-20 mx-auto text-center py-5 text-center">
        <h3 className="text-l font-bold text-white">
          {contractQuery.data.creators[0].profile !== null
            ? JSON.parse(contractQuery.data.creators[0].profile.data).username
            : contractQuery.data.creators[0].id.slice(0, 6)}
        </h3>
        <h3 className="text-l text-white">{contractQuery.data.creators[0].description}</h3>
        <h1 className="text-white">Followers {followersQuery?.data?.identity?.followerCount} | Following {followersQuery?.data?.identity?.followingCount}</h1>

        <div className="my-5 mx-auto max-w-lg w-2/5 sm:w-1/5 space-y-5">
          {generateButton()}
          { !isSelf &&
          <Button
            onClick={
              !isFollowing
                ? () => cyberConnect.connect(context.account)
                : () => cyberConnect.disconnect(context.account)
            }
            label={isFollowing ? 'Unfollow' : 'Follow'}
          />
          }

          {context.chainId === 80000 && (
            <span>
              <div className="flex space-x-5">
                <Button
                  onClick={() => {
                    mint();
                  }}
                  label="Mint"
                  theme="secondary-2"
                />
                <Button
                  onClick={() => {
                    approveUSDC();
                  }}
                  label="Approve"
                  theme="secondary-2"
                />
              </div>

              <Button
                onClick={() => {
                  convertUSDCx();
                }}
                label="Upgrade"
              />

              <Button
                onClick={() => {
                  addGasless();
                }}
                label="Enable no gas!"
                theme="secondary-2"
              />
            </span>
          )}
        </div>

        <h1 className="mb-5 text-2xl font-bold text-white">
          {contents.length === 0 ? 'No posts yet!' : 'Latest posts'}
        </h1>
        <div className="py-5">
          {
            //reactions &&
            contents.map((x) => showItem(x))
          }
        </div>
      </div>
    </div>
  );
}
