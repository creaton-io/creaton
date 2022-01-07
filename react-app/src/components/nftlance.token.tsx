import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "../web3-react/core";
import { Contract, ethers } from "ethers";
import { FC, useContext, useEffect, useState } from "react";
import creaton_contracts from "../Contracts";
import { Web3UtilsContext } from "../Web3Utils";
import { NotificationHandlerContext } from "../ErrorHandler";
import { Link } from "react-router-dom";
import { Input } from "../elements/input";
import { Button } from "../elements/button";

interface NftlanceTokenProps {
    token: any
}

export const Token: FC<NftlanceTokenProps> = ({ token }) => {
    console.log(token);
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [collectionsTokenDecimals, setCollectionsTokenDecimals] = useState(0);
    const [collectionsTokenSymbol, setCollectionsTokenSymbol] = useState("");

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();

            const erc20Contract: Contract = new Contract(token.card.catalog.creatorCollections.token, creaton_contracts.erc20.abi, signer);
            setCollectionsTokenDecimals(await erc20Contract.decimals());
            setCollectionsTokenSymbol((await erc20Contract.symbol()).toUpperCase());
        })();
    }, [web3Context]);

    async function handleRequest(e){
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library) return;

        try {
            const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
            const collectibleContract: Contract = new Contract(token.card.catalog.creatorCollections.collectible.id, creaton_contracts.fanCollectible.abi, signer);
            await collectibleContract.setRequestData(token.card.cardId, token.tokenId, e.target.request.value);

            collectibleContract.once("RequestDataSet", async(cardId, tokenId, collectibleRequestData) => {
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'Request set successfully!', type: 'success'});
            });
        } catch (error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: 'Could not set request: ' + error.message, type: 'error'});
        }
    }

    return (
        <div className="mb-5 z-0">
            <div className="flex flex-col rounded-2xl border border-opacity-10 bg-white bg-opacity-5 filter shadow-md hover:shadow-lg">
                <div className="p-8">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-white">
                                {token.card.catalog.title} by <Link to={`/creator/${token.card.catalog.artist.creatorContract}`}>
                                    {token.card.catalog.artist.profile !== null ? JSON.parse(token.card.catalog.artist.profile.data).username : token.card.catalog.artist.id.slice(0, 6)}                                    
                                </Link>
                            </h4>
                            <div className="flex justify-between">
                                <div className="mr-5 text-white">
                                    {`${ethers.utils.formatEther(token.card.price)} $${collectionsTokenSymbol}`}
                                </div> 
                            </div>
                        </div>

                        {token.state == "PURCHASED" && <div className="flex items-center justify-between">
                            <form onSubmit={handleRequest} className="grid grid-cols-1 place-items-center text-white">
                                <div className="p-5 text-white">
                                    <Input className="bg-gray-900 text-white" type="text" name="request" placeholder="Your request" label="Request text" />
                                    <Button type="submit" label="Request" />
                                </div>
                            </form>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};
