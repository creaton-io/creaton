import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from 'hardhat';

const mockCreator = ['https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg', 'ETHGlobal', 5];

describe('CreatonFactory', function () {
  it('deploys successfully', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    expect(creatonFactory.address).to.be.a('string');
  });

  it('deploys Creator contract', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    const creator = await creatonFactory.deployCreator(...mockCreator);
    expect(creator.hash).to.be.a('string');
  });
});

describe('Creator', function () {
  let creator: any;
  async function setup() {
    await deployments.fixture();
    creator = await ethers.getContract('Creator');
    creator.init(...mockCreator);
  }

  beforeEach(setup);

  // it('deploys with all param data set', async function () {
  //   expect(await creator.creatorTitle()).to.equal('ETHGlobal');
  //   expect(await creator.avatarURL()).to.equal('https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg');
  //   expect(await creator.subscriptionPrice()).to.equal(5);
  // });
  it('sets avatar url', async function () {
    creator.setAvatarURL(
      'https://image.shutterstock.com/image-vector/hand-drawn-modern-man-avatar-260nw-1373616869.jpg'
    );
    expect(await creator.avatarURL()).to.equal(
      'https://image.shutterstock.com/image-vector/hand-drawn-modern-man-avatar-260nw-1373616869.jpg'
    );
  });
});
