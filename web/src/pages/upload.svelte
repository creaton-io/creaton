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

  async function upload(){
    const file = uploader.files[0];
    const encFile = await textile.uploadFile(file);
    console.log(encFile.encryptedFile.cid, encFile.encryptedFile.path);
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
</style>

<button on:click={deployTextile}> Setup </button>
<br>
<label for="avatar">Upload a file (picture for now):</label>
<label>
  <slot name="content">
  </slot>
  <input 
			 bind:this={uploader}
			 type="file" 
			 class="visually-hidden"
			 on:change={upload} 
			/>
</label>

<br>
<div class="field-row">
  <label for="path-url">path</label>
  <Input id="path-url" type="text" placeholder="Path" className="field" bind:value={path} />
</div>
<div class="field-row">
  <label for="pubkey-url">pubkey</label>
  <Input id="pubkey-url" type="text" placeholder="Pubkey" className="field" bind:value={pubkey} />
</div>
<button on:click={sendKeys}> Send Keys </button>

<br>
<div class="field-row">
  <label for="dpath-url">download path</label>
  <Input id="dpath-url" type="text" placeholder="Dpath" className="field" bind:value={downloadPath} />
</div>
<button on:click={download}> Download </button>
