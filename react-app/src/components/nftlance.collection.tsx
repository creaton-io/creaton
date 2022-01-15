import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "../web3-react/core";
import { Contract, ethers } from "ethers";
import { FC, useContext, useEffect, useState } from "react";
import creaton_contracts from "../Contracts";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { Web3UtilsContext } from "../Web3Utils";
import { NotificationHandlerContext } from "../ErrorHandler";

interface NftlanceCollectionProps {
    collection: any
    creatorCollectionsAddress: any
    collectionsToken: any
}

export const NftlanceCollection: FC<NftlanceCollectionProps> = ({ collection, creatorCollectionsAddress, collectionsToken }) => {
    const web3Context = useWeb3React<Web3Provider>();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [createCardsVisible, setCreateCardsVisible] = useState(false);
    const [collectionsTokenDecimals, setCollectionsTokenDecimals] = useState(0);
    const [collectionsTokenSymbol, setCollectionsTokenSymbol] = useState("");

    useEffect(() => {
        (async function iife() {
            const { library } = web3Context;
            if(!library) return;

            const signer = library!.getSigner();

            const erc20Contract: Contract = new Contract(collectionsToken, creaton_contracts.erc20.abi, signer);
            setCollectionsTokenDecimals(await erc20Contract.decimals());
            setCollectionsTokenSymbol((await erc20Contract.symbol()).toUpperCase());
        })();
    }, [web3Context]);

    async function handleCreateCards(e){
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library) return;
       
        const amount = e.target.amount.value;
        const price = ethers.utils.parseEther(e.target.price.value);
        // const releaseTime = e.target.releaseTime.value;
        const releaseTime = Math.floor(Date.now()/1000); // Hardcoding this feature for now

        try {
            const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
            const creatorCollectionContract: Contract = new Contract(creatorCollectionsAddress, creaton_contracts.creatorCollections.abi, signer);
            await creatorCollectionContract.createCard(collection.catalogId, amount, price, releaseTime);

            creatorCollectionContract.once("CardAdded", async (cardId, catalog, tokenIdsGenerated, price, releaseTime) => {
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'Cards created successfully!', type: 'success'});
                setCreateCardsVisible(!createCardsVisible);
            });
        } catch (error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: 'Could not create cards: ' + error.message, type: 'error'});
            setCreateCardsVisible(!createCardsVisible);
        }
    }

    async function handleBuy(card) { 
        web3utils.setIsWaiting(true);
        const { library } = web3Context;
        if(!library) return;

        try {
            const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
            const userAddress = await signer.getAddress();

            const creatorCollectionContract: Contract = new Contract(creatorCollectionsAddress, creaton_contracts.creatorCollections.abi, signer);

            // Allowance
            const erc20Contract: Contract = new Contract(collectionsToken, creaton_contracts.erc20.abi, signer);
            const purchaseAmount = ethers.BigNumber.from(card.price).mul(ethers.BigNumber.from(10).pow(collectionsTokenDecimals));

            const allowance = await erc20Contract.allowance(userAddress, creatorCollectionsAddress);
            if(purchaseAmount.gt(allowance)){
              let tx = await erc20Contract.approve(creatorCollectionsAddress, purchaseAmount);
              await tx.wait();
              let receipt = await tx.wait();
              receipt = receipt.events?.filter((x: any) => {return x.event == "Approval"})[0];
              if(receipt.length == 0){
                throw Error('Error allowing token for purchasing');
              }
            }

            await creatorCollectionContract.purchase(collection.catalogId, card.cardId);
            creatorCollectionContract.once("Purchased", async (user, catalogId, cardId, amount) => {
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'Card purchased successfully!', type: 'success'});
            });
        } catch (error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: 'Could not purchase card: ' + error.message, type: 'error'});
        }

    }

    return (
        <div className="mb-5 z-0">
            <div className="flex flex-col rounded-2xl border border-opacity-10 bg-white bg-opacity-5 filter shadow-md hover:shadow-lg">
                <div className="p-8">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-white">
                                {collection.title}
                            </h4>
                            <div className="flex justify-between">
                                <div className="mr-5">
                                </div> 
                            </div>
                        </div>

                        <p className="text-left text-white">
                            {collection.description}
                        </p>

                        <div className="text-left">
                            <h5 className="mt-5 text-lg font-semibold text-white">{`${collection.cardsInCatalog} cards in this collection`}</h5>
                            <ul className="text-left text-white">
                                {collection.cards.map((c,i) => 
                                    <li className="mb-2" key={`card-${i}`}>
                                        <div className="inline-block"><span className="mr-2 font-bold">Price:</span><span className="mr-3">{ `${ethers.utils.formatEther(c.price)} $${collectionsTokenSymbol}`}</span></div>
                                        <div className="inline-block"><span className="mr-2 font-bold">Release Time:</span><span className="mr-3">{ new Date(c.releaseTime*1000).toLocaleString() }</span></div>
                                        <div className="inline-block"><span className="mr-2 font-bold">Tokens available:</span><span className="mr-3">{`${c.tokensAvailable} of ${c.tokensCount}`}</span></div>
                                        <div className="inline-block"><Button theme="secondary" label="Buy one!" onClick={() => handleBuy(c)} /></div>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="text-left text-white mt-3">
                            <Button disabled={createCardsVisible} className="mt-5" theme={`${createCardsVisible ? 'unfocused':'primary'}`} onClick={() => setCreateCardsVisible(true)} label="Create Cards"/>
                        </div>
                        <div className={`${createCardsVisible ? '':'hidden'} p-5 mt-5 rounded text-left`} style={{
                            backgroundColor: "rgb(41 25 67 / 70%)",
                            border: "1px solid #473a5f"
                        }}>
                            <form onSubmit={handleCreateCards} className="grid grid-cols-1 place-items-left w-max m-auto text-white">
                                <Input name="amount" type="text" label="Amount" className="text-black" />
                                <Input name="price" type="text" label="Price" className="text-black" />
                                {/* <Input name="releaseTime" type="text" label="Release Time" className="text-black" /> */}
                                <Button type="submit" label="Create"/>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
