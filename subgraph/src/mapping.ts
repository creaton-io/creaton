/* eslint-disable prefer-const */
import {CreatorDeployed as CreatorDeployedEvent} from '../generated/CreatonAdmin/CreatonAdmin';
import {Content, Creator, Subscriber} from '../generated/schema';
import {SubscriberEvent, PostContract, NewPost, Like} from '../generated/templates/Creator/Creator';
import {Creator as CreatorTemplate} from '../generated/templates';
import {DataSourceContext, dataSource, json, Bytes, log} from '@graphprotocol/graph-ts';

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
  if (event.params.pubKey.length > 0) subscriber.pub_key = event.params.pubKey;
  let status = 'undefined';
  if (event.params.status == 0) status = 'unsubscribed';
  if (event.params.status == 1) status = 'requested_subscribe';
  if (event.params.status == 2) status = 'pending_subscribe';
  if (event.params.status == 3) status = 'pending_unsubscribe';
  if (event.params.status == 4) status = 'subscribed';
  subscriber.status = status;
  subscriber.save();
}

export function handleNewPost(event: NewPost): void {
  let context = dataSource.context();
  let creator_id = context.getString('user');
  let creator_contract = context.getBytes('contract');
  let tokenId = event.params.tokenId;
  let id = creator_contract.toHex() + "-" + tokenId.toString()
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
  entity.likes = 0;
  entity.save();
}

export function handleLike(event: Like): void {
  let context = dataSource.context();
  let creator_contract = context.getBytes('contract');
  let tokenId = event.params.tokenId;
  let id = creator_contract.toHex() + "-" + tokenId.toString();
  let entity = Content.load(id);
  entity.likes = entity.likes + 1;
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
