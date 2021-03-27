import 'react-app-polyfill/ie11';
import * as React from 'react';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useContext, useState} from "react";
import {Creator, useCurrentCreator} from "./Utils";
import {gql, useQuery} from "@apollo/client";
import {Contract} from "ethers";
import creaton_contracts from "./contracts.json";
import {UmbralWasmContext} from "./UmbralWasm";
import {UmbralAlice} from "./Umbral";

const CreatorContract = creaton_contracts.Creator

const SUBSCRIBERS_QUERY = gql`
      query GET_SUBSCRIBERS($user: Bytes!) {
      subscribers(where: { creatorContract: $user }) {
        user
        sig_key
        pub_key
        status
      }
    }
`;

const Grant = () => {
  const umbralWasm = useContext(UmbralWasmContext)
  const web3Context = useWeb3React<Web3Provider>()
  const [grantStatus, setGrantStatus] = useState({status: '', message: ''})
  const creator = useCurrentCreator().currentCreator
  const {loading, error, data} = useQuery(SUBSCRIBERS_QUERY, {
    pollInterval: 10000,
    variables: {user: creator?.creatorContract}
  });

  if (umbralWasm === null)
    return (<div>Umbral Wasm not loaded</div>)
  if (!web3Context.account)
    return (<div>Not connected to MetaMask</div>)
  if (creator === undefined)
    return (<div>Please signup as a creator</div>)
  if (loading)
    return (<div>Loading subscribers...</div>)
  if (error)
    return (<div>Error Loading subscribers</div>)
  let currentCreator: Creator = creator

  async function grant(subscriber) {
    setGrantStatus({status: 'pending', message: 'Granting subscribers, please wait'})
    const umbral = new UmbralAlice(umbralWasm, currentCreator.user)
    await umbral.initMasterkey(web3Context.library!.getSigner(web3Context.account!))
    umbral.grant(subscriber.sig_key)
      .then(function () {
        const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
        creatorContract.acceptSubscribe(subscriber.user).then(function () {
          console.log('Accepted the subscription')
          setGrantStatus({status: 'done', message: 'Granted'})
        })
      })
  }

  async function revoke(subscriber) {
    setGrantStatus({status: 'pending', message: 'Revoking subscribers, please wait'})
    const umbral = new UmbralAlice(umbralWasm, currentCreator.user)
    await umbral.initMasterkey(web3Context.library!.getSigner(web3Context.account!))
    umbral.revoke(subscriber.sig_key)
      .then(function () {
        const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
        creatorContract.acceptUnsubscribe(subscriber.user).then(function () {
          console.log('Revoked the subscription')
          setGrantStatus({status: 'done', message: 'Revoked'})
        })
      })
  }

  async function regrant(subscriber) {
    const umbral = new UmbralAlice(umbralWasm, currentCreator.user)
    await umbral.initMasterkey(web3Context.library!.getSigner(web3Context.account!))
    console.log(subscriber)
    umbral.grant(subscriber.sig_key)
  }

  return (
    <div>
      <h1>Grant Subscribers</h1>
      {grantStatus.message && <h3>{grantStatus.message}</h3>}
      {data.subscribers.map((subscriber) => (<div key={subscriber.user}>{subscriber.user} : {subscriber.status}
        {subscriber.status==='pending_subscribe' && (<button onClick={()=>{grant(subscriber)}}>Grant</button>)}
        {subscriber.status==='subscribed' && (<button onClick={()=>{regrant(subscriber)}}>Re-Grant</button>)}
        {subscriber.status==='pending_unsubscribe' && (<button onClick={()=>{revoke(subscriber)}}>Revoke</button>)}
      </div>))}
    </div>
  );
};

export default Grant;
