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


  async function deployTextile(){
    const setup = await textile.authenticate();
    alert("done setup!")
  }

  async function upload(){
    const file = uploader.files[0];
    const encFile = await textile.uploadFile(file);
    console.log(encFile.encryptedFile.cid, encFile.encryptedFile.path);
  }

  async function download(){

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
  button {
    @apply flex-shrink-0 bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700 text-sm border-4
          text-white py-1 px-2 rounded disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed;
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
<button on:click={download}> Download </button>
