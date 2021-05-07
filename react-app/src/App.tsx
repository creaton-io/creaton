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
import creaton_contracts from "./Contracts";
import {ProfileEdit} from "./ProfileEdit";
import {useCurrentCreator, useCurrentProfile} from "./Utils";
import {InjectedConnector} from "@web3-react/injected-connector";
import {APOLLO_URI} from "./Config";
import {Notification} from "./components/notification";
import {initFontAwesome} from "./icons/font-awesome";
import {Avatar} from "./components/avatar";
import {Toggle} from "./elements/toggle";
import {Web3UtilsContext, Web3UtilsProvider} from "./Web3Utils";
import Loader from "./elements/loader";

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

function ConnectOrSignup(props) {
  const {active} = useWeb3React()
  const {currentProfile} = useCurrentProfile()
  const web3utils = useContext(Web3UtilsContext)

  if (currentProfile)
    return (<a href="" onClick={(e) => {
        e.preventDefault();
        props.onAvatarClick()
      }}>
      <Avatar size="menu" src={currentProfile.image}/></a>)
  if (active)
    return (<Link to="/signup"><Button label="Sign Up"></Button></Link>)
  else
    return (<div><Button label="Connect Wallet" theme="secondary" onClick={web3utils.connect}></Button></div>)
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
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  return (<div className="hidden md:flex md:space-x-10 ml-auto">
    <Link to="/">
      <Button label="Home" theme="focused"></Button>
    </Link>
    <Link to="/creators">
      <Button label="Creators" theme="unfocused"></Button>
    </Link>
    {currentCreator && (<Link to="/grant">
      <Button label="Grant" theme="unfocused"></Button>
    </Link>)}
    {currentProfile && (<Link to="/upload">
      <Button label="Upload" theme="unfocused"></Button>
    </Link>)}
    {currentProfile && (<Link to="/staking">
      <Button label="Staking" theme="unfocused"></Button>
    </Link>)}
    <ConnectOrSignup onAvatarClick={()=>{setShowSubmenu(!showSubmenu)}}/>
    {showSubmenu && <div className="absolute z-30 top-10 right-0 rounded-lg bg-gray-500 text-white w-48">
      {currentCreator && <NavigationLink to="/grant" label="Grant"/>}
      {currentProfile && <NavigationLink to="/upload" label="Upload"/>}
      {currentProfile && <NavigationLink to="/signup" label="My Profile"/>}
    </div>}
  </div>)
}

function NavigationLink(props) {
  if (props.to)
    return (
      <Link to={props.to}>
        <div className="p-2 m-2 rounded-lg hover:bg-white hover:text-black">
          {props.label}
        </div>
      </Link>)
  else
    return (
      <a href="" onClick={(e) => {
        e.preventDefault();
        props.onClick()
      }}>
        <div className="p-2 hover:bg-white hover:text-black">
          {props.label}
        </div>
      </a>)

}

function ChainIdChecker(props) {
  const {library, chainId} = useWeb3React()
  if (!library || chainId === 80001)
    return (<div></div>)
  return (<div
    className="w-full fixed h-full z-30 flex items-center">
    <div
      className="border-2 grid grid-cols-1 py-7 px-6 max-w-lg m-auto transform -translate-y-1/2 place-items-center rounded-lg bg-gray-100">
      <p className="my-3">Creaton beta uses the mumbai test network.<br/>Please switch to this network</p>
      <Button label="Switch to Mumbai test network" onClick={() => {
        library.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            "chainId": "0x13881",
            "chainName": "Matic Testnet Mumbai",
            "rpcUrls": ["https://rpc-mumbai.matic.today"],
            "nativeCurrency": {
              "name": "tMATIC",
              "symbol": "tMATIC",
              "decimals": 18
            },
            "blockExplorerUrls": ["https://explorer-mumbai.maticvigil.com/"]
          }]
        })
      }}/>
    </div>
  </div>)
}

function NavigationLinks() {
  const {currentProfile} = useCurrentProfile()
  const {currentCreator} = useCurrentCreator()
  const {active} = useWeb3React()
  const web3utils = useContext(Web3UtilsContext)
  return (<div>
    <NavigationLink to="/" label="Home"/>
    <NavigationLink to="/creators" label="Creators"/>
    {currentCreator && <NavigationLink to="/grant" label="Grant"/>}
    {currentProfile && <NavigationLink to="/upload" label="Upload"/>}
    {currentProfile && <NavigationLink to="/staking" label="Staking"/>}
    {currentProfile && <NavigationLink to="/signup" label="My Profile"/>}
    {(!currentProfile && active) && <NavigationLink to="/signup" label="Signup"/>}
    {(!currentProfile && !active) && <NavigationLink onClick={web3utils.connect} label="Connect Wallet"/>}
  </div>)
}

const App = () => {
  const [isGSN, setIsGSN] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
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
                <Web3UtilsProvider>
                  <div className="h-screen flex flex-col">
                    <NotificationHandlerContext.Consumer>
                      {value => (value.notification && (<div className="fixed top-5 right-5 z-50 bg-white">
                        <Notification type={value.notification.type} description={value.notification.description}
                                      close={() => {
                                        value.setNotification(null)
                                      }}/>
                      </div>))}
                    </NotificationHandlerContext.Consumer>

                    <div className="flex-initial">

                      <div className="relative bg-gray-800">
                        <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full"
                             aria-hidden="true">
                          <div className="relative h-full max-w-7xl mx-auto"></div>
                        </div>
                        <div className="relative pt-6 pb-6 sm:pb-6">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <nav className="relative flex items-center sm:h-10 md:justify-center" aria-label="Global">
                              <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                                <div className="flex items-center justify-between w-full md:w-auto">
                                  <a href="#"><span className="sr-only">Workflow</span><img
                                    src="./assets/svgs/logo.svg"/></a>
                                  <div className="-mr-2 flex items-center md:hidden">
                                    <button type="button"
                                            className="bg-gray-50 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                            onClick={() => {
                                              setShowMenu(!showMenu)
                                            }}
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
                        <div className="bg-gray text-white md:hidden">
                          {showMenu && <NavigationLinks/>}
                        </div>

                      </div>

                    </div>

                    <Web3UtilsContext.Consumer>
                      {value => {
                        return (
                          <div className="flex-1 flex-grow">
                            {value.isWaiting && (
                              <div
                                className="w-full fixed h-full z-30 flex items-center">
                                <div
                                  className="h-32 border-2 grid grid-cols-1 py-7 px-6 max-w-lg m-auto transform -translate-y-1/2 place-items-center rounded-full bg-gray-100">
                                  <Loader/>
                                  <p className="mt-3">Waiting for transaction confirmation</p>
                                </div>
                              </div>)}
                            <ChainIdChecker/>
                            <div className={value.disableInteraction ? "filter blur-sm h-full" : "h-full"}>
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
                          </div>
                        )
                      }}
                    </Web3UtilsContext.Consumer>
                  </div>
              </Web3UtilsProvider>
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
