import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "../web3-react/core";
import { Contract, ethers } from "ethers";
import { FC, useContext, useEffect, useRef, useState } from "react";
import creaton_contracts from "../Contracts";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { Web3UtilsContext } from "../Web3Utils";
import { CREATOR_VOTING_ADDRESS } from "../Config";
import { NotificationHandlerContext } from "../ErrorHandler";

interface VotingProcessProps {
    process: any
}

export const VotingProcess: FC<VotingProcessProps> = ({ process }) => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
        })();
    }, [web3Context]);

    async function handleVote(e){
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library) return;

        console.log('Form values: ', e.target.answer.value, e.target.token.value, e.target.amount.value);
        
        const answerId = e.target.answer.value.split(".")[1];
        const votingTokenAddress = e.target.token.value;
        const amount = e.target.amount.value;
        try {
            const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
            const userAddress = await signer.getAddress();

            // Allowance
            const erc20Contract: Contract = new Contract(votingTokenAddress, creaton_contracts.erc20.abi, signer);
      
            const preDecimals = await erc20Contract.decimals();
            const decimals = ethers.BigNumber.from(10).pow(preDecimals);
            const votingAmount = ethers.BigNumber.from(amount).mul(decimals);
      
            const allowance = await erc20Contract.allowance(userAddress, process.contract);
            if(votingAmount.gt(allowance)){
              let tx = await erc20Contract.approve(process.contract, votingAmount);
              await tx.wait();
              let receipt = await tx.wait();
              receipt = receipt.events?.filter((x: any) => {return x.event == "Approval"})[0];
              if(receipt.length == 0){
                throw Error('Error allowing token for voting');
              }
            }

            const creatorVotingContract: Contract = new ethers.Contract(process.contract, creaton_contracts.creator_voting_process.abi, signer);
            console.log('Voting with: ', answerId, votingTokenAddress, votingAmount);
            await creatorVotingContract.vote(answerId, votingTokenAddress, votingAmount);
            creatorVotingContract.once("Voted", async (answerId, votingToken, votingAmount) => {
                console.log('Voted', answerId, votingToken, votingAmount);
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'Voted successfully!', type: 'success'});
            });
        } catch (error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: 'Could not vote' + error.message, type: 'error'});
        }
    }

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

                        <form onSubmit={handleVote} className="grid grid-cols-1 place-items-center w-max m-auto text-white">
                            {process.answers.map(a => (
                                <div key={a.id}>
                                    <input type="radio" value={a.id} name="answer" id={a.id} />
                                    <label htmlFor={a.id}>{a.answer}</label>
                                </div>
                            ))}

                            <select name="token">
                                {process.acceptedTokens.map(t => (
                                    <option key={t.token.address} value={t.token.address}>{t.token.address}</option>
                                ))} 
                            </select>

                            <Input name="amount" type="text" label="Amount" />

                            <Button type="submit" label="Vote"/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
};
