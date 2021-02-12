<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Web3 from 'web3-utils';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import Blockie from '../components/Blockie.svelte';
  import {test} from 'creaton-common';
  import {logs} from 'named-logs';
  import {abi as creatorABI} from '../Creator.json';
  import {wallet, balance, flow, chain} from '../stores/wallet';
  import {identity} from 'svelte/internal';
  import {TextileStore} from '../stores/textileStore';
  import {Buffer} from 'buffer';
  import {onMount} from 'svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';

  import {BiconomyHelper} from '../biconomy-helpers/biconomyForwarderHelpers';
  import {Web3Provider} from "@ethersproject/providers";
  import {ethers} from "ethers";
  import {defaultAbiCoder, Interface } from '@ethersproject/abi';
  // import '@metamask/legacy-web3';

  global.Buffer = Buffer;

  const textile: TextileStore = new TextileStore();
  let contractAddress, creatorAddress;
  let file, description, nuPassword;

  // Biconomy 
  let bh;
  let ethersProvider;
  let signer;
  let userAddress;
  const maticId = 80001;
  const goerliId = 5;

  let adminContract;

  if (typeof window !== 'undefined') {
    contractAddress = '0x7B221cD5fd855b3F6Bb29a770DA44D1eFdcdb153';
    // contractAddress = Web3.toChecksumAddress('0x067e30b82d1adc78d8b35cc93950b4501f82da5a');
    // console.log(contractAddress)
  }

  onMount(async () => {
    if (wallet.provider) {
      deployBiconomy();
      await loadCreatorData();
    } else {
      flow.execute(async () => {
        deployBiconomy();
        await loadCreatorData();
      });
    }
    await deployTextile();
    // let socket = window['socket'];
    // socket.on('connect', function () {
    //   console.log('client connected!');
    // });
    // socket.on('sign_broad_req', async function (data) {
    //   data = decodeURIComponent(data).replaceAll('+', ' ');
    //   data = JSON.parse(data);
    //   console.log('new request for tx signing!');
    //   console.log(data);
    //   await send(data);
    // });
    // socket.on('sign_req', async function (data) {
    //   data = decodeURIComponent(data).replaceAll('+', ' ');
    //   data = JSON.parse(data);
    //   console.log('new request for msg signing!');
    //   console.log(data);
    //   await sign(data);
    // });
    // socket.on('disconnect', function () {
    //   console.log('client disconnected!');
    // });
    // setTimeout(() => {
    //   console.log('here we are!!!');
    //   window['socket'].emit('event', 'sample!');
    // }, 1000);
    // if (typeof window['ethereum'] !== 'undefined') {
    //   ethereum = window['ethereum'];
    //   web3 = window['web3'];
    // }
  });

  async function deployTextile() {
    const setup = await textile.authenticate();
  }

  async function loadCreatorData() {
    adminContract = new Contract(contracts.CreatonAdmin.address,
              contracts.CreatonAdmin.abi, signer);
    // contractAddress = Web3.toChecksumAddress('0x067e30b82d1adc78d8b35cc93950b4501f82da5a');
    // console.log('creator address:', creatorAddress);
    // console.log("contract address:", contractAddress);
  }

  async function deployBiconomy() {
    bh = new BiconomyHelper();
    ethersProvider = new Web3Provider(window['ethereum']);
    console.log('hello!')
    console.log(ethersProvider);
    signer = ethersProvider.getSigner();
    creatorAddress = await signer.getAddress();
    console.log(creatorAddress);
    // biconomy = new Biconomy(window['ethereum'],{apiKey: '2YCO6NaKI.da767985-4e30-448e-a781-561d92bc73bf', debug: true});
    // ethersProvider = new Web3Provider(biconomy);
    // biconomy.onEvent(biconomy.READY, () => {
    //   console.log("biconomy ready");
    //   signer = ethersProvider.getSigner();
    // }).onEvent(biconomy.ERROR, (error, message) => {
    //   console.log("biconomy not ready");
    // });
  }

  async function upload() {
    const content = await file.files[0];
    const encFile = await textile.uploadFile(content, contractAddress, creatorAddress, nuPassword);
    const metadata = {
      name: encFile.encryptedFile.name,
      type: encFile.encryptedFile.type,
      description: description,
      date: encFile.encryptedFile.date,
      ipfs: encFile.encryptedFile.ipfsPath,
    };
    console.log(metadata.ipfs);
    let ccinterFace = new Interface(creatorABI);
    console.log('got here after interface');
    let creatorContractEncoded = defaultAbiCoder.encode(['bytes'], [ccinterFace.encodeFunctionData('upload', [JSON.stringify(metadata)])]);
    console.log('got here after encoding 1');
    let addressEncoded = defaultAbiCoder.encode(['bytes'], [defaultAbiCoder.encode(['address'], [creatorAddress])]);
    console.log('got here after encoding 2');
    let {data} = await adminContract.populateTransaction.forwardMetaTx(contractAddress, creatorContractEncoded, addressEncoded);
    console.log('got here after encoding 3');
    // const receipt = await creatorContract.setMetadataURL(JSON.stringify(metadata));
    // console.log(receipt);
    let forwarder = await bh.getBiconomyForwarderConfig(maticId);
    console.log(forwarder);
    let forwarderContract = new Contract(
          forwarder.address,
          forwarder.abi,
          signer
        );
    let gasLimit = await ethersProvider.estimateGas({
          to: adminContract.address,
          from: creatorAddress,
          data: data
        });

    const batchNonce = await forwarderContract.getNonce(creatorAddress,0);
    const gasLimitNum = Number(gasLimit);
    console.log('forward request?')
    const req = await bh.buildForwardTxRequest({account:creatorAddress,to:contracts.CreatonAdmin.address, gasLimitNum, batchId:0,batchNonce,data});
    console.log('tx req', req);
    const hashToSign =  await bh.getDataToSignForPersonalSign(req);
    signer.signMessage(ethers.utils.arrayify(hashToSign))
        .then(function(sig){
          console.log('signature ' + sig);
          // make API call
          sendTransaction({creatorAddress, req, sig, signatureType:"PERSONAL_SIGN"});
        })
        .catch(function(error) {
	        console.log(error)
        });
  }

  async function sendTransaction({creatorAddress, req, sig, signatureType}){
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
            "to": adminContract.address,
            "apiId": 'aad856dd-8d00-410d-a315-2253d93133a1',
            "params": params,
            "from": creatorAddress,
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

  // async function grant() {
  //   let pubkeys_sig = JSON.stringify([sigKey, sigKey2]);
  //   let pubkeys_enc = JSON.stringify([pubKey, pubKey2]);
  //   const data = {
  //     subscriber_pubkeys_sig: pubkeys_sig,
  //     subscriber_pubkeys_enc: pubkeys_enc,
  //     label: contractAddress,
  //     address: creatorAddress,
  //     password: nuPassword,
  //   };
  //   const form_data = new FormData();
  //   for (const key in data) {
  //     form_data.append(key, data[key]);
  //   }
  //   console.log('sending through socket');
  //   await window['socket'].emit('grant_signer');
  //   const response = await fetch('http://127.0.0.1:5000/grant', {method: 'POST', body: form_data});
  //   const tmap_string = await response.text();
  //   const tmap = JSON.parse(tmap_string);
  //   console.log(tmap['tmap']);
  //   textile.sendTmapToSubscribers(textilePubKey, contractAddress, tmap['tmap']);
  // }

  // async function send(data: any) {
  //   console.log('sending tx request ...');
  //   console.log(data);
    // let batch = web3.createBatch();
    // // let hash: {[data: string]: string;} = {};
    // let hash = [];
    // data.forEach((element) => {
    //   element = JSON.parse(element);
    //   console.log(element['data']);
    //   let tx = web3.eth.sendTransaction.request(
    //     {
    //       from: element['from'],
    //       to: element['to'],
    //       gas: element['gas'],
    //       gasPrice: element['gasPrice'],
    //       value: element['value'],
    //       data: element['data'],
    //     },
    //     (err, res) => {
    //       if (err == null) {
    //         window['socket'].emit('sign_broad_res', JSON.stringify({data: element['data'], txHash: res}));
    //       }
    //     }
    //   );
    //   batch.add(tx);
    // });
    // batch.execute();
    // console.log('resulting hashes');
    // console.log(hash);
  //   let params= [
  //     {
  //       from: data['from'],
  //       to: data['to'],
  //       gas: data['gas'],
  //       gasPrice: data['gasPrice'],
  //       value: data['value'],
  //       data: data['data'],
  //     }
  //   ];
  //   ethereum.request({
  //     method: 'eth_sendTransaction',
  //     params,
  //   })
  //   .then((result) => {
  //     console.log(result)
  //     window['socket'].emit('sign_broad_res', result);
  //     console.log(result)
  //   })
  //   .catch((error) => {
  //     // If the request fails, the Promise will reject with an error.
  //   });
  // }

  // async function sign(msg: any) {
  //   console.log('signing request ... ');
  //   console.log(msg);
  //   let params= [
  //       msg['address'],
  //       msg['message']
  //   ];
  //   ethereum.request({
  //       method: 'personal_sign',
  //       params,
  //   })
  //   .then((result) => {
  //       window['socket'].emit('sign_res', result);
  //       console.log(result);
  //   })
  //   .catch((error) => {
  //       console.log("sign error")
  //       console.log(error);
  //   });
  // }
</script>

<style>
  ::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    color: black;
    opacity: 0.5;
  }
  ::-moz-placeholder {
    /* Firefox 19+ */
    color: black;
    opacity: 0.5;
  }
  :-ms-input-placeholder {
    /* IE 10+ */
    color: black;
    opacity: 0.5;
  }
  :-moz-placeholder {
    /* Firefox 18- */
    color: black;
    opacity: 0.5;
  }
  .field-row {
    @apply mt-3 flex items-center;
  }
  label {
    @apply mr-3;
  }

  input {
    @apply p-1 border-gray-300 rounded-md border flex-grow;
  }
</style>

<WalletAccess />
<section class="py-8 px-4 text-center">
  <form class="content flex flex-col max-w-lg mx-auto">
    <div class="field-row">
      <label for="avatar">Select file:</label>
      <input id="avatar" bind:this={file} type="file" placeholder="File" className="visually-hidden" />
    </div>
    <div class="field-row">
      <label for="description">Description: </label>
      <Input type="text" placeholder="My recent trip to Norway!" className="field" bind:value={description} />
    </div>
    <div class="field-row">
      <label for="description">NuCypher Password: </label>
      <Input type="text" placeholder="Password" className="field" bind:value={nuPassword} />
    </div>
    <Button class="mt-3" on:click={upload}>Upload</Button>

    <!-- <br />
    <div class="field-row">
      <label for="path-url">Subscriber Signing Key: </label>
      <Input type="text" placeholder="Signing Key" className="field" bind:value={sigKey} />
    </div>
    <div class="field-row">
      <label for="pubkey-url">Subscriber Public key: </label>
      <Input type="text" placeholder="Public Key" className="field" bind:value={pubKey} />
    </div>
    <div class="field-row">
      <label for="description">NuCypher Password: </label>
      <Input type="text" placeholder="Password" className="field" bind:value={nuPassword} />
    </div>
    <div class="field-row">
      <label for="description">Textile Public Key: </label>
      <Input type="text" placeholder="Textile Key" className="field" bind:value={textilePubKey} />
    </div>
    <Button class="mt-3" on:click={grant}>Grant Access to Subscriber</Button> -->

    <!-- <br />
    <div class="field-row">
      <label for="dpath-url">Download path</label>
      <Input type="text" placeholder="Download path" className="field" bind:value={downloadPath} />
    </div>
    <Button class="mt-3" on:click={() => download('/ipfs/bafkreiatbl2cne7potna4q26xxjjbvcoiztd6fvr6mje2622gt455lq34m')}>
      Download
    </Button> -->
  </form>

  // <!-- <br />
  // <Button class="mt-3" on:click={getContent}>Show Contents</Button> -->

  // <!-- <div class="py-4 dark:bg-black bg-white">
  //   <div class="mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
  //     <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  //       {#if contentsShow}
  //         {#each contents as content, index}
  //           <h3 class="text-1xl leading-normal font-medium text-gray-900 dark:text-gray-500">{index}</h3>
  //           <h3 class="text-1xl leading-normal font-medium text-gray-900 dark:text-gray-500">{content.name}</h3>
  //           <h3 class="text-1xl mt-3 leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">
  //             Description:
  //             {content.description}
  //           </h3>
  //           <h3 class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300">{content.ipfs}</h3>
  //         {/each}
  //       {/if}
  //     </div>
  //   </div>
  // </div> -->
</section>
