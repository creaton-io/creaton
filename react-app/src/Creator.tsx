import {useParams} from "react-router-dom";
import React, {CSSProperties, useContext, useEffect, useState} from "react";
import {useWeb3React} from "./web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {ApolloClient, gql, InMemoryCache, useQuery} from "@apollo/client";
import {SuperfluidContext} from "./Superfluid";
import {parseUnits} from '@ethersproject/units';
import {wad4human} from "@decentral.ee/web3-helpers";
import {defaultAbiCoder} from '@ethersproject/abi';
import creaton_contracts from "./Contracts";
import {useCurrentCreator} from "./Utils";
import {UmbralWasmContext} from "./UmbralWasm";
import {UmbralCreator, UmbralSubscriber} from "./Umbral";
import {TextileContext} from "./TextileProvider";
import {Base64} from "js-base64";
import {Contract, ethers} from "ethers";
import {NotificationHandlerContext} from "./ErrorHandler";
import {VideoPlayer} from "./VideoPlayer";
import {Button} from "./elements/button";
import {Card} from "./components/card";
import {StickyHeader} from './components/sticky-header';
import {Avatar} from "./components/avatar";
import {REACTIONS_GRAPHQL_URI, REPORT_URI, REACTION_CONTRACT_ADDRESS, REACTION_ERC20} from "./Config";
import {Web3UtilsContext} from "./Web3Utils";
import {
  Link
} from "react-router-dom";

interface params {
  id: string;
}

export function Creator() {
  let {id} = useParams<params>();
  const creatorContractAddress = id

  const CONTENTS_QUERY = gql`
      query GET_CONTENTS($user: Bytes!) {
      contents(orderBy: date, orderDirection: desc, where: { creatorContract: $user }) {
        name
        type
        description
        date
        ipfs
        tokenId
        tier
      }
    }
    `;
  const SUBSCRIPTION_QUERY = gql`
      query GET_SUBSCRIPTION_STATUS($user: Bytes!, $creator: Bytes!) {
      subscribers(where: { user: $user, creatorContract: $creator}) {
        status
      }
    }
    `;
  const CONTRACT_INFO_QUERY = gql`
      query GET_CONTRACT($contractAddress: Bytes!){
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

  const textile = useContext(TextileContext)
  const notificationHandler = useContext(NotificationHandlerContext)
  const web3utils = useContext(Web3UtilsContext)
  const context = useWeb3React<Web3Provider>()
  const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {user: creatorContractAddress}, pollInterval: 10000});
  function updateContentsQuery(){
    updateReactions(creatorContractAddress);
    contentsQuery.refetch({user:creatorContractAddress})
    console.log("\"smart\" refetch was run")
  }
  const contractQuery = useQuery(CONTRACT_INFO_QUERY, {variables: {contractAddress: creatorContractAddress}})
  const subscriptionQuery = useQuery(SUBSCRIPTION_QUERY, {
    variables: {
      user: context.account,
      creator: creatorContractAddress
    },
    pollInterval: 10000
  });

  const superfluid = useContext(SuperfluidContext);
  const umbralWasm = useContext(UmbralWasmContext)
  const [usdcx, setUsdcx] = useState(0)
  const {currentCreator} = useCurrentCreator()

  const [reactions, setReactions] = useState<Array<any>>();
  const [reactionErc20Available, setReactionErc20Available] = useState<string>();
  const [reactionErc20Symbol, setReactionErc20Symbol] = useState<string>();

  async function getUsdcx() {
    if (!superfluid)
      return;
    let {usdcx} = superfluid;
    let subscriber = context.account;
    if (!subscriber)
      return;
    setUsdcx(wad4human(await usdcx.balanceOf(subscriber)))
  }

  useEffect(() => {
    getUsdcx()
  }, [context, superfluid])
  const [downloadStatus, setDownloadStatus] = useState({})
  const [downloadCache, setDownloadCache] = useState({})
  const [subscription, setSubscription] = useState('unsubscribed')
  useEffect(() => {
    if (subscriptionQuery.data) {
      if (subscriptionQuery.data.subscribers.length > 0)
        setSubscription(subscriptionQuery.data.subscribers[0].status)
      else
        setSubscription("unsubscribed")
    }
  }, [subscriptionQuery, context])
  let isSelf = currentCreator && currentCreator.creatorContract === creatorContractAddress;
  const canDecrypt = (isSelf || subscription === 'subscribed')

  useEffect(() => {
    if (contentsQuery.loading || contentsQuery.error) return;
    //if (!textile) return;
    // if (!canDecrypt) return;
    // const contents = contentsQuery.data.contents;
    // if (Object.keys(downloadStatus).length === 0 || !contents) return;
    // if (umbralWasm === null) return;
    // if (contents.some((x) => downloadStatus[x.ipfs] === 'downloading')) {
    //   console.log('already downloading some stuff')
    //   return;
    // }
    // for (let content of contents) {
    //   if (content.tier == 0) continue;
    //   if (downloadStatus[content.ipfs] === 'pending') {
    //     setDownloadStatus({...downloadStatus, [content.ipfs]: 'downloading'})
    //     decrypt(content).then((decrypted) => {
    //       console.log('decrypted promise result', decrypted)
    //       setDownloadCache({...downloadCache, [content.ipfs]: decrypted})
    //       setDownloadStatus({...downloadStatus, [content.ipfs]: 'cached'})
    //     })
    //     break;
    //   }
    // }
  }, [downloadStatus, textile, canDecrypt])

  useEffect(() => {
    (async function iife() {
      if(!context.library) return;
      const signer = context.library.getSigner()
      const userAddress = await signer.getAddress();

      const erc20Contract: Contract = new Contract(REACTION_ERC20, creaton_contracts.erc20.abi, signer);
      setReactionErc20Available((await erc20Contract.balanceOf(userAddress)).toString());
      setReactionErc20Symbol(await erc20Contract.symbol());

      if(!creatorContractAddress) return;
      updateReactions(creatorContractAddress);
    })();
  }, [contentsQuery, creatorContractAddress, context.library]);

  async function updateReactions(nftAddress: string){
    const reactionsQuery = `
      query($nftAddress: Bytes!) {
        reactions(where: {reactionRecipientAddress: $nftAddress}) {
          id
          amount,
          reactionRecipientAddress,
          tokenId
          user {
            address
          }
        }
      }
    `;

    const client = new ApolloClient({
      uri: REACTIONS_GRAPHQL_URI,
      cache: new InMemoryCache()
    });

    const data = await client.query({query: gql(reactionsQuery), variables: {'nftAddress': nftAddress}});
    setReactions(data.data.reactions);
  }
  
  function downloadURL(data, fileName) {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }

  function downloadBlob(decrypted: Uint8Array, content) {
    const blob = new Blob([decrypted], {type: content.type});
    const url = window.URL.createObjectURL(blob);
    downloadURL(url, content.name);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
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
    const tx = await usdc.approve(usdcx.address, parseUnits('1800', 18), {from: subscriber,});
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
    setUsdcx(usdcxBalance)
    console.log('converted', usdcxBalance, 'usdc to usdcx');
  }

  async function startStreaming() {
    let call;
    const contract = contractQuery.data.creators[0]
    let MINIMUM_FLOW_RATE = parseUnits(contract.subscriptionPrice, 18).div(3600 * 24 * 30);
    let {sf, usdc, usdcx} = superfluid;
    let subscriber = context.account;
    call = [
      [
        201, // create constant flow (10/mo)
        sf.agreements.cfa.address,
        defaultAbiCoder.encode(
          ['bytes', 'bytes'],
          [
            sf.agreements.cfa.contract.methods.createFlow(
              usdcx.address,
              creatorContractAddress,
              MINIMUM_FLOW_RATE.toString(),
              '0x',
            ).encodeABI(),
            defaultAbiCoder.encode(
              ['string'],
              ['']
            )
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

  async function decrypt(content) {
    let encObject
    if (content.ipfs.startsWith('/ipfs'))
      encObject = await textile!.downloadEncryptedFile(content.ipfs)
    else {//handle arweave
      const response = await fetch('https://arweave.net/' + content.ipfs)
      encObject = await response.json()
    }
    if (isSelf) {
      const umbral = new UmbralCreator(umbralWasm, currentCreator!.creatorContract)
      await umbral.initMasterkey(context.library!.getSigner(context.account!), currentCreator!.creatorContract, true)
      return await umbral.decrypt(encObject.ciphertext, encObject.capsule)
    } else {
      const umbral = new UmbralSubscriber(umbralWasm)
      await umbral.initMasterkey(context.library!.getSigner(context.account!), context.account!, false)
      return await umbral.decrypt(encObject.ciphertext, encObject.capsule, encObject.signing_pk, encObject.alice_pk, creatorContractAddress)
    }
  }

  async function download(content) {
    let decrypted;
    if (downloadStatus[content.ipfs] === 'cached')
      decrypted = downloadCache[content.ipfs]
    else
      decrypted = await decrypt(content)
    if (decrypted)
      await downloadBlob(decrypted, content);
  }

  if (contentsQuery.loading || contractQuery.loading) {
    return (<div>Loading</div>)
  }
  if (contentsQuery.error || contractQuery.error) {
    return (<div>{contentsQuery.error}</div>)
  }
  const contents = contentsQuery.data.contents;
  if (Object.keys(downloadStatus).length === 0 && contents.length > 0) {
    const status = {}
    contents.forEach((x) => {
      status[x.ipfs] = 'pending';
    })
    console.log('setting download status', status)
    setDownloadStatus(status)
  }
  const contract = contractQuery.data.creators[0]

  function getSrc(content){
    let src
    if (content.tier === 0)
      src = 'https://arweave.net/' + content.ipfs
    else {
      if (downloadStatus[content.ipfs] !== 'cached') return;
      src = "data:" + content.type + ";base64, " + Base64.fromUint8Array(downloadCache[content.ipfs]);
    }
    return src;
  }

  function showContent(content) {
    let src
    if (content.tier === 0)
      src = 'https://arweave.net/' + content.ipfs
    else {
      if (downloadStatus[content.ipfs] !== 'cached') return;
      src = "data:" + content.type + ";base64, " + Base64.fromUint8Array(downloadCache[content.ipfs]);
    }
    if (content.type.startsWith('image')) {
      return (<img style={{'maxWidth': '150px'} as CSSProperties} src={src}/>)
    } else if (content.type.startsWith('video')) {
      return (<video controls style={{'maxWidth': '300px'} as CSSProperties} src={src}/>)
    } else if (content.type === 'application/vnd.apple.mpegurl') {
      return (
        <VideoPlayer url={src}/>
      )
    }
  }

  function showItem(content){
    let src = getSrc(content)

    let fileType;
    if (content.type.startsWith('image')) {
      fileType = "image";
    }else if (content.type == "text") {
      fileType = "text";
    }else{
      fileType = "video";
    }

    return <Card key={content.ipfs} fileUrl={src} name={content.name} description={content.description}
      fileType={fileType} date={content.date}
      avatarUrl="" onReport= {() => {report(content)}} 
      reactionErc20Available={reactionErc20Available}
      reactionErc20Symbol={reactionErc20Symbol}
      onReact={(amount, callback) => { react(content, amount, callback) }} 
      hasReacted={hasReacted(content)} 
      initialReactCount={countReacted(content)} />
  }

  async function subscribe() {
    if (!web3utils.isSignedUp()) return;
    const creatorContract = new Contract(creatorContractAddress, creaton_contracts.Creator.abi).connect(context.library!.getSigner());
    const umbral = new UmbralSubscriber(umbralWasm)
    await umbral.initMasterkey(context.library!.getSigner(context.account!), context.account, false)
    const result = umbral.getPublicKeyBase64()
    const receipt = await creatorContract.requestSubscribe(result)
    web3utils.setIsWaiting(true);
    await receipt.wait(1)
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({description: 'Sent subscription request', type: 'success'})
  }

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
  }

  function countReacted(content): string{
    if(!reactions) return '0';
    const count = reactions.filter((r) => (r.tokenId===content.tokenId))
                           .reduce((sum, current) => sum + +current.amount, 0);
    return ethers.utils.formatEther(count.toLocaleString('fullwide', {useGrouping:false}));
  }
  function hasReacted(content){
    if(!reactions) return false;
    return reactions.some((r)=>(r.tokenId===content.tokenId && r.user.address===context.account?.toLowerCase()));
  }

  async function report(content) {
    if (!web3utils.isSignedUp()) return;
    try {
      const message = "I want to report the content with token id " + content.tokenId + " in contract " +
        creatorContractAddress + " on the Creaton platform.";
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
          signer: context.account
        })
      })
      await response;
      notificationHandler.setNotification({
        description: 'Content reported. Thanks for contributing to the platform :)',
        type: 'success'
      });
    } catch (error: any) {
      notificationHandler.setNotification({description: 'Could not report content' + error.message, type: 'error'});
    }
  }

  function generateButton(){
    return (<div>{(subscription === 'unsubscribed' && !isSelf) && (<Button onClick={() => {
          subscribe()
        }} label="Subscribe"/>)}
        {(subscription === 'requested_subscribe' && !isSelf) && (<Button disabled={true} label="Subscription Requested"/>)}
        {(subscription === 'pending_subscribe') && (<Button onClick={() => {
          startStreaming()
        }} label="Start Subscription"/>)}</div>)
  }

  function getCoverPhotoUrl(){
    let cover_url = JSON.parse(contractQuery.data.creators[0].profile.data).cover
    if(!cover_url)
      cover_url="https://cdn.discordapp.com/attachments/790997156353015868/839540529992958012/banner.png"
    return "url("+cover_url+")"
  }

  return (
    <div>
    <StickyHeader name={contractQuery.data.creators[0].profile !== null ? JSON.parse(contractQuery.data.creators[0].profile.data).username : contractQuery.data.creators[0].id} src={ contractQuery.data.creators[0].profile !== null ? JSON.parse(contractQuery.data.creators[0].profile.data).image : ""} button={generateButton()}/>
    <div className="relative w-full h-20 sm:h-40 bg-cover bg-center bg-gradient-to-b from-purple-500 to-purple-700 filter drop-shadow-xl">
      <div className="object-cover w-20 h-20 rounded-full my-5 mx-auto block absolute left-1/2 -translate-x-1/2 transform -bottom-20 blur-none">
        <div className="absolute p-0.5 -top-1">
          <Avatar size="profile" src={contractQuery.data.creators[0].profile !== null ? JSON.parse(contractQuery.data.creators[0].profile.data).image : ""}/>
        </div>
      </div>
      <Link to="/signup" className="sm:hidden fixed right-0 filter scale-125 border-transparent text-green-500 hover:text-green-700 hover:border-green-300 w-1/5 py-5 px-1 text-center border-b-2 font-medium text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 m-auto hover-tab p-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
    <div className="flex flex-col max-w-5xl my-0 pt-20 mx-auto text-center py-5 text-center">
      <h3
        className="text-l font-bold text-white">{contractQuery.data.creators[0].profile !== null ? JSON.parse(contractQuery.data.creators[0].profile.data).username : contractQuery.data.creators[0].id}</h3>
 
      <div className="my-5 mx-auto max-w-lg w-2/5 sm:w-1/5 space-y-5">
        {generateButton()}

        {/*TODO add if statement if testnet <div className="flex space-x-5">*/}
        {/*    <Button onClick={() => {*/}
        {/*          mint()*/}
        {/*        }} label="Mint" theme='secondary-2'/>*/}
        {/*      */}
        {/*      <Button onClick={() => {*/}
        {/*        approveUSDC()*/}
        {/*      }} label="Approve" theme='secondary-2'/>*/}
        {/*  </div>*/}

        {/*<Button onClick={() => {*/}
        {/*  convertUSDCx()*/}
        {/*}} label="Upgrade"/>*/}
      </div>
      <h1 className="mb-5 text-2xl font-bold text-white">
        {
          contents.length === 0 ? "No posts yet!" : "Latest posts"
        }
      </h1>
      <div className="py-5">
        {reactions && 
          contents.map((x) => showItem(x))
        }
      </div>
    </div>
    </div>
  );
}
