import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from '../web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { Web3UtilsContext } from "../Web3Utils";
import { Contract, ethers } from "ethers";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { NotificationHandlerContext } from "../ErrorHandler";
import creaton_contracts from "../Contracts";
import { gql, useQuery } from "@apollo/client";
import { CREATE_TOKEN_ADDRESS } from "../Config";
import { Case } from "../components/moderation.case";
import { ReportedCase } from "../components/moderation.reportedcase";

interface params {
    id: string;
}

export const Moderation: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [moderationData, setModerationData] = useState<any>(false);
    const [reporterData, setReporterData] = useState<any>(false);
    const [userAddress, setUserAddress] = useState('');
    const [becomeAJurorVisible, setBecomeAJurorVisible] = useState(false);
    const [stakingTokenSymbol, setStakingTokenSymbol] = useState("");
    const [juror, setJuror] = useState<any>();

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address.toLowerCase());
            
            const erc20Contract: Contract = new Contract(CREATE_TOKEN_ADDRESS, creaton_contracts.erc20.abi, signer);
            setStakingTokenSymbol((await erc20Contract.symbol()).toUpperCase());

            const moderationContract: Contract = new ethers.Contract(creaton_contracts.moderation.address, creaton_contracts.moderation.abi, signer);
            setJuror(await moderationContract.jurors(address));
        })();
    }, [web3Context]);

    const JUROR_CONTENTS_QUERY = gql`
        query GET_REPORTED_CONTENTS($userAddress: Bytes!) {
            jurors(where: {address: $userAddress}){
                id
                address
                initialStaked
                cases {
                    id
                    decision
                    timestamp
                    moderationCase {
                        id
                        pendingVotes
                        timestamp
                        content {
                            id
                            name
                            reported {
                                id
                                staked
                                reporters
                                fileProofs
                            }
                        }
                    }
                }
            }
        }
    `;
    const jurorContentsQuery = useQuery(JUROR_CONTENTS_QUERY, {variables: {userAddress: userAddress}});

    const REPORTER_CONTENTS_QUERY = gql`
        query GET_USER_REPORTED_CONTENTS($userAddress: Bytes!) {
            creators (where: {id: $userAddress}){
                id
              reportedContent {
                id
                reporters
                fileProofs
                reportersStaked
                content {
                  id
                  name
                  moderationCase{
                    id
                    status
                    pendingVotes
                    timestamp
                  }
                }
              }
            }
        }
    `;
    const reporterContentsQuery = useQuery(REPORTER_CONTENTS_QUERY, {variables: {userAddress: userAddress}});

    useEffect(() => {
        if (jurorContentsQuery.data && jurorContentsQuery.data) {
            if(jurorContentsQuery.data.jurors.length > 0){
                setModerationData(jurorContentsQuery.data.jurors[0]);
            }
        }

        if (reporterContentsQuery.data && reporterContentsQuery.data.creators && reporterContentsQuery.data.creators.length > 0 && reporterContentsQuery.data.creators[0].reportedContent.length > 0) {
            setReporterData(reporterContentsQuery.data.creators[0].reportedContent);
        }
    }, [jurorContentsQuery, reporterContentsQuery]);

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

            if(stakingAmount.gt(await erc20Contract.balanceOf(userAddress))){
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: "You don't have this amount to stake", type: 'error'})
                return;
            }

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

    async function removeJuror() {
        web3utils.setIsWaiting(true);

        const { library } = web3Context;
        if(!library || !userAddress) return;

        const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
 
        const moderationContract: Contract = new ethers.Contract(creaton_contracts.moderation.address, creaton_contracts.moderation.abi, signer);
        try {
            await moderationContract.removeJuror();
            moderationContract.once("JurorRemoved", async (juror, unstaked) => {
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: ethers.utils.formatEther(unstaked)+" $" + stakingTokenSymbol + " unstaked. You are not a Juror anymore.", type: 'success'});
            });
        } catch(error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: error.message.toString(), type: 'error'})
            return;
        }
    }

    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center text-white">
            {!moderationData && <>
                <h1 className="text-5xl pt-12 pb-6 pl-6">Become a Juror</h1>
                <p className="text-xl opacity-50 pl-6">
                    {`Become a Juror by staking some $${stakingTokenSymbol} and get rewarded for contributing!`}
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
            </>}

            {moderationData && <div className="text-white">
                <p className="text-5xl pt-12 pb-6 pl-6 m-auto">Moderation Panel</p>

                { moderationData.cases && juror && <div className="flex flex-col text-left rounded-2xl border border-opacity-10 bg-white bg-opacity-5 p-5 my-10">
                    <h4 className="text-lg font-semibold text-white">
                        Initially Staked: <span className="font-normal">{`${ethers.utils.formatEther(juror.initialStaked)} $${stakingTokenSymbol}`}</span>
                    </h4>
                    <h4 className="text-lg font-semibold text-white">
                        Currently Staked: <span className="font-normal">{`${ethers.utils.formatEther(juror.staked)} $${stakingTokenSymbol}`}</span>
                    </h4>
                    { <Button className="mt-5" onClick={() => removeJuror()} label="Unstake & Stop being a Juror"/>  }
                </div> }

                { moderationData.cases && moderationData.cases.length == 0 && <p className="text-xl opacity-50 pl-6">No cases reported yet</p> }

                { moderationData.cases && moderationData.cases.length > 0 && <>
                    <h2 className="text-3xl opacity-50 pl-6">Judging Cases</h2>
                    { moderationData.cases.map((c,index) => {
                        return <Case jurorDecision={c} key={index} />
                    })}
                </> }
            </div>}

            {reporterData && <div className="text-white">
                <h2 className="text-3xl opacity-50 pl-6 mt-10">Your Reported Cases</h2>

                { reporterData.map((r,index) => {
                    return <ReportedCase reportedContent={r} key={index} />
                })}
            </div>}
        </div>
    )
};
