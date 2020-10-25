<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Button from '../components/Button.svelte';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import {wallet, flow, chain} from '../stores/wallet';
  import { onMount, afterUpdate } from 'svelte';

  import {creators} from '../stores/queries';
  let contractAddress;
  let creator;


  creators.fetch();

  if (typeof window !== 'undefined') {
    contractAddress = window.location.pathname.split('/')[2];

    // onMount(async () => {
    //   flow.execute(async () => {
    //     const creatorContract = new Contract(
    //         contractAddress, 
    //         contracts.Creator.abi,
    //         wallet.provider
    //       )
    //     console.log(creatorContract)
    //   })
    // })

    afterUpdate(async () => {
      creator = $creators.data.filter(data => data.creatorContract === contractAddress)[0];
    })
  }

  function handleSubscribe(){
    console.log('todo: handleSubscribe')
  }
</script>
<WalletAccess>
  <section class="py-8 px-4 text-center max-w-md mx-auto">
    {#if !creator}
      <div>Fetching creator...</div>
    {:else}
      <h3 class="text-4xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">{creator.title}</h3>
      <p class="mb-2 text-base leading-6 text-gray-500 dark:text-gray-300 text-center">
        {creator.user}
      </p>
      <img class="avatar" src={creator.avatarURL} alt={creator.title}/>
          <Button class="mt-3" on:click={handleSubscribe}>
            Subscribe - ${creator.subscriptionPrice}</Button>
    {/if}
  </section>
</WalletAccess>