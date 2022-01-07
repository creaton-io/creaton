import { Address, DataSourceContext, Bytes, BigInt } from '@graphprotocol/graph-ts';
import { DeployedCreatorCollection as DeployedCreatorCollectionsEvent } from '../generated/NFTLance/NFTLance';
import { Card, Catalog, Creator, CreatorCollections, FanCollectible, NFTLance, Token } from '../generated/schema';
import { CreatorCollections as CreatorCollectionsTemplate, FanCollectible as FanCollectibleTemplate, ReactionToken } from "../generated/templates";

import { CardAdded, CatalogAdded, FanCollectibleDataSet, Purchased } from "../generated/templates/CreatorCollections/CreatorCollections";
import { RequestDataSet } from "../generated/templates/FanCollectible/FanCollectible";

export function handleDeployedCreatorCollections(event: DeployedCreatorCollectionsEvent): void {
    let id = event.transaction.hash.toHex();
    let entity = NFTLance.load(id);
    if (!entity) {
        entity = new NFTLance(id);
    }
    entity.save();
    
    createFanCollectible(event.params.fanCollectible, event.params.fanCollectibleURI);
    createCreatorCollections(event.params.creatorCollections, event.transaction.hash as Address, event.transaction.from, event.params.fanCollectible, event.params.token);

    let context = new DataSourceContext()
    context.setBytes('contract', event.params.creatorCollections);
    CreatorCollectionsTemplate.createWithContext(event.params.creatorCollections, context);

    let context2 = new DataSourceContext()
    context2.setBytes('contract', event.params.fanCollectible);
    FanCollectibleTemplate.createWithContext(event.params.fanCollectible, context2);
}

export function handleCatalogAdded(event: CatalogAdded): void {
    let creatorCollection = CreatorCollections.load(event.transaction.to.toHex());
    let catalogId = creatorCollection.id.toString() + "-" + event.params.catalogId.toString();
    let catalog = Catalog.load(catalogId);
    if(catalog === null){
        catalog = new Catalog(catalogId);
    }

    creatorCollection.catalogsCount = creatorCollection.catalogsCount.plus(BigInt.fromI32(1));
    creatorCollection.save();

    catalog.catalogId = event.params.catalogId.toString();
    catalog.creatorCollections = creatorCollection.id;
    catalog.feesCollected = BigInt.fromI32(0);
    catalog.title = event.params.title;
    catalog.description = event.params.description;
    catalog.cardsInCatalog = 0;
    catalog.artist = Creator.load(event.params.artist.toHex()).id
    catalog.save();
}

export function handleCardAdded(event: CardAdded): void {
    let cardId = event.transaction.to.toHex() + "-" + event.params.catalogId.toString() + "-" + event.params.cardId.toString();
    let card = Card.load(cardId);
    if(card === null){
        card = new Card(cardId);
        card.cardId = event.params.cardId.toString();
    }

    let creatorCollection = CreatorCollections.load(event.transaction.to.toHex())
    let catalogId = creatorCollection.id.toString() + "-" + event.params.catalogId.toString();

    let catalog = Catalog.load(catalogId);
    catalog.cardsInCatalog = catalog.cardsInCatalog + 1;
    catalog.save();

    card.catalog = catalog.id;
    card.price = event.params.price;
    card.releaseTime = event.params.releaseTime;
    card.idPointOfNextEmpty = BigInt.fromI32(1);
    card.tokensCount = BigInt.fromI32(event.params.tokenIds.length);
    card.save();

    for(let i = 1; i <= event.params.tokenIds.length; i++){
        createCardToken(i.toString(), cardId, creatorCollection.collectible);
    }    
}

export function handlePurchased(event: Purchased): void {
    let cardId = event.transaction.to.toHex() + "-" + event.params.catalogId.toString() + "-" + event.params.cardId.toString();
    let card = Card.load(cardId);
    let purchasedTokenId = card.idPointOfNextEmpty;
    card.idPointOfNextEmpty = card.idPointOfNextEmpty.plus(BigInt.fromI32(1));
    card.save();

    let creatorCollection = CreatorCollections.load(event.transaction.to.toHex());
    
    let token = createCardToken(purchasedTokenId.toString(), cardId, creatorCollection.collectible.toString());
    token.state = "PURCHASED";
    token.owner = event.params.user;
    token.save();
}

export function handleRequestDataSet(event: RequestDataSet): void {   
    let cardId = event.params.cardID.toString();

    let token = createCardToken(event.params.tokenID.toString(), cardId, event.transaction.to.toHex());
    token.requestData = event.params.collectibleRequestData.toString();
    token.save();
}

export function handleFanCollectibleDataSet(event: FanCollectibleDataSet): void {
    let creatorsCollection = CreatorCollections.load(event.transaction.to.toHex());
    let token = createCardToken(event.params.fanId.toString(), event.params.cardId.toString(), creatorsCollection.collectible.toString());
    token.state = "PURCHASED_AND_FINALIZED";
    token.save();
}

export function createCreatorCollections(
    creatorCollections: Address, 
    nftLance: Address, 
    creator: Address,
    fanCollectible: Address,
    token: Address
): CreatorCollections {
    let ccollection = CreatorCollections.load(creatorCollections.toHex());
    if (ccollection === null) {
        ccollection = new CreatorCollections(creatorCollections.toHex());
        ccollection.nftLance = NFTLance.load(nftLance.toHex()).id;
        ccollection.creator = Creator.load(creator.toHex()).id;
        ccollection.creatonBalance = BigInt.fromI32(0);
        ccollection.creatonPercentage = 0;
        ccollection.artistPercentage = BigInt.fromI32(0);
        ccollection.token = token;
        ccollection.collectible = createFanCollectible(fanCollectible, "").id;
        ccollection.totalSupply = BigInt.fromI32(0);
        ccollection.catalogsCount = BigInt.fromI32(0);
        ccollection.save();
    }

    return ccollection as CreatorCollections;
}

export function createFanCollectible(
    fanCollectible: Address, 
    uri: string
): FanCollectible {
    let fc = FanCollectible.load(fanCollectible.toHex());
    if (fc === null) {
        fc = new FanCollectible(fanCollectible.toHex());
    }

    if(uri.length > 0){
        fc.uri = uri;
    }

    fc.save();

    return fc as FanCollectible;
}

export function createCardToken(tokenId: string, cardId: string, fanCollectibleId: string): Token {
    let id: string = fanCollectibleId + "-" + cardId + "-" + tokenId;

    let token = Token.load(id);
    if (token === null) {
        token = new Token(id);
        token.tokenId = tokenId;
        token.card = Card.load(cardId).id;
        token.state = "UNPURCHASED";
        token.save();
    }

    return token as Token;
}