let APOLLO_URI, REENCRYPTION_URI, REACTIONS_GRAPHQL_URI
const ARWEAVE_GATEWAY = 'https://arweave.net/';
const REPORT_URI = 'https://report.creaton.io/report'
const ARWEAVE_URI = 'https://arweave.creaton.io'
const FAUCET_URI = 'https://faucet.creaton.io/give-me-some'
if (process.env.NODE_ENV === 'development') {
  REENCRYPTION_URI = 'https://staging.creaton.io'
  // APOLLO_URI = 'http://api.graph.io:8000/subgraphs/name/creaton-io/creaton'
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-mumbai'
  REACTIONS_GRAPHQL_URI = 'https://api.studio.thegraph.com/query/2670/reaction_tokens/v0.0.20'
} else {//staging
  REENCRYPTION_URI = 'https://reencryption.creaton.io'
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton-mumbai'
}
//TODO:PRODUCTION CONFIG
// {
//   REENCRYPTION_URI = 'https://reencryption.creaton.io'
//   APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton'
// }

export {APOLLO_URI, ARWEAVE_URI, ARWEAVE_GATEWAY, REENCRYPTION_URI, REPORT_URI, FAUCET_URI, REACTIONS_GRAPHQL_URI}
