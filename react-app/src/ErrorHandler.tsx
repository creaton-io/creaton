import React, {createContext, useState} from "react";

interface ErrorHandler {
  error;
  setError;
}

const ErrorHandlerContext = createContext<ErrorHandler>({error: null, setError: null})
const ErrorHandlerProvider = (props) => {
  const [error, setError] = useState<any>(null);
  const handler: ErrorHandler = {error, setError}
  return (<ErrorHandlerContext.Provider value={handler}>{props.children}</ErrorHandlerContext.Provider>)
}
export {ErrorHandlerContext, ErrorHandlerProvider};
