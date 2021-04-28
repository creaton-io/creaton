let APOLLO_URI, REENCRYPTION_URI, ARWEAVE_URI
const ARWEAVE_GATEWAY = 'https://arweave.net/';
const REPORT_URI = 'https://report.creaton.io/report'

if (process.env.NODE_ENV === 'development') {
  REENCRYPTION_URI = 'http://localhost:3010'
  APOLLO_URI = 'http://twitter.creaton.io:8000/subgraphs/name/creaton-io/creaton'
  // ARWEAVE_URI = 'http://localhost:1984'
  ARWEAVE_URI = 'https://arweave.creaton.io'
}
else {
  REENCRYPTION_URI = 'https://reencryption.creaton.io'
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton2'
  ARWEAVE_URI = 'https://arweave.creaton.io'
}

export {APOLLO_URI, ARWEAVE_URI, ARWEAVE_GATEWAY, REENCRYPTION_URI, REPORT_URI}
