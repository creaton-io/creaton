<script lang="ts">

import Button from '../components/Button.svelte';
import WalletAccess from '../templates/WalletAccess.svelte';
import UploadCreatorCard from '../components/UploadCreatorCard.svelte';
import {creators} from '../stores/queries';
import { wallet, flow } from '../stores/wallet';
import {onMount} from 'svelte';

  const name = 'CREATON';

  async function fetchContracts(){
    creators.fetch();
  } 

  onMount(async () => {
      if (wallet.provider) {
          await fetchContracts()
      } else {
      flow.execute(async () => {
        await fetchContracts()
      });
    }
  })

</script>

<WalletAccess />
<section class="py-8 px-4 text-center">
  <div class="max-w-auto md:max-w-lg mx-auto mt-4 mb-10">
    <h1 class="text-indigo-600 font-bold text-6xl mb-2 font-heading">{name}</h1>
  </div>
  <div class="py-4 dark:bg-black bg-white">
    <div class="mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {#if !$creators.state || !wallet.provider}
            <div>creators not loaded</div>
          {:else if $creators.error}
            <div>Error: {$creators.error}</div>
          {:else if $creators.state === 'Fetching'}
            <div>Loading creators...</div>
          {:else}
            {#each $creators.data.filter(element => element.user.toLowerCase() === wallet.address.toLowerCase()) as creator, index}
              <UploadCreatorCard creator={creator}>{creator.creatorContract}</UploadCreatorCard>
            {/each}
          {/if}
      </div>
    </div>
  </div>
</section>
