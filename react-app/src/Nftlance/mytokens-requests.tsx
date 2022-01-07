import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from '../web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { Web3UtilsContext } from "../Web3Utils";
import { NotificationHandlerContext } from "../ErrorHandler";
import { gql, useQuery } from "@apollo/client";
import { Token } from "../components/nftlance.token";


export const MytokensRequests: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [userAddress, setUserAddress] = useState("");
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();
            const userAddress = await signer.getAddress();
            setUserAddress(userAddress);
        })();
    }, [web3Context]);

    const CONTENTS_QUERY = gql`
        query GET_TOKENS($userAddress: Bytes!) {
            tokens {
                id
            }
        }
    `;
    const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {userAddress: userAddress.toLocaleLowerCase()}});

    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center">
            { contentsQuery.data && contentsQuery.data.tokens && <div className="mt-10">
                {contentsQuery.data.tokens.map((t,i) => <Token key={`token-${i}`} token={t} /> )}
            </div>}
        </div>
    )
};
