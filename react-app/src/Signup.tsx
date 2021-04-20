import 'react-app-polyfill/ie11';
import * as React from 'react';
import {Formik, Field, Form, FormikHelpers} from 'formik';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {RelayProvider} from "@opengsn/gsn";
import {Contract} from "ethers";
import creaton_contracts from './contracts.json'
import {useCurrentCreator} from "./Utils";
import {useContext, useEffect, useState} from "react";
import {NotificationHandlerContext} from "./ErrorHandler";
import Web3Modal from "web3modal";
import {Button} from "./elements/button";
import {Input} from "./elements/input";

const CreatonAdminContract = creaton_contracts.CreatonAdmin

interface Values {
  creatorName: string;
  subscriptionPrice: number;
}


const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi)
const SignUp = () => {


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

  function submitForm(event) {
    const {library} = context;
    console.log(creatorFactoryContract)
    // @ts-ignore
    const connectedContract = creatorFactoryContract.connect(library!.getSigner())
    connectedContract.deployCreator(creatorName, subscriptionPrice,collectionName,collectionSymbol)
      .then(async function (response) {
        setSignedup("Waiting for your signup to be confirmed on the blockchain...")
        await response.wait(1)
        notificationHandler.setNotification({description: 'Signed up successfully, welcome to Creaton!', type: 'success'})
      }).catch(function (error) {
      notificationHandler.setNotification({description: 'Failed to signup. ' + error.message, type: 'error'})
    });
    event.preventDefault();
  }

  return (
    <div>
      <form onSubmit={submitForm}>
        <label htmlFor="creatorName">Bio</label>
        <Input type="text" placeholder="Artist/Painter/..." value={creatorName} onChange={(event) => {
          setCreatorName(event.target.value)
        }}></Input>

        <label htmlFor="subscriptionPrice">Subscription Price</label>
        <Input type="number" value={subscriptionPrice} onChange={(event) => {
          setSubscriptionPrice(event.target.value)
        }}></Input>

        <label>Collection Name</label>
        <Input type="text" placeholder="My beautiful NFT creations" value={collectionName} onChange={(event) => {
          setCollectionName(event.target.value)
        }}></Input>

        <label>Collection Symbol</label>
        <Input type="text" placeholder="MYART" value={collectionSymbol} onChange={(event) => {
          setCollectionSymbol(event.target.value)
        }}></Input>

        <Button type="submit" label="Become a Creator"></Button>
      </form>
    </div>
  );
};

export default SignUp;
