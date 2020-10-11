import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from '@nomiclabs/buidler';

describe('CreatonFactory', function () {
  it('deploys successfully', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    expect(creatonFactory.address).to.be.a('string');
  });

  it('deploys Creator contract', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    const creator = await creatonFactory.deployCreator('ETHGlobal', 5, 12);
    expect(creator.hash).to.be.a('string');
  });
});

describe('Creator', function () {
  it('deploys with creator title', async function () {
    await deployments.fixture();
    const creator = await ethers.getContract('Creator');
    creator.init('ETHGlobal', 5, 12);
    expect(await creator.getCreatorTitle()).to.equal('ETHGlobal');
  });
});
