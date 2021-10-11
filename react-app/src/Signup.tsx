import 'react-app-polyfill/ie11';
import {useWeb3React} from "./web3-react/core";
import {TransactionRequest, Web3Provider} from "@ethersproject/providers";
import {Contract} from "ethers";
import creaton_contracts from "./Contracts";
import {useCurrentCreator} from "./Utils";
import {useContext, useEffect, useState} from "react";
import {NotificationHandlerContext} from "./ErrorHandler";
import {Button} from "./elements/button";
import {Input} from "./elements/input";
import {Web3UtilsContext} from "./Web3Utils";
import {Transaction} from '@ethereumjs/tx';
import Common from '@ethereumjs/common'
import { Deferrable } from '@ethersproject/properties';

const CreatonAdminContract = creaton_contracts.CreatonAdmin

interface Values {
  creatorName: string;
  subscriptionPrice: number;
}


const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi)
const SignUp = () => {

  const web3utils = useContext(Web3UtilsContext)
  const notificationHandler = useContext(NotificationHandlerContext)
  const context = useWeb3React<Web3Provider>()
  const [signedup, setSignedup] = useState<any>(false)
  const {currentCreator} = useCurrentCreator()

  const [creatorName, setCreatorName] = useState("")
  const [subscriptionPrice, setSubscriptionPrice] = useState("5")
  const [collectionName, setCollectionName] = useState("")
  const [collectionSymbol, setCollectionSymbol] = useState("")

  if (!context.library)
    return (<div>Please connect your wallet</div>)
  if (currentCreator !== undefined)
    return (<div>Congratulation you just signed up on creaton!</div>)
  if (signedup)
    return (<div>{signedup}</div>)

  async function submitForm(event) {
    console.log(creatorFactoryContract)


    // let contract = new ethers.Contract(<CONTRACT_ADDRESS>,
    // <CONTRACT_ABI>, biconomy.getSignerByAddress(userAddress));
      
    // let contractInterface = new ethers.utils.Interface(<CONTRACT_ABI>);
        
    // let userAddress = <Selected Address>;

    console.log(context.account)
    const signer = context.library!.getSigner();

    const connectedContract = creatorFactoryContract.connect(signer)

    let { data } = await creatorFactoryContract.populateTransaction.deployCreator(creatorName, subscriptionPrice,collectionName,collectionSymbol)
    
    let gasLimit = await connectedContract.estimateGas.deployCreator(creatorName, subscriptionPrice,collectionName,collectionSymbol);
    console.log("Gas limit : ", gasLimit);
          
    const tes2: Deferrable<TransactionRequest> =  {
                to: connectedContract.address,
                from: context.account!,
                data: data,
                gasLimit: gasLimit
            };

            let txParams = {
              to: connectedContract.address,
              from: context.account,
              data: data
          };

    //const serializedTransaction = txParams.serialize();
    //const raw = '0x' + serializedTransaction.toHexString();

    const customChainParams = { name: 'matic-mumbai', chainId: 80001, networkId: 80001 }
    const common = Common.forCustomChain('goerli', customChainParams)
    //let test = new Transaction.Transaction.();
    const tx = Transaction.fromTxData(txParams, { common });
    
    //const test: Deferrable<TransactionRequest> = '0x' + tx.serialize().toString('hex').
    const tx1 = signer.sendTransaction(tes2);
    console.log("Transaction hash : ", tx1);
    //event emitter methods

    setSignedup("Waiting for your signup to be confirmed on the blockchain...");
    
    notificationHandler.setNotification({description: 'Signed up successfully, welcome to Creaton!', type: 'success'})

    // @ts-ignore
    // const connectedContract = creatorFactoryContract.connect(library!.getSigner())
    // connectedContract.deployCreator(creatorName, subscriptionPrice,collectionName,collectionSymbol)
    //   .then(async function (response) {
    //     setSignedup("Waiting for your signup to be confirmed on the blockchain...")
    //     web3utils.setIsWaiting(true);
    //     await response.wait(1)
    //     web3utils.setIsWaiting(false);
    //     notificationHandler.setNotification({description: 'Signed up successfully, welcome to Creaton!', type: 'success'})
    //   }).catch(function (error) {
    //   notificationHandler.setNotification({description: 'Failed to signup. ' + error.message, type: 'error'})
    // });
    // event.preventDefault();
  }

  return (
    <div className="grid grid-cols-1 place-items-center m-auto text-white">
      <p className="text-5xl pt-12 pb-6 pl-6">
        Sign Up As Creator!
      </p>
      <p className="text-xl opacity-50 pl-6">
        Setup your creator profile so you can upload content and start earning!
      </p>
      <form onSubmit={submitForm} className="py-10">
        <Input className="bg-gray-900" type="text" label="Bio" placeholder="Artist/Painter/..." value={creatorName} onChange={(event) => {
          setCreatorName(event.target.value)
        }}></Input>

        <Input className="bg-gray-900" type="number" label="Subscription Price per Month" min="1" value={subscriptionPrice} onChange={(event) => {
          setSubscriptionPrice(event.target.value)
        }} tooltip="Each subscriber will stream this amount of USDC per month"></Input>

        <Input className="bg-gray-900" type="text" label="Collection Name" placeholder="My exclusive content" value={collectionName} onChange={(event) => {
          setCollectionName(event.target.value)
        }} tooltip="This would be the name of your NFT contract"></Input>

        <Input className="bg-gray-900" type="text" label="Collection Symbol" placeholder="MYART" value={collectionSymbol} onChange={(event) => {
          setCollectionSymbol(event.target.value)
        }} tooltip="This would be the symbol of your NFT contract"></Input>

        <Button className="mt-6 py-3 mb-16" type="submit" label="Become a Creator"></Button>
      </form>
    </div>
  );
};

export default SignUp;
