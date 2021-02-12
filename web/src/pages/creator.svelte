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
  import {ethers} from "ethers";

  import {Buffer} from 'buffer';
  global.Buffer = Buffer;

  let userRole;
  let subscriptionStatus;

  // Biconomy 
  let bh;
  let ethersProvider;
  let signer;
  let userAddress;
  const maticId = 80001;
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
  let usdcApproved;

  // NuCypher

  let subscriberAddress, nuPassword;
  let subscriberPubKeySig, subscriberPubKeyEnc;

  // Page
  let ethereum;
  let web3;

  const APP_ADDRESS = '0x46113fF0F86A2c27151F43e7959Ff60DebC18dB1';
  const MINIMUM_GAME_FLOW_RATE = '3858024691358';

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
    let socket = window['socket'];
    socket.on('connect', function () {
      console.log('client connected!');
    });
    socket.on('sign_broad_req', async function (data) {
      data = decodeURIComponent(data).replaceAll('+', ' ');
      data = JSON.parse(data);
      console.log('new request for tx signing!');
      console.log(data);
      await send(data);
    });
    socket.on('sign_req', async function (data) {
      data = decodeURIComponent(data).replaceAll('+', ' ');
      data = JSON.parse(data);
      console.log('new request for msg signing!');
      console.log(data);
      await sign(data);
    });
    socket.on('disconnect', function () {
      console.log('client disconnected!');
    });
    setTimeout(() => {
      console.log('here we are!!!');
      window['socket'].emit('event', 'sample!');
    }, 1000);
    if (typeof window['ethereum'] !== 'undefined') {
      ethereum = window['ethereum'];
      web3 = window['web3'];
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

  async function send(data: any) {
    console.log('sending tx request ...');
    console.log(data);
    let params= [
      {
        from: data['from'],
        to: data['to'],
        gas: data['gas'],
        gasPrice: data['gasPrice'],
        value: data['value'],
        data: data['data'],
      }
    ];
    ethereum.request({
      method: 'eth_sendTransaction',
      params,
    })
    .then((result) => {
      console.log(result)
      window['socket'].emit('sign_broad_res', result);
      console.log(result)
    })
    .catch((error) => {
      // If the request fails, the Promise will reject with an error.
    });
  }

  async function sign(msg: any) {
    console.log('signing request ... ');
    console.log(msg);
    let params= [
        msg['address'],
        msg['message']
    ];
    ethereum.request({
        method: 'personal_sign',
        params,
    })
    .then((result) => {
        window['socket'].emit('sign_res', result);
        console.log(result);
    })
    .catch((error) => {
        console.log("sign error")
        console.log(error);
    });
  }

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
                ['string', 'string', 'string'],
                ['hello', 'world', textile.identity.public.toString()]
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
                ['string', 'string', 'string'],
                [subscriberPubKeySig, subscriberPubKeyEnc, textile.identity.public.toString()]
              )
            ]
          ),
        ],
      ];

    console.log('this is the batchcall: ', call);
    let {data} = await sf.host.populateTransaction.biconomyBatchCall(call);
    let forwarder = await bh.getBiconomyForwarderConfig(maticId);
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

    async function grant() {
    let pubkeys_sig = JSON.stringify([sigKey]);
    let pubkeys_enc = JSON.stringify([pubKey]);
    const data = {
      subscriber_pubkeys_sig: pubkeys_sig,
      subscriber_pubkeys_enc: pubkeys_enc,
      label: contractAddress,
      address: creatorAddress,
      password: nuPassword,
    };
    const form_data = new FormData();
    for (const key in data) {
      form_data.append(key, data[key]);
    }
    console.log('sending through socket');
    await window['socket'].emit('grant_signer');
    const response = await fetch('http://127.0.0.1:5000/grant', {method: 'POST', body: form_data});
    const tmap_string = await response.text();
    const tmap = JSON.parse(tmap_string);
    console.log(tmap['tmap']);
    textile.sendTmapToSubscribers(textilePubKey, contractAddress, tmap['tmap']);
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
        subscriberPubKeyEnc=pairs.pubkey_enc;
    });
  }

  async function mintUSDC() {
    await usdc.mint(userAddress, parseUnits('1000', 18), {from: userAddress});
    usdcBalance = formatEther(await usdc.balanceOf(userAddress));
  }

  async function convertUSDCx() {
    await usdcx.upgrade(parseEther('900'));
    usdcxBalance = formatUnits(await usdcx.balanceOf(userAddress), 18);
  }

  async function approveUSDC() {
    await usdc
      .approve(usdcx.address, parseUnits('900', 18), {
        from: userAddress,
      })
      .then(async (i) => (usdcApproved = await usdc.allowance(userAddress, usdcx.address)));
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
          <li>{subscriberPubKeyEnc}</li>
        </ul>
      {/if}
      <br />
      <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">usdc balance: ${usdcBalance}</p>
      <p class="mt-4 text-2xl leading-6 dark:text-gray-300 text-center">approved usdc balance: ${usdcApproved}</p>
      <Button class="mt-3" on:click={mintUSDC}>mint 100 usdc</Button>
      <Button class="mt-3" on:click={approveUSDC}>approve a lot of usdc</Button>
    {/if}
  </section>
