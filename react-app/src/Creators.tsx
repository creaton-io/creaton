/* ****************** IMPORTS ****************** */

import {gql, useQuery} from '@apollo/client';
import React, {useEffect} from 'react';
import {FilterList} from './components/filter-list';
import {useWeb3React} from '@web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import {Splash} from './components/splash';





/* ****************** GRAPH QUERIES ****************** */

const CREATORS_QUERY = gql`
  query {
    creators(orderBy: reactionsReceived, orderDirection: desc) {
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





/* ****************** LOADING, ERROR ****************** */

function Creators() {
  const {loading, error, data} = useQuery(CREATORS_QUERY, {pollInterval: 10000});
  //const {account} = useWeb3React<Web3Provider>()
  if (loading) return <Splash src="https://assets5.lottiefiles.com/packages/lf20_bkmfzg9t.json"></Splash>;
  if (error) return <p>Error :(</p>;
  




/* ****************** DEFINE LIST ****************** */
  
  const items = data.creators.map((creator: any) => {
    // let subtitle = '$' + creator.subscriptionPrice + ' / month'
    // if(account){
    //   const found = creator.subscribers.find(element => element.user.toLowerCase() === account.toLowerCase());
    //   if(found) {
    //     if(found.status==='subscribed')
    //       subtitle="Subscribed"
    //   }
    // }





/* ****************** PROFILE DATA ****************** */

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





/* ****************** LIST OF PROFILES ****************** */

  return <FilterList list={items} />;
}





/* ****************** EXPORT ****************** */

export {CREATORS_QUERY};
export default Creators;
