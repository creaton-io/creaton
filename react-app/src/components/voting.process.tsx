import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "../web3-react/core";
import { ethers } from "ethers";
import { FC, useEffect, useRef, useState } from "react";
import creaton_contracts from "../Contracts";

interface VotingProcessProps {
    process: any
}

export const VotingProcess: FC<VotingProcessProps> = ({ process }) => {
    console.log(process);
    const web3Context = useWeb3React<Web3Provider>();

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
        })();
    }, [web3Context]);

    return (
        <div className="mb-5">
            <div className="flex flex-col rounded-2xl border border-opacity-10 overflow-hidden bg-white bg-opacity-5 filter drop-shadow-md shadow-md hover:shadow-lg">
                <div className="p-8">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-white">
                                {process.question}
                            </h4>
                            <div className="flex justify-between">
                                <div className="mr-5">
                                    {/* Like, votes or something here? */}
                                </div>                       
                            </div>
                        </div>

                        <p className="text-left text-white">
                            {process.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};
