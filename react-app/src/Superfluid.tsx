import SuperfluidSDK from '@superfluid-finance/js-sdk';
import {useWeb3React} from '@web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {NotificationHandlerContext} from './ErrorHandler';
import {Web3UtilsProviderContext} from './Web3Utils';

const SuperfluidContext = createContext<any>(null);
const SuperfluidProvider = (props) => {
  const [superfluid, setSuperfluid] = useState<any>(null);
  const notificationHandler = useContext(NotificationHandlerContext);
  const web3Context = useWeb3React();
  const {biconomyProvider, setBiconomyProvider} = useContext(Web3UtilsProviderContext);
  async function init() {
    if (!web3Context.isActive) return;
    const provider = web3Context.provider as Web3Provider;
    if (web3Context.chainId === 137) {    
      const sf = new SuperfluidSDK.Framework({
        ethers: provider!,
        tokens: ['USDC'],
      });

      await sf.initialize();
      // @ts-ignore
      const usdc = sf.tokens.USDC;
      const usdcx = sf.tokens.USDCx;
      setSuperfluid({sf, usdc, usdcx});
      // app = await ethers.getContractAt('Creator', contractAddr, subscriber);
    } else if (web3Context.chainId === 80001) {
      const sf = new SuperfluidSDK.Framework({
        ethers: provider!,
        tokens: ['fUSDC'],
      });

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
