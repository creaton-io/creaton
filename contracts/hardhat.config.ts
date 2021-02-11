import 'dotenv';
import '@nomiclabs/hardhat-web3';
import 'hardhat/config';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import '@tenderly/hardhat-tenderly';
// require('solidity-coverage');

const {Wallet} = require('@ethersproject/wallet');

const mnemonic = process.env.MNEMONIC;
let accounts;
let hardhatAccounts;

if (mnemonic) {
  accounts = {
    mnemonic,
  };
  hardhatAccounts = [];
  for (let i = 0; i < 10; i++) {
    const wallet = Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/" + i);
    hardhatAccounts.push({
      privateKey: wallet.privateKey,
      balance: '1000000000000000000000',
    });
  }
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
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
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
    stagingMatic: {
      url: 'https://rpc-mumbai.maticvigil.com/v1/c0e16c25bb88390e3ebbd68547f27d5756420c5a',
      accounts
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
      url: 'https://eth-goerli.alchemyapi.io/v2/' + process.env.ALCHEMY_TOKEN,
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
  tenderly: {
    project: 'creaton',
    username: 'aeroxander',
  },
};

module.exports = config;
