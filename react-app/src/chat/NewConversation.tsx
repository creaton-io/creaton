import { FC, useCallback, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { gql, useQuery } from "@apollo/client";
import { useHistory } from "react-router-dom";

export const NewConversation: FC = () => {
    const web3Context = useWeb3React();
    const history = useHistory();
    const [userAddress, setUserAddress] = useState('');

    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;
            if(!provider) return;

            const signer = provider!.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address.toLowerCase());
        })();
    }, [web3Context]);

    const FOLLOWERS_INFO_QUERY = gql`
        query GET_FOLLOWERS($userAddress: String!) {
            identity(address: $userAddress) {
                address
                followers {
                    list {
                        address
                    }
                }
                followings {
                    list {
                        address
                    }
                }
            }
        }
    `;

    const SUBSCRIBERS_INFO_QUERY = gql`
        query GET_SUBSCRIBERS($userAddress: String!) {
            subscribers (where: {creator: $userAddress, status: 1}){
                id
                user
            }	
        }
    `;

    const SUBSCRIBED_INFO_QUERY = gql`
        query GET_SUBSCRIBEDS($userAddress: String!) {
            subscribers (where: {user: $userAddress, status: 1}){
                id
                creator {
                    id
                }
            }	
        }
    `;

    const {data: followersData } = useQuery(FOLLOWERS_INFO_QUERY, { variables: {userAddress}, context: {clientName: 'cyberConnect'}, pollInterval: 10000 });
    const {data: subscribersData } = useQuery(SUBSCRIBERS_INFO_QUERY, { variables: {userAddress}, pollInterval: 10000 });
    const {data: subscribedData } = useQuery(SUBSCRIBED_INFO_QUERY, { variables: {userAddress}, pollInterval: 10000 });

    const conversationDialog = async() => {
        console.log('Followers: ', followersData);
        console.log('Subscribed: ', subscribedData);
        console.log('Subscribers: ', subscribersData);
    }

    const newConversation = async (address: string) => {
        if(!address.startsWith('0x') || address.length !== 42) console.error("Invalid Address");
        history.push(`/chat/${address}`);
    };

    return (
        <button 
            onClick={conversationDialog}
            className="p-4 w-full font-bold border" 
            style={{
                backgroundColor: "rgb(91 33 182)", 
                borderColor: "rgb(124 58 237)", 
                borderLeftWidth: "0",
                borderRightWidth: "0",
                color: "white"
            }}
        >
            New Conversation
        </button>
    )
};
