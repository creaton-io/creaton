<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Input from '../components/Input.svelte';
  import {wallet, flow} from '../stores/wallet';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import {onMount} from 'svelte';
//   import {
//   Buckets,
//   KeyInfo,
//   PrivateKey,
//   WithKeyInfoOptions,
//   Users,
//   Client,
//   Where,
//   UserMessage,
//   PublicKey,
//   ThreadID,
// } from '@textile/hub';
  // import {TextileStore} from '../stores/textileStore';
  import {BiconomyHelper} from '../biconomy-helpers/biconomyForwarderHelpers';
  import {Web3Provider} from "@ethersproject/providers";
  import { Interface } from '@ethersproject/abi';

  // const textile: TextileStore = new TextileStore();

  let profileImage;
  let tierName: string = '';
  let tierDescription: string = '';
  let subscriptionPrice: number;
  let adminContract;
  let biconomy;
  let ethersProvider;
  let signer;
  let creatorAddress;
  let networkId;
  let bh;

  onMount(async () => {
    // await deployTextile();
    if (wallet.provider) {
      deployBiconomy();
    } else {
      flow.execute(async (contracts) => {
        deployBiconomy();
        //console.log('creatonfactory contracts:', await contracts.CreatonFactory.creatorContracts());
      });
    }
  });

  async function deployBiconomy() {
    bh = new BiconomyHelper();
    ethersProvider = new Web3Provider(window['ethereum']);
    console.log('hello!')
    console.log(ethersProvider);
    signer = ethersProvider.getSigner();
    creatorAddress = await signer.getAddress();
    console.log(creatorAddress);
    networkId = 5;
    // biconomy = new Biconomy(window['ethereum'],{apiKey: '2YCO6NaKI.da767985-4e30-448e-a781-561d92bc73bf', debug: true});
    // ethersProvider = new Web3Provider(biconomy);
    // biconomy.onEvent(biconomy.READY, () => {
    //   console.log("biconomy ready");
    //   signer = ethersProvider.getSigner();
    // }).onEvent(biconomy.ERROR, (error, message) => {
    //   console.log("biconomy not ready");
    // });
  }

  async function deployTextile() {
    // const setup = await textile.authenticate();
  }

  async function deployCreator() {
    const tier = {
      profileImage: profileImage,
      name: tierName,
      description: tierDescription,
    };

    const profileImagefile = await profileImage.files[0];
    // const metadataURL = await textile.uploadTier(tier, profileImagefile);

    adminContract = new Contract(contracts.CreatonAdmin.address,
              contracts.CreatonAdmin.abi, signer);
    let {data} = await adminContract.populateTransaction.deployCreator('hello', 2);
    console.log(data);
    // let gasPrice = await ethersProvider.getGasPrice();
    console.log('here?')

    let forwarder = await bh.getBiconomyForwarderConfig(networkId);
    let forwarderContract = new Contract(
          forwarder.address,
          forwarder.abi,
          signer
        );   
    let gasLimit = await ethersProvider.estimateGas({
              to: adminContract.address,
              from: forwarderContract.address,
              data: data
            });
       
    
    const batchNonce = await forwarderContract.getNonce(creatorAddress,0);
    const gasLimitNum = Number(gasLimit);
    console.log('forward request?')
    const req = await bh.buildForwardTxRequest({account:creatorAddress,to:adminContract.address, gasLimitNum, batchId:0,batchNonce,data});
    console.log('tx req', req);
    const domainSeparator = await bh.getDomainSeperator(networkId);
    const dataToSign = await bh.getDataToSignForEIP712(req,networkId);
    console.log(dataToSign);
    let sig;
    // get the user's signature
    ethersProvider.send("eth_signTypedData_v4", [creatorAddress, dataToSign])
        .then(function(signature){
          sig = signature; 
          // make the API call
          sendTransaction({creatorAddress, req, domainSeparator, sig, signatureType:"EIP712_SIGN"});
        })
        .catch(function(error) {
	        console.log(error)
	      });
    // const hashToSign =  await bh.getDataToSignForPersonalSign(req);
    // console.log(hashToSign);
    // signer.signMessage(hashToSign)
        // .then(function(sig){
          // console.log('signature ' + sig);
          // make API call
          // sendTransaction(creatorAddress, req, sig, "PERSONAL_SIGN");
        // })
        // .catch(function(error) {
	        // console.log(error)
	      // });
    // let adminInterface = new Interface(contracts.CreatonAdmin.abi);
    // let creatorAddress = await ethersProvider.getSigner().getAddress();
    // let functionSignature = adminInterface.encodeFunctionData("deployCreator", [metadataURL, subscriptionPrice]);
    // let rawTx = {
    //   to: contracts.CreatonAdmin.address,
    //   data: functionSignature,
    //   from: creatorAddress
    // };
    // const metaTxData = await biconomy.getForwardRequestAndMessageToSign(
    //   rawTx
    // );

    // const hashToSign = metaTxData.personalSignatureFormat;
    // const signature = await signer.signMessage(hashToSign);
    // let data = {
    //   signature: signature,
    //   forwardRequest: metaTxData.request,
    //   rawTransaction: rawTx,
    //   signatureType: biconomy.PERSONAL_SIGN,
    // };

    // let tx = await ethersProvider.send("eth_sendRawTransaction", [data]);
    // console.log("Transaction hash : ", tx);    

    // ethersProvider.once(tx, (transaction) => {
    //   // Emitted when the transaction has been mined
    //   console.log(transaction);
    //   //doStuff
    // }); 
  }

  async function sendTransaction({creatorAddress, req, domainSeparator, sig, signatureType}){
      // let params = [req, sig]
      let params = [req, domainSeparator, sig]
      try {
        fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key" : '2YCO6NaKI.da767985-4e30-448e-a781-561d92bc73bf',
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "to": adminContract.address,
            "apiId": '0471ba26-8cda-424d-9c24-f13ae728add7',
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

  // async function loadCreatorData() {
    // creatorContract = await new Contract(
    //   contracts.CreatonAdmin.address,
    //   contracts.CreatonAdmin.abi,
    //   wallet.provider.getSigner()
    // );

    // creatorContract.on('CreatorDeployed', (...response) => {
    //   const [sender, contractaddr] = response;
    //   console.log('creator contract address', contractaddr);
    // });
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

  button {
    @apply flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 text-sm border-4
          text-white py-1 px-2 rounded disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed;
  }
</style>

<WalletAccess>
  <section class="pt-10 sm:pt-40 px-4">
    <div class="container mx-auto px-4 h-auto max-w-screen-lg">
      <div class="flex content-center justify-center">
        <div class="w-full lg:w-4/12 md:w-6/12 sm:w-8/12 px-4">
          <div
            class="relative flex flex-col min-w-0 break-words w-full pb-10 pt-6 shadow-lg rounded-lg bg-gray-300 border-0">
            <div class="max-w-auto md:max-w-lg mx-auto text-center">
              <h1 class="text-xl mb-5 font-heading text-gray-600">Become a Creator</h1>
            </div>
            <form class="px-10">
              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2"> Tier Name </label>
                <input
                  type="text"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150"
                  placeholder="Name"
                  bind:value={tierName} />
              </div>

              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2"> Description </label>
                <input
                  type="text"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150"
                  placeholder="Name"
                  bind:value={tierDescription} />
              </div>

              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2"> Profile Image URL </label>
                <input
                  bind:this={profileImage}
                  type="file"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150"
                  placeholder="Profile Image" />
              </div>

              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2"> Subscription Price: $</label>
                <input
                  type="text"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150"
                  placeholder="Subscription Price: $"
                  bind:value={subscriptionPrice} />
              </div>
              <button
                class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150 mt-6"
                type="button"
                on:click={deployCreator}>Create!</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</WalletAccess>
