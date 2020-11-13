<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import {wallet, flow, chain} from '../stores/wallet';
  import {onMount} from 'svelte';
  import {SuperfluidSDK} from '@superfluid-finance/ethereum-contracts';

  let creatorContract;
  let superAppContract;
  let contractAddress;
  let creator;
  let title;
  let avatarURL;
  let subscriptionPrice;
  let currentBalance;
  let isSubscribed;

  let subscriptionStatus;

  let sf;
  let usdc;
  let usdcx;
  let app;
  let usdcBalance;
  let usdcApproved;

  const APP_ADDRESS = '0x46113fF0F86A2c27151F43e7959Ff60DebC18dB1';
  const MINIMUM_GAME_FLOW_RATE = '3858024691358';
  //TODO: try this with hardhat
  //const LotterySuperApp = TruffleContract(require("./LotterySuperApp.json"));

  //if (typeof window !== 'undefined') {
  //  contractAddress = window.location.pathname.split('/')[2];
  //}

  //onMount(async () => {

  //});

  /*
  async function support() {
    usdcBalance = await usdc.balanceOf.call($wallet.address);
    usdcApproved = await usdcx.balanceOf.call($wallet.address);
    var call;
    if (usdcApproved < 2)
      call = [
        [
          2, // upgrade 100 daix to play the game
          usdcx.address,
          sf.web3.eth.abi.encodeParameters(['uint256'], [sf.web3.utils.toWei('100', 'ether').toString()]),
        ],
        [
          0, // approve collateral fee
          usdcx.address,
          sf.web3.eth.abi.encodeParameters(
            ['address', 'uint256'],
            [APP_ADDRESS, sf.web3.utils.toWei('1', 'ether').toString()]
          ),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          app.contract.methods.collateral('0x').encodeABI(),
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.agreements.cfa.contract.methods
            .createFlow(usdcx.address, app.address, MINIMUM_GAME_FLOW_RATE.toString(), '0x')
            .encodeABI(),
        ],
      ];
    else
      call = [
        [
          0, // approve collateral fee
          usdcx.address,
          sf.web3.eth.abi.encodeParameters(
            ['address', 'uint256'],
            [APP_ADDRESS, sf.web3.utils.toWei('1', 'ether').toString()]
          ),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          app.contract.methods.collateral('0x').encodeABI(),
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.agreements.cfa.contract.methods
            .createFlow(usdcx.address, app.address, MINIMUM_GAME_FLOW_RATE.toString(), '0x')
            .encodeABI(),
        ],
      ];
    console.log('this is the batchcall: ', call);
    await sf.host.batchCall(call, {from: $wallet.address});
  }
  async function loadSuperFluid() {
    sf = new SuperfluidSDK.Framework({
      chainId: 5,
      version: '0.1.2-preview-20201014',
      web3Provider: wallet.web3Provider,
    });
    await sf.initialize();

    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    usdc = await sf.contracts.TestToken.at(usdcAddress);
    const usdcxWrapper = await sf.getERC20Wrapper(usdc);
    usdcx = await sf.contracts.ISuperToken.at(usdcxWrapper.wrapperAddress);

    app = await new Contract(contractAddress, contracts.CreatonSuperApp.abi, wallet.provider.getSigner());
  }

  async function mintUSDC() {
    //mint some dai here!  100 default amount
    await usdc.mint($wallet.address, sf.web3.utils.toWei('100', 'ether'), {from: $wallet.address});
    usdcBalance = await usdc.balanceOf.call($wallet.address);
  }

  async function approveUSDC() {
    //approve unlimited please
    await usdc
      .approve(usdcx.address, '115792089237316195423570985008687907853269984665640564039457584007913129639935', {
        from: $wallet.address,
      })
      .then(async (i) => (usdcApproved = await usdc.allowance.call($wallet.address, usdcx.address)));
  }
*/
  async function loadCreatorData() {
    await flow.execute(async (contracts) => {
      creatorContract = await new Contract(contractAddress, contracts.Creator.abi, wallet.provider.getSigner());

      creatorContract.on('NewSubscriber', (...response) => {
        const [address, balance] = response;
        if (address === wallet.address) {
          subscriptionStatus = 'SUBSCRIBED';
          currentBalance = balance.toNumber();
        }
      });

      creator = await creatorContract.creator();
      title = await creatorContract.creatorTitle();
      avatarURL = await creatorContract.avatarURL();
      subscriptionPrice = await creatorContract.subscriptionPrice();
      [currentBalance, isSubscribed] = await creatorContract.currentBalance(wallet.address);
      if (isSubscribed) {
        subscriptionStatus = 'SUBSCRIBED';
      } else {
        subscriptionStatus = 'UNSUBSCRIBED';
      }
    });
  }

  /*

  async function handleSubscribe() {
    if (!subscriptionPrice) return; // todo: show error
    try {
      const receipt = await creatorContract.subscribe(subscriptionPrice);
      subscriptionStatus = 'PENDING';
      // todo: show loader and watch for event when transaction is mined
    } catch (err) {
      console.error(err);
    }
  }*/

  async function searchCreator() {
    loadCreatorData();
  }
</script>

<WalletAccess>
  <section class="py-8 px-4 text-center max-w-md mx-auto">
    <form class="content flex flex-col max-w-lg mx-auto">
      <div class="field-row">
        <label for="name">search:</label>
        <Input type="text" placeholder="Search Address" className="field" bind:value={contractAddress} />
      </div>
      <button class="mt-6" type="button" on:click={searchCreator}>Search!</button>
    </form>
  </section>
</WalletAccess>
