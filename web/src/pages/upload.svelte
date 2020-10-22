<script lang="ts">
  // import {wallet, balance, flow, chain} from '../stores/wallet';
  // import {identity} from 'svelte/internal';
  // import {TextileStore} from '../stores/textileStore';

  // const textile: TextileStore = new TextileStore();
  // import Buffer from 'buffer/';
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
<label for="content">Upload a file (picture for now):</label>
<input id="content" accept="image/png, image/jpeg" bind:files name="content" type="file" />
