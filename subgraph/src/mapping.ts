/* eslint-disable prefer-const */
import {CreatorDeployed as CreatorDeployedEvent, ProfileUpdate, ReactionFactoryDeployed } from '../generated/CreatonAdmin/CreatonAdmin';
import {Content, Creator, Profile, Subscriber} from '../generated/schema';
import {SubscriberEvent, PostContract, NewPost, HidePost} from '../generated/templates/Creator/Creator';
import {Creator as CreatorTemplate} from '../generated/templates';
import {Address, DataSourceContext, dataSource, json, Bytes, log} from '@graphprotocol/graph-ts';
import { ReactionDeployed } from "../generated/templates/ReactionFactory/ReactionFactory";
import { Staked, Reacted, Flowed } from "../generated/templates/ReactionToken/ReactionToken";
import { Flowing } from "../generated/templates/StakedFlow/StakedFlow";
import { ReactionDef, Stake, Reaction, User, Flow, StakedFlow } from "../generated/schema";
import { ReactionToken as ReactionTokenTemplate, StakedFlow as StakedFlowTemplate, ReactionFactory as ReactionFactoryTemplate} from "../generated/templates";

// const zeroAddress = '0x0000000000000000000000000000000000000000';

export function handleCreatorDeployed(event: CreatorDeployedEvent): void {
  let id = event.params.creator.toHex();
  let entity = Creator.load(id);
  if (!entity) {
    entity = new Creator(id);
  }
  entity.user = event.params.creator;
  entity.creatorContract = event.params.creatorContract;
  let context = new DataSourceContext();
  context.setString('user', id);
  context.setBytes('contract', event.params.creatorContract);
  CreatorTemplate.createWithContext(event.params.creatorContract, context);
  entity.description = event.params.description;
  entity.subscriptionPrice = event.params.subscriptionPrice;
  entity.timestamp = event.block.timestamp;
  let profile = Profile.load(id);
  if (profile) {
    entity.profile = profile.id;
  }
  entity.save();
}

export function handleSubscriberEvent(event: SubscriberEvent): void {
  let context = dataSource.context();
  let id = context.getString('user');
  let creator = Creator.load(id);
  let subscriber_user = event.params.user;
  let subscriber_id = subscriber_user.toHex() + id;
  let subscriber = Subscriber.load(subscriber_id);
  if (!subscriber) {
    subscriber = new Subscriber(subscriber_id);
    subscriber.creator = creator.id;
    subscriber.user = subscriber_user;
    subscriber.creatorContract = context.getBytes('contract');
  }
  let status = 'undefined';
  if (event.params.status == 0) status = 'unsubscribed';
  if (event.params.status == 1) status = 'subscribed';
  subscriber.status = status;
  let profile = Profile.load(subscriber_user.toHex());
  if (profile) {
    subscriber.profile = profile.id;
  }
  subscriber.save();
}

export function handleNewPost(event: NewPost): void {
  let context = dataSource.context();
  let creator_id = context.getString('user');
  let creator_contract = context.getBytes('contract');
  let tokenId = event.params.tokenId;
  let id = creator_contract.toHex() + '-' + tokenId.toString();
  let json_str = event.params.jsonData;
  let data: Bytes = <Bytes>Bytes.fromUTF8(json_str);
  let metadata = json.fromBytes(data).toObject();
  let name = '';
  let type = '';
  let description = '';
  let date = '';
  let ipfs = '';
  if (metadata.isSet('name')) name = metadata.get('name').toString();
  if (metadata.isSet('type')) type = metadata.get('type').toString();
  if (metadata.isSet('description')) description = metadata.get('description').toString();
  if (metadata.isSet('date')) date = metadata.get('date').toString();
  if (metadata.isSet('ipfs')) ipfs = metadata.get('ipfs').toString();
  if (ipfs === '') return;
  let entity = Content.load(id);
  if (!entity) {
    entity = new Content(id);
  }
  entity.creator = creator_id;
  entity.creatorContract = context.getBytes('contract');
  entity.date = date;
  entity.description = description;
  entity.name = name;
  entity.type = type;
  entity.ipfs = ipfs;
  entity.tokenId = tokenId;
  entity.tier = event.params.contentType;
  entity.hide = false;
  entity.save();
}

export function handleProfileUpdate(event: ProfileUpdate): void {
  let id = event.params.user.toHex();
  let entity = Profile.load(id);
  if (!entity) {
    entity = new Profile(id);
  }
  entity.address = event.params.user;
  entity.data = event.params.jsonData;
  entity.save();
}

export function handleHidePost(event: HidePost): void {
  let context = dataSource.context();
  let creator_contract = context.getBytes('contract');
  let tokenId = event.params.tokenId;
  let id = creator_contract.toHex() + '-' + tokenId.toString();
  let entity = Content.load(id);
  entity.hide = event.params.hide;
  entity.save();
}

// export function handlePostContract(event: PostContract): void {
//   let id = event.params..toHex();
//   let entity = Creator.load(id);
//   if (!entity) {
//     entity = new Creator(id);
//   }
//   entity.user = event.params.creator;
//   entity.creatorContract = event.params.creatorContract;
//   let context = new DataSourceContext();
//   context.setString('user', id);
//   context.setBytes('contract', event.params.creatorContract);
//   CreatorTemplate.createWithContext(event.params.creatorContract, context);
//   entity.description = event.params.description;
//   entity.subscriptionPrice = event.params.subscriptionPrice;
//   entity.timestamp = event.block.timestamp;
//   entity.save();
// }

export function handleReactionFactoryDeployed(event: ReactionFactoryDeployed): void{ 
  let context = new DataSourceContext();
  context.setBytes('contract', event.params.factoryContractAddress);
  ReactionFactoryTemplate.createWithContext(event.params.factoryContractAddress, context);
}

export function handleReactionDeployed(event: ReactionDeployed): void {
  let entity = ReactionDef.load(event.params.reactionContractAddr.toHex());
  if (entity == null) {
    entity = new ReactionDef(event.params.reactionContractAddr.toHex());
  }
  
  entity.user = createUser(event.params.creator).id;
  entity.contract = event.params.reactionContractAddr;
  entity.name = event.params.reactionTokenName;
  entity.symbol = event.params.reactionTokenSymbol;
  entity.stakingTokenAddress = event.params.stakingTokenAddress;
  entity.save();

  let context = new DataSourceContext();
  context.setBytes('contract', event.params.reactionContractAddr);
  ReactionTokenTemplate.createWithContext(event.params.reactionContractAddr, context);
}

export function handleStake(event: Staked): void {
  let entity = Stake.load(event.transaction.hash.toHex());
  if (entity == null) {
    entity = new Stake(event.transaction.hash.toHex());
  }

  entity.user = createUser(event.params.author).id;
  entity.token = event.params.stakingTokenAddress;
  entity.amount = event.params.amount;
  entity.reaction = event.transaction.hash.toHex();
  entity.save();
}

export function handleReacted(event: Reacted): void {
  let entity = Reaction.load(event.transaction.hash.toHex());
  if (entity == null) {
    entity = new Reaction(event.transaction.hash.toHex());
  }

  let reactionDef = ReactionDef.load(event.params.reactionTokenAddress.toHex());

  entity.user = createUser(event.params.author).id;
  entity.reaction = reactionDef.id;
  entity.amount = event.params.amount;
  entity.reactionRecipientAddress = event.params.reactionRecipientAddress;
  entity.tokenId = event.params.tokenId;
  
  entity.save();
}

export function handleFlowed(event: Flowed): void {
  let entity = Flow.load(event.transaction.hash.toHex());
  if (entity == null) {
    entity = new Flow(event.transaction.hash.toHex());
  }

  entity.stakedFlow = createStakedFlow(event.params.flow).id;
  entity.amount = event.params.amount;
  entity.stakingTokenAddress = event.params.stakingTokenAddress;
  entity.recipient = createUser(event.params.recipient).id;
  entity.stakingSuperTokenAddress = event.params.stakingSuperTokenAddress;
  entity.reaction = event.transaction.hash.toHex();
  entity.save();

  let context = new DataSourceContext();
  context.setBytes('contract', event.params.flow);
  StakedFlowTemplate.createWithContext(event.params.flow, context);
}

export function handleFlowing(event: Flowing): void {  
  let stakedFlow = createStakedFlow(event.address);
  
  stakedFlow.stakingSuperToken = event.params.stakingSuperToken;
  stakedFlow.balance = event.params.balance;
  stakedFlow.recipient = createUser(event.params.recipient).id;
  stakedFlow.flowRate = event.params.flowRate;
  stakedFlow.save();
}

export function createUser(address: Address): User {
  let user = User.load(address.toHexString());
  if (user === null) {
    user = new User(address.toHexString());
    user.address = address;
    user.save();
  }

  return user as User;
}

export function createStakedFlow(address: Address): StakedFlow {
  let stakedFlow = StakedFlow.load(address.toHexString());
  if (stakedFlow === null) {
    stakedFlow = new StakedFlow(address.toHexString());
    stakedFlow.save();
  }

  return stakedFlow as StakedFlow;
}