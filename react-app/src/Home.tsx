import {gql, useQuery} from "@apollo/client";
import React, {CSSProperties} from "react";
import {Link} from "react-router-dom";

const CREATORS_QUERY = gql`
  query {
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    title
    subscriptionPrice
    avatarURL
    timestamp
  }
}
`;

function Home() {
  const {loading, error, data} = useQuery(CREATORS_QUERY);
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  const myStyles: CSSProperties = {
    width: '20px',
  }
  return (<div>
    {data.creators.map((creator: any) => (
      <div key={creator.id}>
        <p>
          <img src={creator.avatarURL} style={myStyles}/><Link
          to={"/creator/" + creator.creatorContract}>{creator.title} with price {creator.subscriptionPrice}</Link>
        </p>
      </div>
    ))}</div>);
}

export {CREATORS_QUERY};
export default Home;
