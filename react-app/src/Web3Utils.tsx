import {useWeb3React} from "@web3-react/core";
import React, {createContext, useContext, useEffect, useState} from "react";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useHistory} from "react-router-dom";
import {useCurrentProfile} from "./Utils";
import {NotificationHandlerContext} from "./ErrorHandler";

const Web3UtilsContext = createContext<any>(null)
const Web3UtilsProvider = (props) => {
  const {activate, account} = useWeb3React()
  const {currentProfile} = useCurrentProfile()
  const history = useHistory();
  const notificationHandler = useContext(NotificationHandlerContext)

  async function tryConnect() {
    //TODO: test walletConnect and open up a modal
    const injected = new InjectedConnector({supportedChainIds: [1, 3, 4, 5, 42, 137, 80001]})
    if (await injected.getProvider())
      activate(injected)
    else {
      alert('only injected providers are supported at the moment')
    }
  }

  function isSignedUp() {
    if (!account) {
      tryConnect();
      return false;
    }
    if (!currentProfile) {
      history.push("/signup");
      notificationHandler.setNotification({description: 'You need to sign up in the platform first.', type: 'info'})
      return false;
    }
    return true;
  }

  return (<Web3UtilsContext.Provider
    value={{connect: tryConnect, isSignedUp: isSignedUp}}>{props.children}</Web3UtilsContext.Provider>)
}
export {Web3UtilsContext, Web3UtilsProvider};
