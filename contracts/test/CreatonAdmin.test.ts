import {expect} from 'chai';
import {ethers, network} from 'hardhat';
import {Contract} from '@ethersproject/contracts';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {BigNumber, ContractFactory} from 'ethers';
import SuperfluidSDK from '@superfluid-finance/js-sdk';
import {ConstantFlowAgreementV1, Framework, IAgreementV1Options, SuperToken} from '@superfluid-finance/sdk-core';
import {Address} from 'hardhat-deploy/dist/types';

const CREATON_TREASURY: Address = '0xC2Be769Df80AA18aA7982B5ecA0AaE037460891d';

const SFHOST: Address = process.env.SUPERFLUID_HOST || '';
const SFCFA: Address = process.env.SUPERFLUID_CFA || '';
const SFRESOLVER: Address = process.env.SUPERFLUID_RESOLVER || '';
const SFIDA: Address = process.env.SUPERFLUID_IDAV1 || '';
const FUSDCADDRESS: Address = '0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2';
const FUSDCXADDRESS: Address = '0x42bb40bF79730451B11f6De1CbA222F17b87Afd7';

let SF: Framework;
let FUSDCXContract: any;

let owner: SignerWithAddress, 
    alice: SignerWithAddress, 
    bob: SignerWithAddress, 
    addrs: SignerWithAddress[];

let creatonAdmin: Contract, 
    creator: Contract;

const timeTravel = async (time: number) => {
  const startBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  await network.provider.send('evm_increaseTime', [time]);
  await network.provider.send('evm_mine');
  const endBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());

  console.log(`\tTime Travelled ${time} (sec) => FROM ${startBlock.timestamp} TO ${endBlock.timestamp}`);
};

const startStreaming = async (creatorContractAddress: string, subscriber: SignerWithAddress) => {
  const signer = SF.createSigner({signer: subscriber});

  const creatorContract = await ethers.getContractAt('CreatorV1', creatorContractAddress);
  const subscriptionPrice = await creatorContract.subscriptionPrice();
  const MINIMUM_FLOW_RATE = ethers.utils.parseUnits(subscriptionPrice.toString(), 18).div(3600 * 24 * 30);

  const cfaV1 = new ConstantFlowAgreementV1({
    config: {
      hostAddress: SFHOST,
      cfaV1Address: SFCFA,
      idaV1Address: SFIDA,
      resolverAddress: SFRESOLVER,
      governanceAddress: '',
    },
  });

  const txnResponse = await cfaV1
    .createFlow({
      sender: subscriber.address,
      receiver: creatorContractAddress,
      superToken: FUSDCXADDRESS,
      flowRate: MINIMUM_FLOW_RATE.toString(),
    })
    .exec(signer);

  const txnReceipt = await txnResponse.wait();

  const flowInfo = await cfaV1.getFlow({
    superToken: FUSDCXADDRESS,
    sender: subscriber.address,
    receiver: creatorContractAddress,
    providerOrSigner: signer,
  });

  console.log('Streaming: ', flowInfo);
};

describe('Creaton Admin Tests', async () => {
  before(async () => {
    SF = await Framework.create({
      networkName: 'custom',
      resolverAddress: SFRESOLVER,
      dataMode: 'WEB3_ONLY',
      protocolReleaseVersion: 'test',
      provider: hre.ethers.provider,
    });

    FUSDCXContract = await SF.loadSuperToken(FUSDCXADDRESS);
  });

  beforeEach(async () => {
    [owner, alice, bob, ...addrs] = await ethers.getSigners();

    const SFACCEPTEDTOKEN = '0x42bb40bF79730451B11f6De1CbA222F17b87Afd7';
    const TREASURY = CREATON_TREASURY;
    const TREASURYFEE = '96';
    const CREATONBEACON = '0x34c17Ef019A232383cD6CDBBCcAE53C70c722F79';
    const NFTFACTORY = '0xE3d1dEbC90F5715A00229fe6Af9DaFEE8D4Db11A';
    const TRUSTEDFORWARDER = '0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b';

    const contractFactory = await ethers.getContractFactory('CreatonAdmin');
    creatonAdmin = await contractFactory.deploy(
      SFHOST,
      SFCFA,
      SFACCEPTEDTOKEN,
      TREASURY,
      TREASURYFEE,
      CREATONBEACON,
      NFTFACTORY,
      TRUSTEDFORWARDER
    );
    await creatonAdmin.deployed();
  });

  // it('Should be able to deploy a new Creator', async () => {
  //   const description = 'Hi! This is the Creator Test';
  //   const subscriptionPrice = 1;
  //   const nftName = 'Testing';
  //   const nftSymbol = 'TST';
  //   await expect(creatonAdmin.deployCreator(description, subscriptionPrice, nftName, nftSymbol)).to.emit(
  //     creatonAdmin,
  //     'CreatorDeployed'
  //   );
  // });

  it('Should be able to subscribe to a new Creator', async () => {
    const description = 'Hi! This is the Creator Test';
    const subscriptionPrice = 1;
    const nftName = 'Testing';
    const nftSymbol = 'TST';
    const tx = await creatonAdmin.deployCreator(description, subscriptionPrice, nftName, nftSymbol);
    let receipt = await tx.wait();
    receipt = receipt.events?.filter((x: any) => {
      return x.event == 'CreatorDeployed';
    })[0];

    const creatorContractAddress = receipt.args.creatorContract;
    expect(creatorContractAddress).to.be.properAddress;
    const creatorContract = await ethers.getContractAt('CreatorV1', creatorContractAddress);

    // Minting some fUSDC and upgrading it to SuperToken
    const subscriber = alice;
    const fusdcContract = await ethers.getContractAt('TestToken', FUSDCADDRESS);
    await fusdcContract.mint(subscriber.address, ethers.utils.parseEther('1000'));
    await fusdcContract.connect(subscriber).approve(FUSDCXADDRESS, ethers.utils.parseEther('1000'));
    const upgradeTxn = await FUSDCXContract.upgrade({amount: ethers.utils.parseEther('1000')}).exec(alice);
    await upgradeTxn.wait();
    const initialSubscriberBalance = await FUSDCXContract.balanceOf({
      account: subscriber.address,
      providerOrSigner: subscriber,
    });
    expect(initialSubscriberBalance).to.be.equal(ethers.utils.parseEther('1000'));

    const initialCreatorBalance = await FUSDCXContract.balanceOf({
      account: owner.address,
      providerOrSigner: owner,
    });
    const initialCreatorContractBalance = await FUSDCXContract.balanceOf({
      account: creatorContractAddress,
      providerOrSigner: owner,
    });
    const initialTreasuryBalance = await FUSDCXContract.balanceOf({
      account: CREATON_TREASURY,
      providerOrSigner: owner,
    });
    expect(+initialCreatorBalance).to.be.equal(0);
    expect(+initialCreatorContractBalance).to.be.equal(0);

    await startStreaming(creatorContractAddress, alice);

    timeTravel(3600 * 24 * 15);

    // const finalCreatorContractBalance = await superTokenContract.balanceOf(creatorContractAddress);
    // expect(finalCreatorContractBalance).to.be.above(initialCreatorBalance);

    // const creatorBalance = await superTokenContract.balanceOf(creatorContract.creator());
    // expect(creatorBalance).to.be.above(initialCreatorBalance);

    // const treasuryBalance = await superTokenContract.balanceOf(CREATON_TREASURY);
    // expect(treasuryBalance).to.be.above(initialTreasuryBalance);
  });
});
