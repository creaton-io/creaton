<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import Blockie from '../components/Blockie.svelte';
  import {test} from 'creaton-common';
  import {logs} from 'named-logs';
  import {wallet, flow, chain} from '../stores/wallet';
  import {Contract} from '@ethersproject/contracts';

  let creatorName: string = '';
  let avatarURL: string = '';
  let subscriptionPrice: number;
  let projectDuration: number; // 6337 = approx # of blocks per day

  async function deployCreator() {
    await flow.execute(async (contracts) => {
      avatarURL = avatarURL || 'https://utulsa.edu/wp-content/uploads/2018/08/generic-avatar.jpg';
      const receipt = await contracts.CreatonFactory.deployCreator(avatarURL, creatorName, subscriptionPrice, projectDuration);
      // const creatorContract = await Contract(contracts.Creator, )
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

<WalletAccess>
  <section class="py-8 px-4 text-center">
    <div class="max-w-auto md:max-w-lg mx-auto">
      <h1 class="text-4xl mb-2 font-heading">Become a Creator</h1>
    </div>
    <form class="content flex flex-col max-w-lg mx-auto">
      <div class="field-row">
        <label for="name">Name:</label>
        <Input id="name" type="text" placeholder="Name / title" className="field" bind:value={creatorName} />
      </div>
      <div class="field-row">
        <label for="avatar-url">Profile Image URL:</label>
        <Input id="avatar-url" type="text" placeholder="Profile image URL" className="field" bind:value={avatarURL} />
      </div>
      <div class="field-row">
        <label for="subscription-price">Subscription Price: $</label>
        <Input id="subscription-price" type="number" placeholder="Cost per month" className="field" bind:value={subscriptionPrice} />
      </div>
      <div class="field-row">
        <label for="project-length">Project length:</label>
        <Input id="project-length" type="number" placeholder="Enter months" className="field" bind:value={projectDuration} />
      </div>
      <button class="mt-6" type="button" on:click={deployCreator}>Create!</button>
    </form>
  </section>
</WalletAccess>
