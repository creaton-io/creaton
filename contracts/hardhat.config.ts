import 'dotenv';
import 'hardhat/config';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
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
    version: '0.7.1',
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  namedAccounts: {
    creator: {
      default: 0,
    },
    subscriber: {
      default: 1,
    },
  },
  networks: {
    coverage: {
      url: 'http://localhost:5458',
    },
    hardhat: {
      accounts: hardhatAccounts,
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts,
    },
    staging: {
      url: 'https://goerli.infura.io/v3/' + process.env.INFURA_TOKEN,
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
      url: 'https://goerli.infura.io/v3/' + process.env.INFURA_TOKEN,
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
