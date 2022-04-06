import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from '@web3-react/core';
import { ethers } from "ethers";
import { useContext } from "react";
import { REACTION_CONTRACT_ADDRESS } from "../Config";
import creaton_contracts from "../Contracts";
import { BiconomyContext, IBiconomyContext } from "../contexts/Biconomy";
import { NotificationHandlerContext } from "../ErrorHandler";

type ContractName =
  | 'erc20Contract'
	| 'ReactionToken'

type MetaTxOptions = {
  contractAddress?: string
};

export const useMetaTx = () => {
  const web3Context = useWeb3React();
  const web3Provider = web3Context.provider as Web3Provider;
  const chainId = web3Context.chainId;
  const { isBiconomyReady, biconomy } = useContext(BiconomyContext) as IBiconomyContext;
  const notificationHandler = useContext(NotificationHandlerContext);


  const executeMetaTx = async (
    contractName: ContractName,
    fnName: string,
    fnParams: (string | number | boolean)[],
    options?: MetaTxOptions
  ): Promise<any> => {
    if(!isBiconomyReady){
      notificationHandler.setNotification({description: 'Trying to execute a MetaTX but Biconomy is not ready', type: 'error'});
      return false
    };

    if(!web3Provider) throw "No Provider set!"
    if(!chainId) throw "No ChainId set!"

    let contract: ethers.Contract;
    let contractInterface: ethers.utils.Interface;
    let contractAddress: string;
    let contractABI: [];

    const web3ProviderSigner = web3Provider.getSigner()
    const userAddress = await web3ProviderSigner.getAddress()

    const signer = biconomy.getSignerByAddress(userAddress);

    switch (contractName) {
      case 'erc20Contract':
        if(!options?.contractAddress) return false;
        contractAddress = options.contractAddress;
        contractABI = creaton_contracts.erc20.abi;
        break
      case 'ReactionToken':
        contractAddress = REACTION_CONTRACT_ADDRESS;
        contractABI = creaton_contracts.ReactionToken.abi;
        break
      default:
        throw "Contract not supported!"
    }

    // Initialize Constants
    contract = new ethers.Contract(contractAddress, contractABI, signer);  
    contractInterface = new ethers.utils.Interface(contractABI);

    let { data } = await contract.populateTransaction[fnName](...fnParams);
    let provider = biconomy.getEthersProvider();

    let gasLimit = await provider.estimateGas({
      to: contractAddress,
      from: userAddress,
      data: data
    });

    let txParams = {
      data: data,
      to: contractAddress,
      from: userAddress,
      gasLimit: gasLimit*2,
      signatureType: "EIP712_SIGN"
    };

    // as ethers does not allow providing custom options while sending transaction                 
    let txHash = await provider.send("eth_sendTransaction", [txParams]);

    //event emitter methods
    provider.once(txHash, (transaction) => {
      // Emitted when the transaction has been mined
      //show success message
      console.log(transaction);
      //do something with transaction hash
    });
  };

  return { executeMetaTx }
};