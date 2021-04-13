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
import {ErrorHandlerContext} from "./ErrorHandler";
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


  const errorHandler = useContext(ErrorHandlerContext)
  const context = useWeb3React<Web3Provider>()
  const [signedup, setSignedup] = useState<any>(false)
  const [library, setLibrary] = useState<any>(null)
  const {currentCreator} = useCurrentCreator()

  const [creatorName, setCreatorName] = useState("")
  const [subscriptionPrice, setSubscriptionPrice] = useState("5")

  if (!context.library)
    return (<div>Please connect your wallet</div>)
  // @ts-ignore
  context.library.then((result) => {
    setLibrary(result);
  })

  if (currentCreator !== undefined)
    return (<div>Congratulation you just signed up on creaton!</div>)
  if (signedup)
    return (<div>{signedup}</div>)

  function submitForm(event) {
    const connectedContract = creatorFactoryContract.connect(library!.getSigner())
    connectedContract.deployCreator(creatorName, subscriptionPrice)
      .then(function (response) {
        setSignedup("Waiting for your signup to be confirmed on the blockchain...")
      }).catch(function (error) {
      errorHandler.setError('Failed to signup. ' + error.message)
    });
    event.preventDefault();
  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={submitForm}>
        <label htmlFor="creatorName">Name</label>
        <Input type="text" placeholder="John The Creator" value={creatorName} onChange={(event) => {
          setCreatorName(event.target.value)
        }}></Input>
        <label htmlFor="subscriptionPrice">Subscription Price</label>
        <Input type="number" value={subscriptionPrice} onChange={(event) => {
          setSubscriptionPrice(event.target.value)
        }}></Input>
        <Button type="submit" label="Submit"></Button>
      </form>
    </div>
  );
};

export default SignUp;
