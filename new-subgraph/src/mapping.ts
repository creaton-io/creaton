/* eslint-disable prefer-const */
import {CreatorDeployed as CreatorDeployedEvent} from '../generated/CreatonFactory/CreatonFactory';
import {Content, Creator, Subscriber} from '../generated/schema';
import {SubscriberEvent, NewPost} from '../generated/templates/Creator/Creator';
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
  log.info('here1s', []);
}

export function handleSubscriberEvent(event: SubscriberEvent): void {
  let context = dataSource.context();
  let id = context.getString('user');
  let creator = Creator.load(id);
  let subscriber_user = event.params.user;
  let subscriber = new Subscriber(subscriber_user.toHex() + id);
  subscriber.creator = creator.id;
  subscriber.user = subscriber_user;
  subscriber.sig_key = event.params.sigKey;
  subscriber.pub_key = event.params.pubKey;
  subscriber.save();
}

export function handleNewPost(event: NewPost): void {
  let context = dataSource.context();
  log.info('here1', []);
  let creator_id = context.getString('user');
  log.info('here2', []);
  let json_str = event.params.metadataURL;
  log.info('here3', []);
  let data: Bytes = <Bytes>Bytes.fromUTF8(json_str);
  let metadata = json.fromBytes(data).toObject();
  let name = metadata.get('name').toString();
  let type = metadata.get('type').toString();
  let description = metadata.get('description').toString();
  let date = metadata.get('date').toString();
  let ipfs = metadata.get('ipfs').toString();
  let entity = Content.load(ipfs);
  if (!entity) {
    entity = new Content(ipfs);
  }
  entity.creator = creator_id;
  entity.creatorContract = context.getBytes('contract');
  entity.date = date;
  entity.description = description;
  entity.name = name;
  entity.type = type;
  entity.ipfs = ipfs;
  entity.save();
}
