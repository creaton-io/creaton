import React, {useContext, useEffect, useState} from 'react';
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
import {Staking} from "./Staking";
import {Creator} from "./Creator";
import {NotificationHandlerContext, NotificationHandlerProvider} from "./ErrorHandler";
import {UmbralWasmProvider} from "./UmbralWasm";
import {TextileProvider} from "./TextileProvider";
import TwitterVerification from "./TwitterVerification";

import Creators from "./Creators";
import {RelayProvider} from "@opengsn/gsn";
import {Button} from "./elements/button";
import creaton_contracts from "./contracts.json";
import {ProfileEdit} from "./ProfileEdit";
import {useCurrentCreator, useCurrentProfile} from "./Utils";
import {InjectedConnector} from "@web3-react/injected-connector";
import {APOLLO_URI} from "./Config";
import {Notification} from "./components/notification";
import {initFontAwesome} from "./icons/font-awesome";
import {Avatar} from "./components/avatar";
import {Toggle} from "./elements/toggle";

initFontAwesome()

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
};

const client = new ApolloClient({
  uri: APOLLO_URI,
  cache: new InMemoryCache()
});

const paymaster = creaton_contracts.Paymaster


const getLibrary = (provider) => {
  console.log('evaluating getLibrary', provider)
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const getGSNLibrary = (provider) => {
  let paymasterAddress = paymaster.address
  const config = {
    paymasterAddress
  }
  console.log('evaluating getGSNLibrary', provider)
  const gsnProvider = RelayProvider.newProvider({provider: provider, config});
  gsnProvider.init()
  // @ts-ignore
  const gsnLibrary = new Web3Provider(gsnProvider)
  gsnLibrary.pollingInterval = 12000
  return gsnLibrary
}

function ConnectOrSignup() {
  const {active, activate} = useWeb3React()
  const {currentProfile} = useCurrentProfile()

  async function tryConnect() {
    //TODO: test walletConnect and open up a modal
    const injected = new InjectedConnector({supportedChainIds: [1, 3, 4, 5, 42, 137, 80001]})
    if (await injected.getProvider())
      activate(injected)
    else {
      alert('only injected providers are supported at the moment')
    }
  }

  if (currentProfile)
    return (<Link to="/signup">
      <Avatar size="menu" src={currentProfile.image}/></Link>)
  if (active)
    return (<Link to="/signup"><Button label="Sign Up"></Button></Link>)
  else
    return (<Button label="Connect Wallet" onClick={tryConnect}></Button>)
}

const Autoconnect = () => {
  const injected = new InjectedConnector({supportedChainIds: [1, 3, 4, 5, 42, 137, 80001]})
  const {activate, active} = useWeb3React<Web3Provider>()
  useEffect(() => {
    async function connectWalletIfAvailable() {
      if (!active && ((await injected.getProvider()).selectedAddress))
        activate(injected)
    }

    connectWalletIfAvailable()
  }, [active, injected, activate])
  return null;
}

const StakingDetector = (props) => {
  const {library} = useWeb3React<Web3Provider>()
  if (props.isGSN) // already switched to GSN
    return null;
  //check something with library and call props.setIsGSN(true) if needed
  return null;
}

const HeaderButtons = () => {
  const {currentProfile} = useCurrentProfile()
  const {currentCreator} = useCurrentCreator()
  return (<div className="hidden md:flex md:space-x-10 ml-auto">
    <Link to="/">
      <Button label="Home" theme="secondary"></Button>
    </Link>
    <Link to="/creators">
      <Button label="Creators" theme="secondary"></Button>
    </Link>
    {currentCreator && (<Link to="/grant">
      <Button label="Grant" theme="secondary"></Button>
    </Link>)}
    {currentProfile && (<Link to="/upload">
      <Button label="Upload" theme="secondary"></Button>
    </Link>)}
    {currentProfile && (<Link to="/staking">
      <Button label="Staking" theme="secondary"></Button>
    </Link>)}
    <Link to="/">
    <Button label="Pitch Deck" theme="secondary-2"></Button>
    </Link>
    <ConnectOrSignup/>
  </div>)
}

const App = () => {
  const [isGSN, setIsGSN] = useState<boolean>(false);
  return (
    <NotificationHandlerProvider>
      <TextileProvider>
        <Web3ReactProvider getLibrary={isGSN ? getGSNLibrary : getLibrary}>
          <StakingDetector isGSN={isGSN} setIsGSN={setIsGSN}/>
          <Autoconnect/>
          <SuperfluidProvider>
            <UmbralWasmProvider>
              <ApolloProvider client={client}>
                <Router>
                  <div>
                    <NotificationHandlerContext.Consumer>
                      {value => (value.notification && (<div className="fixed top-5 right-5 z-50 bg-white">
                        <Notification type={value.notification.type} description={value.notification.description}
                                      close={() => {
                                        value.setNotification(null)
                                      }}/>
                      </div>))}
                    </NotificationHandlerContext.Consumer>

                    <div>

                      <div className="relative bg-black overflow-hidden">
                        <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full"
                             aria-hidden="true">
                          <div className="relative h-full max-w-7xl mx-auto"></div>
                        </div>
                        <div className="relative pt-6 pb-16 sm:pb-24">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <Toggle state={isGSN} onClick={(e) => {
                              e.preventDefault()
                              setIsGSN(!isGSN)
                            }}/>
                            <nav className="relative flex items-center sm:h-10 md:justify-center" aria-label="Global">
                              <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                                <div className="flex items-center justify-between w-full md:w-auto">
                                  <a href="#"><span className="sr-only">Workflow</span><img
                                    src="./assets/svgs/logo.svg"/></a>
                                  <div className="-mr-2 flex items-center md:hidden">
                                    <button type="button"
                                            className="bg-gray-50 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                            aria-expanded="false">
                                      <span className="sr-only">Open main menu</span>
                                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                                           viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M4 6h16M4 12h16M4 18h16"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <HeaderButtons/>
                            </nav>
                </div>
            </div>
        </div>

                    </div>


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
                    <Route exact path="/creators">
                      <Creators/>
                    </Route>
                    <Route path="/connect-wallet">
                      <WalletConnect/>
                    </Route>
                    <Route path="/signup">
                      <ProfileEdit/>
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
                    <Route path="/staking">
                      <Staking/>
                    </Route>
                  </Switch>
                </div>
              </Router>
            </ApolloProvider>
          </UmbralWasmProvider>
        </SuperfluidProvider>
      </Web3ReactProvider>
      </TextileProvider>
    </NotificationHandlerProvider>
  );
}

export default App;
