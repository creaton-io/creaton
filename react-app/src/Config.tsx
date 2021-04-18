let ARWEAVE_URI

if (false && process.env.NODE_ENV === 'development')
  ARWEAVE_URI = 'http://localhost:1984'
else
  ARWEAVE_URI = 'https://report.creaton.io'

const ARWEAVE_GATEWAY = 'https://arweave.net/';

export {ARWEAVE_URI, ARWEAVE_GATEWAY}
