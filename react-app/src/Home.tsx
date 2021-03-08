import {gql, useQuery} from "@apollo/client";
import React, {CSSProperties} from "react";
import {Link} from "react-router-dom";

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

function Home() {
  const {loading, error, data} = useQuery(CREATORS_QUERY,{pollInterval: 10000});
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  return (<div>
    {data.creators.map((creator: any) => (
      <div key={creator.id}>
        <p>
          <Link to={"/creator/" + creator.creatorContract}>{creator.description} with price {creator.subscriptionPrice}</Link>
        </p>
      </div>
    ))}</div>);
}

export {CREATORS_QUERY};
export default Home;
