import {useParams} from "react-router-dom";
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
import {UmbralSubscriber} from "./Umbral";
import {TextileContext} from "./TextileProvider";
import {Base64} from "js-base64";
import {Contract} from "ethers";
import {ErrorHandlerContext} from "./ErrorHandler";
import {VideoPlayer} from "./VideoPlayer";

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
        }
      }
   `;



  const textile = useContext(TextileContext)
  const errorHandler = useContext(ErrorHandlerContext)
  const context = useWeb3React<Web3Provider>()
  const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {user: creatorContractAddress}, pollInterval: 10000});
  const contractQuery = useQuery(CONTRACT_INFO_QUERY, {variables:{contractAddress:creatorContractAddress}})
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
    if (subscriptionQuery.data && subscriptionQuery.data.subscribers.length > 0)
      setSubscription(subscriptionQuery.data.subscribers[0].status)
  }, [subscriptionQuery, context])
  useEffect(() => {
    if (contentsQuery.loading || contentsQuery.error) return;
    if (!textile) return;
    if (subscription !== 'subscribed') return;
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
  }, [downloadStatus, textile, subscription])

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

  async function subscribe() {
    if (!(context.account)) {
      alert('Connect to metamask')
      return;
    }
    const umbral = new UmbralSubscriber(umbralWasm)
    await umbral.initMasterkey(context.library!.getSigner(context.account), context.account, false)
    const result = umbral.getPublicKeyBase64()
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
              ['string', 'string'],
              [result, 'newcypher']
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
    console.log(content)
    let encObject
    if (content.ipfs.startsWith('/ipfs'))
      encObject = await textile!.downloadEncryptedFile(content.ipfs)
    else {//handle arweave
      const response = await fetch('https://arweave.net/' + content.ipfs)
      encObject = await response.json()
    }
    const umbral = new UmbralSubscriber(umbralWasm)
    await umbral.initMasterkey(context.library!.getSigner(context.account!), context.account!, false)
    return await umbral.decrypt(encObject.ciphertext, encObject.capsule, encObject.signing_pk, encObject.alice_pk, creatorContractAddress)
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

  if (!context.account)
    return (<div>Connect to metamask</div>)
  if (contentsQuery.loading || subscriptionQuery.loading || contractQuery.loading) {
    return (<div>Loading</div>)
  }
  if (contentsQuery.error || subscriptionQuery.error || contractQuery.error) {
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

  const creatorContract = new Contract(creatorContractAddress, creaton_contracts.Creator.abi).connect(context.library!.getSigner());
  async function like(content) {
    try {
        let receipt = await creatorContract.like(content.tokenId, 1);
      } catch (error) {
        errorHandler.setError('Could not like content' + error.message);
        return;
      }
  }

  return (
    <div>
      <h3>Contract ID: {id}</h3>
      <h3>Creator ID: {contract.user}</h3>
      <h3>Status: {subscription}</h3>
      {(currentCreator && currentCreator.creatorContract === creatorContractAddress) && (<h3>This is your account</h3>)}
      <h3>Account: {context.account}</h3>
      <h3>Superfluid usdcx: {usdcx}</h3>
      {(subscription == 'unsubscribed') && (<button onClick={() => {
        subscribe()
      }}>Subscribe</button>)}
      <br/>
      <button onClick={() => {
        mint()
      }}>Mint</button>
      <br/>
      <button onClick={() => {
        approveUSDC()
      }}>Approve</button>
      <br/>
      <button onClick={() => {
        convertUSDCx()
      }}>Upgrade</button>
      <h3>Uploaded Contents</h3>
      <ul>
        {
          contents.map((x) => <li key={x.ipfs}>{x.name}({x.description}):
            {subscription === 'subscribed' && (<div><span>Current Status: {downloadStatus[x.ipfs]}</span><button onClick={() => {
              like(x)
            }}>Like</button> {x.likes} likes </div>)} {showContent(x)}
          </li>)
        }
      </ul>
    </div>
  );
}
