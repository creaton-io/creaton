import {Framework} from '@superfluid-finance/js-sdk';
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import React, {createContext, useEffect, useState} from "react";

const SuperfluidContext = createContext<Framework | null>(null)
const SuperfluidProvider = (props) => {
  const [superfluid, setSuperfluid] = useState<Framework | null>(null);
  const web3Context = useWeb3React<Web3Provider>()
  async function init() {
    if(!window['ethereum']){
      return
    }
    let ethersProvider = new Web3Provider(window['ethereum']);
    console.log(window['ethereum']);
    let sf = new Framework({
      web3Provider: ethersProvider,
      version: 'v1',
      chainId: 5,
      tokens: ["fUSDC"],
    });
    console.log('web3 provider test');
    await sf.initialize();
    setSuperfluid(sf);
    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    let usdc = await sf.contracts.TestToken.at(sf.tokens.fUSDC.address);
    let usdcx = sf.tokens.fUSDCx
    console.log('ran successfully');
    // app = await ethers.getContractAt('Creator', contractAddr, subscriber);
  }
  useEffect(() => {
    init();
  }, [web3Context]);
  return (<SuperfluidContext.Provider value={superfluid}>{props.children}</SuperfluidContext.Provider>)
}
export {SuperfluidContext, SuperfluidProvider};
