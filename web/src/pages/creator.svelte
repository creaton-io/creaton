<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Web3 from "web3-utils";
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';

  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import {abi as creatorABI} from '../Creator.json';

  import {wallet, flow} from '../stores/wallet';
  import {onMount} from 'svelte';

  import {SuperfluidSDK} from '../js-sdk/Framework';
  import Superfluid from '../build/abi';
  import {parseEther, formatEther, parseUnits, formatUnits} from '@ethersproject/units';

  import {TextileStore} from '../stores/textileStore';

  import {BiconomyHelper} from '../biconomy-helpers/biconomyForwarderHelpers';
  import {Web3Provider} from "@ethersproject/providers";

  import {Buffer} from 'buffer';
  global.Buffer = Buffer;

  let userRole;
  let subscriptionStatus;

  // Biconomy 
  let bh;
  let ethersProvider;
  let signer;
  let userAddress;
  const matickId = 80001;
  const goerliId = 5;

  // Textile
  const textile: TextileStore = new TextileStore();

  // Creator
  let creatorContract;
  let creatorAddress;
  let contractAddress;
  let contractDescription;
  let subscriptionPrice;
  let currentBalance;
  let isSubscribed;
  let contents = [];

  // Superfluid

  let sf;
  let usdc;
  let usdcx;
  let app;
  let usdcBalance;
  let usdcxBalance;


  let subscriberAddress, nuPassword;
  let subscriberPubKeySig,subscriberPubKeyEnv;

  const APP_ADDRESS = '0x46113fF0F86A2c27151F43e7959Ff60DebC18dB1';
  const MINIMUM_GAME_FLOW_RATE = '3858024691358';
  //TODO: try this with hardhat
  //const LotterySuperApp = TruffleContract(require("./LotterySuperApp.json"));

  if (typeof window !== 'undefined') {
    contractAddress = window.location.pathname.split('/')[2];
    contractAddress = Web3.toChecksumAddress(contractAddress);
  }

  onMount(async () => {
    if (wallet.provider) {
      loadBiconomy();
      deployTextile();
      loadCreatorData();
    } else {
      flow.execute(async () => {
        loadBiconomy();
        deployTextile();
        loadCreatorData();
      });
    }
    if (userRole == 'SUBSCRIBER'){
      loadSuperFluid();
    }
  });

  async function loadBiconomy() {
    bh = new BiconomyHelper();
    ethersProvider = new Web3Provider(window['ethereum']);
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
  }

  async function deployTextile() {
    const setup = await textile.authenticate();
  }

  async function loadCreatorData() {
    creatorContract = await new Contract(contractAddress, creatorABI, signer);
    await getContent();
    creatorAddress = await creatorContract.creator();
    contractDescription = await creatorContract.description();
    subscriptionPrice = await creatorContract.subscriptionPrice();

    if (userAddress == creatorAddress){
      userRole = 'CREATOR';
    } else {
      userRole = 'SUBSCRIBER';
      // TODO read from the contract see if in subscriber list

      // [currentBalance, isSubscribed] = await creatorContract.currentBalance(wallet.address);
      // if (isSubscribed) {
      //   subscriptionStatus = 'SUBSCRIBED';
      // } else {
      //   subscriptionStatus = 'UNSUBSCRIBED';
      // }

    }
    
    // TODO add this event
    // creatorContract.on('NewSubscriber', (...response) => {
    //   const [address, balance] = response;
    //   if (address === wallet.address) {
    //     subscriptionStatus = 'SUBSCRIBED';
    //     currentBalance = balance.toNumber();
    //   }
    // });
  }

  async function getContent() {
    let contentsString = await creatorContract.getAllMetadata();
    contents = [];
    for (let c of contentsString) {
      contents.push(JSON.parse(c));
    }
  }

  async function loadSuperFluid() {
    sf = new SuperfluidSDK(ethersProvider, 'v1', '80001', ['fUSDC']);
    await sf.initialize();

    const usdcAddress = await sf.resolver.get('tokens.fUSDC');
    usdc = new Contract(await sf.tokens.fUSDC.address, Superfluid.ABI.TestToken, signer);
    usdcx = new Contract(await sf.tokens.fUSDCx.address, Superfluid.ABI.ISuperToken, signer);

    usdcBalance = formatEther(await usdc.balanceOf(subscriberAddress));
    usdcxBalance = formatEther(await usdcx.balanceOf(subscriberAddress));

    // TODO this wasn't working
    // usdcApproved = formatEther(await usdc.allowance(subscriberAddress, usdc.address));
  }

  async function support() {
    usdcBalance = await usdc.balanceOf($wallet.address);
    usdcApproved = await usdcx.balanceOf($wallet.address);
    var call;
    if (usdcApproved < 2)
      call = [
        [
          2, // upgrade 100 daix to play the game
          usdcx.address,
          sf.interface._encodeParams(['uint256'], [parseEther('100').toString()]),
        ],
        [
          0, // approve collateral fee
          usdcx.address,
          sf.interface._encodeParams(['address', 'uint256'], [APP_ADDRESS, parseEther('1').toString()]),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          sf.interface.encodeFunctionData('collateral', ['0x']),
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interface.encodeFunctionData(
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
          sf.web3.eth.abi.encodeParameters(['address', 'uint256'], [APP_ADDRESS, parseEther('1').toString()]),
        ],
        [
          5, // callAppAction to collateral
          app.address,
          app.collateral('0x').encodeABI(),
        ],
        [
          4, // create constant flow (10/mo)
          sf.agreements.cfa.address,
          sf.interface.encodeFunctionData(
            'createFlow',
            [usdcx.address, app.address],
            MINIMUM_GAME_FLOW_RATE.toString(),
            '0x'
          ),
        ],
      ];
    console.log('this is the batchcall: ', call);
    await sf.host.batchCall(call);
  }

  async function mintUSDC() {
    //mint some dai here!  100 default amount
    await usdc.mint($wallet.address, parseEther('100'), {from: $wallet.address});
    usdcBalance = await usdc.balanceOf($wallet.address);
  }

  async function approveUSDC() {
    //approve unlimited please
    await usdc
      .approve(usdcx.address, '115792089237316195423570985008687907853269984665640564039457584007913129639935', {
        from: $wallet.address,
      })
      .then(async (i) => (usdcApproved = await usdc.allowance($wallet.address, usdcx.address)));
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


  async function download(path) {
    console.log("download clicked");
    await textile.getTmapFromCreator(contractAddress);
    const decrypted = await textile.decryptFile(path, contractAddress, subscriberAddress, nuPassword);
    await downloadBlob(decrypted);
    // let mdata = await creatorContract.getMetadataURL();
    // console.log(mdata);
  }
  function downloadURL(data, fileName) {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }
  function downloadBlob(decrypted: ArrayBuffer) {
    const blob = new Blob([new Uint8Array(decrypted)], {
      type: 'image/jpg',
    });
    const url = window.URL.createObjectURL(blob);
    downloadURL(url, 'whatever');
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  function support2() {
    subscriptionStatus = 'SUBSCRIBED';
    loadKeyPairs()
  }

  async function loadKeyPairs(){
    let password = '';
    let data={password, userAddress}
    let url = new URL("http://127.0.0.1:5000/loadKeyPair");
    Object.keys(data).forEach(key => url.searchParams.append(key, data[key]))
    fetch(url.toString())
    .then(function(response) {
        if (response.status >= 400) {
            throw new Error("Bad response from server");
        }
        return response.json();
    })
    .then(function(pairs) {
        subscriberPubKeySig=pairs.pubkey_sig;
        subscriberPubKeyEnv=pairs.pubkey_enc;
    });
  }

  function copyToClipboard(val) {
    // Create a "hidden" input
    var aux = document.createElement('input');

    // Assign it the value of the specified element
    aux.setAttribute('value', val);

    // Append it to the body
    document.body.appendChild(aux);

    // Highlight its content
    aux.select();

    // Copy the highlighted text
    document.execCommand('copy');

    // Remove it from the body
    document.body.removeChild(aux);
  }
</script>


<WalletAccess />
  <section class="py-8 px-4 text-center max-w-4xl mx-auto">
    {#if !creator || !title || !avatarURL || !subscriptionPrice}
      <div>Fetching creator...</div>
    {:else}
      <h3 class="text-4xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">{title}</h3>
      <p class="mb-2 text-base leading-6 text-gray-500 dark:text-gray-300 text-center">{creator}</p>
      <img class="w-full" src={avatarURL} alt={title} />
      {#if subscriptionStatus === 'UNSUBSCRIBED'}
        <Button class="mt-3" on:click={support2}>Subscribe - ${subscriptionPrice}</Button>
      {:else if subscriptionStatus === 'PENDING'}
        <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">Subscription pending...</p>
      {:else}
        <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">Subscription balance: ${currentBalance}</p>
        <label for="description">NuCypher Password: </label>
        <Input type="text" placeholder="Password" className="field" bind:value={nuPassword} />
        <br />
        <div class="py-4 dark:bg-black bg-white">
          <div class="mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {#each contents as content, index}
                <h3 class="text-1xl leading-normal font-medium text-gray-900 dark:text-gray-500">{index + 1}</h3>
                <h3 class="text-1xl leading-normal font-medium text-gray-900 dark:text-gray-500">{content.name}</h3>
                <h3
                  title={encodeURI(content.description)}
                  class="text-1xl mt-3 leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">
                  Description:
                  {content.description}
                </h3>
                <h3
                  title={encodeURI(content.ipfs)}
                  class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300 truncate">
                  <Button class="mt-3" on:click={() => copyToClipboard(content.ipfs)}>Get</Button>
                  {content.ipfs}
                </h3>
                <Button class="mt-3" on:click={() => download(content.ipfs)}>Download</Button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
      {#if subscriberPubKeySig !== null}
        <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">Please relay your public keys to Creator:</p>
        <ul>
          <li>{subscriberPubKeySig}</li>
          <li>{subscriberPubKeyEnv}</li>
        </ul>
      {/if}
      <br />
      <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">usdc balance: ${usdcBalance}</p>
      <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">approved usdc balance: ${usdcApproved}</p>
      <Button class="mt-3" on:click={mintUSDC}>mint 100 usdc</Button>
      <Button class="mt-3" on:click={approveUSDC}>approve a lot of usdc</Button>
    {/if}
  </section>
