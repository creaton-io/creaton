


interface BasicChainInformation {
  urls: string[]
  name: string
}




export function getAddChainParameters(chainId: number): number {
  const chainInformation = CHAINS[chainId]
  return chainId
}

export const CHAINS: { [chainId: number]: BasicChainInformation } = {
  1: {
    //@ts-ignore
    urls: [
      process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : undefined,
      'https://cloudflare-eth.com',
    ].filter((url) => url !== undefined),
    name: 'Mainnet',
  },
  3: {
    //@ts-ignore
    urls: [process.env.infuraKey ? `https://ropsten.infura.io/v3/${process.env.infuraKey}` : undefined].filter(
      (url) => url !== undefined
    ),
    name: 'Ropsten',
  },
  4: {
    //@ts-ignore
    urls: [process.env.infuraKey ? `https://rinkeby.infura.io/v3/${process.env.infuraKey}` : undefined].filter(
      (url) => url !== undefined
    ),
    name: 'Rinkeby',
  },
  5: {
    //@ts-ignore
    urls: [process.env.infuraKey ? `https://goerli.infura.io/v3/${process.env.infuraKey}` : undefined].filter(
      (url) => url !== undefined
    ),
    name: 'Görli',
  },
  42: {
    //@ts-ignore
    urls: [process.env.infuraKey ? `https://kovan.infura.io/v3/${process.env.infuraKey}` : undefined].filter(
      (url) => url !== undefined
    ),
    name: 'Kovan',
  },
  // Optimism
  10: {
    //@ts-ignore
    urls: [
      process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://mainnet.optimism.io',
    ].filter((url) => url !== undefined),
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  69: {
    //@ts-ignore
    urls: [
      process.env.infuraKey ? `https://optimism-kovan.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://kovan.optimism.io',
    ].filter((url) => url !== undefined),
    name: 'Optimism Kovan',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
  },
  // Arbitrum
  42161: {
    //@ts-ignore
    urls: [
      process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://arb1.arbitrum.io/rpc',
    ].filter((url) => url !== undefined),
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  421611: {
    //@ts-ignore
    urls: [
      process.env.infuraKey ? `https://arbitrum-rinkeby.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://rinkeby.arbitrum.io/rpc',
    ].filter((url) => url !== undefined),
    name: 'Arbitrum Testnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://testnet.arbiscan.io'],
  },
  // Polygon
  137: {
    //@ts-ignore
    urls: [
      process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://polygon-rpc.com',
    ].filter((url) => url !== undefined),
    name: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  80001: {
    //@ts-ignore
    urls: [process.env.infuraKey ? `https://polygon-mumbai.infura.io/v3/${process.env.infuraKey}` : undefined].filter(
      (url) => url !== undefined
    ),
    name: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
}

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{ [chainId: number]: string[] }>(
  (accumulator, chainId) => {
    const validURLs: string[] = CHAINS[Number(chainId)].urls

    if (validURLs.length) {
      accumulator[Number(chainId)] = validURLs
    }

    return accumulator
  },
  {}
)
