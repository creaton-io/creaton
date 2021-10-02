import { FC, useContext, useEffect, useState } from "react";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { CREATOR_VOTING_ADDRESS, VOTING_GRAPHQL_URI } from "./Config";
import { VotingProcess } from "./components/voting.process";
import { useWeb3React } from "./web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Button } from "./elements/button";
import { Input } from "./elements/input";
import { Textarea } from "./elements/textArea";
import { Contract, ethers } from "ethers";
import creaton_contracts from "./Contracts";
import { NotificationHandlerContext } from "./ErrorHandler";
import { Web3UtilsContext } from "./Web3Utils";

export const CreatorVoting: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [votingProcesses, setVotingProcesses] = useState([]);
    const [createVotingProcessesVisible, setCreateVotingProcessesVisible] = useState<boolean>(false);

    useEffect(() => {
        (async function iife() {
            if(!web3Context.library) return;
            const signer = web3Context.library.getSigner()
            const address = await signer.getAddress();

            getVotingProcesses(address);
        })();
    }, [web3Context]);

    async function getVotingProcesses(userAddress: string){
        const processesQuery = `
            query($userAddress: Bytes!) {
                votingProcesses(where: {user: $userAddress}, orderBy: id, orderDirection:desc) {
                    id
                    contract
                    question
                    description
                    uri
                    answers {
                        id
                        answer
                        voted {
                            id
                            votingToken {
                                id
                            }
                            votingAmount
                        }
                        countVotes
                    }
                    acceptedTokens {
                        token {
                            address
                        }
                    }
                }
            }
        `;

        const client = new ApolloClient({
            uri: VOTING_GRAPHQL_URI,
            cache: new InMemoryCache()
        });

        const data = await client.query({query: gql(processesQuery), variables: {'userAddress': userAddress.toLowerCase()}});
        setVotingProcesses(data.data.votingProcesses);
    }

    async function handleSubmit(e) { 
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library) return;

        const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
        const address = await signer.getAddress();

        let answers = e.target.answers.value.split(",").map(str => str.trim());
        let acceptedTokens = e.target.acceptedTokens.value.split(",").map(str => str.trim());

        const creatorVotingFactoryContract: Contract = new ethers.Contract(CREATOR_VOTING_ADDRESS, creaton_contracts.creator_voting_factory.abi, signer);
        try {
            await creatorVotingFactoryContract.createVotingProcess(e.target.question.value, e.target.description.value, "", answers, acceptedTokens);
            creatorVotingFactoryContract.once("VotingProcessDeployed", async (creator, votingProcessAddress, question, description, uri, answers, acceptedTokens) => {
                setCreateVotingProcessesVisible(false);
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'New Voting Process created successfully!', type: 'success'});
                getVotingProcesses(address);
            });
        } catch(error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: error.toString(), type: 'error'})
            return;
        }
    }

    return (
        <div className="flex flex-col max-w-5xl my-0 mx-auto text-center text-center">
            {!createVotingProcessesVisible && <Button className="mt-5" onClick={() => setCreateVotingProcessesVisible(true)} label="Create Voting Process"/> }

            {createVotingProcessesVisible &&
                <form onSubmit={handleSubmit} className="grid grid-cols-1 place-items-center w-max m-auto text-white">
                    <h3 className="text-5xl pt-12 pb-6 text-white">Create Voting Process</h3>
                    <div className="p-5 text-white">
                        <Input className="bg-gray-900 text-white" type="text" name="question" placeholder="Question" label="Question" />
                        <Textarea className="bg-gray-900 text-white" name="description" placeholder="Description" label="Description" />
                        <Input className="bg-gray-900 text-white" type="text" name="answers" placeholder="Answers (comma-separated)" label="Answers" />
                        <Input className="bg-gray-900 text-white" type="text" name="acceptedTokens" placeholder="Accepted Tokens (comma-separated)" label="Accepted Tokens" />
                        <Button type="submit" label="Create"/>
                    </div>
                </form>
            }

            {votingProcesses.length > 0 && <>
                <h3 className="text-5xl pt-12 pb-6 text-white">Voting Processes</h3>
                <ul>
                    {votingProcesses.map((p,i) => <VotingProcess process={p} key={`Process-${i}`} voting={true} />)}
                </ul>
            </>}
        </div>
    )
};
