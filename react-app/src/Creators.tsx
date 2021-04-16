import {gql, useQuery} from "@apollo/client";
import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {Card} from "./components/card";

const CREATORS_QUERY = gql`
  query {
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    description
    subscriptionPrice
    timestamp
  }
}
`;

function Creators() {
  const {loading, error, data} = useQuery(CREATORS_QUERY,{pollInterval: 10000});
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  return (<div>

    {data.creators.map((creator: any) => (
      <div key={creator.id}>
        <Link to={"/creator/" + creator.creatorContract}>
          <Card price={creator.subscriptionPrice} name={creator.description}></Card>
        </Link>
      </div>
    ))}</div>);
}

export {CREATORS_QUERY};
export default Creators;
