import {gql, useQuery} from "@apollo/client";
import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {Card} from "./components/card";
import {FilterList} from "./components/filter-list";


const CREATORS_QUERY = gql`
  query {
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    description
    subscriptionPrice
    timestamp
    subscribers {
      id
    }
    profile {
      data
    }
  }
}
`;

function Creators() {
  const {loading, error, data} = useQuery(CREATORS_QUERY, {pollInterval: 10000});
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  const items = data.creators.map((creator: any) => {
    return {
      avatar: JSON.parse(creator.profile.data).image,
      title: JSON.parse(creator.profile.data).username,
      subtitle: '$' + creator.subscriptionPrice + ' / month',
      description: creator.description,
      count: creator.subscribers.length,
      source: 'subscribers',
      url: "/creator/" + creator.creatorContract
    }
  })
  return (<FilterList list={items}/>);
}

export {CREATORS_QUERY};
export default Creators;
