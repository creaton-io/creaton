import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from '../web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { Web3UtilsContext } from "../Web3Utils";
import { Contract, ethers } from "ethers";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { Textarea } from "../elements/textArea";
import { NotificationHandlerContext } from "../ErrorHandler";
import creaton_contracts from "../Contracts";
import { gql, useQuery } from "@apollo/client";
import { CREATE_TOKEN_ADDRESS } from "../Config";
import { Case } from "../components/moderation.case";

interface params {
    id: string;
}

export const Moderation: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [moderationData, setModerationData] = useState<any>([]);
    const [userAddress, setUserAddress] = useState('');
    const [becomeAJurorVisible, setBecomeAJurorVisible] = useState(false);

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address.toLowerCase());
        })();
    }, [web3Context]);

    const CONTENTS_QUERY = gql`
        query GET_REPORTED_CONTENTS($userAddress: Bytes!) {
            jurors(where: {address: $userAddress}){
                id
                address
                staked
                cases {
                    id
                    decision
                    moderationCase {
                        id
                        pendingVotes
                    }
                }
            }
        }
    `;
    const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {userAddress: userAddress}});

    useEffect(() => {
        if (contentsQuery.data && contentsQuery.data) {
            if(contentsQuery.data.jurors.length > 0){
                setModerationData(contentsQuery.data.jurors);
            }
        }
    }, [contentsQuery]);

    async function newJuror(e) {
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library || !userAddress) return;

        const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
 
        const moderationContract: Contract = new ethers.Contract(creaton_contracts.moderation.address, creaton_contracts.moderation.abi, signer);
        try {
            // Allowance
            const erc20Contract: Contract = new Contract(CREATE_TOKEN_ADDRESS, creaton_contracts.erc20.abi, signer);

            const preDecimals = await erc20Contract.decimals();
            const decimals = ethers.BigNumber.from(10).pow(preDecimals);
            const stakingAmount = ethers.BigNumber.from(e.target.amount.value).mul(decimals);

            const allowance = await erc20Contract.allowance(userAddress, creaton_contracts.moderation.address);
            if(stakingAmount.gt(allowance)){
                let tx = await erc20Contract.approve(creaton_contracts.moderation.address, stakingAmount);
                await tx.wait();
                let receipt = await tx.wait();
                receipt = receipt.events?.filter((x: any) => {return x.event == "Approval"})[0];
                if(receipt.length == 0){
                    throw Error('Error allowing token for staking');
                }
            }

            await moderationContract.addJuror(stakingAmount);
            moderationContract.once("JurorAdded", async (user, stake) => {
                setBecomeAJurorVisible(false);
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: "Congratulations! You just become a Juror!", type: 'success'});
            });
        } catch(error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: error.message.toString(), type: 'error'})
            return;
        }
    }

    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center">
            {moderationData && moderationData.length == 0 && <div>
                <div className="grid grid-cols-1 place-items-center m-auto text-white">
                    <p className="text-5xl pt-12 pb-6 pl-6">Become a Juror</p>
                    <p className="text-xl opacity-50 pl-6">
                        Become a Juror by staking some $CREATE and get rewarded for your opinion!
                    </p>
                    {!becomeAJurorVisible && <Button className="mt-5" onClick={() => setBecomeAJurorVisible(true)} label="Become a Juror"/>  }

                    {becomeAJurorVisible &&
                        <form onSubmit={newJuror} className="grid grid-cols-1 place-items-center m-auto text-white">
                            <div className="p-5 text-white">
                                <Input className="bg-gray-900 text-white" type="text" name="amount" placeholder="Stake Amount" label="Amount to Stake" />
                                <Button type="submit" label="Stake" />
                            </div>
                        </form>
                    }
                </div>
            </div>}

            {moderationData && moderationData.length > 0 && <div className="grid grid-cols-1 place-items-center m-auto text-white">
                <p className="text-5xl pt-12 pb-6 pl-6">Moderation Panel</p>

                { moderationData[0].cases.length == 0 && <p className="text-xl opacity-50 pl-6">No cases reported yet</p> }

                { moderationData[0].cases.length > 0 && <>
                    <p className="text-xl opacity-50 pl-6">Cases reported</p>
                    { moderationData[0].cases.map((c,index) => {
                        return <Case moderationCase={c} key={index} />
                    })}
                </> }
            </div>}
        </div>
    )
};
