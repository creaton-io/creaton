import {queryStore} from '../_graphql';

export const creators = queryStore<
  {
    id: string;
    user: string;
    creatorContract: string;
    title: string;
    timestamp: string;
  }[]
>(
  `
query {
  creators(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    creatorContract
    title
    subscriptionPrice
    timestamp
  }
}`,
  {path: 'creators'} // allow to access messages directly
);
