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
  import {ethers} from "ethers";
  import {BiconomyHelper} from '../biconomy-helpers/biconomyForwarderHelpers';
  import {Web3Provider} from "@ethersproject/providers";

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

  let ethersProvider;
  let signer;
  let subscriberAddress;
  let networkId;
  let bh;

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
    usdcBalance = formatEther(await usdc.balanceOf(subscriberAddress));
    usdcxBalance = formatEther(await usdcx.balanceOf(subscriberAddress));
    // console.log(parseEther(MINIMUM_GAME_FLOW_RATE.toString()).mul(24 * 3600 * 30).toNumber());
    let call;
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
    let {data} = await sf.host.populateTransaction.biconomyBatchCall(call);
    let forwarder = await bh.getBiconomyForwarderConfig(networkId);
    console.log(forwarder);
    let forwarderContract = new Contract(
          forwarder.address,
          forwarder.abi,
          signer
        );
    let gasLimit = await ethersProvider.estimateGas({
          to: sf.host.address,
          from: subscriberAddress,
          data: data
        });

    const batchNonce = await forwarderContract.getNonce(subscriberAddress,0);
    const gasLimitNum = Number(gasLimit);
    console.log('forward request?')
    const req = await bh.buildForwardTxRequest({account:subscriberAddress,to:sf.host.address, gasLimitNum, batchId:0,batchNonce,data});
    console.log('tx req', req);

    const hashToSign =  await bh.getDataToSignForPersonalSign(req);
    signer.signMessage(ethers.utils.arrayify(hashToSign))
        .then(function(sig){
          console.log('signature ' + sig);
          // make API call
          sendTransaction({subscriberAddress, req, sig, signatureType:"PERSONAL_SIGN"});
        })
        .catch(function(error) {
	        console.log(error)
        });

    // await sf.host.batchCall(call, {from: subscriberAddress});
  }

  async function searchCreator() {
    if (wallet.provider) {
      fetchStatus = FetchState.loading;
      deployBiconomy();
      loadCreatorData();
      loadSuperFluid();
    } else {
      flow.execute(async () => {
        deployBiconomy();
        loadCreatorData();
        loadSuperFluid();
      });
    }
  }

  async function deployBiconomy() {
    bh = new BiconomyHelper();
    ethersProvider = new Web3Provider(window['ethereum']);
    console.log('hello!')
    console.log(ethersProvider);
    signer = ethersProvider.getSigner();
    subscriberAddress = await signer.getAddress();
    console.log(subscriberAddress);
    networkId = 80001;
    // biconomy = new Biconomy(window['ethereum'],{apiKey: '2YCO6NaKI.da767985-4e30-448e-a781-561d92bc73bf', debug: true});
    // ethersProvider = new Web3Provider(biconomy);
    // biconomy.onEvent(biconomy.READY, () => {
    //   console.log("biconomy ready");
    //   signer = ethersProvider.getSigner();
    // }).onEvent(biconomy.ERROR, (error, message) => {
    //   console.log("biconomy not ready");
    // });
  }

  async function loadCreatorData() {
    creatorContract = await new Contract(contractAddress, creatorABI, signer);

    // creatorContract.on('NewSubscriber', (...response) => {
    //   const [address, balance] = response;
    //   if (address === wallet.address) {
    //     subscriptionStatus = 'SUBSCRIBED';
    //     currentBalance = 11; //TODO: replace with native token balance get balance.toNumber();
    //   }
    // });
    // console.log('subscribers: ', await creatorContract.getAllSubscribers());
    creator = await creatorContract.creator();

    const creatorSubscriberStatus = await creatorContract.subscribers(await signer.getAddress()) //0xaeAedC36bE97fbeabA6E55Ef9e18bebad963335a

    if(creatorSubscriberStatus[2] === 0) {
      console.log('USER NOT A SUBSCRIBER')
    } else if (creatorSubscriberStatus[2] === 1) {
      console.log('USER IS PENDING SUBSCRIBER')
    } else if (creatorSubscriberStatus[2] === 2) {
      console.log('USER IS PENDING UNSUBSCRIBER')
    } else if (creatorSubscriberStatus[2] === 3) {
      console.log('USER IS PENDING SUBSCRIBER')
    }

    metadataURL = await creatorContract.description();
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
    sf = new SuperfluidSDK(ethersProvider, 'v1', '80001', ['fUSDC']);
    await sf.initialize();

    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    usdc = new Contract(await sf.tokens.fUSDC.address, Superfluid.ABI.TestToken, signer);
    usdcx = new Contract(await sf.tokens.fUSDCx.address, Superfluid.ABI.ISuperToken, signer);

    //usdcx = await sf.createERC20Wrapper(usdc);
    //think I just need to use the address still so I can still get the ethers contract

    usdcBalance = formatEther(await usdc.balanceOf(subscriberAddress));
    usdcxBalance = formatEther(await usdcx.balanceOf(subscriberAddress));
    usdcApproved = formatEther(await usdc.allowance(subscriberAddress, usdc.address));
  }

  async function mintUSDC() {
    await usdc.mint(subscriberAddress, parseUnits('1000', 18), {from: subscriberAddress});
    usdcBalance = formatEther(await usdc.balanceOf(subscriberAddress));
  }

  async function convertUSDCx() {
    await usdcx.upgrade(parseEther('900'));
    usdcxBalance = formatUnits(await usdcx.balanceOf(subscriberAddress), 18);
  }

  async function approveUSDC() {
    await usdc
      .approve(usdcx.address, parseUnits('900', 18), {
        from: subscriberAddress,
      })
      .then(async (i) => (usdcApproved = await usdc.allowance(subscriberAddress, usdcx.address)));
  }

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

    console.log(creatorContract.subscribers(subscriberAddress));
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

  async function sendTransaction({subscriberAddress, req, sig, signatureType}){
      // let params = [req, sig]
      let params = [req, ethers.utils.joinSignature(sig)]
      try {
        fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key" : 'XcDSlwY22.5ff169a7-acf2-4005-a06c-d3c2ea2ea1e1',
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "to": sf.host.address,
            "apiId": 'f4570249-e456-4852-a392-8276f58ebcc5',
            "params": params,
            "from": subscriberAddress,
            "signatureType": signatureType
          })
        })
        .then(response=>response.json())
        .then(function(result) {
          console.log('transaction hash ' + result.txHash);
        })
        // once you receive transaction hash you can wait for mined transaction receipt here
        // using Promise in web3 : web3.eth.getTransactionReceipt
        // or using ethersProvider event emitters
	      .catch(function(error) {
	        console.log(error)
	      });
      } catch (error) {
        console.log(error);
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
            <Button class="mt-3" on:click={approveUSDC}>approve 900 usdc</Button>
            <Button class="mt-3" on:click={convertUSDCx}>convert 900 usdc</Button>
            <!-- <Button class="mt-3" on:click={testStream}>Directly stream test</Button> -->
            <Button class="mt-3" on:click={getStreams}>Get stream infos in console</Button>
          </div>
        </div>a
      </section>
    {/if}
  </SearchBackground>
</WalletAccess>
