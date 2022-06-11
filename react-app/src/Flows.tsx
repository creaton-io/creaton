import { FC, useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { UserFlow } from "./components/user.flow";
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { Framework } from "@superfluid-finance/sdk-core";

export const Flows: FC = () => {
    const web3Context = useWeb3React();

    const [reactionFlows, setReactionFlows] = useState([]);
    const [flows, setFlows] = useState<any>([]);
    const [userAddress, setUserAddress] = useState('');

    const FLOWS_QUERY = gql`
        query($userAddress: Bytes!) {
            stakedFlows(where: {recipient: $userAddress}) {
                id
                stakingSuperToken
                balance
                flowRate
            }

            subscribers (where: {
                creator: $userAddress,
                status: "subscribed",
                user_not: $userAddress
            }){
                user
            }
        }
    `;

    const flowsQuery = useQuery(FLOWS_QUERY, {
        variables: {'userAddress': userAddress.toLocaleLowerCase()},
        pollInterval: 10000,
    });

    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;
            if(!provider) return;

            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setUserAddress(address);
            
            // Get all the Streams from Superfluid 
            const sf = await Framework.create({
                chainId: 80001,
                provider: provider
            });
            const streams = await sf.query.listStreams({ receiver: address });
console.log('SF Streams: ', streams);

            let fs: any[] = [];
            for(let s of streams.data){
                if(+s.currentFlowRate > 0 && await isFollower(s)){
                    fs.push({...{reaction: await isReaction(s)}, ...s});
                }
            }

            setFlows(fs);
        })();
    }, [flowsQuery, web3Context]);

    const isReaction = async (stream): Promise<Boolean> => {
        const reactionFlows = flowsQuery.data.stakedFlows;

        for(let f of reactionFlows){
            if(f.flowRate == stream.currentFlowRate
                && f.id == stream.sender
                && f.stakingSuperToken === stream.token.id
            ){
                return true;
            }
        }

        return false;
    }

    const isFollower = async (stream): Promise<Boolean> => {
        const subscribers = flowsQuery.data.subscribers;

        for(let s of subscribers){
            if(stream.sender == s.user){
                return true;
            }
        }

        return false;
    }

    return (
        <>
            {flows.length > 0 && <div className="grid grid-cols-1 place-items-center m-auto text-white">
                <h2 className="text-5xl pt-12 pb-6 pl-6">Token Flows</h2>

                <ul className="mt-14">
                    {flows.map((f,i) => <UserFlow flow={f} key={`UserFlow-${i}`} />)}
                </ul>
            </div>}
        </>
    )
};
