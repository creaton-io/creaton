<script lang="ts">
  export let title: string;
  export let slug: string;

  import Link from '../_routing/curi/Link.svelte';
  import {getRouter, getResponse} from '@curi/svelte';
  import {active as activeInteraction, pathname} from '@curi/interactions';

</script>

<Link id={slug} params={{id: slug}} name="Creator" class="block px-4 py-8 border rounded overflow-hidden">
  <h3 class="text-2xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">{title}</h3>
  <p class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300 truncate">
    <slot />
  </p>
</Link>
