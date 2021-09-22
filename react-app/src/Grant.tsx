import 'react-app-polyfill/ie11';
import * as React from 'react';
import {useWeb3React} from "./web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useContext, useState} from "react";
import {Creator, useCurrentCreator} from "./Utils";
import {gql, useQuery} from "@apollo/client";
import {Contract} from "ethers";
import creaton_contracts from "./Contracts";
import {UmbralWasmContext} from "./UmbralWasm";
import {UmbralCreator} from "./Umbral";
import {Button} from "./elements/button";
import {Avatar} from "./components/avatar";
import {Checkbox} from "./elements/checkbox";
import {NotificationHandlerContext} from "./ErrorHandler";
import clsx from "clsx";
import {Web3UtilsContext} from "./Web3Utils";
import {Example} from "./components/error-notification";

const CreatorContract = creaton_contracts.Creator

const SUBSCRIBERS_QUERY = gql`
      query GET_SUBSCRIBERS($user: Bytes!) {
      subscribers(where: { creatorContract: $user }) {
        user
        status
        profile {
          data
        }
      }
    }
`;

function Tabs({tabs, activeTab, setActiveTab}) {
  return (
    <div className="w-full mb-3 text-black">
      <div className="hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={tabs.find((tab) => tab.name === activeTab).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href="#"
                className={clsx(
                  tab.name === activeTab
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-purple-300 hover:border-gray-200',
                  'w-1/3 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm'
                )}
                aria-current={tab.name === activeTab ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.name)
                }}
              >
                {tab.name}
                <span
                  className={clsx(
                    tab.name === activeTab ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                    'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                  )}
                >
                    {tab.count}
                  </span>

              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

const Grant = () => {
  const umbralWasm = useContext(UmbralWasmContext)
  const web3Context = useWeb3React<Web3Provider>()
  const web3utils = useContext(Web3UtilsContext)
  const notificationHandler = useContext(NotificationHandlerContext)
  const [grantStatus, setGrantStatus] = useState({status: '', message: ''})
  const creator = useCurrentCreator().currentCreator
  const [checkedSubscribers, setCheckedSubscribers] = useState<Map<string, boolean>>(new Map());
  const {loading, error, data} = useQuery(SUBSCRIBERS_QUERY, {
    pollInterval: 10000,
    variables: {user: creator?.creatorContract}
  });
  const [activeTab, setActiveTab] = useState('Requested')

  if (!web3Context.account)
    return (<div>Not connected to Web3 Wallet</div>)
  if (creator === undefined)
    return (<div><Example/></div>)
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
        creatorContract.acceptSubscribe(subscriber.user).then(async function (receipt) {
          console.log('Accepted the subscription')
          web3utils.setIsWaiting(true);
          await receipt.wait(1)
          web3utils.setIsWaiting(false);
        }).catch((error) => {
          notificationHandler.setNotification({description: 'Could not grant ' + error.message, type: 'error'})
        })
      })
  }

  async function grantChecked() {
    const umbral = await getUmbral()
    let users: any = []
    web3utils.setIsWaiting("Sending re-encryption keys to the network");
    for (let subscriber of data.subscribers) {
      if (checkedSubscribers.get(subscriber.user)) {
        await umbral.grant(subscriber.pub_key)
        users.push(subscriber.user)
      }
    }
    web3utils.setIsWaiting(false);
    const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
    creatorContract.bulkAcceptSubscribe(users).then(async function (receipt) {
      console.log('Accepted all the subscription')
      web3utils.setIsWaiting(true);
      await receipt.wait(1)
      web3utils.setIsWaiting(false);
    }).catch((error) => {
      notificationHandler.setNotification({description: 'Could not grant ' + error.message, type: 'error'})
      web3utils.setIsWaiting(false);
    })
  }

  async function revoke_all() {
    setGrantStatus({status: 'pending', message: 'Revoking all pending unsubscribers, please wait'})
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

  const requested_subscribers = data.subscribers.filter((subscriber) => {
    return subscriber.status === 'requested_subscribe'
  })
  const other_subscribers = data.subscribers.filter((subscriber) => {
    return subscriber.status !== 'requested_subscribe'
  })

  const subscribed_subscribers = data.subscribers.filter((subscriber) => {
    return subscriber.status === 'subscribed'
  })

  const pending_subscribers = data.subscribers.filter((subscriber) => {
    return subscriber.status === 'pending_subscribe'
  })

  const tabs = [
    {name: 'Subscribed', count: subscribed_subscribers.length},
  ]
  const checkedCount = Array.from(checkedSubscribers.values()).filter((checked) => (checked)).length;


  return (
    <div className="w-3/4 sm:w-1/2 pt-8 m-auto grid grid-cols-1 place-items-start text-white">

      <div><h3 className="text-md text-white pb-4">{subscribed_subscribers.length !== 0 ? "These profiles are streaming money to you right now!" : "No one is subscribed to you yet, but don't worry, soon!"}</h3>
        {subscribed_subscribers.map((subscriber) => (
          <div key={subscriber.user} className="flex flex-row place-items-center m-2">
            <Avatar size="medium"
                    src={JSON.parse(subscriber.profile.data).image}/>
            <span className="font-bold ml-2">{JSON.parse(subscriber.profile.data).username}</span>
          </div>))}</div>

    </div>
  );
};

export default Grant;
