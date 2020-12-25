<script lang="ts">
  export let name: string;
  export let params: any = {};
  export let partial: boolean = false;

  import Link from '../_routing/curi/Link.svelte';
  import {getRouter, getResponse} from '@curi/svelte';
  import {active as activeInteraction} from '@curi/interactions';

  let router = getRouter();
  let response = getResponse();

  let active: boolean;
  $: route = router.route(name);
  $: active = $response && activeInteraction(route, $response, {params, partial});
</script>

{#if active}
  <li class="-mb-px mr-1">
    <Link
      class="px-4 py-2 rounded-md inline-block text-sm font-medium text-white bg-gray-900 opacity-25 cursor-not-allowed"
      {name}
      {params}>
      <slot />
    </Link>
  </li>
{:else}
  <li class="-mb-px mr-1">
    <Link
      class="px-4 py-2 inline-block rounded-md text-sm font-medium text-gray-700 hover:text-white hover:bg-gray-700 opacity-25 cursor-not-allowed"
      {name}
      {params}>
      <slot />
    </Link>
  </li>
{/if}
