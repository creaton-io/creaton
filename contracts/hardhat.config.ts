import 'dotenv/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-web3';
import '@nomiclabs/hardhat-waffle';
import 'hardhat/config';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import '@openzeppelin/hardhat-upgrades';
import '@openzeppelin/hardhat-defender';
import {Wallet} from '@ethersproject/wallet';
import 'hardhat-contract-sizer';
import 'solidity-coverage';
import {HardhatUserConfig} from 'hardhat/config';
import '@tenderly/hardhat-tenderly';

const mnemonic = process.env.MNEMONIC;
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
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  defender: {
    apiKey: '4ZWQXK75DWT1QxDqSPTGzbU9uu3ZetzZ',
    apiSecret: '5gu1MrsvEoWfiiCafGeBytuoUmaSRoWt4NAed1gepL4pJNTqzNSjVB7MdhZSj3SW',
  },
  tenderly: {
    project: 'Creaton',
    username: 'Aer0xander',
  },
  gasReporter: {
    enabled: false, //set to false for faster compile times!
    currency: 'CAD',
    gasPrice: 44,
    coinmarketcap: 'a5c40070-7a5a-442e-9b9c-43ed83047df6',
    showTimeSpent: true,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_SCAN,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.2',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
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
        version: '0.7.6',
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
        version: '0.6.0',
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
  defaultNetwork: 'hardhat',
  networks: {
    coverage: {
      url: 'http://localhost:5458',
    },
    hardhat: {
      accounts: hardhatAccounts,
      forking: {
        url: 'https://polygon-mumbai.g.alchemy.com/v2/mI1l0P98j53LS6ZDuAyn2vWI7RSp_OqT',
      },
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts,
    },
    staging: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/mI1l0P98j53LS6ZDuAyn2vWI7RSp_OqT',
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
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : "remote",
    },
    matic: {
      url: 'https://matic-mainnet--jsonrpc.datahub.figment.io/apikey/' + process.env.FIGMENT_TOKEN,
      accounts,
    },
  },
  paths: {
    sources: 'src',
  },
};

module.exports = config;
