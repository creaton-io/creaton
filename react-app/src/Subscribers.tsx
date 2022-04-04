import 'react-app-polyfill/ie11';
import * as React from 'react';
import {useWeb3React} from '@web3-react/core';
import {Web3Provider} from '@ethersproject/providers';
import {Fragment, useContext, useState} from 'react';
import {Creator, useCurrentCreator} from './Utils';
import {gql, useQuery} from '@apollo/client';
import {Contract} from 'ethers';
import creaton_contracts from './Contracts';
import {Button} from './elements/button';
import {Avatar} from './components/avatar';
import {Checkbox} from './elements/checkbox';
import {NotificationHandlerContext} from './ErrorHandler';
import clsx from 'clsx';
import {Web3UtilsContext} from './Web3Utils';
import {Example} from './components/error-notification';
import {Dialog, Transition} from '@headlessui/react';
import {LoginIcon} from '@heroicons/react/outline';
import {ExclamationIcon, XIcon} from '@heroicons/react/outline';

const CreatorContract = creaton_contracts.Creator;

const SUBSCRIBERS_QUERY = gql`
  query GET_SUBSCRIBERS($user: Bytes!) {
    subscribers(where: {creatorContract: $user}) {
      user
      status
      profile {
        data
      }
    }
  }
`;

function Tabs({tabs, activeTab, setActiveTab}) {
  return (
    <div className="w-full mb-3 text-black">
      <div className="hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          defaultValue={tabs.find((tab) => tab.name === activeTab).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href="#"
                className={clsx(
                  tab.name === activeTab
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-purple-300 hover:border-gray-200',
                  'w-1/3 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm'
                )}
                aria-current={tab.name === activeTab ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.name);
                }}
              >
                {tab.name}
                <span
                  className={clsx(
                    tab.name === activeTab ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                    'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                  )}
                >
                  {tab.count}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

const Subscribers = () => {
  const context = useWeb3React();
  const web3utils = useContext(Web3UtilsContext);
  const notificationHandler = useContext(NotificationHandlerContext);
  const creator = useCurrentCreator().currentCreator;
  const [checkedSubscribers, setCheckedSubscribers] = useState<Map<string, boolean>>(new Map());
  const {loading, error, data} = useQuery(SUBSCRIBERS_QUERY, {
    pollInterval: 10000,
    variables: {user: creator?.creatorContract},
  });
  const [activeTab, setActiveTab] = useState('Requested');
  const [open, setOpen] = useState(true);
  console.log('rest');
  if (!context.isActive) return <div><Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="absolute z-50 inset-0 overflow-y-auto" onClose={setOpen}>
          <div className="flex items-end justify-center min-h-screen px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="relative inset-0 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-8 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <LoginIcon className="h-6 w-6 ml-1 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Connect your wallet to Creaton
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        If you don't have a crypto wallet yet we recommend using your email unless you feel bold today!
                        <br />
                        <br />
                        If you want to use Metamask, please purchase a Ledger Hardware wallet so that funds can never be
                        hacked (never give out your recovery phase)!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center mb-4">
                      <span className="px-2 bg-white text-sm text-gray-500">For existing crypto users</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm mb-4 px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={web3utils.connect}
                  >
                    <img
                      className="w-6 mr-2"
                      src="https://cdn.worldvectorlogo.com/logos/metamask.svg"
                      alt="MetaMask logo vector"
                    />
                    Connect with Metamask
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm mb-4 px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={web3utils.walletConnect}
                  >
                    <svg
                      className="mr-2"
                      width="32"
                      height="19"
                      viewBox="0 0 32 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.0625 4.02523C12.0062 -0.81505 20.0215 -0.81505 24.9652 4.02523L25.5601 4.60776C25.8073 4.84978 25.8073 5.24216 25.5601 5.48417L23.5248 7.47691C23.4012 7.59792 23.2009 7.59792 23.0773 7.47691L22.2585 6.67527C18.8097 3.29857 13.218 3.29857 9.76916 6.67527L8.89233 7.53376C8.76874 7.65477 8.56836 7.65477 8.44476 7.53376L6.40946 5.54102C6.16227 5.29901 6.16227 4.90663 6.40946 4.66461L7.0625 4.02523ZM29.1744 8.14642L30.9858 9.91996C31.233 10.162 31.233 10.5544 30.9858 10.7964L22.8179 18.7935C22.5708 19.0355 22.17 19.0355 21.9228 18.7935C21.9228 18.7935 21.9228 18.7935 21.9228 18.7935L16.1258 13.1177C16.064 13.0572 15.9638 13.0572 15.902 13.1177C15.902 13.1177 15.902 13.1177 15.902 13.1177L10.1051 18.7935C9.85787 19.0355 9.45711 19.0355 9.20992 18.7935C9.20992 18.7935 9.20992 18.7935 9.20991 18.7935L1.04183 10.7963C0.794649 10.5543 0.794649 10.1619 1.04183 9.91986L2.85326 8.14631C3.10045 7.9043 3.50121 7.9043 3.7484 8.14631L9.54553 13.8222C9.60732 13.8827 9.70751 13.8827 9.76931 13.8222C9.76931 13.8222 9.76931 13.8222 9.76931 13.8222L15.5662 8.14631C15.8133 7.9043 16.2141 7.90429 16.4613 8.14629C16.4613 8.1463 16.4613 8.1463 16.4613 8.1463L22.2584 13.8222C22.3202 13.8827 22.4204 13.8827 22.4822 13.8222L28.2792 8.14642C28.5264 7.9044 28.9272 7.9044 29.1744 8.14642Z"
                        fill="#3B99FC"
                      ></path>
                    </svg>
                    Connect with WalletConnect
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center mb-4">
                      <span className="px-2 bg-white text-sm text-gray-500">For crypto beginners</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 mb-4">
                      <input
                        type="text"
                        name="email"
                        id="email"
                        ref={web3utils.setMagicEmail}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="you@example.com"
                        value={web3utils.magicEmail}
                        onChange={(e) => {
                          web3utils.setMagicEmail(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={web3utils.magicConnect}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 filter drop-shadow-lg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                    Connect with Email
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root></div>;
  if (creator === undefined)
    return (
      <div>
        <Example />
      </div>
    );
  if (loading) return <div>Loading subscribers...</div>;
  if (error) return <div>Error Loading subscribers</div>;
  let currentCreator: Creator = creator;

  const subscribed_subscribers = data.subscribers.filter((subscriber) => {
    return subscriber.status === 'subscribed';
  });

  const tabs = [{name: 'Subscribed', count: subscribed_subscribers.length}];
  const checkedCount = Array.from(checkedSubscribers.values()).filter((checked) => checked).length;

  return (
    <div className="w-3/4 sm:w-1/2 pt-8 m-auto grid grid-cols-1 place-items-start text-white">
      <div>
        <h3 className="text-md text-white pb-4">
          {subscribed_subscribers.length >= 2 //in Lit Protocol, one is in the subscriber mapping themselves to see the content
            ? 'These profiles are streaming money to you right now!'
            : "No one is subscribed to you yet, but don't worry, soon!"}
        </h3>
        {subscribed_subscribers.map(
          (subscriber) =>
            context.account?.toLowerCase() !== subscriber.user && (
              <div key={subscriber.user} className="flex flex-row place-items-center m-2">
                <Avatar
                  size="medium"
                  src={subscriber.profile !== null ? JSON.parse(subscriber.profile.data).image : ''}
                />
                <span className="font-bold ml-2">
                  {subscriber.profile !== null ? JSON.parse(subscriber.profile.data).username : 'Anon'}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Subscribers;
