import { FC, useEffect, useState } from "react";
import { Conversation } from '@xmtp/xmtp-js/dist/types/src/conversations';
import { Message } from '@xmtp/xmtp-js';
import useConversation from '../hooks/useConversation';
import { Link } from "react-router-dom";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import AddressAvatar from "./AddressAvatar";

type ConversationTileProps = {
    conversation: Conversation
    isSelected: boolean
    onClick?: () => void
}

export const truncate = (
    str: string | undefined,
    length: number
  ): string | undefined => {
    if (!str) {
      return str
    }
    if (str.length > length) {
      return `${str.substring(0, length - 3)}...`
    }
    return str
  }

export const formatDate = (d: Date | undefined): string =>
  d ? d.toLocaleDateString('en-US') : ''

export const formatTime = (d: Date | undefined): string =>
  d
    ? d.toLocaleTimeString(undefined, {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

const getLatestMessage = (messages: Message[]): Message | null =>
  messages.length ? messages[messages.length - 1] : null

export const ConversationTile: FC<ConversationTileProps> = ({conversation, isSelected, onClick}) => {
    const web3Context = useWeb3React();
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

    const { messages } = useConversation(conversation.peerAddress)
    const latestMessage = getLatestMessage(messages)
    const path = `/chat/${conversation.peerAddress}`
    if (!latestMessage) {
        return null
    }

    const shortAddress = (addr: string): string =>
      addr.length > 12 && addr.startsWith('0x')
        ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`
        : addr

    return (
        <Link to={path} key={conversation.peerAddress}>
            <a onClick={onClick} className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                <AddressAvatar peerAddress={conversation.peerAddress} />
                {/* <img className="object-cover w-10 h-10 rounded-full" src="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg" alt="username" /> */}
                <div className="w-full pb-2">
                    <div className="flex justify-between">
                        <span className="block ml-2 font-semibold text-gray-600">{shortAddress(conversation.peerAddress)}</span>
                        <span className="block ml-2 text-sm text-gray-600">{formatDate(latestMessage?.sent)}</span>
                    </div>
                    <span className="block ml-2 text-sm text-gray-600">{latestMessage && truncate(latestMessage.content, 75)}
                    </span>
                </div>
            </a>
        </Link>      
    )
};
