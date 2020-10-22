<script lang="ts">
  export let creator: {
    user: string;
    title: string;
    subscriptionPrice: number;
  };

  import Link from '../_routing/curi/Link.svelte';
  import {getRouter, getResponse} from '@curi/svelte';
  import {active as activeInteraction, pathname} from '@curi/interactions';

</script>

<Link id={creator.user} params={{id: creator.user}} name="Creator" class="block px-4 py-8 border rounded overflow-hidden">
  <h3 class="text-2xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">{creator.title}</h3>
  <h3 class="text-2xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">${creator.subscriptionPrice}</h3>
  <p class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300 truncate">
    <slot />
  </p>
</Link>
