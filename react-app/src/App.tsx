import React, {useContext} from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';
import Home from './Home';
import WalletConnect from "./WalletConnect";
import {useWeb3React, Web3ReactProvider} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import SignUp from "./Signup";
import Upload from "./Upload";
import {SuperfluidContext, SuperfluidProvider} from "./Superfluid";
import Grant from "./Grant";
import {Creator} from "./Creator";
import {ErrorHandlerContext, ErrorHandlerProvider} from "./ErrorHandler";
import {UmbralWasmProvider} from "./UmbralWasm";
import {TextileProvider} from "./TextileProvider";
import TwitterVerification from "./TwitterVerification";
import Creators from "./Creators";

let APOLLO_URI
if (process.env.NODE_ENV === 'development')
  APOLLO_URI = 'http://localhost:8000/subgraphs/name/creaton-io/creaton'
else
  APOLLO_URI = 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton2'

const client = new ApolloClient({
  uri: APOLLO_URI,
  cache: new InMemoryCache()
});


function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

function Status() {
  const {active, error} = useWeb3React()
  return (
    <div>
    <h1 style={{margin: '1rem', textAlign: 'right'}}>Web3:{active ? '🟢' : error ? '🔴' : '🟠'}</h1>
    </div>
  );
}

const App = () => {
  return (
    <ErrorHandlerProvider>
      <TextileProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <SuperfluidProvider>
          <UmbralWasmProvider>
            <ApolloProvider client={client}>
              <Status/>
              <Router>
<div>
    <div>
        <div className="relative bg-black overflow-hidden">
            <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full" aria-hidden="true">
                <div className="relative h-full max-w-7xl mx-auto"></div>
            </div>
            <div className="relative pt-6 pb-16 sm:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <nav className="relative flex items-center sm:h-10 md:justify-center" aria-label="Global">
                        <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                            <div className="flex items-center justify-between w-full md:w-auto">
                                <a href="#"><span className="sr-only">Workflow</span><img src="./assets/svgs/logo.svg"/></a>
                                <div className="-mr-2 flex items-center md:hidden">
                                    <button type="button" className="bg-gray-50 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
                                        <span className="sr-only">Open main menu</span>
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex md:space-x-10 ml-auto"><a href="#" className="font-medium text-gray-400 hover:text-gray-900">Product</a>
                          <a href="#" className="font-medium text-gray-400 hover:text-gray-900">Features</a>
                          <a href="#" className="font-medium text-gray-400 hover:text-gray-900">Marketplace</a>
                          <a href="#" className="font-medium text-gray-400 hover:text-gray-900">Company</a>
                        </div>
                        <div className="hidden md:flex md:items-center md:justify-end md:inset-y-0 md:ml-8 md:mr-0">
                          <a href="#" className="px-4 py-2 rounded-full text-blue border-blue border border-solid">Pitch Docs</a>
                          <a href="#" className="px-4 py-2 rounded-full text-white bg-blue border-blue border border-solid ml-2">Join the race</a>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
        </div>

                  

                  <ul>
                    <li>
                      <Link to="/creators">Creators</Link>
                    </li>
                    <li>
                      <Link to="/connect-wallet">Connect Wallet</Link>
                    </li>
                    <li>
                      <Link to="/signup">SignUp</Link>
                    </li>
                    <li>
                      <Link to="/upload">Upload</Link>
                    </li>
                    <li>
                      <Link to="/grant">Grant</Link>
                    </li>
                    <li>
                      <Link to="/twitter-verification">Twitter Verification</Link>
                    </li>

                  </ul>
                  <hr/>

                  {/*
            A <Switch> looks through all its children <Route>
            elements and renders the first one whose path
            matches the current URL. Use a <Switch> any time
            you have multiple routes, but you want only one
            of them to render at a time
          */}
                  <ErrorHandlerContext.Consumer>
                    {value => (value.error && (<div>Error: {value.error}
                      <button onClick={() => {
                        value.setError('')
                      }}>Clear
                      </button>
                    </div>))}
                  </ErrorHandlerContext.Consumer>
                  <hr/>
                  <Switch>
                    <Route exact path="/">
                      <Home/>
                    </Route>
                    <Route exact path="/creators">
                      <Creators/>
                    </Route>
                    <Route path="/connect-wallet">
                      <WalletConnect/>
                    </Route>
                    <Route path="/signup">
                      <SignUp/>
                    </Route>
                    <Route path="/upload">
                      <Upload/>
                    </Route>
                    <Route path="/grant">
                      <Grant/>
                    </Route>
                    <Route path="/creator/:id">
                      <Creator/>
                    </Route>
                    <Route path="/twitter-verification">
                      <TwitterVerification/>
                    </Route>
                  </Switch>
                </div>
              </Router>
            </ApolloProvider>
          </UmbralWasmProvider>
        </SuperfluidProvider>
      </Web3ReactProvider>
      </TextileProvider>
    </ErrorHandlerProvider>
  );
}

export default App;
