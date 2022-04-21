import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Contract, ethers } from "ethers";
import { FC, useContext, useEffect, useState } from "react";
import creaton_contracts from "../Contracts";
import { Web3UtilsContext } from "../Web3Utils";
import { NotificationHandlerContext } from "../ErrorHandler";
import { Radio } from "../elements/radio";
import { Button } from "../elements/button";
import { CREATE_TOKEN_ADDRESS } from "../Config";

interface ReportedContentProps {
    reportedContent: any
}

export const ReportedCase: FC<ReportedContentProps> = ({ reportedContent }) => {
    const web3Context = useWeb3React();
    const [userAddress, setUserAddress] = useState('');
    const [stakingSymbol, setStakingSymbol] = useState('');
    const [reporterIndex, setReporterIndex] = useState(0);

    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;

            const signer = provider!.getSigner();
            const address = (await signer.getAddress()).toLowerCase();

            const erc20Contract: Contract = new Contract(CREATE_TOKEN_ADDRESS as string, creaton_contracts.erc20.abi, signer);
            setStakingSymbol(await erc20Contract.symbol());
            
            setUserAddress(address);
            setReporterIndex(reportedContent.reporters.indexOf(address));
        })();
    }, [web3Context]);

    return (
        <div className="flex flex-col rounded-2xl border border-opacity-10 bg-white bg-opacity-5 filter shadow-md hover:shadow-lg mt-10">
            <div className="p-8">
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-white">
                            Title: <span className="font-normal">{ reportedContent.content.name }</span>
                        </h4>
                        <h5 className="text-lg font-semibold text-white">
                            Status: <span className="font-normal capitalize">{ reportedContent.content.moderationCase[0].status }</span>
                        </h5>
                        <div className="flex justify-between">
                            <div className="mr-5 text-right">
                                Reported on { new Date((+reportedContent.content.moderationCase[0].timestamp)*1000).toLocaleString() } <br/>
                                { `Your Stake: ${ethers.utils.formatEther(reportedContent.reportersStaked[reporterIndex])} $${stakingSymbol}` } 
                            </div> 
                        </div>
                    </div>

                    <h5 className="text-lg font-semibold text-white mb-5">Screenshot:</h5>
                    <div className="flex">
                        <div className="bg-cyan-300">
                            <a href={reportedContent.fileProofs[reporterIndex]} target="_blank">
                                <img src={reportedContent.fileProofs[reporterIndex]} className="object-scale-down h-48 w-96" />
                            </a>
                        </div>
                    </div>
                    <p className="text-left text-white">
                        
                    </p>
                </div>
            </div>
        </div>
    )
};
