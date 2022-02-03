import React, {useContext, useEffect, useRef, useState, useMemo} from 'react';
import {HashRouter as Router, Switch, Route, Link} from 'react-router-dom';
import './App.css';
import {ApolloClient, ApolloProvider, InMemoryCache, HttpLink} from '@apollo/client';
import Home from './Home';
import WalletConnect from './WalletConnect';
import {useWeb3React, Web3ReactProvider} from './web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import Upload from './Upload';
import {formatEther, parseEther} from '@ethersproject/units';
import {SuperfluidContext, SuperfluidProvider} from './Superfluid';
import Subscribers from './Subscribers';
//import {Staking} from "./Staking";
import {Creator} from './Creator';
import {NotificationHandlerContext, NotificationHandlerProvider} from './ErrorHandler';
import {LitProvider} from './LitProvider';
import Creators from './Creators';
import {Button} from './elements/button';
import creaton_contracts from './Contracts';
import {ProfileEdit} from './ProfileEdit';
import {useCurrentCreator, useCurrentProfile} from './Utils';
import {InjectedConnector} from './web3-react/injected-connector';
import {APOLLO_URI, REACTION_ERC20} from './Config';
import {Notification} from './components/notification';
import {initFontAwesome} from './icons/font-awesome';
import {Avatar} from './components/avatar';
import {Toggle} from './elements/toggle';
import {Web3UtilsContext, Web3UtilsProvider, Web3UtilsProviderContext} from './Web3Utils';
import Loader from './elements/loader';
import {useCanBecomeCreator, useIsAdmin} from './Whitelist';
import WalletModal from './components/walletModal';
import {Flows} from './Flows';
import {Governance} from './Governance';
import {Icon} from './icons';
import Tooltip from './elements/tooltip';
import {Biconomy} from './assets/mexa';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {CreatorVoting} from './CreatorVoting';
import {ApolloLink} from 'apollo-link';
import {RetryLink} from '@apollo/client/link/retry';
import {Mytokens, MytokensRequests, Nftlance} from './Nftlance';

initFontAwesome();

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
};

// const client = new ApolloClient({
//   uri: APOLLO_URI,
//   cache: new InMemoryCache(),
// });

const directionalLink = new RetryLink().split(
  (operation) => operation.getContext().clientName === 'cyberConnect',
  new HttpLink({uri: 'https://api.cybertino.io/connect/'}),
  new HttpLink({uri: APOLLO_URI})
);

const client = new ApolloClient({
  link: directionalLink,
  cache: new InMemoryCache(),
});

// const link = new ApolloLink().split(
//   (operation) => operation.getContext().clientName === 'cyberConnect',
//   new HttpLink({ uri: APOLLO_URI }),
//   new HttpLink({uri: 'https://api.cybertino.io/connect/' })
// )

// const client = new ApolloClient({
//   link: ApolloLink.split(
//     (operation) => operation.getContext().clientName === 'cyberConnect',
//     // the string "third-party" can be anything you want,
//     // we will use it in a bit
//     localLink, // <= apollo will send to this if clientName is "third-party"
//     cyberConnectLink // <= otherwise will send to this
//   ),

//   // other options
// });

const paymaster = creaton_contracts.Paymaster;

const getLibrary = (provider) => {
  console.log('evaluating getLibrary', provider);
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
};

// const getGSNLibrary = (provider) => {
//   let paymasterAddress = paymaster.address
//   const config = {
//     paymasterAddress,
//     requiredVersionRange: "2.2.3-matic",
//   }
//   console.log('evaluating getGSNLibrary', provider)
//   const gsnProvider = RelayProvider.newProvider({provider: provider, config});
//   gsnProvider.init()
//   // @ts-ignore
//   const gsnLibrary = new Web3Provider(gsnProvider)
//   gsnLibrary.pollingInterval = 12000
//   return gsnLibrary
// }

function ConnectOrSignup(props) {
  const {active} = useWeb3React();
  const {currentProfile} = useCurrentProfile();
  const web3utils = useContext(Web3UtilsContext);
  const {account, library} = useWeb3React();

  if (currentProfile)
    return (
      <a
        href=""
        onClick={(e) => {
          e.preventDefault();
          props.onAvatarClick();
        }}
      >
        <Avatar size="menu" src={currentProfile.image} />
      </a>
    );
  if (active)
    return (
      <div className="hidden md:flex md:space-x-10 ml-auto">
        <Link to="/signup">
          <Button label="Profile"></Button>
        </Link>
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            props.onAvatarClick();
          }}
        >
          <Avatar size="menu" src={''} />
        </a>
      </div>
    );
  else
    return (
      <div>
        <WalletModal></WalletModal>
      </div>
    );
}

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

const ProfileMenu = (props) => {
  const {currentProfile} = useCurrentProfile();
  const {currentCreator} = useCurrentCreator();
  const {usdcx, usdc} = useContext(SuperfluidContext);
  const [usdcxBalance, setUsdcxBalance] = useState<any>('Loading');
  const [usdcBalance, setUsdcBalance] = useState<any>('Loading');
  const [maticBalance, setMaticBalance] = useState<any>('Loading');
  const [createBalance, setCreateBalance] = useState<any>('Loading');
  const [wrappingUsdc, setWrappingUsdc] = useState<boolean>(false);
  const [unwrapAmount, setUnwrapAmount] = useState('');
  const [wrapAmount, setWrapAmount] = useState('');
  const [unwrappingUsdcx, setUnwrappingUsdcx] = useState<boolean>(false);
  const {account, library} = useWeb3React();

  const [clipValue, setClipValue] = useState('');
  const [copyClip, setCopyClip] = useState<boolean>(false);

  useEffect(() => {
    usdcx.balanceOf(account).then((balance) => {
      console.log('setting balance in profile menu');
      setUsdcxBalance(balance);
    });
    usdc.balanceOf(account).then((balance) => {
      setUsdcBalance(balance);
    });
  }, [usdc, usdcx, account]);

  useEffect(() => {
    if (!library) return;

    library.getBalance(account).then((balance) => {
      setMaticBalance(balance);
    });
  }, [library, account]);
  const canBecomeCreator = useCanBecomeCreator();

  // useEffect(() => {
  //   (async function iife() {
  //     const signer = library!.getSigner()
  //     const userAddress = await signer.getAddress();

  //     const erc20Contract: Contract = new Contract(REACTION_ERC20, creaton_contracts.erc20.abi, signer);
  //     let balance = (await erc20Contract.balanceOf(userAddress)).toString();
  //     setCreateBalance(balance);
  //   })();
  // }, [account])

  function formatBalance(balance) {
    if (balance === 'Loading') return balance;
    return formatEther(balance);
  }

  function clipAddress(address) {
    return address.slice(0, 8) + '...' + address.slice(36, 42);
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
          image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=010',
        },
      },
    });
  }
  async function addUsdc() {
    const wasAdded = await library.provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: usdc.address, // The address that the token is at.
          symbol: await usdc.symbol(), // A ticker symbol or shorthand, up to 5 chars.
          decimals: await usdc.decimals(), // The number of decimals in the token
          image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=010',
        },
      },
    });
  }

  async function unwrapUsdcx() {
    setUnwrappingUsdcx(true);

    let tx = await usdcx.downgrade(parseEther(unwrapAmount));
    await tx.wait();

    setUsdcxBalance(await usdcx.balanceOf(account));
    setUsdcBalance(await usdc.balanceOf(account));
    setUnwrappingUsdcx(false);
  }

  async function wrapUsdc() {
    setWrappingUsdc(true);

    let tx;
    if ((await usdc.allowance(account, usdcx.address)) < wrapAmount) {
      tx = await usdc.approve(usdcx.address, wrapAmount);
      await tx.wait();
    }

    tx = await usdcx.upgrade(parseEther(wrapAmount));
    await tx.wait();

    setUsdcxBalance(await usdcx.balanceOf(account));
    setUsdcBalance(await usdc.balanceOf(account));
    setWrappingUsdc(false);
  }

  return (
    <div>
      <div className="px-5 mb-4 z-10">
        <div className="text-lg font-bold text-black bold">{currentProfile?.username}</div>
        <div className="-mt-2 text-sm text-purple-500">
          <CopyToClipboard text={account} onCopy={() => setCopyClip(true)}>
            <span className="select-all">{clipAddress(account)}📋</span>
          </CopyToClipboard>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-gray-200">
        <div className="mb-4">
          <div className="flex mb-4 px-5">
            <div className="flex flex-row flex-auto items-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(usdcx);
                  addUsdcx();
                }}
              >
                <div className="mr-4 bg-white w-9 h-9 flex justify-center items-center rounded bg-opacity-25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="86977684-12db-4850-8f30-233a7c267d11"
                    viewBox="0 0 2000 2000"
                  >
                    <path
                      d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
                      fill="#2775ca"
                    />
                    <path
                      d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
                      fill="#fff"
                    />
                    <path
                      d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
                      fill="#fff"
                    />
                  </svg>
                </div>
              </a>
              <div>
                <div className="text-sm text-purple-500">Balance:</div>
                <div className="-mt-1 font-bold text-black">
                  {formatBalance(usdcxBalance)} USDCx
                  <label className="float-right z-50">
                    <Tooltip
                      content={
                        <div>
                          USDCx is the token to send and receive in a "flow" for the subscriptions (micro-transactions
                          per block/second)
                        </div>
                      }
                      hover
                    >
                      <Icon name="question-circle" className="text-gray-500 " />
                    </Tooltip>
                  </label>
                </div>

                {!unwrappingUsdcx && usdcxBalance > 0 && (
                  <span className="sm:flex sm:items-center">
                    <div className="w-2/3 sm:max-w-xs">
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        aria-describedby="price-currency"
                        value={unwrapAmount}
                        onChange={(event) => {
                          setUnwrapAmount(event.target.value);
                        }}
                      />
                    </div>
                    <button
                      onClick={unwrapUsdcx}
                      type="submit"
                      className="mt-3 inline-flex items-center float-right justify-center px-2 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      to USDC
                    </button>
                  </span>
                )}
                {unwrappingUsdcx && (
                  <span>
                    <svg
                      className="inline-block animate-spin mb-1 mr-2 h-4 w-4 text-blue"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Converting to USDC...
                  </span>
                )}
              </div>
            </div>
            <div className="flex"></div>
          </div>
          <div className="flex mb-4 px-5">
            <div className="flex flex-row flex-auto items-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(usdc);
                  addUsdc();
                }}
              >
                <div className="mr-4 bg-white w-9 h-9 flex justify-center items-center rounded bg-opacity-25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="86977684-12db-4850-8f30-233a7c267d11"
                    viewBox="0 0 2000 2000"
                  >
                    <path
                      d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
                      fill="#2775ca"
                    />
                    <path
                      d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
                      fill="#fff"
                    />
                    <path
                      d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
                      fill="#fff"
                    />
                  </svg>
                </div>
              </a>
              <div>
                <div className="text-sm text-purple-500">Balance:</div>
                <div className="-mt-1 font-bold text-black">{formatBalance(usdcBalance)} USDC</div>
                {!wrappingUsdc && usdcBalance > 0 && (
                  <span className="sm:flex sm:items-center">
                    <div className="w-2/3 sm:max-w-xs">
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        aria-describedby="price-currency"
                        value={wrapAmount}
                        onChange={(event) => {
                          setWrapAmount(event.target.value);
                        }}
                      />
                    </div>
                    <button
                      onClick={wrapUsdc}
                      type="submit"
                      className="mt-3 inline-flex items-center float-right justify-center px-1 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      to USDCx
                    </button>
                  </span>
                )}
                {wrappingUsdc && (
                  <span>
                    <svg
                      className="inline-block animate-spin mb-1 mr-2 h-4 w-4 text-blue"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Converting to USDCx...
                  </span>
                )}
              </div>
            </div>
            <div className="flex"></div>
          </div>
          {/* <div className="flex mb-4 px-5">
            <div className="flex flex-row flex-auto items-center">
              <div className="mr-4 bg-white w-9 h-9 flex justify-center items-center rounded bg-opacity-25">
              </div>
              <div>
                <div className="text-sm text-purple-500">Balance:</div>
                <div className="-mt-1 font-bold text-black">{formatBalance(createBalance)} CREATE</div>
              </div>
            </div>
            <div className="flex">
            </div>
          </div> */}
          <div className="flex mb-4 px-5">
            <div className="flex flex-row flex-auto items-center">
              <div className="mr-4 bg-white w-9 h-9 flex justify-center items-center rounded bg-opacity-25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  id="Layer_1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 38.4 33.5"
                  xmlSpace="preserve"
                >
                  <g>
                    <path
                      fill="#8247E5"
                      d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                    />
                  </g>
                </svg>
              </div>
              <div>
                <div className="text-sm text-purple-500">Balance:</div>
                <div className="-mt-1 font-bold text-black">{formatBalance(maticBalance)} tMatic</div>
              </div>
            </div>
            <div className="flex"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {currentCreator && <NavigationLink to="/subscribers" label="Subscribers" />}
          {canBecomeCreator && <NavigationLink to="/upload" label="Upload" />}
          {<NavigationLink to="/signup" label={currentProfile ? 'My Profile' : 'Make Profile'} />}
          {currentProfile && <NavigationLink to="/flows" label="My Flows" />}
        </div>
      </div>
    </div>
  );
};

const HeaderButtons = () => {
  const {currentCreator} = useCurrentCreator();
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const submenuRef = useRef<any>(null);
  //const isAdmin = useIsAdmin();
  useEffect(() => {
    function handleClickOutside(event) {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setShowSubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [submenuRef]);
  return (
    <div className="hidden md:flex md:space-x-10 ml-auto">
      <Link to="/">
        <Button label="Home" theme="focused"></Button>
      </Link>
      <Link to="/creators">
        <Button label="Creators" theme="unfocused"></Button>
      </Link>
      {currentCreator && (
        <Link to="/subscribers">
          <Button label="Subscribers" theme="unfocused"></Button>
        </Link>
      )}
      <Link to="/upload">
        <Button label="Upload" theme="unfocused"></Button>
      </Link>

      {/* {isAdmin && (<Link to="/staking"> */}
      {/* <Button label="Staking" theme="unfocused"></Button> */}
      {/* </Link>)} */}
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
  );
};

function NavigationLink(props) {
  if (props.to)
    return (
      <Link to={props.to}>
        <div className="p-2 m-2 rounded-lg hover:bg-white hover:text-black">{props.label}</div>
      </Link>
    );
  else
    return (
      <a
        href=""
        onClick={(e) => {
          e.preventDefault();
          props.onClick();
        }}
      >
        <div className="p-2 hover:bg-white hover:text-black">{props.label}</div>
      </a>
    );
}

function ChainIdChecker(props) {
  const {library, chainId} = useWeb3React();
  if (!library || chainId === 80001 || chainId === 137) return null;
  return (
    <div className="w-full fixed h-full z-30 flex items-center">
      <div className="border-2 grid grid-cols-1 py-7 px-6 max-w-lg m-auto transform -translate-y-1/2 place-items-center rounded-lg bg-gray-100">
        <p className="my-3">
          Creaton beta uses the Polygon Matic network.
          <br />
          Please switch to this network
        </p>
        <Button
          label="Switch to the Polygon Matic network"
          onClick={() => {
            library.provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x89',
                  chainName: 'Polygon Matic',
                  rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com/'],
                },
              ],
            });
          }}
        />
      </div>
    </div>
  );
}

function CreatorHome() {
  const {currentCreator} = useCurrentCreator();
  if (currentCreator) {
    return (
      <Link
        to={'/creator/' + currentCreator.creatorContract}
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
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    );
  } else
    return (
      <Link
        to="/subscribers/"
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
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    );
}

function CreatorWallet() {
  const {currentCreator} = useCurrentCreator();
  return (
    <div>
      {currentCreator && (
        <Link
          to={'/creator/' + currentCreator.creatorContract}
          className="bg-gray-50 rounded-md p-1 inline-flex items-center justify-center text-gray-400 hover:text-purple-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">Open main menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="green">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}

const App = () => {
  // const [isGSN, setIsGSN] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [loadingBiconomy, setLoadingBiconomy] = useState<boolean>(false);
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const submenuRef = useRef<any>(null);

  const getLibrary = (provider) => {
    setLoadingBiconomy(true);
    const biconomy = new Biconomy(provider, {
      apiKey: 'U-ciLBx4A.481e0ccd-360c-45a4-b89b-75f8feb0457d',
      strictMode: true,
      debug: true,
    });
    // @ts-ignore
    //biconomy.pollingInterval = 12000
    biconomy
      .onEvent(biconomy.READY, () => {
        console.log('Mexa is Ready');
      })
      .onEvent(biconomy.ERROR, (error, message) => {
        console.error(error);
      });
    console.log('evaluating getLibrary', provider);
    const library = biconomy.getEthersProvider();
    library.pollingInterval = 12000;
    return new Web3Provider(provider); //library
  };

  return (
    <NotificationHandlerProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
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

                    <div className="flex-initial border-b border-opacity-25">
                      <div className="relative bg-primary-gradient">
                        <div
                          className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full bg-gradient-to-r from-purple-500 to-purple-700"
                          aria-hidden="true"
                        >
                          <div className="relative h-full max-w-7xl mx-auto"></div>
                        </div>
                        <div className="relative pt-2 pb-2 sm:pt-4 sm:pb-4 bg-gradient-to-r from-purple-500 to-purple-700">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <nav className="relative flex items-center sm:h-10 md:justify-center" aria-label="Global">
                              <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                                <div className="flex items-center justify-between w-full md:w-auto">
                                  <a href="#">
                                    <span className="sr-only">Workflow</span>
                                    <img src="./assets/svgs/logo.svg" />
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
                                  <Home />
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
      </Web3ReactProvider>
    </NotificationHandlerProvider>
  );
};

export default App;
