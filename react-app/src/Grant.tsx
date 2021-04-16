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
import {UmbralCreator} from "./Umbral";
import {Button} from "./elements/button";

const CreatorContract = creaton_contracts.Creator

const SUBSCRIBERS_QUERY = gql`
      query GET_SUBSCRIBERS($user: Bytes!) {
      subscribers(where: { creatorContract: $user }) {
        user
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

  async function getUmbral() {
    const umbral = new UmbralCreator(umbralWasm, currentCreator.creatorContract)
    await umbral.initMasterkey(web3Context.library!.getSigner(web3Context.account!),currentCreator.creatorContract,true)
    return umbral
  }

  async function grant(subscriber) {
    setGrantStatus({status: 'pending', message: 'Granting subscribers, please wait'})
    const umbral = await getUmbral()
    umbral.grant(subscriber.pub_key)
      .then(function () {
        const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
        creatorContract.acceptSubscribe(subscriber.user).then(function () {
          console.log('Accepted the subscription')
          setGrantStatus({status: 'done', message: 'Granted'})
        })
      })
  }

  async function grant_all() {
    setGrantStatus({status: 'pending', message: 'Granting all pending subscribers, please wait'})
    const umbral = await getUmbral()
    let users: any = []
    for (let subscriber of data.subscribers) {
      if (subscriber.status === 'pending_subscribe') {
        await umbral.grant(subscriber.pub_key)
        users.push(subscriber.user)
      }
    }
    const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
    creatorContract.bulkAcceptSubscribe(users).then(function () {
      console.log('Accepted all the subscription')
      setGrantStatus({status: 'done', message: 'Granted'})
    })
  }

  async function revoke_all() {
    setGrantStatus({status: 'pending', message: 'Reovking all pending unsubscribers, please wait'})
    const umbral = await getUmbral()
    let users: any = []
    for (let subscriber of data.subscribers) {
      if (subscriber.status === 'pending_unsubscribe') {
        await umbral.revoke(subscriber.pub_key)
        users.push(subscriber.user)
      }
    }
    const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
    creatorContract.bulkAcceptUnsubscribe(users).then(function () {
      console.log('Revoked all the pending_unsubscription')
      setGrantStatus({status: 'done', message: 'Revoked all'})
    })
  }

  async function revoke(subscriber) {
    setGrantStatus({status: 'pending', message: 'Revoking subscribers, please wait'})
    const umbral = await getUmbral()
    umbral.revoke(subscriber.pub_key)
      .then(function () {
        const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
        creatorContract.acceptUnsubscribe(subscriber.user).then(function () {
          console.log('Revoked the subscription')
          setGrantStatus({status: 'done', message: 'Revoked'})
        })
      })
  }

  async function regrant(subscriber) {
    const umbral = await getUmbral()
    console.log(subscriber)
    umbral.grant(subscriber.pub_key)
  }
  console.log(data.subscribers)

  return (
    <div>
      <h1>Grant Subscribers</h1>
      {grantStatus.message && <h3>{grantStatus.message}</h3>}
      {data.subscribers.some((subscriber) => (subscriber.status === 'requested_subscribe')) && (<Button onClick={() => {
        grant_all()
      }} label="Grant all requests"/>)}
      {data.subscribers.some((subscriber) => (subscriber.status === 'pending_unsubscribe')) && (<Button onClick={() => {
        revoke_all()
      }} label="Revoke all pending_unsubscribe"/>)}
      <br/>
      {data.subscribers.map((subscriber) => (<div key={subscriber.user}>{subscriber.user} : {subscriber.status}
        {subscriber.status === 'requested_subscribe' && (<Button onClick={() => {
          grant(subscriber)
        }} label="Grant"/>)}
        {subscriber.status === 'subscribed' && (<Button onClick={() => {
          regrant(subscriber)
        }} label="Re-Grant" />)}
        {subscriber.status === 'pending_unsubscribe' && (<Button onClick={() => {
          revoke(subscriber)
        }} label="Revoke"/>)}
      </div>))}
    </div>
  );
};

export default Grant;
