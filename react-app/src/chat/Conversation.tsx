import { FC, useCallback, useRef, useState } from "react";
import { Message } from '@xmtp/xmtp-js';
import { useParams } from "react-router-dom";
import useConversation from "../hooks/useConversation";
import useXmtp from "../hooks/useXmtp";
import AddressAvatar from "./AddressAvatar";

interface params {
    recipientWalletAddr: string;
}

export const Conversation: FC = () => {
    let { recipientWalletAddr } = useParams<params>();
    const { walletAddress, client } = useXmtp();

    const [message, setMessage] = useState('');

    const messagesEndRef = useRef(null)
    const scrollToMessagesEndRef = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(messagesEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
    }, [messagesEndRef])
    const { messages, sendMessage, loading } = useConversation(
        recipientWalletAddr,
        scrollToMessagesEndRef
    )

    if (!recipientWalletAddr || !walletAddress || !client) {
        return <div />
    }
    if (loading && !messages?.length) {
        return (
            <p>Loading messages...</p>
        )
    }

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            onSend(e);
        }
    }

    const onSend = async (e) => {
        e.preventDefault()

        if (!message) return;

        sendMessage(message);
        setMessage('');
    }

    return (
        <>
            <div className="relative flex items-center p-3 border-b border-gray-300">
                <AddressAvatar peerAddress={recipientWalletAddr} />
                <span className="block ml-2 font-bold text-gray-600">{recipientWalletAddr}</span>
                <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
            </div>

            <div className="relative w-full p-6 overflow-y-auto h-[40rem]">
                <ul className="space-y-2">
                    {messages?.map((msg: Message) => {
                        const isSender = msg.senderAddress === walletAddress;
                        return <li key={msg.id} className={`flex justify-${isSender?'end':'start'}`} style={{justifyContent: isSender?'end':'start'}}>
                            <div className={`relative max-w-xl mt-1 px-4 py-2 text-gray-700 rounded ${isSender?'bg-indigo-100':'bg-gray-100'} shadow`}>
                                <span className="block">{msg.content}</span>
                            </div>
                        </li>;
                    })}
                </ul>
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center justify-between w-full p-3 border-t border-gray-300">
                <input type="text" placeholder="Message"
                    className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                    name="message" required onKeyDown={handleKeyDown} onChange={(e) => setMessage(e.target.value)} value={message} />

                <button type="submit" onClick={onSend}>
                    <svg className="ml-2 w-5 h-5 text-gray-500 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path
                        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </>
    )
};