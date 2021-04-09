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

const CreatonAdminContract = creaton_contracts.CreatonAdmin

interface Values {
  creatorName: string;
  subscriptionPrice: number;
}


const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi)
const SignUp = () => {

  const [provider, setProvider] = useState<any>(undefined);
  const [signedup, setSignedup] = useState<any>(false)
  const errorHandler = useContext(ErrorHandlerContext)
  const paymasterAddress = '0x8c9245773caF636cAE9Cb1B28a82e061Bd38fDCb'

  async function connectWallet(){
    const providerOptions = {
      /* See Provider Options Section */
      injected: {
        package: null
      }
    };
    const web3Modal = new Web3Modal({
      providerOptions // required
    });
    const initialProvider = await web3Modal.connect();
    const config = {
      paymasterAddress
    }
    const gsnProvider = await RelayProvider.newProvider({provider: initialProvider, config}).init();
    // @ts-ignore
    const provider = new Web3Provider(gsnProvider)
    setProvider(provider);
  }

  if (!provider)
    return (<button onClick={() => connectWallet()}> Connect Wallet</button>)
  // const {currentCreator} = useCurrentCreator()

  // if (currentCreator !== undefined)
  //   return (<div>Congratulation you just signed up on creaton!</div>)
  // if (!context.library)
  //   return (<div>Please connect your wallet</div>)
  if (signedup)
    return (<div>{signedup}</div>)
  return (
    <div>
      <h1>Signup</h1>
      <Formik
        initialValues={{
          creatorName: '',
          subscriptionPrice: 0,
        }}
        onSubmit={(
          values: Values,
          {setSubmitting}: FormikHelpers<Values>
        ) => {
          const connectedContract = creatorFactoryContract.connect(provider.getSigner())
          connectedContract.deployCreator(values.creatorName, values.subscriptionPrice)
            .then(function (response) {
              setSignedup("Waiting for your signup to be confirmed on the blockchain...")
            }).catch(function (error) {
            errorHandler.setError('Failed to signup. ' + error.message)
          });
          setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="creatorName">Name</label>
          <Field id="creatorName" name="creatorName" placeholder="John The Creator"/>

          <label htmlFor="subscriptionPrice">Subscription Price</label>
          <Field
            id="subscriptionPrice"
            name="subscriptionPrice"
            placeholder="3"
            type="number"
          />

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

export default SignUp;
