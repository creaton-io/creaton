import {Web3Provider} from '@ethersproject/providers';
import React, {createContext, useEffect, useState} from 'react';
import {CeramicStore} from './stores/ceramicStore';

import {useWeb3React} from './web3-react/core';

const CeramicContext = createContext<CeramicStore | null>(null);

const CeramicProvider = (props) => {
  const [ceramic, setCeramic] = useState<CeramicStore | null>(null);
  const context = useWeb3React<Web3Provider>();
  useEffect(() => {
    let setupCeramic = async () => {
      let _ceramic = new CeramicStore();
      await _ceramic.authenticate(context);
      setCeramic(_ceramic);
      console.log('ceramic', _ceramic);
    };
    setupCeramic();
  }, []);
  return <CeramicContext.Provider value={ceramic}>{props.children}</CeramicContext.Provider>;
};

export {CeramicProvider, CeramicContext};
