import SuperfluidSDK from '@superfluid-finance/js-sdk';
import {useWeb3React} from "./web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import React, {createContext, useContext, useEffect, useState} from "react";
import {NotificationHandlerContext} from "./ErrorHandler";
import { Web3UtilsProviderContext } from './Web3Utils';

const SuperfluidContext = createContext<any>(null)
const SuperfluidProvider = (props) => {
  const [superfluid, setSuperfluid] = useState<any>(null);
  const notificationHandler = useContext(NotificationHandlerContext)
  const web3Context = useWeb3React<Web3Provider>()
  const {biconomyProvider, setBiconomyProvider} = useContext(Web3UtilsProviderContext);
  async function init() {
    if(!web3Context.library!)
      return;
    if(web3Context.chainId !== 80001) {
      return;
    }
    const sf = new SuperfluidSDK.Framework({
      ethers: web3Context.library!,
      tokens: ["fUSDC"],
  });
    console.log('web3 provider test');
    await sf.initialize();
    // @ts-ignore
    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    // @ts-ignore
    const usdc = await sf.contracts.TestToken.at(sf.tokens.fUSDC.address);
    const usdcx = sf.tokens.fUSDCx;
    setSuperfluid({sf, usdc, usdcx});
    // app = await ethers.getContractAt('Creator', contractAddr, subscriber);
  }
  useEffect(() => {
    init();
  }, [web3Context]);
  return (<SuperfluidContext.Provider value={superfluid}>{props.children}</SuperfluidContext.Provider>)
}
export {SuperfluidContext, SuperfluidProvider};
