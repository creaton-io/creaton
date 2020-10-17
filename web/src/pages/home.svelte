<script lang="ts">
  import Button from '../components/Button.svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';
  const name = 'Creaton';

  creators.fetch();

  // let creatorList = [
  //   {title: 'alice', slug: 'alice'},
  //   {title: 'bob', slug: 'bob'},
  //   {title: 'john', slug: 'john'},
  //   {title: 'aeroxander', slug: 'aeroxander'},
  //   {title: 'cina', slug: 'cina'},
  //   {title: 'matt', slug: 'matt'},
  //   {title: 'sylar217', slug: 'sylar217'},
  // ];
</script>

<section class="py-8 px-4 text-center">
  <div class="max-w-auto md:max-w-lg mx-auto mt-4 mb-10">
    <h1 class="text-6xl mb-2 font-heading">{name}</h1>
  </div>
  <div class="py-4 dark:bg-black bg-white">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
      <div class="lg:grid lg:grid-cols-3 lg:gap-8">
        <!-- {#each creatorList as item, index}
          <CreatorCard id="creator-{index}" title={item.title} slug={item.slug}>{item.title}</CreatorCard>
        {/each} -->

          {#if !$creators.state}
            <div>creators not loaded</div>
          {:else if $creators.error}
            <div>Error: {$creators.error}</div>
          {:else if $creators.state === 'Fetching'}
            <div>Loading creators...</div>
          {:else}
            {#each $creators.data as creator, index}
              <CreatorCard id={creator.user} user={creator.user}>{creator.user}</CreatorCard>
            {/each}
          {/if}

      </div>
    </div>
  </div>
</section>
