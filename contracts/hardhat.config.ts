import 'dotenv';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-web3';
import 'hardhat/config';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import {Wallet} from '@ethersproject/wallet';

// const mnemonic = process.env.MNEMONIC;
const mnemonic = 'aerobic claim erase pretty real unfold twenty label yard open square universe';
let accounts;
let hardhatAccounts;

if (mnemonic) {
  accounts = {
    mnemonic,
  };
} else {
  hardhatAccounts = [];
  for (let i = 0; i < 10; i++) {
    const wallet = Wallet.createRandom();
    hardhatAccounts.push({
      privateKey: wallet.privateKey,
      balance: '1000000000000000000000',
    });
  }
}

const config = {

  solidity: {
    compilers: [
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      {
        version: '0.6.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      }
    ], 
  },

  namedAccounts: {
    admin: {
      default: 0,
    },
    creator: {
      default: 1,
    },
    subscriber: {
      default: 2,
    },
    treasury: {
      default: 3,
    },
  },
  defaultNetwork: 'goerli',
  networks: {
    coverage: {
      url: 'http://localhost:5458',
    },
    hardhat: {
      accounts: hardhatAccounts,
      forking: {
        url: 'https://eth-goerli.alchemyapi.io/v2/' + process.env.ALCHEMY_TOKEN,
      },
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts,
    },
    staging: {
      url: 'https://eth-goerli.alchemyapi.io/v2/' + process.env.ALCHEMY_TOKEN,
      accounts,
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_TOKEN,
      accounts,
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/' + process.env.INFURA_TOKEN,
      accounts,
    },
    goerli: {
      // url: 'https://eth-goerli.alchemyapi.io/v2/' + process.env.ALCHEMY_TOKEN,
      url: 'https://eth-goerli.alchemyapi.io/v2/' + 'IUpvNP1pJQSpTDx7buvmQTFD6L9aYvUi',
      accounts,
    },
    mumbai: {
      url: 'https://matic-mumbai.p2pify.com',
      accounts,
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_TOKEN,
      accounts,
    },
  },
  paths: {
    sources: 'src',
  },
};

module.exports = config;
