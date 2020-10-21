<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import Blockie from '../components/Blockie.svelte';
  import {test} from 'creaton-common';
  import {logs} from 'named-logs';
  import {wallet, balance, flow, chain} from '../stores/wallet';
  import {identity} from 'svelte/internal';
  //import {TextileStore} from '../stores/textileStore';

  //const textile: TextileStore = new TextileStore();
  import Buffer from 'buffer/';
  let contentName: string = '';
  let contentDescription: string = '';
  //let ERC1155address where to mint the content NFT in
  let files;
  let encrypted;
  var arrayBuffer, uint8Array;
  //var Buffer = require('buffer/')

  // const initIndex = async (buckets: Buckets, bucketKey: string, identity: Identity) => {
  // Create a json model for the index
  let contentLocation;
  const metadata = {
    title: 'Asset Metadata',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Identifies the asset to which this NFT represents',
      },
      description: {
        type: 'string',
        description: 'Describes the asset to which this NFT represents',
      },
      image: {
        type: 'string',
        description:
          'A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.',
      },
      content: {
        type: 'string',
        description: contentLocation,
      },
      date: {
        type: 'string',
        description: new Date().getTime(),
      },
    },
  };

  $: if (files) {
    let file = files[0];
    let reader = new FileReader();
    reader.onload = async function (evt) {
      arrayBuffer = this.result;
      uint8Array = new Uint8Array(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
    //encrypted = textile.uploadFile(uint8Array);

    contentLocation = encrypted.path; //update content location in metadata
    //TODO: upload content first and then put content link in metadata json and upload json
    const buf = Buffer.Buffer.from(JSON.stringify(metadata));
    //const JSONFile = textile.uploadJSONFile(buf);
    //TODO: mint NFT token in ERC1155address with metadata json link as uri
  }

  async function deployCreator() {
    await flow.execute(async (contracts) => {
      const receipt = await contracts.CreatonFactory.deployCreator(this.creatorName, this.subscriptionPrice);
      console.log(receipt);
      return receipt;
    });
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

<label for="avatar">Upload a file (picture for now):</label>
<input accept="image/png, image/jpeg" bind:files id="content" name="content" type="file" />
