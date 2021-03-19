import React, {createContext, useEffect, useState} from "react";
import {TextileStore} from "./stores/textileStore";

const TextileContext = createContext<TextileStore | null>(null)

const TextileProvider = (props) => {
  const [textile, setTextile] = useState<TextileStore | null>(null);
  useEffect(() => {
    let setupTextile = async () => {
      let _textile = new TextileStore()
      await _textile.authenticate()
      setTextile(_textile)
    };
    setupTextile()
  }, []);
  return (<TextileContext.Provider value={textile}>{props.children}</TextileContext.Provider>)
}

export {TextileProvider, TextileContext}
