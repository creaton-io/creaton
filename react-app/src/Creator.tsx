import {useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {NuCypherSocketContext} from "./Socket";
import {EncryptedObject, TextileStore} from "./stores/textileStore";
import {NuCypher} from "./NuCypher";
import {gql, useQuery} from "@apollo/client";
import { SuperfluidContext } from "./Superfluid";
import {parseUnits, parseEther} from '@ethersproject/units';
import { wad4human } from "@decentral.ee/web3-helpers";
import {defaultAbiCoder} from '@ethersproject/abi';
import {Contract, utils} from "ethers";
import creaton_contracts from "./contracts.json";

const CreatorContract = creaton_contracts.Creator

interface params{
  id: string;
}
export function Creator() {
  let { id } = useParams<params>();
  const creatorContractAddress = id

  const CONTENTS_QUERY = gql`
      query GET_CONTENTS($user: Bytes!) {
      contents(orderBy: date, orderDirection: desc, where: { creatorContract: $user }) {
        name
        type
        description
        date
        ipfs
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

  const [textile, _] = useState(new TextileStore())
  useEffect(() => {
    textile.authenticate().then(function () {
      console.log('textile authenticated')
    })
  }, [textile])
  const context = useWeb3React<Web3Provider>()
  const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {user: creatorContractAddress}, pollInterval: 10000});
  const subscriptionQuery = useQuery(SUBSCRIPTION_QUERY, {
    variables: {
      user: context.account,
      creator: creatorContractAddress
    },
    pollInterval: 10000
  });
  const socket = useContext(NuCypherSocketContext);
  const superfluid = useContext(SuperfluidContext);
  const [keyPair, setKeyPair] = useState({})
  const [usdcx, setUsdcx] = useState(0)

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

  function downloadURL(data, fileName) {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }

  function downloadBlob(decrypted: ArrayBuffer, content) {
    const blob = new Blob([new Uint8Array(decrypted)], {type: content.type});
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
    if (socket == null) {
      alert('connect to wallet')
      return
    }
    const nucypher = new NuCypher(socket)
    const result = await nucypher.getKeyPair(context.account)
    let call;
    let MINIMUM_GAME_FLOW_RATE = parseUnits('2', 18).div(3600 * 24 * 30);
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
              MINIMUM_GAME_FLOW_RATE.toString(),
              '0x',
            ).encodeABI(),
            defaultAbiCoder.encode(
              ['string', 'string'],
              [result['pubkey_sig'], result['pubkey_enc']]
            )
          ]
        ),
      ],
    ];
    const tx = await sf.host.batchCall(call, {from: subscriber});
    await tx.wait();
    console.log('subscribed');
    setKeyPair(result);
  }

  async function download(content) {
    console.log(content)
    const encObject: EncryptedObject = await textile.downloadEncryptedFile(content.ipfs)
    if (socket == null) {
      alert('connect to wallet')
      return
    }
    const nucypher = new NuCypher(socket)
    const data = await nucypher.decrypt(encObject.policy_pubkey, encObject.alice_sig_pubkey, encObject.enc_file_content,
      creatorContractAddress, context.account!)
    const decrypted = textile.base64ToArrayBuffer(data['decrypted_content']);
    await downloadBlob(decrypted, content);
  }
  if(!context.account)
    return (<div>Connect to metamask</div>)
  if (contentsQuery.loading || subscriptionQuery.loading) {
    return (<div>Loading</div>)
  }
  if (contentsQuery.error || subscriptionQuery.error) {
    return (<div>Error</div>)
  }
  const contents = contentsQuery.data.contents;
  let subscription = 'unsubscribed'
  if (subscriptionQuery.data.subscribers.length > 0)
    subscription = subscriptionQuery.data.subscribers[0].status
  return (
    <div>
      <h3>ID: {id}</h3>
      <h3>Status: {subscription}</h3>
      <h3>Account: {context.account}</h3>
      <h3>Superfluid usdcx: {usdcx}</h3>
      {Object.entries(keyPair).map((x) => <h3 key={x[0]}>{x[0]} : {x[1]}</h3>)}
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
            {subscription === 'subscribed' && (<button onClick={() => {
              download(x)
            }}>Download</button>)}
          </li>)
        }
      </ul>
    </div>
  );
}
