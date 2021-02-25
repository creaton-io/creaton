import 'react-app-polyfill/ie11';
import * as React from 'react';
import {Formik, Field, Form, FormikHelpers} from 'formik';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useContext, useState} from "react";
import {NuCypherSocketContext} from "./Socket";
import {Creator, useCurrentCreator} from "./Utils";
import {NuCypher} from "./NuCypher";

interface Values {
  pubkey_enc: string;
  pubkey_sig: string;
}


const Grant = () => {
  const socket = useContext(NuCypherSocketContext)
  const web3Context = useWeb3React<Web3Provider>()
  const [grantStatus, setGrantStatus] = useState({status: '', message: ''})
  const creator = useCurrentCreator().currentCreator
  if (socket === null)
    return (<div>Not connected to NuCypher</div>)
  if (!web3Context.account)
    return (<div>Not connected to MetaMask</div>)
  if (creator === undefined)
    return (<div>Please signup as a creator</div>)
  let currentCreator: Creator = creator
  return (
    <div>
      <h1>Grant Subscribers</h1>
      {grantStatus.message && <h3>{grantStatus.message}</h3>}
      <Formik
        initialValues={{
          pubkey_enc: '',
          pubkey_sig: '',
        }}
        onSubmit={(
          values: Values,
          {setSubmitting}: FormikHelpers<Values>
        ) => {
          setGrantStatus({status: 'pending', message: 'Granting subscribers, please wait'})
          const nucypher = new NuCypher(socket)
          nucypher.grant(currentCreator.creatorContract, currentCreator.user, values.pubkey_enc, values.pubkey_sig, web3Context.library!.getSigner())
          setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="pubkey_enc">pubkey_enc</label>
          <Field id="pubkey_enc" name="pubkey_enc" placeholder=""/>

          <label htmlFor="pubkey_sig">pubkey_sig</label>
          <Field id="pubkey_sig" name="pubkey_sig" placeholder=""/>

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Grant;
