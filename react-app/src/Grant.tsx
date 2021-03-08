import 'react-app-polyfill/ie11';
import * as React from 'react';
import {Formik, Field, Form, FormikHelpers} from 'formik';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useContext, useState} from "react";
import {NuCypherSocketContext} from "./Socket";
import {Creator, useCurrentCreator} from "./Utils";
import {NuCypher} from "./NuCypher";
import {gql, useQuery} from "@apollo/client";
import {Contract} from "ethers";
import creaton_contracts from "./contracts.json";

const CreatorContract = creaton_contracts.Creator

interface Values {
  pubkey_enc: string;
  pubkey_sig: string;
}

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
  const socket = useContext(NuCypherSocketContext)
  const web3Context = useWeb3React<Web3Provider>()
  const [grantStatus, setGrantStatus] = useState({status: '', message: ''})
  const creator = useCurrentCreator().currentCreator
  const {loading, error, data} = useQuery(SUBSCRIBERS_QUERY, {
    pollInterval: 10000,
    variables: {user: creator?.creatorContract}
  });
  if (socket === null)
    return (<div>Not connected to NuCypher</div>)
  if (!web3Context.account)
    return (<div>Not connected to MetaMask</div>)
  if (creator === undefined)
    return (<div>Please signup as a creator</div>)
  if (loading)
    return (<div>Loading subscribers...</div>)
  if (error)
    return (<div>Error Loading subscribers</div>)
  let currentCreator: Creator = creator

  function grant(subscriber) {
    setGrantStatus({status: 'pending', message: 'Granting subscribers, please wait'})
    const nucypher = new NuCypher(socket!)
    nucypher.grant(currentCreator.creatorContract, currentCreator.user, subscriber.pub_key, subscriber.sig_key, web3Context.library!.getSigner())
      .then(function () {
        const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(web3Context.library!.getSigner())
        console.log('3rd transaction for accepting the subscription in creator contract')
        creatorContract.acceptSubscribe(subscriber.user).then(function () {
          console.log('Accepted the subscription')
        })
      })
  }

  return (
    <div>
      <h1>Grant Subscribers</h1>
      {grantStatus.message && <h3>{grantStatus.message}</h3>}
      {data.subscribers.map((subscriber) => (<div key={subscriber.user}>{subscriber.user} : {subscriber.status}
        {subscriber.status==='pending_subscribe' && (<button onClick={()=>{grant(subscriber)}}>Grant</button>)}
      </div>))}
    </div>
  );
};

export default Grant;
