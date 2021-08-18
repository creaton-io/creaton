import {Framework} from '@superfluid-finance/js-sdk';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import React, {createContext, useContext, useEffect, useState} from "react";
import {NotificationHandlerContext} from "./ErrorHandler";

const SuperfluidContext = createContext<any>(null)
const SuperfluidProvider = (props) => {
  const [superfluid, setSuperfluid] = useState<any>(null);
  const notificationHandler = useContext(NotificationHandlerContext)
  const web3Context = useWeb3React<Web3Provider>()
  async function init() {
    if(!web3Context.library)
      return;
    if(web3Context.chainId !== 80001) {
      return;
    }
    const sf = new Framework({
      ethers: web3Context.library!,
      version: 'v1',
      chainId: web3Context.chainId,
      tokens: ["USDC"],
    });
    console.log('web3 provider test');
    await sf.initialize();
    const usdcAddress = await sf.resolver.get('tokens.USDC');
    const usdc = await sf.contracts.TestToken.at(sf.tokens.USDC.address);
    const usdcx = sf.tokens.USDCx;
    setSuperfluid({sf, usdc, usdcx});
    // app = await ethers.getContractAt('Creator', contractAddr, subscriber);
  }
  useEffect(() => {
    init();
  }, [web3Context]);
  return (<SuperfluidContext.Provider value={superfluid}>{props.children}</SuperfluidContext.Provider>)
}
export {SuperfluidContext, SuperfluidProvider};
