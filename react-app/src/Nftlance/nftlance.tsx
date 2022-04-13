import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from '@web3-react/core';
import { Web3Provider } from "@ethersproject/providers";
import { Web3UtilsContext } from "../Web3Utils";
import { Contract, ethers } from "ethers";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { Textarea } from "../elements/textArea";
import { NotificationHandlerContext } from "../ErrorHandler";
import creaton_contracts from "../Contracts";
import { gql, useQuery } from "@apollo/client";
import { NftlanceCollection } from "../components/nftlance.collection";
import { useCurrentCreator } from "../Utils";
import SignUp from "../Signup";
import { useCanBecomeCreator } from "../Whitelist";
import { Splash } from "../components/splash";
import { useParams } from "react-router-dom";

interface params {
    id: string;
}

export const Nftlance: FC = () => {
    let {id} = useParams<params>();
    if(id) id = id.toLowerCase();

    const web3Context = useWeb3React();
    const web3utils = useContext(Web3UtilsContext);
    const notificationHandler = useContext(NotificationHandlerContext);
    const [createCreatorsCollectionsVisible, setCreateCreatorsCollectionsVisible] = useState<boolean>(false);
    const [creatorCollectionsAddress, setCreatorCollectionsAddress] = useState<string|boolean>(false);
    const [createNftCatalogVisible, setCreateNftCatalogVisible] = useState<boolean>(false);
    const [collectionsData, setCollectionsData] = useState([]);
    const [creatorAddress, setCreatorAddress] = useState(id);
    const [collectionsToken, setCollectionsToken] = useState("");

    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;
            if(!provider) return;

            if(!creatorAddress){
                const signer = provider.getSigner();
                const libCreatorAddress = await signer.getAddress();
                setCreatorAddress(libCreatorAddress.toLowerCase());
            }
        })();
    }, [web3Context]);

    const CONTENTS_QUERY = gql`
        query GET_COLLECTIONS($creatorAddress: Bytes!) {
            creatorCollections (where: {creator: $creatorAddress}) {
                id
                token
                collectible
                catalogs {
                    id
                    catalogId
                    artist
                    title
                    description
                    cardsInCatalog
                    cards {
                        id
                        cardId
                        price
                        releaseTime
                        idPointOfNextEmpty
                        tokensCount
                        tokensAvailable
                        tokens {
                            id
                            tokenId
                            state
                            requestData
                        }
                    }
                }
                catalogsCount
            }
        }
    `;
    const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {creatorAddress: creatorAddress}});

    useEffect(() => {
        if (contentsQuery.data && contentsQuery.data) {
            if(contentsQuery.data.creatorCollections.length > 0){
                setCollectionsData(contentsQuery.data.creatorCollections[0].catalogs);
                setCreatorCollectionsAddress(contentsQuery.data.creatorCollections[0].id);
                setCollectionsToken(contentsQuery.data.creatorCollections[0].token);
            }
        }
    }, [contentsQuery]);

    const {loading, error, currentCreator} = useCurrentCreator();
    const canBecomeCreator = useCanBecomeCreator();
    if (!canBecomeCreator) return <div>Not allowed, you are not whitelisted</div>;
    if (loading) return <Splash src="https://assets5.lottiefiles.com/packages/lf20_bkmfzg9t.json"></Splash>;
    if (!id && currentCreator === undefined) return <SignUp />;

    async function newCreatorCollections(e) { 
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const provider = web3Context.provider as Web3Provider;
        if(!provider) return;

        const signer: ethers.providers.JsonRpcSigner = provider.getSigner();
        const address = await signer.getAddress();

        const nftlanceContract: Contract = new ethers.Contract(creaton_contracts.nftlance.address, creaton_contracts.nftlance.abi, signer);
        try{
            nftlanceContract.deployCreatorCollection(e.target.uri.value, e.target.token.value);
            nftlanceContract.once("DeployedCreatorCollection", async (creatorCollectionsAddress, fanCollectibleAddress, fanCollectibleURI, token) => {
                setCreatorCollectionsAddress(creatorCollectionsAddress);
                setCreateCreatorsCollectionsVisible(false);
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'New Creator Collections deployed successfully!', type: 'success'});
            });
        } catch(error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: error.toString(), type: 'error'})
            return;
        }
    }
    
    async function newCatalog(e) { 
        web3utils.setIsWaiting(true);
        e.preventDefault();
        const provider = web3Context.provider as Web3Provider;
        if(!provider || !creatorCollectionsAddress) return;

        const signer: ethers.providers.JsonRpcSigner = provider.getSigner();
        const address = await signer.getAddress();

        const collectionsContract: Contract = new ethers.Contract(creatorCollectionsAddress as string, creaton_contracts.creatorCollections.abi, signer);
        try {
            await collectionsContract.createCatalog(e.target.title.value, e.target.description.value);
            collectionsContract.once("CatalogAdded", async (catalogId, title, description, artist, periodStart) => {
                setCreateNftCatalogVisible(false);
                web3utils.setIsWaiting(false);
                notificationHandler.setNotification({description: 'New NFT Collection created successfully!', type: 'success'});
            });
        } catch(error: any) {
            web3utils.setIsWaiting(false);
            notificationHandler.setNotification({description: error.toString(), type: 'error'})
            return;
        }
    }

    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center">
            {!creatorCollectionsAddress &&  
                <div className="grid grid-cols-1 place-items-center m-auto text-white">
                    <p className="text-5xl pt-12 pb-6 pl-6">Create your own Nft Collections</p>
                    <p className="text-xl opacity-50 pl-6">
                        Setup your NFT Collections so you can create your catalog and earn creating NFT's!
                    </p>
                    {!createCreatorsCollectionsVisible && <Button className="mt-5" onClick={() => setCreateCreatorsCollectionsVisible(true)} label="Setup Creator Collections"/>  }

                    {createCreatorsCollectionsVisible &&
                        <form onSubmit={newCreatorCollections} className="grid grid-cols-1 place-items-center m-auto text-white">
                            <div className="p-5 text-white">
                                <Input className="bg-gray-900 text-white" type="text" name="uri" placeholder="https://token-cdn-domain/{id}.json" label="Fan Collectible URI" />
                                <Input className="bg-gray-900 text-white" type="text" name="token" placeholder="Token Address" label="Token address" />
                                <Button type="submit" label="Setup" />
                            </div>
                        </form>
                    }
                </div>
            }

            {creatorCollectionsAddress &&  
                <div className="grid grid-cols-1 place-items-center m-auto text-white">
                    <p className="text-5xl pt-12 pb-6 pl-6">Nft Collections</p>

                    {!createNftCatalogVisible && <Button className="mt-5" onClick={() => setCreateNftCatalogVisible(true)} label="Create a new NFT Collection"/> }

                    {createNftCatalogVisible &&
                        <form onSubmit={newCatalog} className="grid grid-cols-1 place-items-center w-max m-auto text-white">
                            <div className="p-5 text-white">
                                <Input className="bg-gray-900 text-white" type="text" name="title" placeholder="Title" label="Title" />
                                <Textarea className="bg-gray-900 text-white" name="description" placeholder="Description" label="Description" />
                                <Button type="submit" label="Create" />
                            </div>
                        </form>
                    }
                </div>
            }

            { collectionsData.length > 0 && <div className="mt-10">
                {collectionsData.map((c,i) => <NftlanceCollection collection={c} creatorCollectionsAddress={creatorCollectionsAddress} collectionsToken={collectionsToken} key={`collection-${i}`} />)}
            </div>}
        </div>
    )
};
