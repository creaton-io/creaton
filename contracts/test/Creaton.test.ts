import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from '@nomiclabs/buidler';

describe('Creaton', function () {
  it('should work', async function () {
    await deployments.fixture();
    const creatonContract = await ethers.getContract('Creaton');
    expect(creatonContract.address).to.be.a('string');
  });

  it('setMessage works', async function () {
    await deployments.fixture();
    const others = await getUnnamedAccounts();
    const creatonContract = await ethers.getContract('Creaton', others[0]);
    const testMessage = 'Hello World';
    await expect(creatonContract.setMessage(testMessage))
      .to.emit(creatonContract, 'MessageChanged')
      .withArgs(others[0], testMessage);
  });
});
