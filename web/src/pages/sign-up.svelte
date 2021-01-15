<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Input from '../components/Input.svelte';
  import {wallet, flow} from '../stores/wallet';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import {onMount} from 'svelte';
  import {creatorAddress} from '../stores/creatorAddress';

  let creatorName: string = '';
  let avatarURL: string = '';
  let subscriptionPrice: number;
  let creatorContract;

  onMount(async () => {
    console.log('test1');
    if (wallet.provider) {
      loadCreatorData();
      console.log('test2');
    } else {
      flow.execute(async (contracts) => {
        loadCreatorData();
        console.log('test3');
        //console.log('creatonfactory contracts:', await contracts.CreatonFactory.creatorContracts());
      });
    }
  });

  async function deployCreator() {
    await flow.execute(async (contracts) => {
      avatarURL = avatarURL || 'https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg';
      creatorName = creatorName || 'creaotorname';
      subscriptionPrice = subscriptionPrice || 10;
      const receipt = await contracts.CreatonFactory.deployCreator(avatarURL, creatorName, subscriptionPrice);
      console.log(receipt);
      return receipt;
    });
  }

  async function loadCreatorData() {
    console.log('test');
    creatorContract = await new Contract(
      contracts.CreatonFactory.address,
      contracts.CreatonFactory.abi,
      wallet.provider.getSigner()
    );

    creatorContract.on('CreatorDeployed', (...response) => {
      const [sender, contractaddr] = response;

      if (sender === $wallet.address) {
        creatorAddress.set(contractaddr);
      }
      console.log('creator contract address', contractaddr);
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
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2"> Name </label>
                <input
                  type="text"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150"
                  placeholder="Name"
                  bind:value={creatorName} />
              </div>

              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2"> Profile Image URL </label>
                <input
                  type="text"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full ease-linear transition-all duration-150"
                  placeholder="Profile Image URL"
                  bind:value={avatarURL} />
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
