import {useHistory, useParams} from "react-router-dom";
import React, {CSSProperties, useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {gql, useQuery} from "@apollo/client";
import {SuperfluidContext} from "./Superfluid";
import {parseUnits} from '@ethersproject/units';
import {wad4human} from "@decentral.ee/web3-helpers";
import {defaultAbiCoder} from '@ethersproject/abi';
import creaton_contracts from "./contracts.json";
import {useCurrentCreator} from "./Utils";
import {UmbralWasmContext} from "./UmbralWasm";
import {UmbralCreator, UmbralSubscriber} from "./Umbral";
import {TextileContext} from "./TextileProvider";
import {Base64} from "js-base64";
import {Contract} from "ethers";
import {NotificationHandlerContext} from "./ErrorHandler";
import {VideoPlayer} from "./VideoPlayer";
import {Button} from "./elements/button";
import {Header} from "./elements/stickyHeader";
import {Card} from "./components/card";
import {Avatar} from "./components/avatar";
import {REPORT_URI} from "./Config";
import {Icon} from "./icons";
import {Web3UtilsContext} from "./Web3Utils";

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
        likes
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
    if (!textile) return;
    if (!canDecrypt) return;
    const contents = contentsQuery.data.contents;
    if (Object.keys(downloadStatus).length === 0 || !contents) return;
    if (umbralWasm === null) return;
    if (contents.some((x) => downloadStatus[x.ipfs] === 'downloading')) {
      console.log('already downloading some stuff')
      return;
    }
    for (let content of contents) {
      if (content.tier == 0) continue;
      if (downloadStatus[content.ipfs] === 'pending') {
        setDownloadStatus({...downloadStatus, [content.ipfs]: 'downloading'})
        decrypt(content).then((decrypted) => {
          console.log('decrypted promise result', decrypted)
          setDownloadCache({...downloadCache, [content.ipfs]: decrypted})
          setDownloadStatus({...downloadStatus, [content.ipfs]: 'cached'})
        })
        break;
      }
    }
  }, [downloadStatus, textile, canDecrypt])

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
    await tx.wait();
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
    return (<div>Error</div>)
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
    if (content.type.startsWith('image')) {
      if (src)
        return <Card key={content.ipfs} fileUrl={src} name={content.name} description={content.description}
                     fileType="image"
                     avatarUrl={JSON.parse(contractQuery.data.creators[0].profile.data).image} onLike={() => {
                      like(content) }} likeCount={content.likes} onReport= {() => {report(content)}}  />
    } else {
      return <Card key={content.ipfs} fileUrl={src} name={content.name} description={content.description}
                   fileType="video"
                   avatarUrl={JSON.parse(contractQuery.data.creators[0].profile.data).image} onLike={() => {
        like(content) }} likeCount={content.likes} onReport= {() => {report(content)}}  />
    }

    return <div  className="relative mb-5 h-80">
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-80 z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center  rounded-2xl border">
    <div className="border-gray-200 text-center text-white text-xl">
        <Icon size="5x" name="lock" />
    </div>
    <h3 className="w-1/3 text-center text-white mt-10">{content.name}</h3>
    <p className="w-1/3 text-center text-white mt-4">({content.description}): {(subscription !== 'subscribed' && content.tier > 0) && <span>Encrypted content, only subscribers can see this</span>}
            {subscription === 'subscribed' && (<div><span>Current Status: {downloadStatus[content.ipfs]}</span><button onClick={() => {
              like(content)
            }}>Like</button> {content.likes} likes </div>)} {showContent(content)}</p>
 
</div>
</div>
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

  async function like(content) {
    if (!web3utils.isSignedUp()) return;
    const creatorContract = new Contract(creatorContractAddress, creaton_contracts.Creator.abi).connect(context.library!.getSigner());
    try {
      let receipt = await creatorContract.like(content.tokenId, 1);
    } catch (error) {
      notificationHandler.setNotification({description: 'Could not like content' + error.message, type: 'error'});
    }
  }

  async function report(content) {
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
    } catch (error) {
      notificationHandler.setNotification({description: 'Could not report content' + error.message, type: 'error'});
    }
  }

  return (
    <div>
    <div className="relative bg-gray-300 w-full h-40 -my-5">
      <div className="object-cover w-20 h-20 rounded-full  my-5 mx-auto block absolute left-1/2 -translate-x-1/2 transform -bottom-20">
        <div className="absolute p-0.5 -top-1">
          <Avatar size="profile" src={JSON.parse(contractQuery.data.creators[0].profile.data).image}/>
        </div>
      </div>
    </div>
    <div className="flex flex-col max-w-5xl my-0 pt-24 mx-auto text-center py-5 text-center">
      <h3
        className="text-l font-bold text-gray-800">{JSON.parse(contractQuery.data.creators[0].profile.data).username}</h3>
 
      <div className="my-5 mx-auto max-w-lg w-full">
        {(subscription === 'unsubscribed' && !isSelf) && (<Button onClick={() => {
          subscribe()
        }} label="Subscribe"/>)}
        {(subscription === 'pending_subscribe') && (<Button onClick={() => {
          startStreaming()
        }} label="Start Streaming"/>)}

        <div className="flex">
            <Button onClick={() => {
                  mint()
                }} label="Mint" theme='secondary-2'/>
              
              <Button onClick={() => {
                approveUSDC()
              }} label="Approve" theme='secondary-2'/>
          </div>

        <Button onClick={() => {
          convertUSDCx()
        }} label="Upgrade"/>
      </div>
      <h1 className="mb-5 text-2xl uppercase font-bold">Uploaded Contents</h1>
      
      <div className="py-5">
        {
          contents.map((x) => showItem(x))
        }
      </div>
    </div>
    </div>
  );
}
