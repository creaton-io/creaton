/*import {expect} from './chai-setup';
import {ethers, deployments} from 'hardhat';

const mockCreator = ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'ETHGlobal', 5];

describe('CreatonFactory', function () {
  it('deploy successfully', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    expect(creatonFactory.address).to.be.a('string');
  });

  it('deploy Creator contract', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    const creator = await creatonFactory.deployCreator(...mockCreator);
    expect(creator.hash).to.be.a('string');
  });
});

describe('Creator', async function () {
  let creatorContract: any;
  let creator: any;
  let subscriber: any;

  before(async () => {
    [creator, subscriber] = await ethers.getSigners();
  });

  beforeEach(async function setup() {
    await deployments.fixture();
    creatorContract = await ethers.getContract('Creator');
    creatorContract.init(...mockCreator);
  });

  it('deploy with all param data set', async function () {
    expect(await creatorContract.creator()).to.equal(creator.address);
    expect(await creatorContract.creatorTitle()).to.equal('ETHGlobal');
    expect(await creatorContract.avatarURL()).to.equal(
      'https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg'
    );
    expect(await creatorContract.subscriptionPrice()).to.equal(5);
  });
  it('set avatar url', async function () {
    creatorContract.setAvatarURL(
      'https://image.shutterstock.com/image-vector/hand-drawn-modern-man-avatar-260nw-1373616869.jpg'
    );
    expect(await creatorContract.avatarURL()).to.equal(
      'https://image.shutterstock.com/image-vector/hand-drawn-modern-man-avatar-260nw-1373616869.jpg'
    );
  });
  it('subscribe to creator', async function () {
    await creatorContract.connect(subscriber).subscribe(5);
    const [balance, isSubscribed] = await creatorContract.currentBalance(subscriber.address);
    expect(balance).to.equal(5);
    expect(isSubscribed).to.be.true;
  });
  it('subscription reverts if subscriber is also the creator', async function () {
    const promise = creatorContract.connect(creator).subscribe(5);
    expect(promise).to.be.revertedWith("Creators can't subscribe to themselves");
  });
  it('subscription reverts if subscriber is already subscribed', async function () {
    await creatorContract.connect(subscriber).subscribe(5);
    const promise = creatorContract.connect(subscriber).subscribe(5);
    expect(promise).to.be.revertedWith('Already subscribed');
  });
  it('subscription reverts if subscription amount is missing', async function () {
    try {
      await creatorContract.connect(subscriber).subscribe();
    } catch (err) {
      expect(err.code).to.equal('MISSING_ARGUMENT');
    }
  });
  it('subscription emits event', async () => {
    await expect(creatorContract.connect(subscriber).subscribe(5))
      .to.emit(creatorContract, 'NewSubscriber')
      .withArgs(subscriber.address, 5);
  });
});*/