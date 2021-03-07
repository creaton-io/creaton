import 'react-app-polyfill/ie11';
import * as React from 'react';
import {Formik, Field, Form, FormikHelpers} from 'formik';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Contract} from "ethers";
import creaton_contracts from './contracts.json'
import {useCurrentCreator} from "./Utils";
import {useState} from "react";

const CreatonAdminContract = creaton_contracts.CreatonAdmin

interface Values {
  creatorName: string;
  subscriptionPrice: number;
}


const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi)
const SignUp = () => {
  const context = useWeb3React<Web3Provider>()
  const {currentCreator} = useCurrentCreator()
  const [signedup,setSignedup] = useState(false)
  if(currentCreator !== undefined)
    return(<div>You've already signed up!</div>)
  if(signedup)
    return (<div>Congratulation you just signed up</div>)
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
          const {library} = context
          if (library) {
            const connectedContract = creatorFactoryContract.connect(library.getSigner())
            connectedContract.deployCreator(values.creatorName, values.subscriptionPrice)
              .then(function(response){
                setSignedup(true)
              }).catch(function(error){
                console.log(error)
            });
            //TODO error handling on promise
          } else {
            alert('not connected')
          }
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
