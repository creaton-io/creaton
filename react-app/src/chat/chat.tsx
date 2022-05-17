import { FC, useEffect, useState, useContext, useCallback } from "react";
import {useWeb3React} from '@web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import useXmtp from '../hooks/useXmtp';
import { Message } from '@xmtp/xmtp-js';
import XmtpContext from "../contexts/xmtp";
import { Conversation as ConversationType } from '@xmtp/xmtp-js/dist/types/src/conversations'
import { ConversationTile } from "./ConversationTile";
import { Conversation } from "./Conversation";
import { useParams } from "react-router-dom";
import Loader from "./Loader";

interface params {
    recipientWalletAddr: string;
}

export const Chat: FC = () => {
    let { recipientWalletAddr } = useParams<params>();
    if (recipientWalletAddr) recipientWalletAddr = recipientWalletAddr.toLowerCase();

    const web3Context = useWeb3React();
    const [userAddress, setUserAddress] = useState('');
    const [xmtpConnected, setXmtpConnected] = useState(false);

    const { getMessages } = useContext(XmtpContext);

    const {
        connect: connectXmtp,
        disconnect: disconnectXmtp,
        conversations, 
        loadingConversations,
        client
      } = useXmtp();

    const getLatestMessage = (messages: Message[]): Message | null => {
        return messages.length ? messages[messages.length - 1] : null;
    }

    const orderByLatestMessage = (convoA: ConversationType, convoB: ConversationType): number => {
        const convoAMessages = getMessages(convoA.peerAddress);
        const convoBMessages = getMessages(convoB.peerAddress);
        const convoALastMessageDate = getLatestMessage(convoAMessages)?.sent || new Date();
        const convoBLastMessageDate = getLatestMessage(convoBMessages)?.sent || new Date();
        return convoALastMessageDate < convoBLastMessageDate ? 1 : -1;
    }

    const handleDisconnect = useCallback(async () => {
        disconnectXmtp()
    }, [disconnectXmtp]);
 
    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;
            if(!provider) return;

            const signer = provider!.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address.toLowerCase());
            if(!xmtpConnected) connectXmtp(signer);
            setXmtpConnected(true);
        })();
    }, [web3Context]);

    return (
        <>
            <div className="mt-10 container mx-auto bg-white">
                <div className="min-w-full border rounded grid col-span-3" style={{gridTemplateColumns: "repeat(3, minmax(0, 1fr))"}}>
                    <div className="border-r border-gray-300 col-span-1">
                        <div className="mx-3 my-3">
                            {/* <div className="relative text-gray-600">
                                THIS IS A SEARCH BOX. FEEL FREE TO ENABLE IT NAD IMPLEMENT IT

                                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                                    <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    viewBox="0 0 24 24" className="w-6 h-6 text-gray-300">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </span>
                                <input type="search" className="block w-full py-2 pl-10 bg-gray-100 rounded outline-none" name="search"
                                    placeholder="Search" required />
                            </div> */}
                        </div>

                        <h2 className="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
                        {!client && <div className="py-10"><Loader
                            headingText="Awaiting signatures..."
                            subHeadingText="Use your wallet to sign"
                            isLoading
                        /></div>}

                        {loadingConversations && <p>Loading conversations...</p>}

                        { client && !loadingConversations && (conversations && conversations.length > 0) ? 
                            <ul className="overflow-auto h-[32rem]">
                                { conversations.sort(orderByLatestMessage)
                                    .map((convo) => (
                                        <ConversationTile 
                                            key={convo.peerAddress} 
                                            conversation={convo} 
                                            isSelected={recipientWalletAddr == convo.peerAddress} 
                                        />
                                    )
                                )}
                            </ul>
                        :
                            client && !loadingConversations && <p>Your message list is empty</p>
                        }
                    </div>

                    <div className="hidden lg:block" style={{gridColumn: "span 2 / span 2"}}>
                        <div className="w-full">
                            <Conversation /> 
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};
