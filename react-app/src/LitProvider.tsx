import React, {createContext, useEffect, useState} from "react";
//import {LitStore} from "./stores/textileStore";
import LitJsSdk from 'lit-js-sdk'

const LitContext = createContext<any>(null)

const LitProvider = (props) => {
  const [litNode, setLitNode] = useState<any>(false);
  useEffect(() => {
    let setupLit = async () => {
      var _litNode = new LitJsSdk.LitNodeClient()
      await _litNode.connect()
      setLitNode(_litNode)
    };
    setupLit()
  }, []);
  return (<LitContext.Provider value={litNode}>{props.children}</LitContext.Provider>)
}

export {LitProvider, LitContext}
