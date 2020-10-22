/* eslint-disable prefer-const */
import {CreatorDeployed as CreatorDeployedEvent} from '../generated/CreatonFactory/CreatonFactory';
import {Creator} from '../generated/schema';

// const zeroAddress = '0x0000000000000000000000000000000000000000';

export function handleCreatorDeployed(event: CreatorDeployedEvent): void {
  let id = event.params.user.toHex();
  let entity = Creator.load(id);
  if (!entity) {
    entity = new Creator(id);
  }
  entity.user = event.params.user;
  entity.creatorContract = event.params.creatorContract;
  entity.title = event.params.title;
  entity.subscriptionPrice = event.params.subscriptionPrice;
  entity.avatarURL = event.params.avatarURL;
  entity.timestamp = event.block.timestamp;
  entity.save();
}
