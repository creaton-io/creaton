import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import * as React from "react";
import {utils} from "ethers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {ErrorHandlerContext} from "./ErrorHandler";
import {useContext} from "react";

interface Values {
  twitterUsername: string;
}

const TwitterVerification = () => {
  const context = useWeb3React<Web3Provider>()
  const errorHandler = useContext(ErrorHandlerContext)
  if (!context.account)
    return (<div>Please connect your wallet</div>)
  const message = "Verifying my self in creaton-io: %23" + utils.sha256(utils.toUtf8Bytes(context.account + '-creaton-io'))
  const link = "https://twitter.com/intent/tweet?in_reply_to=1371219103487262724&text=" + message
  return (
    <div>
      <h1>Signup</h1>
      <Formik
        initialValues={{
          twitterUsername: '',
        }}
        onSubmit={(
          values: Values,
          {setSubmitting}: FormikHelpers<Values>
        ) => {
          const {library} = context
          const msg = "Verifying my Twitter account on creaton-io: " + context.account + values.twitterUsername;
          let signer = context.library!.getSigner(context.account!);
          signer.signMessage(msg)
            .then((response) => {

            }).catch((error) => {
              errorHandler.setError(error.toString())
              return;
            });
          setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="twitterUsername">Twitter Username</label>
          <Field id="twitterUsername" name="twitterUsername" placeholder="jack"/>

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
    // <div>
    //   <a href={link} target="_blank">Tweet your verification
    //     code</a>
    // </div>)
  )
}

export default TwitterVerification;
