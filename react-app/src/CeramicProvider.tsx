import React, {createContext, useEffect, useState} from "react";
import {CeramicStore} from "./stores/ceramicStore";

const CeramicContext = createContext<CeramicStore | null>(null)

const CeramicProvider = (props) => {
  const [ceramic, setCeramic] = useState<CeramicStore | null>(null);
  useEffect(() => {
    let setupCeramic = async () => {
      let _ceramic = new CeramicStore()
      await _ceramic.authenticate()
      setCeramic(_ceramic)
      console.log('ceramic', _ceramic)
    };
    setupCeramic()
  }, []);
  return (<CeramicContext.Provider value={ceramic}>{props.children}</CeramicContext.Provider>)
}

export {CeramicProvider, CeramicContext}
