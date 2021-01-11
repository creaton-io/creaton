<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Web3 from "web3-utils";
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import Blockie from '../components/Blockie.svelte';
  import {test} from 'creaton-common';
  import {logs} from 'named-logs';
  import {wallet, balance, flow, chain} from '../stores/wallet';
  import {identity} from 'svelte/internal';
  import {TextileStore} from '../stores/textileStore';
  import {Buffer} from 'buffer';
  import {onMount} from 'svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';
  import "@metamask/legacy-web3";

  global.Buffer = Buffer;

  const textile: TextileStore = new TextileStore();
  let creatorName: string = '';
  let subscriptionPrice: number;
  let ethereum, web3;
  let contractAddress, creatorAddress, creatorContract;
  let file, description, nuPassword;
  let sigKey, pubKey, textilePubKey, sigKey2, pubKey2, textilePubKey2;
  let contents = [];
  let contentsShow = false;

  if (typeof window !== 'undefined') {
    contractAddress = window.location.pathname.split('/')[2];
    contractAddress = Web3.toChecksumAddress(contractAddress);
    // contractAddress = Web3.toChecksumAddress('0x067e30b82d1adc78d8b35cc93950b4501f82da5a');
    // console.log(contractAddress)
  }

  async function deployTextile() {
    const setup = await textile.authenticate();
    alert("you're good");
  }

  async function loadCreatorData() {
    creatorContract = await new Contract(contractAddress, contracts.Creator.abi, wallet.provider.getSigner());
    let accounts = await wallet.provider.listAccounts();
    creatorAddress = accounts[0];
    // contractAddress = Web3.toChecksumAddress('0x067e30b82d1adc78d8b35cc93950b4501f82da5a');
    console.log("creator address:", creatorAddress);
    // console.log("contract address:", contractAddress);
  }

  async function getContent() {
    let contentsString = await creatorContract.getAllMetadata();
    contents = [];
    for (let c of contentsString) {
      contents.push(JSON.parse(c));
    }
    contentsShow = !contentsShow;
  }

  onMount(async () => {
    if (wallet.provider) {
      await loadCreatorData();
    } else {
      flow.execute(async () => {
        await loadCreatorData();
      });
    }
    await deployTextile();
    let socket = window['socket']
      socket.on('connect', function(){ console.log('client connected!')});
      socket.on('sign_broad_req', async function(data){
          data = decodeURIComponent(data).replaceAll('+',' ');
          data = JSON.parse(data);
          console.log('new request for tx signing!');
          console.log(data);
          await send(data)
      });
      socket.on('sign_req', async function(data){
          data = decodeURIComponent(data).replaceAll('+',' ');
          data = JSON.parse(data);
          console.log('new request for msg signing!');
          console.log(data);
          await sign(data)
      });
      socket.on('disconnect', function(){console.log('client disconnected!')});
      setTimeout(()=>{console.log("here we are!!!");window['socket'].emit('event', 'sample!');},1000);
      if (typeof window['ethereum'] !== 'undefined') {
        ethereum = window['ethereum'];
        web3 = window['web3'];
      }
  });

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
    const receipt = await creatorContract.setMetadataURL(JSON.stringify(metadata));
    console.log(receipt);
  }

  async function grant() {
    let pubkeys_sig = JSON.stringify([sigKey, sigKey2]);
    let pubkeys_enc = JSON.stringify([pubKey, pubKey2]);
    const data = {subscriber_pubkeys_sig: pubkeys_sig, subscriber_pubkeys_enc: pubkeys_enc, label: contractAddress, address: creatorAddress, password: nuPassword};
    const form_data = new FormData();
    for (const key in data) {
      form_data.append(key, data[key]);
    }
    console.log('sending through socket')
    await window['socket'].emit('grant_signer');
    const response = await fetch('http://127.0.0.1:5000/grant', {method: 'POST', body: form_data});
    const tmap_string = await response.text();
    const tmap = JSON.parse(tmap_string);
    console.log(tmap['tmap']);
    textile.sendTmapToSubscribers(textilePubKey, contractAddress, tmap['tmap']);
  }

  async function send(data: any) {
    console.log(data);
    let batch = web3.createBatch();
    // let hash: {[data: string]: string;} = {};
    let hash = [];
    data.forEach(element => {
      element = JSON.parse(element);
      console.log(element['data']);
      let tx = web3.eth.sendTransaction.request({
        from: element['from'],
        to: element['to'],
        gas: element['gas'],
        gasPrice: element['gasPrice'],
        value: element['value'],
        data: element['data'],
      }, (err, res) => {
        if (err == null){
          window['socket'].emit('sign_broad_res', JSON.stringify({data: element['data'], txHash: res}));
        }
      });
      batch.add(tx);
    });
    batch.execute();
    console.log('resulting hashes');
    console.log(hash);
    // let params= [
    //   {
    //     from: data['from'],//'0x8F9A150adb245e8e460760Ed1BFd3C026a0457db',
    //     to: data['to'],//'0x328BDfdD563f67a47c2757E5fD0298AD86F447c0',
    //     gas: data['gas'],//, // 30400
    //     gasPrice: data['gasPrice'],//, // 10000000000000
    //     value: data['value'],//'0x0e9234569184e72a', // 2441406250
    //     data: data['data'],
    //   },
    //   {
    //     from: '0xcDde21d9eE3deC9e00da930ce40e5BEceDE46799',
    //     to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
    //     value: '0x29a2241af62c0000',
    //     gasPrice: '0x09184e72a000',
    //     gas: '0x2710',
    //   },
    // ];
    // ethereum.request({
    //   method: 'eth_sendTransaction',
    //   params,
    // })
    // .then((result) => {
    //   console.log(result)
    //   window['socket'].emit('sign_broad_res', result);
    //   console.log(result)
    // })
    // .catch((error) => {
    //   // If the request fails, the Promise will reject with an error.
    // });
  }

  async function sign(msg: any) {
    console.log('batch signing request ... ')
    console.log(msg);
      // let params= [
      //     msg['address'],
      //     msg['message']
      // ];
      // ethereum.request({
      //     method: 'personal_sign',
      //     params,
      // })
      // .then((result) => {
      //     window['socket'].emit('sign_res', result);
      //     console.log(result);
      // })
      // .catch((error) => {
      //     console.log("sign error")
      //     console.log(error);
      // });
  }


  // async function download(path) {
  //   await textile.getKeysFromCreator();
  //   const decrypted = await textile.decryptFile(path);
  //   await downloadBlob(decrypted);
  //   let mdata = await creatorContract.getMetadataURL();
  //   console.log(mdata);
  // }
  // function downloadURL(data, fileName) {
  //   const a = document.createElement('a');
  //   a.href = data;
  //   a.download = fileName;
  //   document.body.appendChild(a);
  //   a.style.display = 'none';
  //   a.click();
  //   a.remove();
  // }
  // function downloadBlob(decrypted: ArrayBuffer) {
  //   const blob = new Blob([new Uint8Array(decrypted)], {
  //     type: 'image/jpg',
  //   });
  //   const url = window.URL.createObjectURL(blob);
  //   downloadURL(url, 'whatever');
  //   setTimeout(() => window.URL.revokeObjectURL(url), 1000);
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

    <br />
    <div class="field-row">
      <label for="path-url">Subscriber Signing Key: </label>
      <Input type="text" placeholder="Signing Key" className="field" bind:value={sigKey} />
      <br/>
      <Input type="text" placeholder="Signing Key" className="field" bind:value={sigKey2} />
    </div>
    <div class="field-row">
      <label for="pubkey-url">Subscriber Public key: </label>
      <Input type="text" placeholder="Public Key" className="field" bind:value={pubKey} />
      <br/>
      <Input type="text" placeholder="Signing Key" className="field" bind:value={pubKey2} />
    </div>
    <div class="field-row">
      <label for="description">NuCypher Password: </label>
      <Input type="text" placeholder="Password" className="field" bind:value={nuPassword} />
    </div>
    <div class="field-row">
      <label for="description">Textile Public Key: </label>
      <Input type="text" placeholder="Textile Key" className="field" bind:value={textilePubKey} />
      <br/>
      <Input type="text" placeholder="Textile Key" className="field" bind:value={textilePubKey2} />
    </div>
    <Button class="mt-3" on:click={grant}>Grant Access to Subscriber</Button>

    <!-- <br />
    <div class="field-row">
      <label for="dpath-url">Download path</label>
      <Input type="text" placeholder="Download path" className="field" bind:value={downloadPath} />
    </div>
    <Button class="mt-3" on:click={() => download('/ipfs/bafkreiatbl2cne7potna4q26xxjjbvcoiztd6fvr6mje2622gt455lq34m')}>
      Download
    </Button> -->
  </form>

  <!-- <br />
  <Button class="mt-3" on:click={getContent}>Show Contents</Button> -->

  <!-- <div class="py-4 dark:bg-black bg-white">
    <div class="mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#if contentsShow}
          {#each contents as content, index}
            <h3 class="text-1xl leading-normal font-medium text-gray-900 dark:text-gray-500">{index}</h3>
            <h3 class="text-1xl leading-normal font-medium text-gray-900 dark:text-gray-500">{content.name}</h3>
            <h3 class="text-1xl mt-3 leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">
              Description:
              {content.description}
            </h3>
            <h3 class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300">{content.ipfs}</h3>
          {/each}
        {/if}
      </div>
    </div>
  </div> -->
</section>
