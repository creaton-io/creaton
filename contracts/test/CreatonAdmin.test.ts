import {expect} from 'chai';
import {ethers, network} from 'hardhat';
import {Contract} from '@ethersproject/contracts';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {BigNumber, ContractFactory} from 'ethers';
import SuperfluidSDK from '@superfluid-finance/js-sdk';
import {ConstantFlowAgreementV1, Framework, IAgreementV1Options, SuperToken} from '@superfluid-finance/sdk-core';
import {Address} from 'hardhat-deploy/dist/types';

let CREATON_TREASURY: Address;

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

  // const flowInfo = await cfaV1.getFlow({
  //   sender: subscriber.address,
  //   receiver: creatorContractAddress,
  //   superToken: FUSDCXADDRESS,
  //   providerOrSigner: signer,
  // });
  // console.log('Streaming: ', flowInfo);
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
    CREATON_TREASURY = bob.address;

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

  it('Should be able to deploy a new Creator', async () => {
    const description = 'Hi! This is the Creator Test';
    const subscriptionPrice = 1;
    const nftName = 'Testing';
    const nftSymbol = 'TST';
    await expect(creatonAdmin.deployCreator(description, subscriptionPrice, nftName, nftSymbol)).to.emit(
      creatonAdmin,
      'CreatorDeployed'
    );
  });

  it('Should be able to subscribe to a new Creator with no Fee', async () => {
    const description = 'Hi! This is the Creator Test';
    const subscriptionPrice = 100;
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

    //Disabling the fee
    await creatorContract.setFee(false);

    const initialSubscribers = await creatorContract.getSubscriberCount();

    // Minting some fUSDC and upgrading it to SuperToken
    const subscriber = alice;
    const fusdcContract = await ethers.getContractAt('TestToken', FUSDCADDRESS);
    await fusdcContract.mint(subscriber.address, ethers.utils.parseEther('1000'));
    await fusdcContract.connect(subscriber).approve(FUSDCXADDRESS, ethers.utils.parseEther('1000'));
    const upgradeTxn = await FUSDCXContract.upgrade({amount: ethers.utils.parseEther('1000')}).exec(alice);
    await upgradeTxn.wait();

    const initialCreatorBalance = await FUSDCXContract.realtimeBalanceOf({
      account: owner.address,
      providerOrSigner: subscriber,
    });
    const initialSubscriberBalance = await FUSDCXContract.realtimeBalanceOf({
      account: subscriber.address,
      providerOrSigner: subscriber,
    });
    const initialCreatorContractBalance = await FUSDCXContract.realtimeBalanceOf({
      account: creatorContractAddress,
      providerOrSigner: owner,
    });
    const initialTreasuryBalance = await FUSDCXContract.realtimeBalanceOf({
      account: CREATON_TREASURY,
      providerOrSigner: owner,
    });
    expect(+initialCreatorBalance.availableBalance).to.be.equal(0);
    expect(initialSubscriberBalance.availableBalance).to.be.equal(ethers.utils.parseEther('1000'));
    expect(+initialCreatorContractBalance.availableBalance).to.be.equal(0);
    expect(+initialTreasuryBalance.availableBalance).to.be.equal(0);

    await startStreaming(creatorContractAddress, alice);

    await timeTravel(3600 * 24 * 15); // 15 days

    const finalCreatorBalance = await FUSDCXContract.realtimeBalanceOf({
      account: owner.address,
      providerOrSigner: subscriber,
    });
    const finalSubscriberBalance = await FUSDCXContract.realtimeBalanceOf({
      account: subscriber.address,
      providerOrSigner: subscriber,
    });
    const finalCreatorContractBalance = await FUSDCXContract.realtimeBalanceOf({
      account: creatorContractAddress,
      providerOrSigner: owner,
    });
    const finalTreasuryBalance = await FUSDCXContract.realtimeBalanceOf({
      account: CREATON_TREASURY,
      providerOrSigner: owner,
    });

    // Not really checking if the flow numbers add up, but, it's something...
    expect(+finalCreatorBalance.availableBalance).to.be.above(+initialCreatorBalance.availableBalance);
    expect(+finalSubscriberBalance.availableBalance).to.be.below(+initialSubscriberBalance.availableBalance);
    expect(+finalCreatorContractBalance.availableBalance).to.be.equal(0);
    expect(+finalTreasuryBalance.availableBalance).to.be.above(+initialTreasuryBalance.availableBalance);

    // console.log('Creator: %s -> %s', initialCreatorBalance.availableBalance, finalCreatorBalance.availableBalance);
    // console.log('Subscriber Balance: %s -> %s', initialSubscriberBalance.availableBalance, finalSubscriberBalance.availableBalance);
    // console.log('Creator Contract: %s -> %s', initialCreatorContractBalance.availableBalance, finalCreatorContractBalance.availableBalance);
    // console.log('Treasury: %s -> %s', initialTreasuryBalance.availableBalance, finalTreasuryBalance.availableBalance);

    const finalSubscribers = await creatorContract.getSubscriberCount();
    console.log('Subscribers: %s -> %s', initialSubscribers, finalSubscribers);
    expect(finalSubscribers).to.be.equal(initialSubscribers.add(1));
  });
});
