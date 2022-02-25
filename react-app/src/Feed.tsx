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
//import {TextileContext} from "./TextileProvider";
import {LitContext} from "./LitProvider";
import {Base64} from "js-base64";
import {Contract, ethers} from "ethers";
import {NotificationHandlerContext} from "./ErrorHandler";
import {VideoPlayer} from "./VideoPlayer";
import {Button} from "./elements/button";
import {Card} from "./components/card";
import {Avatar} from "./components/avatar";
import {APOLLO_URI, REPORT_URI, REACTION_CONTRACT_ADDRESS, REACTION_ERC20} from "./Config";
import {Web3UtilsContext} from "./Web3Utils";
import {
  Link
} from "react-router-dom";
import LitJsSdk from 'lit-js-sdk'
import JSZip from 'jszip'
import { FilterList } from "./components/filter-list";
import { Splash } from "./components/splash";

interface params {
  id: string;
}

export function Feed() {
  let {id} = useParams<params>();
  const creatorContractAddress = id

  const CONTENTS_QUERY = gql`
      query GET_CONTENTS($creatorContract: Bytes!) {
      contents(orderBy: date, orderDirection: desc, where: { creatorContract: $creatorContract }) {
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
      query GET_SUBSCRIPTION_STATUS($user: Bytes!) {
      subscribers(where: { user: $user, status: "subscribed"}) {
        creatorContract
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

  const CREATORS_QUERY = gql`
  query GET_SUBSCRIPTIONS($creatorContracts: [Bytes!]) {
    creators(orderBy: reactionsReceived, orderDirection: desc, where: {creatorContract: $creatorContracts}) {
      id
      user
      creatorContract
      description
      subscriptionPrice
      timestamp
      subscribers {
        id
        status
        user
      }
      profile {
        data
      }
    }
  }
  `;

  //const textile = useContext(TextileContext)
  const litNode = useContext(LitContext)
  const notificationHandler = useContext(NotificationHandlerContext)
  const web3utils = useContext(Web3UtilsContext)
  const context = useWeb3React<Web3Provider>()
  const subscriptionQuery = useQuery(SUBSCRIPTION_QUERY, {
    skip: !context.account,
    variables: {
      user: context.account
    }
  });
  if (subscriptionQuery.data) {
    console.log('subscriptionsssss');
    console.log(subscriptionQuery.data?.subscribers.map(x => {
      return x.creatorContract;
    }))
  }

  const {loading, error, data} = useQuery(CREATORS_QUERY, {
    skip: !subscriptionQuery.data,
    variables: {creatorContracts: subscriptionQuery.data?.subscribers.map(x => {
      return x.creatorContract;
    })[0]},
    pollInterval: 10000,
  });
  
  console.log(data);
  //const {account} = useWeb3React<Web3Provider>()
  if (loading) return <Splash src="https://assets5.lottiefiles.com/packages/lf20_bkmfzg9t.json"></Splash>;
  if (error) return <p>Error :(</p>;
  const items = data.creators.map((creator: any) => {
    // let subtitle = '$' + creator.subscriptionPrice + ' / month'
    // if(account){
    //   const found = creator.subscribers.find(element => element.user.toLowerCase() === account.toLowerCase());
    //   if(found) {
    //     if(found.status==='subscribed')
    //       subtitle="Subscribed"
    //   }
    // }
    return {
      avatar: creator.profile !== null ? JSON.parse(creator.profile.data).image : '',
      title: creator.profile !== null ? JSON.parse(creator.profile.data).username : creator.id.slice(0, 6),
      //subtitle: subtitle,
      description: creator.description,
      count: creator.subscribers.length,
      source: 'subscribers',
      url: '/creator/' + creator.creatorContract,
      creatorAddress: creator.id,
    };
  });
  return <FilterList list={items} />;
}
