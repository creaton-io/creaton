<script lang="ts">
  export let title: string;
  export let slug: string;
  export let id: string;

  import Link from '../_routing/curi/Link.svelte';
  import {getRouter, getResponse} from '@curi/svelte';
  import {active as activeInteraction, pathname} from '@curi/interactions';
</script>

<Link {id} name="Creator" class="px-4 py-8 border rounded">
  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-500">{title}</h3>
  <p class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300">
    <slot />
  </p>
</Link>
