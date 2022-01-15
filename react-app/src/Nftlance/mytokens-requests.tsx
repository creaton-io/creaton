import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from '../web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { gql, useQuery } from "@apollo/client";
import { Token } from "../components/nftlance.token";


export const MytokensRequests: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();
    const [userAddress, setUserAddress] = useState("");
    const [requestsAmount, setRequestsAmount] = useState(0);

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
        query GET_COLLECTIONS($creatorAddress: Bytes!) {
            creatorCollections (where: {creator: $creatorAddress}) {
                id
                catalogs {
                    id
                    title
                    description
                    cards {
                        id
                        price
                        tokens (where:{state: "PURCHASED", requestData_not: ""}) {
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
                                    creatorCollections {
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
                }
            }
        }
    `;
    const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {creatorAddress: userAddress.toLocaleLowerCase()}});

    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center">
            { contentsQuery.data && contentsQuery.data && <div className="mt-10">
                {contentsQuery.data.creatorCollections.map((cc, i) => {
                    return cc.catalogs.map((catalog, j) => {
                        return catalog.cards.map((card, x) => {
                            return card.tokens.map((token, z) => {
                                setRequestsAmount(requestsAmount+1);
                                return <Token creator={true} key={`token-${z}`} token={token} />
                            });
                        });
                    });
                })}
            </div>}

            {!requestsAmount && <h2 className="text-white font-bold">No requests for your tokens</h2>}
        </div>
    )
};
