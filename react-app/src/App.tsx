import {useEffect, useRef, useState} from 'react';
import {HashRouter as Router, Switch, Route, Link} from 'react-router-dom';
import './App.css';
import {ApolloClient, ApolloProvider, InMemoryCache, HttpLink} from '@apollo/client';
import WalletConnect from './WalletConnect';
import {useWeb3React, Web3ReactProvider} from './web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import Upload from './Upload';
import Subscribers from './Subscribers';
import {Creator} from './Creator';
import {NotificationHandlerContext, NotificationHandlerProvider} from './ErrorHandler';
import {LitProvider} from './LitProvider';
import Creators from './Creators';
import {ProfileEdit} from './ProfileEdit';
import {InjectedConnector} from './web3-react/injected-connector';
import {APOLLO_URI} from './Config';
import {Notification} from './components/notification';
import {initFontAwesome} from './icons/font-awesome';
import {Web3UtilsContext, Web3UtilsProvider} from './Web3Utils';
import Loader from './elements/loader';
import {Flows} from './Flows';
import {Governance} from './Governance';
import {Biconomy} from '@biconomy/mexa';
import {CreatorVoting} from './CreatorVoting';
import {RetryLink} from '@apollo/client/link/retry';
import {Mytokens, MytokensRequests, Nftlance} from './Nftlance';
import {Feed} from './Feed';
import {Discovery} from './Discovery';
import {SuperfluidProvider} from './Superfluid';
import {ConnectOrSignup, HeaderButtons, ProfileMenu, ChainIdChecker, CreatorHome} from './components';
import { BiconomyProvider } from './contexts/Biconomy';

initFontAwesome();

const directionalLink = new RetryLink().split(
  (operation) => operation.getContext().clientName === 'cyberConnect',
  new HttpLink({uri: 'https://api.cybertino.io/connect/'}),
  new HttpLink({uri: APOLLO_URI})
);

const client = new ApolloClient({
  link: directionalLink,
  cache: new InMemoryCache(),
});

const Autoconnect = () => {
  const injected = new InjectedConnector({supportedChainIds: [1, 3, 4, 5, 42, 137, 80001]});
  const {activate, active} = useWeb3React<Web3Provider>();
  useEffect(() => {
    async function connectWalletIfAvailable() {
      if (!active && (await injected.getProvider()).selectedAddress) activate(injected);
    }

    connectWalletIfAvailable();
  }, [active, injected, activate]);
  return null;
};

const StakingDetector = (props) => {
  const {library} = useWeb3React<Web3Provider>();
  if (props.isGSN)
    // already switched to GSN
    return null;
  //check something with library and call props.setIsGSN(true) if needed
  return null;
};

const App = () => {
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const submenuRef = useRef<any>(null);

  const getLibrary = (provider) => {
    return new Web3Provider(provider); //library
  };

  return (
    <NotificationHandlerProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <BiconomyProvider>
          {/* <StakingDetector isGSN={isGSN} setIsGSN={setIsGSN}/> */}
          <Autoconnect />
          <SuperfluidProvider>
            <LitProvider>
              <ApolloProvider client={client}>
                <Router>
                  <Web3UtilsProvider>
                    <div className="h-screen flex flex-col">
                      <NotificationHandlerContext.Consumer>
                        {(value) =>
                          value.notification && (
                            <div className="fixed top-5 right-5 z-50 bg-white">
                              <Notification
                                type={value.notification.type}
                                description={value.notification.description}
                                close={() => {
                                  value.setNotification(null);
                                }}
                              />
                            </div>
                          )
                        }
                      </NotificationHandlerContext.Consumer>

                      <div className="flex-initial">
                        <div className="relative bg-primary-gradient">
                          <div
                            className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full bg-gradient-to-b from-transparent to-purple-700"
                            aria-hidden="true"
                          >
                            <div className="relative h-full max-w-7xl mx-auto"></div>
                          </div>
                          <div className="relative pt-2 pb-2 sm:pt-4 sm:pb-4">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                              <nav className="relative flex items-center sm:h-10 md:justify-center" aria-label="Global">
                                <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                                  <div className="flex items-center justify-between w-full md:w-auto">
                                    <a href="#">
                                      <span className="sr-only">Workflow</span>
                                      <img className="stroke-cyan-500 stroke-1" src="./assets/svgs/logo.svg" />
                                    </a>
                                    <div className="flex items-center md:hidden">
                                      <ConnectOrSignup
                                        onAvatarClick={() => {
                                          setShowSubmenu(!showSubmenu);
                                        }}
                                      />
                                      {showSubmenu && (
                                        <div
                                          className="absolute z-50 top-12 right-0 rounded-lg bg-white text-blue border-2 shadow-xl w-full max-w-sm py-5"
                                          ref={submenuRef}
                                        >
                                          <ProfileMenu />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <HeaderButtons />
                              </nav>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Web3UtilsContext.Consumer>
                        {(value) => {
                          return (
                            <div className="flex-1 flex-grow">
                              {value.isWaiting && (
                                <div className="w-full fixed h-full z-30 flex items-center">
                                  <div className="h-32 border-2 grid grid-cols-1 py-7 px-6 max-w-lg m-auto transform -translate-y-1/2 place-items-center rounded-lg bg-gray-100">
                                    <Loader />
                                    <p className="mt-3">{value.waitingMessage}</p>
                                  </div>
                                </div>
                              )}
                              <ChainIdChecker />
                              <div className={value.disableInteraction ? 'filter blur-sm h-full' : 'h-full'}>
                                <Switch>
                                  <Route exact path="/">
                                    <Discovery />
                                  </Route>
                                  <Route exact path="/creators">
                                    <Creators />
                                  </Route>
                                  <Route path="/connect-wallet">
                                    <WalletConnect />
                                  </Route>
                                  <Route path="/signup">
                                    <ProfileEdit />
                                  </Route>
                                  <Route path="/upload">
                                    <Upload />
                                  </Route>
                                  <Route path="/subscribers">
                                    <Subscribers />
                                  </Route>
                                  <Route path="/creator/:id">
                                    <Creator />
                                  </Route>
                                  <Route path="/twitter-verification">{/* <TwitterVerification/> */}</Route>
                                  <Route path="/staking">{/* <Staking/> */}</Route>
                                  <Route path="/flows">
                                    <Flows />
                                  </Route>
                                  <Route path="/governance">
                                    <Governance />
                                  </Route>
                                  <Route path="/creator-voting">
                                    <CreatorVoting />
                                  </Route>
                                  <Route path="/nftlance/:id?">
                                    <Nftlance />
                                  </Route>
                                  <Route path="/nftlance-mycards">
                                    <Mytokens />
                                  </Route>
                                  <Route path="/nftlance-mycardsrequests">
                                    <MytokensRequests />
                                  </Route>
                                  <Route path="/feed">
                                    <Feed />
                                  </Route>
                                  <Route path="/discovery">
                                    <Discovery />
                                  </Route>
                                </Switch>
                              </div>
                            </div>
                          );
                        }}
                      </Web3UtilsContext.Consumer>
                      <div>
                        <div className="sm:hidden bottom-0 fixed w-full backdrop-filter z-50 backdrop-blur">
                          <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                              <Link
                                to="/"
                                className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10 m-auto hover-tab p-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                              </Link>

                              <Link
                                to="/subscribers"
                                className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10 m-auto hover-tab p-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </Link>

                              <Link
                                to="/upload"
                                className="filter scale-125 border-transparent text-green-500 hover:text-green-700 hover:border-green-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10 m-auto hover-tab-green p-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </Link>

                              <Link
                                to="/creators"
                                className="border-transparent text-purple-500 hover:text-purple-700 hover:border-purple-300 w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-10 w-10 m-auto hover-tab p-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </Link>
                              <CreatorHome />
                            </nav>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Web3UtilsProvider>
                </Router>
              </ApolloProvider>
            </LitProvider>
          </SuperfluidProvider>
        </BiconomyProvider>
      </Web3ReactProvider>
    </NotificationHandlerProvider>
  );
};

export default App;
