/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
//import WalletStores from 'web3w';
import SuperfluidABI from '../build/abi';
import {Contract} from '@ethersproject/contracts';
import {contracts} from '../contracts.json';
import {defaultAbiCoder, Interface} from '@ethersproject/abi';
import {wallet} from '../stores/wallet';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export class SuperfluidSDK {
  /**
   * @dev Create new Superfluid framework object
   * @param {Web3.Provider} web3Provider web3 provider object
   * @param {boolean} isTruffle if the framework is used within truffle environment
   * @param {string} version protocol contract version
   * @param {string} chainId force chainId, instead relying on web3.eth.net.getId
   * @param {string[]} tokens the tokens to be loaded, each element is an alias for the underlying token
   * @return {Framework} The Framework object
   *
   * NOTE: You should call async function Framework.initialize to initialize the object.
   */
  constructor(web3Provider, version, chainId, tokens) {
    /*
    const walletStores = WalletStores({
      chainConfigs: SuperfluidABI,
      builtin: {autoProbe: true},
      localStoragePrefix:
        window.basepath && window.basepath.startsWith('/ipfs/') ? window.basepath.slice(6) : undefined, // ensure local storage is not shared across web3w apps on ipfs gateway
      options: [
        'builtin',
        new WalletConnectModuleLoader({nodeUrl, chainId, infuraId: 'bc0bdd4eaac640278cdebc3aa91fabe4'}),
        new PortisModuleLoader(PORTIS_DAPP_ID, {nodeUrl, chainId}),
      ],
    });*/

    this.contractNames = Object.keys(SuperfluidABI);

    this.chainId = chainId;
    this.version = version || 'test';
    this.web3Provider = web3Provider;
    this._tokens = tokens;
    /*
    //const web3 = new Web3(web3Provider);
    // load contracts
    this.contracts = {};
    //if (!web3Provider) throw new Error('web3Provider is required');
    // load contracts from ABI
    contractNames.forEach((i) => {
      this.contracts[i] = new Contract(SuperfluidABI[i]);
    });
    this.web3 = new Web3(web3Provider);
    */
  }

  async initialize() {
    const chainId = this.chainId;
    console.log('chainId', chainId);

    //const superfluidAddress = await this.resolver.get.call(`Superfluid.${this.version}`);
    //const cfaAddress = await this.resolver.get.call(`ConstantFlowAgreementV1.${this.version}`);
    //const idaAddress = await this.resolver.get.call(`InstantDistributionAgreementV1.${this.version}`);

    this.interfaceCreateFlow = new Interface(SuperfluidABI.IConstantFlowAgreementV1);
    this.interfaceCollateral = new Interface(contracts.CreatonSuperApp.abi);

    this.interfaceCoder = defaultAbiCoder;

    console.debug('Resolver at', '0x3710AB3fDE2B61736B8BB0CE845D6c61F667a78E');
    //this.resolver = await this.contracts.IResolver.at(config.resolverAddress);
    this.resolver = new Contract(
      '0x3710AB3fDE2B61736B8BB0CE845D6c61F667a78E',
      SuperfluidABI.IResolver,
      wallet.provider.getSigner()
    );

    //this.host = await this.contracts.ISuperfluid.at(superfluidAddress);
    this.host = new Contract(superfluidAddress, SuperfluidABI.ISuperfluid, wallet.provider.getSigner());
    this.agreements = {
      cfa: await new Contract(cfaAddress, SuperfluidABI.IConstantFlowAgreementV1, wallet.provider.getSigner()),
      ida: await new Contract(idaAddress, SuperfluidABI.IInstantDistributionAgreementV1, wallet.provider.getSigner()),
    };

    // load agreements
    const cfav1Type = this.web3.utils.sha3('org.superfluid-finance.agreements.ConstantFlowAgreement.v1');
    const idav1Type = this.web3.utils.sha3('org.superfluid-finance.agreements.InstantDistributionAgreement.v1');

    const cfaAddress = await this.host.getAgreementClass.call(cfav1Type);
    const idaAddress = await this.host.getAgreementClass.call(idav1Type);
    this.agreements = {
      cfa: await this.contracts.IConstantFlowAgreementV1.at(cfaAddress),
      ida: await this.contracts.IInstantDistributionAgreementV1.at(idaAddress),
    };

    // load agreement helpers
    this.cfa = new (require('./ConstantFlowAgreementV1Helper'))(this);
    this.ida = new (require('./InstantDistributionAgreementV1Helper'))(this);
    console.debug(`ConstantFlowAgreementV1: TruffleContract .agreements.cfa @${cfaAddress} | Helper .cfa`);
    console.debug(`InstantDistributionAgreementV1: TruffleContract .agreements.ida @${idaAddress} | Helper .ida`);

    // load tokens
    this.tokens = {};
    if (this._tokens) {
      for (let i = 0; i < this._tokens.length; ++i) {
        const tokenSymbol = this._tokens[i];
        const tokenAddress = await this.resolver.get(`tokens.${tokenSymbol}`);
        if (tokenAddress === ZERO_ADDRESS) {
          throw new Error(`Token ${tokenSymbol} is not registered`);
        }
        const superTokenAddress = await this.resolver.get(`supertokens.${this.version}.${tokenSymbol}x`);
        if (superTokenAddress === ZERO_ADDRESS) {
          throw new Error(`Token ${tokenSymbol} doesn't have a super token wrapper`);
        }
        const superToken = new Contract(superTokenAddress, SuperfluidABI.ISuperToken, wallet.provider.getSigner());
        const superTokenSymbol = await superToken.symbol();
        this.tokens[tokenSymbol] = new Contract(
          tokenAddress,
          SuperfluidABI.ERC20WithTokenInfo,
          wallet.provider.getSigner()
        );
        this.tokens[superTokenSymbol] = superToken;
        console.debug(`${tokenSymbol}: ERC20WithTokenInfo .tokens["${tokenSymbol}"] @${tokenAddress}`);
        console.debug(`${superTokenSymbol}: ISuperToken .tokens["${superTokenSymbol}"] @${superTokenAddress}`);
      }
    }

    this.utils = new (require('./Utils'))(this);
  }

  async getERC20Wrapper(tokenInfo) {
    const tokenInfoSymbol = await tokenInfo.symbol();
    console.log('testtoken address:', tokenInfo.address);
    console.log('testtoken symbol:', `${tokenInfoSymbol}x`);
    console.log('host', this.host);
    const wrapper = await this.host.getERC20Wrapper(tokenInfo.address, `${tokenInfoSymbol}x`);
    return new Contract(wrapper.wrapperAddress, SuperfluidABI.ISuperToken, wallet.provider.getSigner());
  }

  /**
   * @dev Create the ERC20 wrapper from underlying token
   * @param {Any} tokenInfo the TokenInfo contract object to the underlying token
   * @param {address} from (optional) send transaction from
   * @param {address} upgradability (optional) send transaction from
   * @return {Promise<Transaction>} web3 transaction object
   */
  async createERC20Wrapper(tokenInfo, {from, upgradability} = {}) {
    const tokenName = await tokenInfo.name();
    const tokenSymbol = await tokenInfo.symbol();
    const superTokenSymbol = `${tokenSymbol}x`;
    const factory = new Contract(
      await this.host.getSuperTokenFactory(),
      SuperfluidABI.ISuperTokenFactory,
      wallet.provider.getSigner()
    );

    upgradability = typeof upgradability === 'undefined' ? 1 : upgradability;
    const tx = await factory.createERC20Wrapper(
      tokenInfo.address,
      upgradability,
      `Super ${tokenName}`,
      superTokenSymbol,
      ...((from && [{from}]) || []) // don't mind this silly js stuff, thanks to web3.js
    );
    const wrapperAddress = tx.logs[0].args.token;
    const u = ['Non upgradable', 'Semi upgrdable', 'Full upgradable'][upgradability];
    console.log(`${u} super token ${superTokenSymbol} created at ${wrapperAddress}`);
    return new Contract(wrapperAddress, SuperfluidABI.ISuperToken, wallet.provider.getSigner());
  }
}
