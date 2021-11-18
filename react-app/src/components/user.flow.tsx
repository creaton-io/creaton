import {Web3Provider} from '@ethersproject/providers';
import {useWeb3React} from '../web3-react/core';
import {ethers} from 'ethers';
import {FC, useEffect, useRef, useState} from 'react';
import creaton_contracts from '../Contracts';

interface UserFlowProps {
  flow: any;
}

export const UserFlow: FC<UserFlowProps> = ({flow}) => {
  const web3Context = useWeb3React<Web3Provider>();

  const [reactionToken, setReactionToken] = useState<any>();
  const [superToken, setSuperToken] = useState<any>();
  const [superTokenBalance, setSuperTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  useEffect(() => {
    (async function iife() {
      const {library} = web3Context;
      if (!library) return;

      const signer = library!.getSigner();
      // const reactionContract = new ethers.Contract(flow.owner.id, creaton_contracts.ReactionToken.abi, signer);
      // setReactionToken({
      //     name: await reactionContract.name(),
      //     symbol: await reactionContract.symbol(),
      // });

      //@ts-ignore
      const superTokenContract = new ethers.Contract(flow.stakingSuperToken, creaton_contracts.ISuperToken.abi, signer);
      setSuperToken({
        name: await superTokenContract.name(),
        symbol: await superTokenContract.symbol(),
      });

      if (superTokenBalance.toString() == '0') {
        setSuperTokenBalance(await superTokenContract.balanceOf(signer.getAddress()));
        const rate = ethers.BigNumber.from(flow.flowRate);

        setInterval(async () => {
          setSuperTokenBalance((prevValue) => {
            return prevValue.add(rate.div(10));
          });
        }, 100);
      }
    })();
  }, [web3Context]);

  async function withdraw() {
    const {library} = web3Context;
    if (!library) return;

    const signer = library!.getSigner();
    //@ts-ignore
    const superTokenContract = new ethers.Contract(flow.stakingSuperToken, creaton_contracts.ISuperToken.abi, signer);
    let tx = await superTokenContract.downgrade(await superTokenContract.balanceOf(signer.getAddress()));
    let receipt = await tx.wait();
    console.log(receipt);
  }

  return (
    <div className="relative p-3 sm:p-4">
      {superToken && (
        <div className="max-w-7xl mx-auto sm:px-6">
          <div className="bg-white bg-opacity-5 mb-4 rounded-xl shadow-md border-2 border-opacity-10 transition transform hover:shadow-lg">
            <li className="py-4 px-6 flex">
              <div className="ml-3">
                {/* <p className="text-white"><span className="font-bold">Reacted with </span>"{reactionToken.name}"</p> */}
                <p className="text-sm text-white">
                  <span className="font-bold">Received: </span>
                  {ethers.utils.formatEther(superTokenBalance)} {superToken.name} ({superToken.symbol})
                </p>
                <p className="mt-2 text-sm text-gray-200">
                  <span className="font-bold">Receiving: </span>
                  {ethers.utils.formatEther(flow.flowRate)} / second
                </p>
                <p className="mt-2 text-sm text-gray-200">
                  <span className="font-bold">Last Balance: </span>
                  {ethers.utils.formatEther(flow.balance)} ({superToken.symbol})
                </p>
              </div>
              <div className="ml-auto text-center">
                <p className="font-bold text-white">
                  <button
                    onClick={() => {
                      if (!isNaN(+superTokenBalance)) withdraw();
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-green to-indigo-400 text-white hover:bg-green-900 active:bg-green-900 focus:outline-none focus:bg-blue focus:ring-1 focus:ring-blue focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-900 disabled:cursor-default ml-2"
                  >
                    Withdraw
                  </button>
                </p>
                <p className="mt-2 text-sm text-white"></p>
              </div>
            </li>
          </div>
        </div>
      )}
    </div>
  );
};
