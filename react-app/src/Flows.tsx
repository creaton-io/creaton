import { FC, useEffect, useState } from "react";
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";
import { UserFlow } from "./components/user.flow";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

export const Flows: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();

    const [flows, setFlows] = useState([]);
    const [userAddress, setUserAddress] = useState('');

    const FLOWS_QUERY = gql`
        query($userAddress: Bytes!) {
            stakedFlows(where: {recipient: $userAddress}) {
                id
                stakingSuperToken
                balance
                flowRate
            }
        }
    `;

    const reactionsQuery = useQuery(FLOWS_QUERY, {
        variables: {'userAddress': userAddress},
        pollInterval: 10000,
    });

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const address = await signer.getAddress();
            setUserAddress(userAddress);

            if(reactionsQuery.data){
                setFlows(reactionsQuery.data.stakedFlows);
            }
        })();
    }, [reactionsQuery, web3Context]);

    return (
        <>
            {flows.length > 0 && <ul className="mt-14">
                {flows.map((f,i) => <UserFlow flow={f} key={`UserFlow-${i}`} />)}
            </ul>
            }
        </>
    )
};
