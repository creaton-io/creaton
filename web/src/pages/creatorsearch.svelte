<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Input from '../components/Input.svelte';
  import Button from '../components/Button.svelte';
  import {Contract} from '@ethersproject/contracts';
  import Superfluid from '../build/abi';
  import {contracts} from '../contracts.json';
  import {abi as creatorABI} from '../Creator.json';
  import {wallet, flow, chain} from '../stores/wallet';
  import {onMount} from 'svelte';
  import {SuperfluidSDK} from '../js-sdk/Framework';
  import {parseEther, formatEther, parseUnits, formatUnits} from '@ethersproject/units';
  import {JsonRpcSigner} from '@ethersproject/providers';
  import SearchBackground from '../components/SearchBackground.svelte';
import { Interface } from '@ethersproject/abi';

  let creatorContract;
  let contractAddress;
  let creator;
  let metadataURL;
  let subscriptionPrice;

  let subscriptionStatus = 'UNSUBSCRIBED';
  let sf;
  let usdc;
  let usdcx;
  let usdcBalance;
  let usdcApproved;
  let usdcxBalance;

  let MINIMUM_GAME_FLOW_RATE;
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
    //contractAddress = '0x9314977248132C815c657441BBe9bFc6C57502dC'; // window.location.pathname.split('/')[2];
    // console.log('contractaddress', contractAddress);
  }

  onMount(async () => {
    /*
      if (wallet.provider) {
        //loadCreatorData();
        loadSuperFluid();
      } else {
        flow.execute(async () => {
          //loadCreatorData();
          loadSuperFluid();
        });
      }
      */
  });

  async function support() {
    usdcBalance = formatEther(await usdc.balanceOf($wallet.address));
    usdcxBalance = formatEther(await usdcx.balanceOf($wallet.address));
    // console.log(parseEther(MINIMUM_GAME_FLOW_RATE.toString()).mul(24 * 3600 * 30).toNumber());
    var call;
    if (usdcxBalance < 2)
      call = [
        [
          101, // upgrade 100 usdcx to play the game
          usdcx.address,
          sf.interfaceCoder.encode(['uint256'], [parseEther('1000')]),
        ],
        // [
        //   1, // approve collateral fee
        //   usdcx.address,
        //   sf.interfaceCoder.encode(['address', 'uint256'], [contractAddress, parseEther('10')]),
        // ],
        // [
        //   202, // callAppAction to collateral
        //   contractAddress,
        //   sf.interfaceCollateral.encodeFunctionData('collateral', [contractAddress, '0x']), //TODO: have to
        // ],
        [
          201, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interfaceCoder.encode(
            ['bytes', 'bytes'],
            [
              sf.interfaceFlow.encodeFunctionData('createFlow', 
              [
                usdcx.address,
                contractAddress,
                MINIMUM_GAME_FLOW_RATE.toString(),
                '0x',
              ]),
              sf.interfaceCoder.encode(
                ['string', 'string'],
                ['hello', 'world']
              )
            ]
          ),
        ],
      ];
    else
      call = [
        // [
        //   1, // approve collateral fee
        //   usdcx.address,
        //   sf.interfaceCoder.encode(['address', 'uint256'], [contractAddress, parseEther('10')]),
        // ],
        // [
        //   202, // callAppAction to collateral
        //   contractAddress,
        //   sf.interfaceCollateral.encodeFunctionData('collateral', [contractAddress, '0x']),
        // ],
        [
          201, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interfaceCoder.encode(
            ['bytes', 'bytes'],
            [
              sf.interfaceFlow.encodeFunctionData('createFlow', 
              [
                usdcx.address,
                contractAddress,
                MINIMUM_GAME_FLOW_RATE.toString(),
                '0x',
              ]),
              sf.interfaceCoder.encode(
                ['string', 'string'],
                ['hello', 'world']
              )
            ]
          ),
        ],
      ];

    console.log('this is the batchcall: ', call);
    await sf.host.batchCall(call, {from: $wallet.address});
  }

  async function searchCreator() {
    if (wallet.provider) {
      fetchStatus = FetchState.loading;
      loadCreatorData();
      loadSuperFluid();
    } else {
      flow.execute(async () => {
        loadCreatorData();
        loadSuperFluid();
      });
    }
  }

  async function loadCreatorData() {
    creatorContract = await new Contract(contractAddress, creatorABI, wallet.provider.getSigner());

    // creatorContract.on('NewSubscriber', (...response) => {
    //   const [address, balance] = response;
    //   if (address === wallet.address) {
    //     subscriptionStatus = 'SUBSCRIBED';
    //     currentBalance = 11; //TODO: replace with native token balance get balance.toNumber();
    //   }
    // });
    // console.log('subscribers: ', await creatorContract.getAllSubscribers());
    creator = await creatorContract.creator();
    metadataURL = await creatorContract.metadataURL();
    subscriptionPrice = await creatorContract.subscriptionPrice();
    MINIMUM_GAME_FLOW_RATE = parseUnits(subscriptionPrice.toString(), 18).div(3600 * 24 * 30);
    // if (isSubscribed) {
    //   subscriptionStatus = 'SUBSCRIBED';
    // } else {
    //   subscriptionStatus = 'UNSUBSCRIBED';
    // }
    fetchStatus = FetchState.succeeded;
    console.log('treasury address', creatorContract.treasury());
  }

  async function loadSuperFluid() {
    sf = new SuperfluidSDK(wallet, 'v1', '5', ['fUSDC']);
    await sf.initialize();

    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    usdc = new Contract(await sf.tokens.fUSDC.address, Superfluid.ABI.TestToken, wallet.provider.getSigner());
    usdcx = new Contract(await sf.tokens.fUSDCx.address, Superfluid.ABI.ISuperToken, wallet.provider.getSigner());

    //usdcx = await sf.createERC20Wrapper(usdc);
    //think I just need to use the address still so I can still get the ethers contract

    usdcBalance = formatEther(await usdc.balanceOf($wallet.address));
    usdcxBalance = formatEther(await usdcx.balanceOf($wallet.address));
    usdcApproved = formatEther(await usdc.allowance($wallet.address, usdc.address));
  }

  async function mintUSDC() {
    await usdc.mint($wallet.address, parseUnits('1000', 18), {from: $wallet.address});
    usdcBalance = formatEther(await usdc.balanceOf($wallet.address));
  }

  async function convertUSDCx() {
    await usdcx.upgrade(parseEther('900'));
    usdcxBalance = formatUnits(await usdcx.balanceOf($wallet.address), 18);
  }

  // async function approveUSDC() {
  //   await usdc
  //     .approve(usdcx.address, parseUnits('1000', 18), {
  //       from: $wallet.address,
  //     })
  //     .then(async (i) => (usdcApproved = await usdc.allowance($wallet.address, usdcx.address)));
  // }

  function testStream() {
    // console.log('wallet address', $wallet.address);
    // usdcx.upgrade(parseEther('100'));
    //sf.host.callAgreement(
    //  sf.agreements.cfa.address,
    //  sf.interfaceCreateFlow.encodeFunctionData('createFlow', [usdcx.address, contractAddress, '1', '0x']),
    //  {from: $wallet.address}
    //);
  }

  async function getStreams() {

    console.log(creatorContract.subscribers($wallet.address));
    // console.log(creatorContract.subscribers());
    // [$wallet.address].pubKey
    // let contractflow = await sf.agreements.cfa.getNetFlow(usdcx.address, contractAddress);
    // console.log(contractflow);
    // let creatorflow = await sf.agreements.cfa.getNetFlow(usdcx.address, '0x2E6490331ecB9D3820C037e23439191D5e249856');
    // console.log('creator flow', creatorflow.mul(24 * 3600 * 30).div(parseEther('1')).toNumber());
    // let subscriberflow = await sf.agreements.cfa.getNetFlow(usdcx.address, '0xC9e360Dd597a2424001a238A18AfB8d85f41Ae7C');
    // console.log('subscriber flow', subscriberflow.mul(24 * 3600 * 30).div(parseEther('1')).toNumber());
    // let treasuryflow = await sf.agreements.cfa.getNetFlow(usdcx.address, '0x1626957B6fCe89eF126Ff9B2cab4Abb7bbdf3EdE');
    // console.log('treasury flow', treasuryflow.mul(24 * 3600 * 30).div(parseEther('1')).toNumber());
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
            <p class="mb-2 text-base leading-6 text-gray-500 dark:text-gray-300 text-center">{metadataURL}</p>
            <!-- <img class="rounded-full h-24 mx-auto mb-4" src={metadataURL} alt="title placeholder" /> -->
            <!-- <h5 class="text-2xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">
              "title placeholder"
            </h5> -->
            <p class="mb-2 text-base leading-6 text-gray-500 dark:text-gray-300 text-center">{creator}</p>

            {#if subscriptionStatus === 'UNSUBSCRIBED'}
              <Button class="mt-3" on:click={support}>Subscribe - ${subscriptionPrice}</Button>
            {:else}
              <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center" />
            {/if}
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">usdc Balance: ${usdcBalance}</p>
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">Approved usdc Balance: ${usdcApproved}</p>
            <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">usdcx Balance: ${usdcxBalance}</p>
            <Button class="mt-3" on:click={mintUSDC}>mint 1000 usdc</Button>
            <Button class="mt-3" on:click={convertUSDCx}>convert 900 usdc</Button>
            <!-- <Button class="mt-3" on:click={testStream}>Directly stream test</Button> -->
            <Button class="mt-3" on:click={getStreams}>Get stream infos in console</Button>
          </div>
        </div>a
      </section>
    {/if}
  </SearchBackground>
</WalletAccess>

