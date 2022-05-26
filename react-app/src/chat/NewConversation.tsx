import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

type NewConversationProps = {
    recipients: any
}
export const NewConversation: FC<NewConversationProps> = ({recipients}) => {
    const [modalVisible, setModalVisible] = useState(false);
    
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
