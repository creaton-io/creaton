<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import Blockie from '../components/Blockie.svelte';
  import {test} from 'creaton-common';
  import {logs} from 'named-logs';
  import {wallet, balance, flow, chain} from '../stores/wallet';
  import {identity} from 'svelte/internal';
  import {TextileStore} from '../stores/textileStore';
  import { Buffer } from "buffer";
  import {onMount} from 'svelte';
  global.Buffer = Buffer;
  const textile: TextileStore = new TextileStore();
  let creatorName: string = '';
  let subscriptionPrice: number;
  let uploader;
  let path, pubkey, downloadPath;


  async function deployTextile(){
    const setup = await textile.authenticate();
    alert("you're good");
  }

  onMount(async () => {
    deployTextile()
  })
  
  async function upload(){
    const file = await uploader.files[0];
    const encFile = await textile.uploadFile(file);
    console.log(encFile.encryptedFile.ipfsPath);
  }

  async function sendKeys(){
    await textile.sendKeysToSubscribers(path, pubkey);
    alert("keys sent");
  }
  async function download(){
    await textile.getKeysFromCreator();
    const decrypted = await textile.decryptFile(downloadPath);
    await downloadBlob(decrypted);
  }
  function downloadURL (data, fileName) {
    const a = document.createElement('a')
    a.href = data
    a.download = fileName
    document.body.appendChild(a)
    a.style.display = 'none'
    a.click()
    a.remove()
  }
  function downloadBlob(decrypted: ArrayBuffer) {
    const blob = new Blob([new Uint8Array(decrypted)], {
      type: 'image/jpg',
    })
    const url = window.URL.createObjectURL(blob)
    downloadURL(url, 'whatever')
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
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

<section class="py-8 px-4 text-center">
  <form class="content flex flex-col max-w-lg mx-auto">

    <div class="field-row">
    <label for="avatar">Select file:</label>
    <input 
        id="avatar"
        bind:this={uploader}
        type="file" 
        placeholder="File"
        className="visually-hidden"
        />
    </div> 
    <Button class="mt-3" on:click={upload}> Upload </Button>  
    
    <br>
    <div class="field-row">
      <label for="path-url">Path: </label>
      <Input id="path-url" type="text" placeholder="Path" className="field" bind:value={path} />
    </div>
    <div class="field-row">
      <label for="pubkey-url">Pubkey: </label>
      <Input id="pubkey-url" type="text" placeholder="Pubkey" className="field" bind:value={pubkey} />
    </div>
    <Button class="mt-3" on:click={sendKeys}> Send Keys </Button>

    <br>
    <div class="field-row">
      <label for="dpath-url">Download path</label>
      <Input id="dpath-url" type="text" placeholder="Download path" className="field" bind:value={downloadPath} />
    </div>
    <Button class="mt-3" on:click={download}> Download </Button>
  </form>
</section>
