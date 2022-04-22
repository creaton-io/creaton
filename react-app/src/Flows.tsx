import { FC, useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { UserFlow } from "./components/user.flow";
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from "@ethersproject/providers";

export const Flows: FC = () => {
    const web3Context = useWeb3React();

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
