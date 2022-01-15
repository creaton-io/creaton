import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from '../web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { gql, useQuery } from "@apollo/client";
import { Token } from "../components/nftlance.token";


export const Mytokens: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();
    const [userAddress, setUserAddress] = useState("");

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
            tokens (where: {owner: $userAddress}) {
                id
                tokenId
                state
                owner
                requestData
                card {
                    id
                    cardId
                    price
                    catalog {
                        id
                        catalogId
                        title
                        description
                        artist {
                            id
                            creatorContract
                            profile {
                                id
                                data
                            }
                        }
                        creatorCollection {
                            id
                            token
                            collectible {
                                id
                            }
                        }
                    }
                }
            }
        }
    `;
    const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {userAddress: userAddress.toLocaleLowerCase()}});

    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center">
            { contentsQuery.data && contentsQuery.data.tokens && <div className="mt-10">
                {contentsQuery.data.tokens.map((t,i) => <Token key={`token-${i}`} token={t} creator={false} /> )}
            </div>}
        </div>
    )
};
