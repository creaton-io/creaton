import { FC, useEffect, useState } from "react";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { REACTIONS_GRAPHQL_URI } from "./Config";
import { UserFlow } from "./components/user.flow";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

export const Flows: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();

    const [flows, setFlows] = useState([]);

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const address = await signer.getAddress();

            getFlows(address);
        })();
    }, [web3Context]);

    async function getFlows(userAddress: string){
        const flowsQuery = `
            query($userAddress: Bytes!) {
                stakedFlows(where: {recipient: $userAddress}) {
                    id
                    stakingSuperToken
                    balance
                    flowRate
                }
            }
        `;

        const client = new ApolloClient({
            uri: REACTIONS_GRAPHQL_URI,
            cache: new InMemoryCache()
        });

        const data = await client.query({query: gql(flowsQuery), variables: {'userAddress': userAddress.toLowerCase()}});
console.log(data);
        setFlows(data.data.stakedFlows);
    }

    return (
        <>
            <ul className="mt-14">
                {flows && flows.map((f,i) => <UserFlow flow={f} key={`UserFlow-${i}`} />)}
            </ul>
        </>
    )
};
