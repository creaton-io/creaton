<!--   -->
# Creaton

Creaton is a decentralized content sharing platform. Powered by Ethereum, IPFS, Superfluid and Textile, Creaton allows a streaming based subscription system where subscribers support their favorite creators with stablecoins in real-time. Utilizing p2p encryption, Creaton makes sure of exclusive permission-less content delivery to subscribers and eliminates the need for unnecessary middlemen or centralized services. Check out our DApp here:

[Creaton live dev build](https://creaton.on.fleek.co/)

[Demo video](https://youtu.be/XXc1__LGxWw)

# Setup

## requirements :

### docker and docker-compose

`docker` and `docker-compose` are used to setup the external services (an ipfs node and a [subgraph](https://thegraph.com) node)

If you prefer (or do not have access to docker/docker-compose) you can run them independently. 

### node

This app requires [node.js](https://nodejs.org/) (tested on v12+)


## install dependencies :

```bash
npm install
cd contracts
npm install
cd ../react-app/
npm install
cd ../subgraph/
npm install
```

# Development
## Set environment variables
Create a `.env` file and set the following env variables in:
- `INFURA_TOKEN=<infura token to talk to a network>`
- `MNEMONIC=<mnemonic of the account that will deploy the contract>`
- `ALCHEMY_TOKEN=<alchemy token to talk to a network>`
- Superfluid Contracts:
```
# Checkout Superfluid Network Directory: https://docs.superfluid.finance/superfluid/networks/networks
# MUMBAI
SUPERFLUID_HOST = 0xEB796bdb90fFA0f28255275e16936D25d3418603
SUPERFLUID_CFA = 0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873
SUPERFLUID_SUPERTOKENFACTORY = 0x200657E2f123761662567A1744f9ACAe50dF47E6
SUPERFLUID_RESOLVER = 0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3
SUPERFLUID_VERSION = v1
```

## Deploy the contracts

Run `./command.py` and choose `deploy contracts`. After deployment choose to update the contracts as well.

## Run subgraph docker
First edit `subgraph/docker-compose.yml` end edit the `etherum` env variable to an api url in this format:
```
mumbai:https://polygon-mumbai.infura.io/v3/<YOUR_TOKEN>
```

Then run `./command.py` and choose `run subgraph docker`.

## Run react app
```
cd react-app
npm run start
```

