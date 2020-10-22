<script lang="ts">
  import Button from '../components/Button.svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';
  const name = 'Creaton';

  creators.fetch();

</script>

<section class="py-8 px-4 text-center">
  <div class="max-w-auto md:max-w-lg mx-auto mt-4 mb-10">
    <h1 class="text-6xl mb-2 font-heading">{name}</h1>
  </div>
  <div class="py-4 dark:bg-black bg-white">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {#if !$creators.state}
            <div>creators not loaded</div>
          {:else if $creators.error}
            <div>Error: {$creators.error}</div>
          {:else if $creators.state === 'Fetching'}
            <div>Loading creators...</div>
          {:else}
            {#each $creators.data as creator, index}
              <CreatorCard creator={creator}>{creator.user}</CreatorCard>
            {/each}
          {/if}
      </div>
    </div>
  </div>
</section>
