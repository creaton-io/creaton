import { FC, useContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import XmtpContext from "../contexts/xmtp";

export const NewConversation: FC = () => {
    const web3Context = useWeb3React();
    const { client } = useContext(XmtpContext);
    const [userAddress, setUserAddress] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [recipients, setRecipients] = useState([]);

    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;
            if(!provider) return;

            const signer = provider!.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address.toLowerCase());
        })();
    }, [web3Context]);

    // const FOLLOWERS_INFO_QUERY = gql`
    //     query GET_FOLLOWERS($userAddress: String!) {
    //         identity(address: $userAddress) {
    //             address
    //             followers {
    //                 list {
    //                     address
    //                 }
    //             }
    //             followings {
    //                 list {
    //                     address
    //                 }
    //             }
    //         }
    //     }
    // `;

    const SUBSCRIBERS_INFO_QUERY = gql`
        query GET_SUBSCRIBERS($userAddress: String!) {
            subscribers (where: {creator: $userAddress, status: "subscribed", user_not: $userAddress}){
                id
                user
                profile {
                    id
                    data
                }
            }	
        }
    `;

    // const SUBSCRIBED_INFO_QUERY = gql`
    //     query GET_SUBSCRIBEDS($userAddress: String!) {
    //         subscribers (where: {user: $userAddress, status: "subscribed", creator_not: $userAddress}){
    //             id
    //             creator {
    //                 id
    //                 profile {
    //                     id
    //                     data
    //                 }
    //             }
    //         }	
    //     }
    // `;

    const {data: subscribersData } = useQuery(SUBSCRIBERS_INFO_QUERY, { variables: {userAddress}, pollInterval: 10000 });
    // const {data: subscribedData } = useQuery(SUBSCRIBED_INFO_QUERY, { variables: {userAddress}, pollInterval: 10000 });
    // const {data: followersData } = useQuery(FOLLOWERS_INFO_QUERY, { variables: {userAddress}, context: {clientName: 'cyberConnect'}, pollInterval: 10000 });
    
    
    useEffect(() => {
        if(!subscribersData) return;

        const users = subscribersData.subscribers.filter(async (u) => await client?.canMessage(ethers.utils.getAddress(u.user)));
        setRecipients(users);
    },[subscribersData]);


    return (
        <>
            <button 
                onClick={() => setModalVisible(true)}
                className="p-4 w-full font-bold border text-white" 
                style={{
                    backgroundColor: "rgb(91 33 182)", 
                    borderColor: "rgb(124 58 237)", 
                    borderLeftWidth: "0",
                    borderRightWidth: "0"
                }}
            >
                New Conversation
            </button>

            <div>
                <div id="modal-bg" className={`z-40 w-full h-full top-0 left-0 absolute ${modalVisible?'':'hidden'}`} style={{backgroundColor: "rgba(76, 29, 149, 0.5)"}} onClick={() => setModalVisible(false)}></div>
                <div id="modal-box" 
                    className={`z-50 sm:w-[385px] sm:min-w-[40vw] min-w-[80vw] min-h-[50vh] flex flex-col items-center gap-2 -translate-y-1/2 p-6 bg-white rounded-lg top-1/2 left-1/2 -translate-x-1/2 absolute ${modalVisible?'':'hidden'}`} 
                    style={{minWidth: "40vw"}}
                >
                    <h2 className="font-bold text-2xl mb-5">Your Subscribers</h2>
                    <ul className="overflow-auto h-[32rem] w-full overflow-y-auto" style={{maxHeight: "40vw"}}>
                    {recipients && recipients.map((s:any) => {
                        let profileData = JSON.parse(s.profile.data);
                        return <li key={s.user}>
                            <Link to={`/chat/${ethers.utils.getAddress(s.user)}`} onClick={() => setModalVisible(false)}>
                                <a className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                    <img className="object-cover w-10 h-10 rounded-full" src={profileData.image} alt="username" />
                                    <div className="w-full pb-2">
                                        <div className="flex justify-between">
                                            <span className="block ml-2 font-semibold text-gray-600">{profileData.username}</span>
                                        </div>
                                    </div>
                                </a>
                            </Link>
                        </li>
                    })}
                    </ul>
                </div>
            </div>
        </>
    )
};
