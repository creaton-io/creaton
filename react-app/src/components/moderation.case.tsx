import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "../web3-react/core";
import { Contract, ethers } from "ethers";
import { FC, useContext, useEffect, useState } from "react";
import creaton_contracts from "../Contracts";
import { Web3UtilsContext } from "../Web3Utils";
import { NotificationHandlerContext } from "../ErrorHandler";
import { Radio } from "../elements/radio";
import { Button } from "../elements/button";

interface CaseProps {
    moderationCase: any
}

export const Case: FC<CaseProps> = ({ moderationCase }) => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [userAddress, setUserAddress] = useState('');
    const [checkedOK, setCheckedOK] = useState(true);
    const [checkedKO, setCheckedKO] = useState(false);

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address.toLowerCase());
        })();
    }, [web3Context]);

    async function handleVoteToggle(e) {
        e.preventDefault();
        setCheckedOK(!checkedOK);
    }

    async function handleVote(e) {
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library || !userAddress) return;

        const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
        const moderationContract: Contract = new ethers.Contract(creaton_contracts.moderation.address, creaton_contracts.moderation.abi, signer);

        const contentId = moderationCase.moderationCase.contentId;
        const vote = (checkedOK) ? 2:3;
        try {
            await moderationContract.vote(contentId, vote);
            moderationContract.once("JurorVoted", async (user, contentId, voteOK) => {
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: "Thanks for voting!", type: 'success'});
            });
        } catch(error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: error.message.toString(), type: 'error'})
            return;
        }
    }

    return (
        <div className="flex flex-col rounded-2xl border border-opacity-10 bg-white bg-opacity-5 filter shadow-md hover:shadow-lg mt-10">
            <div className="p-8">
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-white">
                            { moderationCase.moderationCase.contentId }
                        </h4>
                        <div className="flex justify-between">
                            <div className="mr-5">
                                { moderationCase.decision === "undefined" && <>
                                    <form onSubmit={handleVote} className="grid grid-cols-1 place-items-left w-max m-auto text-white">
                                        <input type={"hidden"} value="" name="vote" />
                                        <Radio label="OK" checked={checkedOK} toggle={handleVoteToggle} />
                                        <Radio label="KO" checked={!checkedOK} toggle={handleVoteToggle} />
                                        <Button type="submit" label="Vote"/>
                                    </form>
                                </>}

                                { moderationCase.decision !== "undefined" && <>
                                    {moderationCase.decision}
                                </>}
                            </div> 
                        </div>
                    </div>

                    <p className="text-left text-white">
                    </p>
                </div>
            </div>
        </div>
    )
};
