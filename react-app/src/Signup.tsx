import 'react-app-polyfill/ie11';
import * as React from 'react';
import {Formik, Field, Form, FormikHelpers} from 'formik';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Contract} from "ethers";
import contracts from './contracts.json'

interface Values {
  creatorName: string;
  avatarURL: string;
  subscriptionPrice: number;
}


const creatorContract = new Contract(contracts.contracts.CreatonFactory.address, contracts.contracts.CreatonFactory.abi)
const SignUp = () => {
  const context = useWeb3React<Web3Provider>()
  return (
    <div>
      <h1>Signup</h1>
      <Formik
        initialValues={{
          creatorName: '',
          avatarURL: '',
          subscriptionPrice: 0,
        }}
        onSubmit={(
          values: Values,
          {setSubmitting}: FormikHelpers<Values>
        ) => {
          const {library} = context
          if (library) {
            const connectedContract = creatorContract.connect(library.getSigner())
            const promise = connectedContract.deployCreator(values.avatarURL, values.creatorName, values.subscriptionPrice);
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

          <label htmlFor="avatarURL">Avatar URL</label>
          <Field id="avatarURL" name="avatarURL" placeholder=""/>

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
