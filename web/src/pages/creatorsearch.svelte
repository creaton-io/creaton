<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import SuperfluidABI from '../build/abi';
  import {wallet, flow, chain} from '../stores/wallet';
  import {onMount} from 'svelte';
  import {SuperfluidSDK} from '../js-sdk/Framework';
  import {parseEther} from '@ethersproject/units';
  import {JsonRpcSigner} from '@ethersproject/providers';
  import SearchBackground from '../components/SearchBackground.svelte';

  let creatorContract;
  let superAppContract;
  let contractAddress = ''; //TODO make this work with input
  let creator;
  let title;
  let avatarURL;
  let subscriptionPrice;
  let currentBalance;
  let isSubscribed;

  let subscriptionStatus;
  let sf;
  let dai;
  let daix;
  let app;
  let daiBalance;
  let daiApproved;

  const APP_ADDRESS = '0x46113fF0F86A2c27151F43e7959Ff60DebC18dB1';
  const MINIMUM_GAME_FLOW_RATE = '3858024691358';
  //TODO: try this with hardhat
  //const LotterySuperApp = TruffleContract(require("./LotterySuperApp.json"));

  const FetchState = Object.freeze({
    idle: 1,
    loading: 2,
    succeeded: 3,
    failed: 4,
  });
  let fetchStatus = FetchState.idle;

  if (typeof window !== 'undefined') {
    contractAddress = window.location.pathname.split('/')[2];
    console.log('contractaddress', contractAddress);
  }

  onMount(async () => {
    if (wallet.provider) {
      loadCreatorData();
    } else {
      flow.execute(async () => {
        loadCreatorData();
      });
    }
  });

  async function support() {
    daiBalance = await dai.balanceOf($wallet.address);
    daiApproved = await daix.balanceOf($wallet.address);
    var call;
    if (daiApproved < 2)
      call = [
        [
          2, // upgrade 100 daix to play the game
          daix.address,
          sf.interfaceCoder.encode(['uint256'], [parseEther('100').toString()]),
        ],
        [
          0, // approve collateral fee
          daix.address,
          sf.interfaceCoder.encode(['address', 'uint256'], [APP_ADDRESS, parseEther('1').toString()]),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          sf.interface.encodeFunctionData('collateral', ['0x']), //TODO: have to
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interfaceCreateFlow.encodeFunctionData(
            'createFlow',
            [daix.address, app.address],
            MINIMUM_GAME_FLOW_RATE.toString(),
            '0x'
          ),
        ],
      ];
    else
      call = [
        [
          0, // approve collateral fee
          daix.address,
          sf.interfaceCoder.encode(['address', 'uint256'], [APP_ADDRESS, parseEther('1').toString()]),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          sf.interfaceCollateral.encodeFunctionData('collateral', [contractAddress, '0x']),
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interfaceCreateFlow.encodeFunctionData(
            'createFlow',
            [daix.address, app.address],
            MINIMUM_GAME_FLOW_RATE.toString(),
            '0x'
          ),
        ],
      ];
    console.log('this is the batchcall: ', call);
    await sf.host.batchCall(call);
  }

  async function loadSuperFluid() {
    sf = new SuperfluidSDK({
      web3Provider: wallet,
      version: '0.1.2-preview-20201014',
      chainId: 31337,
    });
    await sf.initialize();

    const daiAddress = await sf.resolver.get('tokens.fDAI');
    dai = new Contract(daiAddress, SuperfluidABI.TestToken, wallet.provider.getSigner());
    const daixWrapper = await sf.getERC20Wrapper(dai);
    daix = daixWrapper;
    app = await new Contract(contractAddress, contracts.CreatonSuperApp.abi, wallet.provider.getSigner());
  }

  async function mintDAI() {
    //mint some dai here!  100 default amount
    await dai.mint($wallet.address, parseEther('100'));
    daiBalance = await dai.balanceOf($wallet.address);
  }

  async function approveDAI() {
    //approve unlimited please
    await dai
      .approve(daix.address, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
      .then(async (i) => (daiApproved = await dai.allowance($wallet.address, daix.address)));
  }

  async function loadCreatorData() {
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
    fetchStatus = FetchState.succeeded;
  }

  async function handleSubscribe() {
    if (!subscriptionPrice) return; // todo: show error
    try {
      const receipt = await creatorContract.subscribe(subscriptionPrice);
      subscriptionStatus = 'PENDING';
      // todo: show loader and watch for event when transaction is mined
    } catch (err) {
      console.error(err);
    }
  }

  async function searchCreator() {
    if (wallet.provider) {
      fetchStatus = FetchState.loading;
      loadCreatorData();
      loadSuperFluid();
    } else {
      flow.execute(async () => {
        loadCreatorData();
      });
    }
  }
</script>

<WalletAccess>
  <form class="content flex mx-auto my-5 flex justify-center" on:submit|preventDefault={searchCreator}>
    <div class="field-row">
      <Input type="text" placeholder="Search Address" className="field" bind:value={contractAddress} />
    </div>
    <div class="ml-5 p-1 bg-indigo-600 text-white rounded-md px-3"><button type="submit">Search!</button></div>
  </form>
  <SearchBackground>
    {#if fetchStatus == FetchState.loading}
      <section class="relative bottom-40 bg-white rounded-lg shadow mb-6 mx-auto">
        <div class="py-8 px-4 text-center max-w-md mx-auto z-10">Fetching creator...</div>
      </section>
    {:else if fetchStatus == FetchState.succeeded}
      <section class="relative bottom-40 bg-white rounded-lg shadow mb-6 mx-auto">
        <div class="py-8 px-4 text-center max-w-md mx-auto z-10">
          <div class="relative bottom-20">
            <img class="rounded-full h-24 mx-auto mb-4" src={avatarURL} alt={title} />
            <h5 class="text-2xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">{title}</h5>
            <p class="mb-2 text-base leading-6 text-gray-500 dark:text-gray-300 text-center">{creator}</p>

            {#if subscriptionStatus === 'UNSUBSCRIBED'}
              <Button class="mt-3" on:click={support}>Subscribe - ${subscriptionPrice}</Button>
            {:else}
              <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">
                {#if subscriptionStatus === 'PENDING'}
                  Subscription pending...
                {:else}Subscription balance: ${currentBalance}{/if}
              </p>
            {/if}
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">DAI Balance: ${daiBalance}</p>
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">Approved DAI Balance: ${daiApproved}</p>
            <Button class="mt-3" on:click={mintDAI}>mint 100 dai</Button>
            <Button class="mt-3" on:click={approveDAI}>approve a lot of dai</Button>
          </div>
        </div>
      </section>
    {/if}
  </SearchBackground>
</WalletAccess>
