/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {ethers} from 'ethers';
// import {abi} from "ethereumjs-abi";
import {defaultAbiCoder} from "@ethersproject/abi";
// const abi = require("ethereumjs-abi");

export class BiconomyHelper {

  constructor(){
    this.helperAttributes = {};
    // let supportedNetworks = [42,4]; //add more
    this.helperAttributes.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    // any other constants needed goes in helperAttributes
    
    this.biconomyForwarderAddressMap = {};
    
    // Kovan
    this.biconomyForwarderAddressMap[42] = "0x38C72836364Ae731dCAE427e73585f5D1086dD53";
    
    //Rinkeby
    this.biconomyForwarderAddressMap[4] = "0xfA57c142A798eb70404883b7E8f0ec9dA10684B0";
    this.biconomyForwarderAddressMap[5] = "0x3075b4dc7085C48A14A5A39BBa68F58B19545971"
    
    this.helperAttributes.biconomyForwarderAbi = [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"domainValue","type":"bytes"}],"name":"DomainRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"EIP712_DOMAIN_TYPE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"domains","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"}],"name":"registerDomainSeparator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyEIP712","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyPersonalSign","outputs":[],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
    
    this.helperAttributes.biconomyForwarderDomainData = {
        name : "Biconomy Forwarder", 
        version : "1",
      };
    
    this.helperAttributes.domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "salt", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ];
    
    this.helperAttributes.forwardRequestType = [
        {name:'from',type:'address'},
        {name:'to',type:'address'},
        {name:'token',type:'address'},
        {name:'txGas',type:'uint256'},
        {name:'tokenGasPrice',type:'uint256'},
        {name:'batchId',type:'uint256'},
        {name:'batchNonce',type:'uint256'},
        {name:'deadline',type:'uint256'},
        {name:'data',type:'bytes'}
      ];
  }
  
  /**
   * Returns ABI and contract address based on network Id
   * You can build biconomy forwarder contract object using above values and calculate the nonce
   * @param {*} networkId 
   */
  async getBiconomyForwarderConfig(networkId){
    //get trusted forwarder contract address from network id
    const forwarderAddress = this.biconomyForwarderAddressMap[networkId];
    return {abi: this.helperAttributes.biconomyForwarderAbi, address: forwarderAddress};
  }
  
  /**
   * pass the below params in any order e.g. account=<account>,batchNone=<batchNone>,...
   * @param {*}  account - from (end user's) address for this transaction 
   * @param {*}  to - target recipient contract address
   * @param {*}  gasLimitNum - gas estimation of your target method in numeric format
   * @param {*}  batchId - batchId 
   * @param {*}  batchNonce - batchNonce which can be verified and obtained from the biconomy forwarder
   * @param {*}  data - functionSignature of target method
   * @param {*}  deadline - optional deadline for this forward request 
   */

  async buildForwardTxRequest ({account, to, gasLimitNum, batchId, batchNonce, data, deadline}){
    const req = {
      from: account,
      to: to,
      token: this.helperAttributes.ZERO_ADDRESS,
      txGas: gasLimitNum,
      tokenGasPrice: "0",
      batchId: parseInt(batchId),
      batchNonce: parseInt(batchNonce),
      deadline: deadline || Math.floor(Date.now() / 1000 + 3600),
      data: data
    };
    return req;
  }
  
  /**
   * pass your forward request and network Id 
   * use this method to build message to be signed by end user in EIP712 signature format 
   * @param {*} request - forward request object
   * @param {*} networkId 
   */

  async getDataToSignForEIP712 (request, networkId){
    const forwarderAddress = this.biconomyForwarderAddressMap[networkId];
    let domainData = this.helperAttributes.biconomyForwarderDomainData;
    domainData.salt = networkId;
    domainData.verifyingContract = forwarderAddress;

    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: this.helperAttributes.domainType,
            ERC20ForwardRequest: this.helperAttributes.forwardRequestType
        },
        domain: domainData,
        primaryType: "EIP712Domain",
        message: request
    });
    return dataToSign;
  }
  
  /**
   * pass your forward request
   * use this method to build message to be signed by end user in personal signature format 
   * @param {*} networkId 
   */

  async getDataToSignForPersonalSign(request){
    const hashToSign = ethers.utils.solidityKeccak256([
      "address",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
    ], [
      request.from,
      request.to,
      request.token,
      request.txGas,
      request.tokenGasPrice,
      request.batchId,
      request.batchNonce,
      request.deadline,
      ethers.utils.keccak256(request.data),
    ]);
    return hashToSign;
  }
  
  /**
   * get the domain seperator that needs to be passed while using EIP712 signature type
   * @param {*} networkId 
   */

  async getDomainSeperator(networkId){
    const forwarderAddress = this.biconomyForwarderAddressMap[networkId];
    let domainData = this.helperAttributes.biconomyForwarderDomainData;
    domainData.salt = networkId;
    domainData.verifyingContract = forwarderAddress;

    const domainSeparator = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([
        "bytes32",
        "bytes32",
        "bytes32",
        "uint256",
        "address"
    ], [
        ethers.utils.id("EIP712Domain(string name,string version,uint256 salt,address verifyingContract)"),
        ethers.utils.id(domainData.name),
        ethers.utils.id(domainData.version),
        domainData.salt,
        domainData.verifyingContract,
    ]));
    return domainSeparator;
  }
}
