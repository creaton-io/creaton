import {queryStore} from '../_graphql';

export const creators = queryStore<
  {
    id: string;
    user: string;
    creatorContract: string;
    metadataURL: string;
    timestamp: string;
  }[]
>(
  `
query {
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    subscriptionPrice
    metadataURL
    timestamp
  }
}`,
  {path: 'creators'} // allow to access messages directly
);
