import { FC } from "react";
import { Conversation } from '@xmtp/xmtp-js/dist/types/src/conversations';
import { Message } from '@xmtp/xmtp-js';
import useConversation from '../hooks/useConversation';
import { Link, useParams } from "react-router-dom";
import AddressAvatar from "./AddressAvatar";
import { formatDate, shortAddress, truncate } from ".";

type ConversationTileProps = {
    conversation: Conversation
    recipients: any
}
interface params {
    recipientWalletAddr: string;
}

const getLatestMessage = (messages: Message[]): Message | null =>
  messages.length ? messages[messages.length - 1] : null

export const ConversationTile: FC<ConversationTileProps> = ({conversation, recipients}) => {
    let { recipientWalletAddr } = useParams<params>();
    const { messages } = useConversation(conversation.peerAddress)
    const latestMessage = getLatestMessage(messages)
    const path = `/chat/${conversation.peerAddress}`
    if (!latestMessage) {
        return null
    }

    // Reformat data to get username and image
    let recipientProfile = {image: '', username: ''};
    let data;
    recipients.map((r) => {
        if(r.user == conversation.peerAddress.toLowerCase())
        data = JSON.parse(r.profile.data);
        if(data) recipientProfile = {image: data.image, username: data.username};
    });

    return (
        <li className={`${conversation.peerAddress == recipientWalletAddr?'bg-gray-100':''}`}>
            <Link to={path} key={conversation.peerAddress} className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none">
                {(recipientProfile.image) ?
                    <img className="object-cover w-10 h-10 rounded-full" src={recipientProfile.image} alt="username" /> : <AddressAvatar peerAddress={conversation.peerAddress} /> }
                <div className="w-full pb-2">
                    <div className="flex justify-between">
                        <span className="block ml-2 font-semibold text-gray-600">{(recipientProfile.username) ? recipientProfile.username:shortAddress(conversation.peerAddress)}</span>
                        <span className="block ml-2 text-sm text-gray-600">{formatDate(latestMessage?.sent)}</span>
                    </div>
                    <span className="block ml-2 text-sm text-gray-600">{latestMessage && truncate(latestMessage.content, 75)}
                    </span>
                </div>
            </Link>
        </li>
    )
};
