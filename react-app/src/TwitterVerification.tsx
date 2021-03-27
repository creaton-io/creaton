import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import * as React from "react";
import {utils} from "ethers";

const TwitterVerification = () => {
  const context = useWeb3React<Web3Provider>()
  if (!context.account)
    return (<div>Please connect your wallet</div>)
  const message = "Verifying my self in creaton-io: %23" + utils.sha256(utils.toUtf8Bytes(context.account + '-creaton-io'))
  const link = "https://twitter.com/intent/tweet?in_reply_to=1371219103487262724&text=" + message
  return (
    <div>
      <a href={link} target="_blank">Tweet your verification
        code</a>
    </div>)
}

export default TwitterVerification;
