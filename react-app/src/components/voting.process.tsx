import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Contract, ethers } from "ethers";
import { FC, useContext, useState } from "react";
import creaton_contracts from "../Contracts";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { Web3UtilsContext } from "../Web3Utils";
import { NotificationHandlerContext } from "../ErrorHandler";

interface VotingProcessProps {
    process: any
    voting: boolean
}

export const VotingProcess: FC<VotingProcessProps> = ({ process, voting }) => {
    const web3Context = useWeb3React();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [votingModalVisible, setVotingModalVisible] = useState(false);

    async function handleVote(e){
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const provider = web3Context.provider as Web3Provider;
        if(!provider) return;
       
        const answerId = e.target.answer.value.split(".")[1];
        const votingTokenAddress = e.target.token.value;
        const amount = e.target.amount.value;
        try {
            const signer: ethers.providers.JsonRpcSigner = provider!.getSigner();
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
            await creatorVotingContract.vote(answerId, votingTokenAddress, votingAmount);
            creatorVotingContract.once("Voted", async (answerId, votingToken, votingAmount) => {
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'Voted successfully!', type: 'success'});
                setVotingModalVisible(!votingModalVisible);
            });
        } catch (error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: 'Could not vote: ' + error.message, type: 'error'});
            setVotingModalVisible(!votingModalVisible);
        }
    }

    return (
        <div className="mb-5 z-0">
            <div className="flex flex-col rounded-2xl border border-opacity-10 bg-white bg-opacity-5 filter shadow-md hover:shadow-lg">
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

                        <div className="text-left text-white mt-3">
                            <h5 className="font-bold">Votes:</h5>
                            {process.answers.map(a => (
                                <div key={a.id}>
                                    <h5 className="ml-2">{a.answer}: {a.countVotes.toString()}</h5>
                                </div>
                            ))}
                        </div>

                        {voting && 
                            <div className={`${votingModalVisible ? '':'hidden'} absolute z-50 p-3 rounded left-2/4 text-left`} style={{
                                backgroundColor: "rgb(41 25 67 / 70%)",
                                border: "1px solid #473a5f"
                            }}>
                                <form onSubmit={handleVote} className="grid grid-cols-1 place-items-left w-max m-auto text-white">
                                    <label className="block font-semibold mr-1.5">Answers:</label>
                                    {process.answers.map(a => (
                                        <div key={a.id}>
                                            <input type="radio" value={a.id} name="answer" id={a.id} />
                                            <label htmlFor={a.id} className="ml-1">{a.answer}</label>
                                        </div>
                                    ))}

                                    <label className="mt-3 block font-semibold mr-1.5">Token</label>
                                    <select name="token" className="text-black mb-3">
                                        {process.acceptedTokens.map(t => (
                                            <option key={t.token.address} value={t.token.address}>{t.token.address}</option>
                                        ))} 
                                    </select>

                                    <Input name="amount" type="text" label="Amount" className="text-black" />

                                    <Button type="submit" label="Vote"/>
                                </form>
                            </div>
                        }

                        {voting && 
                            <Button className={`${votingModalVisible ? 'hidden':''} mt-5`} type="submit" label="Vote" onClick={() => setVotingModalVisible(!votingModalVisible)} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};
