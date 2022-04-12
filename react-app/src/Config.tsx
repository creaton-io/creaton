let APOLLO_URI,
  REENCRYPTION_URI,
  REACTION_CONTRACT_ADDRESS,
  REACTION_ERC20,
  CREATE_TOKEN_ADDRESS,
  GOVERNANCE_SQUAD_TOKENS,
  BICONOMY_API,
  BICONOMY_AUTH,
  VOTING_GRAPHQL_URI,
  CREATOR_VOTING_ADDRESS,
  USDC_TOKEN_ADDRESS,
  DAI_TOKEN_ADDRESS;
const ARWEAVE_GATEWAY = 'https://arweave.net/';
const REPORT_URI = 'https://report.creaton.io/report';
const ARWEAVE_URI = 'https://arweave.creaton.io';
const FAUCET_URI = 'https://faucet.creaton.io/give-me-some';
if (process.env.NODE_ENV === 'development') {
  REENCRYPTION_URI = 'https://staging.creaton.io';
  // APOLLO_URI = 'http://api.graph.io:8000/subgraphs/name/creaton-io/creaton'
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-dev';

  BICONOMY_API = process.env.BICONOMY_API;
  BICONOMY_AUTH = process.env.BICONOMY_AUTH;

  REACTION_CONTRACT_ADDRESS = '0xd57d3d31a7b3ae7ac1400da47f13cdb9c6522e70';
  REACTION_ERC20 = '0xe2ee5f719a12a85dc7cdeb04fad3ebc0ffe185de';
  CREATE_TOKEN_ADDRESS = '0xe2ee5f719a12a85dc7cdeb04fad3ebc0ffe185de';
  GOVERNANCE_SQUAD_TOKENS = {
    GOV: '0x21f551FBA148f36fA369601A8eD0D7e3Ad6708ee',
    MKT: '0xb339165C55C3F8BE35033CB26c2505f8B0912C26',
    DEV: '0x06805b2b1a5ab9f6f753f8d220cccef006d1cf8e',
  };
  VOTING_GRAPHQL_URI = 'https://api.studio.thegraph.com/query/2670/creator-voting/v0.0.21'
  CREATOR_VOTING_ADDRESS = '0x9DAEb40970A95C817C1f37EBB765d660fDE0ff64';

  USDC_TOKEN_ADDRESS = '0xe6b8a5cf854791412c1f6efc7caf629f5df1c747';
  DAI_TOKEN_ADDRESS = '0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253';

} else if (process.env.NODE_ENV === 'production') {
  //staging
  REENCRYPTION_URI = 'https://reencryption.creaton.io';
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-polygon'; //'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-dao'

  BICONOMY_API = process.env.BICONOMY_API;
  BICONOMY_AUTH = process.env.BICONOMY_AUTH;

  USDC_TOKEN_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
  DAI_TOKEN_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
  CREATE_TOKEN_ADDRESS = '';
}
//@ts-ignore
else if (process.env.NODE_ENV === 'staging') {
  //staging
  REENCRYPTION_URI = 'https://reencryption.creaton.io';
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-mumbai'; //'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-dao'

  BICONOMY_API = process.env.BICONOMY_API;
  BICONOMY_AUTH = process.env.BICONOMY_AUTH;
}
//TODO:PRODUCTION CONFIG
// {
//   REENCRYPTION_URI = 'https://reencryption.creaton.io'
//   APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton'
// }

export {
  APOLLO_URI,
  ARWEAVE_URI,
  ARWEAVE_GATEWAY,
  REENCRYPTION_URI,
  REPORT_URI,
  FAUCET_URI,
  REACTION_CONTRACT_ADDRESS,
  REACTION_ERC20,
  CREATE_TOKEN_ADDRESS,
  GOVERNANCE_SQUAD_TOKENS,
  BICONOMY_API,
  BICONOMY_AUTH,
  VOTING_GRAPHQL_URI,
  CREATOR_VOTING_ADDRESS,
  USDC_TOKEN_ADDRESS,
  DAI_TOKEN_ADDRESS,
};
