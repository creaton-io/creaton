<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
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
  global.Buffer = Buffer;

  const textile: TextileStore = new TextileStore();
  let creatorName: string = '';
  let subscriptionPrice: number;
  let uploader, myContracts, contractAddress, creatorContract;
  let path, pubkey, downloadPath, description;
  let contents = [];
  let contentsShow = false;

  if (typeof window !== 'undefined') {
    contractAddress = window.location.pathname.split('/')[2];
  }

  async function deployTextile() {
    const setup = await textile.authenticate();
    alert("you're good");
  }

  async function loadCreatorData() {
    creatorContract = await new Contract(contractAddress, contracts.Creator.abi, wallet.provider.getSigner());
  }

  // async function getContent() {
  //   let contentsString = await creatorContract.getAllMetadata();
  //   contents = [];
  //   for (let c of contentsString) {
  //     contents.push(JSON.parse(c));
  //   }
  //   contentsShow = !contentsShow;
  // }

  onMount(async () => {
    await deployTextile();
    if (wallet.provider) {
      loadCreatorData();
    } else {
      flow.execute(async () => {
        loadCreatorData();
      });
    }
  });

  async function upload() {
    const file = await uploader.files[0];
    const encFile = await textile.uploadFile(file);
    const metadata = {
      name: encFile.encryptedFile.name,
      type: encFile.encryptedFile.type,
      description: description,
      date: encFile.encryptedFile.date,
      ipfs: encFile.encryptedFile.ipfsPath,
    };
    const receipt = await creatorContract.setMetadataURL(JSON.stringify(metadata));
    console.log(receipt);
  }

  async function sendKeys() {
    await textile.sendKeysToSubscribers(path, pubkey);
    alert('keys sent');
  }
  async function download(path) {
    await textile.getKeysFromCreator();
    const decrypted = await textile.decryptFile(path);
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
      <input id="avatar" bind:this={uploader} type="file" placeholder="File" className="visually-hidden" />
    </div>
    <div class="field-row">
      <label for="description">Description: </label>
      <Input type="text" placeholder="My recent trip to Norway!" className="field" bind:value={description} />
    </div>
    <Button class="mt-3" on:click={upload}>Upload</Button>

    <br />
    <div class="field-row">
      <label for="path-url">Path: </label>
      <Input type="text" placeholder="Path" className="field" bind:value={path} />
    </div>
    <div class="field-row">
      <label for="pubkey-url">Pubkey: </label>
      <Input type="text" placeholder="Pubkey" className="field" bind:value={pubkey} />
    </div>
    <Button class="mt-3" on:click={sendKeys}>Send Keys</Button>

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
