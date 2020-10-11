import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from '@nomiclabs/buidler';

describe('CreatonFactory', function () {
  it('should work', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    expect(creatonFactory.address).to.be.a('string');
  });

  it('deploys Creator contract', async function () {
    await deployments.fixture();
    const creatonFactory = await ethers.getContract('CreatonFactory');
    const creator = await creatonFactory.deployCreator('ETHGlobal', 5, 12);
    console.log(creator);
  });
});
