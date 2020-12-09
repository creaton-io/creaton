/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
//import WalletStores from 'web3w';
import SuperfluidABI from '../build/abi';
import {Contract} from '@ethersproject/contracts';
import {contracts} from '../contracts.json';
import {defaultAbiCoder, Interface} from '@ethersproject/abi';
import {wallet} from '../stores/wallet';

export class SuperfluidSDK {
  constructor(web3Provider, version, chainId) {
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

    console.log('Resolving contracts with version', this.version);
    const superfluidAddress = await this.resolver.get('Superfluid.0.1.2-preview-20201014');
    const cfaAddress = await this.resolver.get('ConstantFlowAgreementV1.0.1.2-preview-20201014');
    const idaAddress = await this.resolver.get('InstantDistributionAgreementV1.0.1.2-preview-20201014');

    console.log('Superfluid', superfluidAddress);
    console.log('ConstantFlowAgreementV1', cfaAddress);
    console.log('InstantDistributionAgreementV1', idaAddress);

    //this.host = await this.contracts.ISuperfluid.at(superfluidAddress);
    this.host = new Contract(superfluidAddress, SuperfluidABI.ISuperfluid, wallet.provider.getSigner());
    this.agreements = {
      cfa: await new Contract(superfluidAddress, SuperfluidABI.IConstantFlowAgreementV1, wallet.provider.getSigner()),
      ida: await new Contract(
        superfluidAddress,
        SuperfluidABI.IInstantDistributionAgreementV1,
        wallet.provider.getSigner()
      ),
    };
  }

  async getERC20Wrapper(tokenInfo) {
    const tokenInfoSymbol = await tokenInfo.symbol();
    console.log('testtoken address:', tokenInfo.address);
    console.log('testtoken symbol:', `${tokenInfoSymbol}x`);
    console.log('host', this.host);
    const wrapper = await this.host.getERC20Wrapper(tokenInfo.address, `${tokenInfoSymbol}x`);
    console.log('wrapper contract data:', wrapper.data);

    this.interfaceSuperfluid = new Interface(SuperfluidABI.ISuperfluid);

    const wrapperData = this.interfaceSuperfluid.decodeFunctionData('getERC20Wrapper', wrapper.data);
    console.log('decoded wrapper data', wrapperData);

    return new Contract(wrapperData.underlyingToken, SuperfluidABI.ISuperToken, wallet.provider.getSigner());
  }

  async createERC20Wrapper(tokenInfo) {
    const tokenInfoName = await tokenInfo.name();
    const tokenInfoSymbol = await tokenInfo.symbol();
    const tokenInfoDecimals = await tokenInfo.decimals();
    await this.host.createERC20Wrapper(
      tokenInfo.address,
      tokenInfoDecimals,
      `Super ${tokenInfoName}`,
      `${tokenInfoSymbol}x`
    );
  }
}
