import client from '../_graphql/client';
import {writable, derived} from 'svelte/store';

export const creatorStore = () => {
  const value = writable(null);
  const { subscribe, set, update } = value;
  return {
    subscribe,
    fetch: function(walletAddress: string) {
      const query = `
        query {
          creators(where: { user: "${walletAddress}"}, first: 1) {
            id
            user
          }
        }
      `
      client.query(query)
      .toPromise()
      .then(result => {
        set(result.data?.creators[0]?.user || "")
      })
    },
    set: (creatorAddress: string) => { set(creatorAddress.toLowerCase()) }
	};
}

export enum Status {
  IsNotLoggedIn,
  IsNotCreator,
  IsCreator,
}

export const creatorAddress = creatorStore();
export const creatorStatus = derived(
  creatorAddress,
  $creatorAddress => {
    if ($creatorAddress === null) {
      return Status.IsNotLoggedIn;
    } else if ($creatorAddress === "") {
      return Status.IsNotCreator
    } else {
      return Status.IsCreator;
    }
  }
)
