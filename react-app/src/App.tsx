import React, {CSSProperties} from 'react';
import {
  BrowserRouter as Router,
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

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/creaton-io/creaton',
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
    <h1 style={{margin: '1rem', textAlign: 'right'}}>{active ? '🟢' : error ? '🔴' : '🟠'}</h1>
  );
}

const App = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <Status/>
        <Router>
          <div>
            <ul>
              <li>
                <Link to="/">Home</Link>
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
            </ul>

            <hr/>

            {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
            <Switch>
              <Route exact path="/">
                <Home/>
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
            </Switch>
          </div>
          </Router>
        </ApolloProvider>
      </Web3ReactProvider>
    );
}

export default App;
