import {useWeb3React} from "@web3-react/core";
import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useHistory} from "react-router-dom";
import {useCurrentProfile} from "./Utils";
import {NotificationHandlerContext} from "./ErrorHandler";
import {SuperfluidContext} from "./Superfluid";
import {FAUCET_URI} from "./Config";

const Web3UtilsContext = createContext<any>(null)
const Web3UtilsProvider = (props) => {
  const {activate, account, chainId, library} = useWeb3React()
  const {currentProfile} = useCurrentProfile()
  const history = useHistory();
  const notificationHandler = useContext(NotificationHandlerContext)
  const [isWaiting, setIsWaiting] = useState<any>(false);
  const superfluid = useContext(SuperfluidContext);
  const faucetUsed = useRef(false);
  useEffect(() => {
    if (!account || !superfluid || chainId !== 80001 || faucetUsed.current)
      return;
    let {usdcx} = superfluid
    usdcx.balanceOf(account).then(async balance => {
      if (!faucetUsed.current && balance.isZero()) {
        // never turn it to false, if we try to use the faucet and it fails we don't want to retry excessively
        faucetUsed.current = true;
        let response = await fetch(FAUCET_URI + '?address=' + account)
        if (response.ok) {
          notificationHandler.setNotification({
            description: 'We just sent some test tokens to your wallet so you can test the platform! Enjoy!',
            type: 'success'
          });
        }
      }
    })

  }, [account, superfluid, notificationHandler, chainId])

  async function tryConnect() {
    // notificationHandler.setNotification({description: 'Thanks for testing the platform. More features will be released in the next few days. Stay tuned!', type: 'info'})
    // return;
    //TODO: test walletConnect and open up a modal
    const injected = new InjectedConnector({supportedChainIds: [1, 3, 4, 5, 42, 137, 80001]})
    if (await injected.getProvider())
      activate(injected, (error => {
        notificationHandler.setNotification({
          description: 'Unable to connect to wallet. ' + error.message,
          type: 'error'
        });
      }))

    else {
      notificationHandler.setNotification({
        description: 'Only injected providers (e.g. metamask) are supported at the moment',
        type: 'error'
      });
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

  const wrongChainId = Boolean(library && chainId !== 80001)

  return (<Web3UtilsContext.Provider
    value={{
      connect: tryConnect,
      isSignedUp: isSignedUp,
      setIsWaiting: setIsWaiting,
      isWaiting: isWaiting,
      waitingMessage: (isWaiting === true) ? 'Waiting for transaction confirmation' : isWaiting,
      disableInteraction: (Boolean(isWaiting)) || wrongChainId
    }}>{props.children}</Web3UtilsContext.Provider>)
}
export {Web3UtilsContext, Web3UtilsProvider};
