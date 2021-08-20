import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import creaton_contracts from "../Contracts";

interface UserStakedProps {
    stake: any
}

export const UserStaked: FC<UserStakedProps> = ({ stake }) => {
    const web3Context = useWeb3React<Web3Provider>();

    const [stakedToken, setStakedToken] = useState<any>();
    const [stakedTokenBalance, setStakedTokenBalance] = useState('0');

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const stakeContract = new ethers.Contract(stake.token, creaton_contracts.erc20.abi, signer);

            setStakedToken({
                name: await stakeContract.name(),
                symbol: await stakeContract.symbol(),
            });

            setTimeout(async () => {
                setStakedTokenBalance((await stakeContract.balanceOf(signer.getAddress())).toString());
            }, 500);
        })();
    });

    return (
        <div className="relative p-3 sm:p-4">
            {stakedToken && <div className="max-w-7xl mx-auto sm:px-6">
                <div className="bg-white bg-opacity-5 mb-4 rounded-xl shadow-md border-2 border-opacity-10 transition transform hover:shadow-lg">
                    <li className="py-4 px-6 flex"> 
                        <div className="ml-3">
                            <p className="text-white"><span className="font-bold">Staked:</span> {ethers.utils.formatEther(stake.amount)} {stakedToken.symbol} ({stakedToken.name})</p>
                            <p className="text-sm text-white"><span className="font-bold">Reacted with:</span> {stake.reaction.reaction.name} ({stake.reaction.reaction.symbol}) to {stake.reaction.nft} <span className="font-bold">TokenId:</span> {stake.reaction.tokenId}</p>
                            <p className="mt-2 text-sm text-gray-200"></p>
                        </div>
                        <div className="ml-auto text-center">
                            <p className="font-bold text-white">Balance:</p>
                            <p className="mt-2 text-sm text-white">{ethers.utils.formatEther(stakedTokenBalance)} ({stakedToken.symbol})</p>
                        </div>
                    </li>
                </div>
            </div>}
        </div>
    )
};
