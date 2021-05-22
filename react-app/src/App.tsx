import React, {useContext, useEffect, useRef, useState} from 'react';
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
import {formatEther} from "@ethersproject/units";
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
import {useCanBecomeCreator, useIsAdmin} from "./Whitelist";

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


const ProfileMenu = (props) => {
  const {currentProfile} = useCurrentProfile()
  const {currentCreator} = useCurrentCreator()
  const {usdcx} = useContext(SuperfluidContext);
  const [usdcxBalance, setUsdcxBalance] = useState<any>('Loading')
  const [maticBalance, setMaticBalance] = useState<any>('Loading')
  const {account, library} = useWeb3React()
  useEffect(() => {
    usdcx.balanceOf(account).then(balance => {
      console.log('setting balance in profile menu')
      setUsdcxBalance(balance);
    })
  }, [usdcx, account])

  useEffect(() => {
    library.getBalance(account).then(balance => {
      setMaticBalance(balance);
    })
  }, [library, account])
  const canBecomeCreator = useCanBecomeCreator()

  function formatBalance(balance) {
    if (balance === 'Loading') return balance;
    return formatEther(balance);
  }

  function clipAddress(address) {
    return address.slice(0, 8) + '...' + address.slice(36, 42)
  }

  async function addUsdcx() {
    const wasAdded = await library.provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: usdcx.address, // The address that the token is at.
          symbol: await usdcx.symbol(), // A ticker symbol or shorthand, up to 5 chars.
          decimals: await usdcx.decimals(), // The number of decimals in the token
          image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=010'
        },
      },
    });
  }

  return (
    <div>
      <div className="px-5 mb-4">
        <div className="text-lg font-bold text-black bold">
          {currentProfile?.username}
        </div>
        <div className="-mt-2 text-sm text-gray-500">{clipAddress(account)}</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-gray-200">
        <div className="mb-4">
          <div className="flex mb-4 px-5">
            <div className="flex flex-row flex-auto items-center">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                console.log(usdcx);
                addUsdcx()
              }}>
                <div className="mr-4 bg-white w-9 h-9 flex justify-center items-center rounded bg-opacity-25">
                  <svg xmlns="http://www.w3.org/2000/svg" data-name="86977684-12db-4850-8f30-233a7c267d11"
                       viewBox="0 0 2000 2000">
                    <path
                      d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
                      fill="#2775ca"/>
                    <path
                      d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
                      fill="#fff"/>
                    <path
                      d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
                      fill="#fff"/>
                  </svg>
                </div>
              </a>
              <div>
                <div className="text-sm text-gray-500">Balance:</div>
                <div className="-mt-1 font-bold text-black">{formatBalance(usdcxBalance)} USDCx</div>
              </div>
            </div>
            <div className="flex">
            </div>
          </div>
          <div className="flex mb-4 px-5">
            <div className="flex flex-row flex-auto items-center">
              <div className="mr-4 bg-white w-9 h-9 flex justify-center items-center rounded bg-opacity-25">
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1"
                     id="Layer_1" x="0px" y="0px" viewBox="0 0 38.4 33.5" xmlSpace="preserve">
                  <g>
                    <path fill="#8247E5"
                          d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"/>
                  </g>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Balance:</div>
                <div className="-mt-1 font-bold text-black">{formatBalance(maticBalance)} tMatic</div>
              </div>
            </div>
            <div className="flex">
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {currentCreator &&
          <NavigationLink to="/grant" label="Subscribers"/>
          }
          {canBecomeCreator &&
          <NavigationLink to="/upload" label="Upload"/>
          }
          {currentProfile &&
          <NavigationLink to="/signup" label="My Profile"/>
          }
        </div>
      </div>
    </div>)
}

const HeaderButtons = () => {
  const {currentCreator} = useCurrentCreator()
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const submenuRef = useRef<any>(null);
  const canBecomeCreator = useCanBecomeCreator()
  const isAdmin = useIsAdmin()
  useEffect(() => {
    function handleClickOutside(event) {
      if (submenuRef.current && !(submenuRef.current.contains(event.target))) {
        setShowSubmenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [submenuRef]);
  return (<div className="hidden md:flex md:space-x-10 ml-auto">
    <Link to="/">
      <Button label="Home" theme="focused"></Button>
    </Link>
    <Link to="/creators">
      <Button label="Creators" theme="unfocused"></Button>
    </Link>
    {currentCreator && (<Link to="/grant">
      <Button label="Subscribers" theme="unfocused"></Button>
    </Link>)}
    {canBecomeCreator && (<Link to="/upload">
      <Button label="Upload" theme="unfocused"></Button>
    </Link>)}
    {isAdmin && (<Link to="/staking">
      <Button label="Staking" theme="unfocused"></Button>
    </Link>)}
    <ConnectOrSignup onAvatarClick={() => {
      setShowSubmenu(!showSubmenu)
    }}/>
    {showSubmenu &&
    <div className="absolute z-50 top-12 right-0 rounded-lg bg-white text-blue border-2 shadow-xl w-full max-w-sm py-5"
         ref={submenuRef}><ProfileMenu/></div>}
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
    return null;
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
            "rpcUrls": ["https://rpc-mumbai.maticvigil.com"],
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
  const canBecomeCreator = useCanBecomeCreator()
  const isAdmin = useIsAdmin()
  return (<div>
    <NavigationLink to="/" label="Home"/>
    <NavigationLink to="/creators" label="Creators"/>
    {currentCreator && <NavigationLink to="/grant" label="Subscribers"/>}
    {canBecomeCreator && <NavigationLink to="/upload" label="Upload"/>}
    {isAdmin && <NavigationLink to="/staking" label="Staking"/>}
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
                                  className="h-32 border-2 grid grid-cols-1 py-7 px-6 max-w-lg m-auto transform -translate-y-1/2 place-items-center rounded-lg bg-gray-100">
                                  <Loader/>
                                  <p className="mt-3">{value.waitingMessage}</p>
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
