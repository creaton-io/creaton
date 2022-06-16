import React, {useState, useEffect, useContext} from 'react';
import {useCurrentCreator, useCurrentProfile} from '../Utils';
import {useCanBecomeCreator} from '../Whitelist';
import {SuperfluidContext} from '../Superfluid';
import {useWeb3React} from '@web3-react/core';
import {formatEther, parseEther} from '@ethersproject/units';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Tooltip from '../elements/tooltip';
import {Icon} from '../icons';
import WertModal from './wertModal';
import LiFiModal from './lifiModal';
import NavigationLink from './NavigationLink';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import creaton_contracts from "../Contracts";

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
  const {provider, account} = useWeb3React();

  const [clipValue, setClipValue] = useState('');
  const [copyClip, setCopyClip] = useState<boolean>(false);

  const web3Provider = provider as Web3Provider;

  useEffect(() => {
    if (!account && !usdc && !usdcx) return;

    usdcx.balanceOf(account).then((balance) => {
      console.log('setting balance in profile menu');
      setUsdcxBalance(balance);
    });
    usdc.balanceOf(account).then((balance) => {
      setUsdcBalance(balance);
    });
  }, [usdc, usdcx, account]);

  useEffect(() => {
    if (!provider && !account) return;

    provider!.getBalance(account!).then((balance) => {
      setMaticBalance(balance);
    });
  }, [provider, account]);
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
    const wasAdded = await web3Provider.provider.request!({
      method: 'wallet_watchAsset',
      params: {
        //@ts-ignore
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
    const wasAdded = await web3Provider.provider.request!({
      method: 'wallet_watchAsset',
      params: {
        //@ts-ignore
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

    // let tx = await usdcx.downgrade(parseEther(unwrapAmount));
    // await tx.wait();

    let creator = currentCreator?.creatorContract || "";

    const creatorContract = new Contract(creator, creaton_contracts.Creator.abi).connect(
      web3Provider.getSigner()
    );
    const receipt = await creatorContract.recoverTokens(usdcx.address);
    //web3utils.setIsWaiting(true);
    await receipt.wait(1);
    //web3utils.setIsWaiting(false);
    //notificationHandler.setNotification({description: 'Withdrawn USDC', type: 'success'});

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
            <span className="select-all">{clipAddress(account ? account : "")}📋</span>
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
                <WertModal></WertModal>
                <LiFiModal></LiFiModal>
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
          {currentCreator && <NavigationLink to={"/creator/" + currentCreator?.creatorContract} label="My Creator Page" />}
          {<NavigationLink to="/signup" label={currentProfile ? 'My Profile' : 'Make Profile'} />}
          {currentProfile && <NavigationLink to="/flows" label="My Flows" />}
          {currentCreator && <NavigationLink to="/subscribers" label="Subscribers" />}
          {canBecomeCreator && <NavigationLink to="/upload" label="Upload" />}
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
