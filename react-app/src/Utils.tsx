import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {gql, useQuery} from "@apollo/client";
import {useEffect, useState} from "react";

export interface Creator {
  id: string;
  user: string;
  creatorContract: string;
  description: string;
  subscriptionPrice: number;
  avatarURL: string;
  timestamp: number;
}

export interface Profile {
  username: string;
  image: string | null;
}

export function useCurrentProfile() {
  const context = useWeb3React<Web3Provider>()
  const PROFILE_QUERY = gql`
  query GET_PROFILE($user: Bytes!) {
  profiles(where: { address: $user }) {
    id
    address
    data
  }
}
`;

  let user
  if (context.account)
    user = context.account.toLowerCase();
  else
    user = ''
  const {loading, error, data, refetch} = useQuery(PROFILE_QUERY, {
    variables: {user: user}, pollInterval: 20000
  });
  const [currentProfile, setCurrentProfile] = useState<Profile | undefined>(undefined);
  useEffect(() => {
    console.log('loading', loading, 'error', error)
    if (!error && !loading) {
      const matchingProfiles = data.profiles
      if (matchingProfiles.length !== 0) {
        const profile_data = JSON.parse(matchingProfiles[0].data)
        setCurrentProfile({username: profile_data.username, image: profile_data.image})
      }
      else
        setCurrentProfile(undefined)
    }
  }, [loading, error, data]);
  return {loading, error, currentProfile, refetch}
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
  const {loading, error, data, refetch} = useQuery(CREATOR_USER, {
    variables: {user: context.account?.toLowerCase()},
    pollInterval: 10000
  });
  let currentCreator: Creator | undefined = undefined
  if (!error && !loading) {
    const matchingCreators = data.creators
    if (matchingCreators.length !== 0)
      currentCreator = matchingCreators[0]
  }
  return {loading, error, currentCreator, refetch}
}
