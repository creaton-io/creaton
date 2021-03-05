import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {gql, useQuery} from "@apollo/client";

export interface Creator {
  id:string;
  user:string;
  creatorContract:string;
  title:string;
  subscriptionPrice: number;
  avatarURL: string;
  timestamp: number;
}

export function useCurrentCreator() {
  const context = useWeb3React<Web3Provider>()
  const CREATOR_USER = gql`
  query GET_CREATOR_WITH_USER($user: Bytes!) {
  creators(where: { user: $user }) {
    id
    user
    creatorContract
    description
    subscriptionPrice
    timestamp
  }
}
`;
  const {loading, error, data, refetch} = useQuery(CREATOR_USER, {variables: {user: context.account?.toLowerCase()}});
  let currentCreator: Creator | undefined = undefined
  if (!error && !loading) {
    const matchingCreators = data.creators
    if (matchingCreators.length !== 0)
      currentCreator = matchingCreators[0]
  }
  return {loading, error, currentCreator, refetch}
}
