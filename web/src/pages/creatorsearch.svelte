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
  let usdc;
  let usdcx;
  let app;
  let usdcBalance;
  let usdcApproved;

  const APP_ADDRESS = '0xb21e3101467A0f9f5b17e129810824825313434c';
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
    usdcBalance = await usdc.balanceOf($wallet.address);
    usdcApproved = await usdcx.balanceOf($wallet.address);
    var call;
    if (usdcApproved < 2)
      call = [
        [
          2, // upgrade 100 usdcx to play the game
          usdcx.address,
          sf.interfaceCoder.encode(['uint256'], [parseEther('100').toString()]),
        ],
        [
          0, // approve collateral fee
          usdcx.address,
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
            [usdcx.address, app.address],
            MINIMUM_GAME_FLOW_RATE.toString(),
            '0x'
          ),
        ],
      ];
    else
      call = [
        [
          0, // approve collateral fee
          usdcx.address,
          sf.interfaceCoder.encode(['address', 'uint256'], [APP_ADDRESS, parseEther('10').toString()]),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          sf.interfaceCollateral.encodeFunctionData('collateral', [contractAddress, '0x']),
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interfaceCreateFlow.encodeFunctionData('createFlow', [usdcx.address, app.address, app.address]),
        ],
      ];
  }

  async function loadSuperFluid() {
    sf = new SuperfluidSDK({
      web3Provider: wallet,
      version: '0.1.2-preview-20201014',
      chainId: 5,
    });
    await sf.initialize();

    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    usdc = new Contract(usdcAddress, SuperfluidABI.TestToken, wallet.provider.getSigner());
    const usdcxWrapper = await sf.getERC20Wrapper(usdc);
    usdcx = usdcxWrapper;
    app = await new Contract(contractAddress, contracts.CreatonSuperApp.abi, wallet.provider.getSigner());
  }

  async function mintUSDC() {
    //mint some usdc here!  100 default amount
    await usdc.mint($wallet.address, parseEther('100'));
    usdcBalance = await usdc.balanceOf($wallet.address);
  }

  async function approveUSDC() {
    //approve unlimited please
    await usdc
      .approve(usdcx.address, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
      .then(async (i) => (usdcApproved = await usdc.allowance($wallet.address, usdcx.address)));
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

  function testStream() {
    sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.encodeFunctionData('createFlow', [usdcx.address, '385802469135802', '0x']),
      {from: $wallet.address}
    );
  }

  async function getStreams() {
    console.log('app flow', (await usdcx.balanceOf(app.address)).toString() / 1e18);

    console.log('single own flow', (await usdcx.balanceOf($wallet.address)).toString() / 1e18);

    console.log(
      'all own flows',
      (await sf.agreements.cfa.getNetFlow(usdcx.address, $wallet.address)).toString() / 1e18
    );
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
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">usdc Balance: ${usdcBalance}</p>
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">Approved usdc Balance: ${usdcApproved}</p>
            <Button class="mt-3" on:click={mintUSDC}>mint 100 usdc</Button>
            <Button class="mt-3" on:click={approveUSDC}>approve a lot of usdc</Button>
            <Button class="mt-3" on:click={testStream}>Directly stream test</Button>
            <Button class="mt-3" on:click={getStreams}>Get stream infos in console</Button>
          </div>
        </div>
      </section>
    {/if}
  </SearchBackground>
</WalletAccess>
