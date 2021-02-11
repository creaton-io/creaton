/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
//import WalletStores from 'web3w';
import Superfluid from '../build/abi.js';
import {Contract} from '@ethersproject/contracts';
import {id} from '@ethersproject/hash';
import {defaultAbiCoder, Interface} from '@ethersproject/abi';
// import {wallet} from '../stores/wallet';

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
      chainConfigs: Superfluid.ABI,
      builtin: {autoProbe: true},
      localStoragePrefix:
        window.basepath && window.basepath.startsWith('/ipfs/') ? window.basepath.slice(6) : undefined, // ensure local storage is not shared across web3w apps on ipfs gateway
      options: [
        'builtin',
        new WalletConnectModuleLoader({nodeUrl, chainId, infuraId: 'bc0bdd4eaac640278cdebc3aa91fabe4'}),
        new PortisModuleLoader(PORTIS_DAPP_ID, {nodeUrl, chainId}),
      ],
    });*/

    this.contractNames = Object.keys(Superfluid.ABI);

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
      this.contracts[i] = new Contract(Superfluid.ABI[i]);
    });
    this.web3 = new Web3(web3Provider);
    */
  }

  async initialize() {
    const chainId = this.chainId;
    console.log('chainId', chainId);

    console.debug('Resolver at', '0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3');
    //this.resolver = await this.contracts.IResolver.at(config.resolverAddress);
    this.resolver = new Contract(
      '0x8C54C83FbDe3C59e59dd6E324531FB93d4F504d3',
      Superfluid.ABI.IResolver,
      this.web3Provider.getSigner()
    );

    this.interfaceFlow = new Interface(Superfluid.ABI.IConstantFlowAgreementV1);
    this.interfaceCoder = defaultAbiCoder;

    const superfluidAddress = await this.resolver.get(`Superfluid.${this.version}`);
    // load agreements
    const cfav1Type = id('org.superfluid-finance.agreements.ConstantFlowAgreement.v1');
    const idav1Type = id('org.superfluid-finance.agreements.InstantDistributionAgreement.v1');

    //this.host = await this.contracts.ISuperfluid.at(superfluidAddress);
    this.host = new Contract(superfluidAddress, Superfluid.ABI.ISuperfluid, this.web3Provider.getSigner());
    const cfaAddress = await this.host.getAgreementClass(cfav1Type);
    const idaAddress = await this.host.getAgreementClass(idav1Type);
    this.agreements = {
      cfa: await new Contract(cfaAddress, Superfluid.ABI.IConstantFlowAgreementV1, this.web3Provider.getSigner()),
      ida: await new Contract(idaAddress, Superfluid.ABI.IInstantDistributionAgreementV1, this.web3Provider.getSigner()),
    };

    //this.agreements = {
    //  cfa: await this.contracts.IConstantFlowAgreementV1.at(cfaAddress),
    //  ida: await this.contracts.IInstantDistributionAgreementV1.at(idaAddress),
    //};

    // load agreement helpers
    this.cfa = await import('./ConstantFlowAgreementV1Helper');
    this.ida = await import('./InstantDistributionAgreementV1Helper');
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
        const superToken = new Contract(superTokenAddress, Superfluid.ABI.ISuperToken, this.web3Provider.getSigner());
        const superTokenSymbol = await superToken.symbol();
        this.tokens[tokenSymbol] = new Contract(
          tokenAddress,
          Superfluid.ABI.ERC20WithTokenInfo,
          this.web3Provider.getSigner()
        );
        this.tokens[superTokenSymbol] = superToken;
        console.debug(`${tokenSymbol}: ERC20WithTokenInfo .tokens["${tokenSymbol}"] @${tokenAddress}`);
        console.debug(`${superTokenSymbol}: ISuperToken .tokens["${superTokenSymbol}"] @${superTokenAddress}`);
      }
    }

    this.utils = await import('./Utils');
  }

  async getERC20Wrapper(tokenInfo) {
    const tokenInfoSymbol = await tokenInfo.symbol();
    console.log('testtoken address:', tokenInfo.address);
    console.log('testtoken symbol:', `${tokenInfoSymbol}x`);
    console.log('host', this.host);
    const wrapper = await this.host.getERC20Wrapper(tokenInfo.address, `${tokenInfoSymbol}x`);
    return new Contract(wrapper.wrapperAddress, Superfluid.ABI.ISuperToken, this.web3Provider.getSigner());
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
      Superfluid.ABI.ISuperTokenFactory,
      this.web3Provider.getSigner()
    );
    console.log(factory);
    upgradability = typeof upgradability === 'undefined' ? 1 : upgradability;
    const tx = await factory
      .connect(this.web3Provider.getSigner())
      ['createERC20Wrapper(address,uint8,string,string)'](
        tokenInfo.address,
        upgradability,
        `Super ${tokenName}`,
        superTokenSymbol
      );

    console.log(tx);
    //TODO: tx.logs is for web3.js probably, so port this code to ethers.js
    const wrapperAddress = tx.logs[0].args.token;
    const u = ['Non upgradable', 'Semi upgrdable', 'Full upgradable'][upgradability];
    console.log(`${u} super token ${superTokenSymbol} created at ${wrapperAddress}`);
    return new Contract(wrapperAddress, Superfluid.ABI.ISuperToken, this.web3Provider.getSigner());
  }
}
