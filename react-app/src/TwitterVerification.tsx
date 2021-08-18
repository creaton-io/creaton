
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import * as React from "react";
import {BigNumber, ethers} from "ethers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {NotificationHandlerContext} from "./ErrorHandler";
import {useContext, useState} from "react";
/*
import creaton_contracts from "./Contracts";
import {Contract} from "ethers";

const TwitterVerificationContract = creaton_contracts.TwitterVerification
const Creaton = creaton_contracts.CreatonAdmin

interface Values {
  twitterUsername: string;
}

const twitterContract = new Contract(TwitterVerificationContract.address, TwitterVerificationContract.abi)
const CreatonContract = new Contract(Creaton.address, Creaton.abi)

const TwitterVerification = () => {
  const context = useWeb3React<Web3Provider>()
  const notificationHandler = useContext(NotificationHandlerContext)

  const [library, setLibrary] = useState<any>(null)
  const [signature, setSignature] = useState<any>('')
  const [username, setUsername] = useState<any>('')
  const [hash, setHash] = useState<any>(null)
  const [tweet, setTweet] = useState(false)
  if (!context.library)
    return (<div>Please connect your wallet</div>)

  // const library = context.library

  // @ts-ignore
  context.library.then((result) => {
    setLibrary(result);
  })

  function tweetClicked() {
    setTweet(true)
  }

  function showUsername(){
    console.log(CreatonContract.user2twitter(context.account));
  }

  async function verifySignature() {
    console.log(hash)
    const connectedTwitterContract = twitterContract.connect(library!.getSigner());
    const verify = await connectedTwitterContract.requestTwitterVerification(
      signature,
      BigNumber.from(hash),
      username);
    console.log(verify)
    console.log(showUsername)
  }

  if (tweet) {
    return (
      <div>
        <h1>Send Tx to ChainLink Oracle</h1>
        <button onClick={verifySignature}> Send </button>
      </div>
    )
  }

  if (signature) {
    console.log(hash)
    const link = "https://twitter.com/intent/tweet?in_reply_to=1371219103487262724&text=I'm creating my account on " +
      "Creaton&hashtags=" +
      hash;
    return (
      <div>
        {/*<h1>Please Tweet Out Your Verification Link</h1>*//*}
          <a href={link} onClick={tweetClicked} target="_blank">Tweet your verification
           code</a>
      </div>
    )
  }

  // @ts-ignore
  // @ts-ignore
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
          const method = 'personal_sign'
          const msg = "Verifying on Creaton With My Twitter Account: @" + values.twitterUsername;
          const params = [context.account, msg]
          // @ts-ignore
          library.provider.send({
            method,
            params
          }, (err, res) => {
            if (err) {
              notificationHandler.setNotification({
                description: 'Message Sigining Failed ' + err.message,
                type: 'error'
              })
              return
            }
            setSignature(res.result)
            setHash(ethers.utils.keccak256(res.result))
            setUsername(values.twitterUsername)
          })
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
    //
    // </div>)
  )
}

*/

//disabled Twitterverification for now
const TwitterVerification = () => {
  const context = useWeb3React<Web3Provider>()
  const notificationHandler = useContext(NotificationHandlerContext)

  return (
    <div></div>
  )
};
export default TwitterVerification;
