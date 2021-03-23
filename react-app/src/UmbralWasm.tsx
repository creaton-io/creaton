import React, {createContext, useEffect, useState} from "react";

const UmbralWasmContext = createContext<any>(null)
const UmbralWasmProvider = (props) => {
  const [wasm, setWasm] = useState<any>(null);
  useEffect(() => {
    let importWasm = async () => {
      setWasm(await import('umbral-pre'))
    };
    importWasm()
  }, []);
  return (<UmbralWasmContext.Provider value={wasm}>{props.children}</UmbralWasmContext.Provider>)
}
export {UmbralWasmContext, UmbralWasmProvider};
