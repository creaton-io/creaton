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
import {NuCypherSocketContext, NuCypherSocketProvider} from "./Socket";
import Grant from "./Grant";
import {Creator} from "./Creator";

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
  const socket = useContext(NuCypherSocketContext);
  return (
    <div>
    <h1 style={{margin: '1rem', textAlign: 'right'}}>Web3:{active ? '🟢' : error ? '🔴' : '🟠'}</h1>
    <h1 style={{margin: '1rem', textAlign: 'right'}}>NuSocket:{socket !== null ? '🟢' : '🔴'}</h1>
    </div>
  );
}

const App = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <NuCypherSocketProvider>
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
                <li>
                  <Link to="/grant">Grant</Link>
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
                <Route path="/grant">
                  <Grant/>
                </Route>
                <Route path="/creator/:id">
                  <Creator/>
                </Route>
              </Switch>
            </div>
          </Router>
        </ApolloProvider>
      </NuCypherSocketProvider>
      </Web3ReactProvider>
    );
}

export default App;
