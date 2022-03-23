import SuperfluidSDK from '@superfluid-finance/js-sdk';
import {useWeb3React} from './web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {NotificationHandlerContext} from './ErrorHandler';
import {Web3UtilsProviderContext} from './Web3Utils';

{/*
  Explanation on how streaming works in the React app / on the front-end:

  1) Superfluid takes care of the streaming, we are exporting the superfluid context 
     and the providers from the superfluid.tsx file. Reference: Superfluid.tsx 
  2) We are importing them in different components for accessing the values declared 
     and initialised inside the context. Reference: App.tsx,Creator.tsx
  3) We enclose the whole App.tsx file inside the superfluid provider so we can 
     conclude the scope of the context is globally over the whole application inside 
     every routes. Reference: App.tsx file    
  4) Ideally we are storing a variable called superfluid inside the superfluidcontext 
     which holds the value {sf,usdc,usdcx} which we are fetching and accessing all 
     over the applications. Reference: App.tsx, Creator.tsx,Feed.tsx, Web3Utils.tsx 
  5) The rest of the Superfluid.tsx file consist of documented code to initialise 
     and declare the superfluid SDK. 
*/}


const SuperfluidContext = createContext<any>(null);
const SuperfluidProvider = (props) => {
  const [superfluid, setSuperfluid] = useState<any>(null);
  const notificationHandler = useContext(NotificationHandlerContext);
  const web3Context = useWeb3React<Web3Provider>();
  const {biconomyProvider, setBiconomyProvider} = useContext(Web3UtilsProviderContext);
  async function init() {
    if (!web3Context.library!) return;
    if (web3Context.chainId === 137) {
      const sf = new SuperfluidSDK.Framework({
        ethers: web3Context.library!,
        tokens: ['USDC'],
      });
      console.log('web3 provider test');
      await sf.initialize();
      // @ts-ignore
      const usdc = sf.tokens.USDC;
      const usdcx = sf.tokens.USDCx;
      setSuperfluid({sf, usdc, usdcx});
      // app = await ethers.getContractAt('Creator', contractAddr, subscriber);
    } else if (web3Context.chainId === 80001) {
      const sf = new SuperfluidSDK.Framework({
        ethers: web3Context.library!,
        tokens: ['fUSDC'],
      });
      console.log('web3 provider test');
      await sf.initialize();
      // @ts-ignore
      const usdc = await sf.contracts.TestToken.at(sf.tokens.fUSDC.address);
      const usdcx = sf.tokens.fUSDCx;
      setSuperfluid({sf, usdc, usdcx});
      // app = await ethers.getContractAt('Creator', contractAddr, subscriber);
    }
  }
  useEffect(() => {
    init();
  }, [web3Context]);
  return <SuperfluidContext.Provider value={superfluid}>{props.children}</SuperfluidContext.Provider>;
};
export {SuperfluidContext, SuperfluidProvider};
