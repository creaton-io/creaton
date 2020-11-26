<script lang="ts">
  type LinkInfo = string | {name: string; title: string};
  export let links: LinkInfo[];
  import NavLink from './NavLink.svelte';
  import {wallet, builtin, chain, flow} from '../stores/wallet';
  import Button from '../components/Button.svelte';
</script>

<nav class="top-0 z-50 w-full flex flex-wrap items-center justify-between navbar-expand-lg bg-white shadow">
  <ul class="flex m-2">
    {#each links as link}
      <NavLink name={typeof link === 'string' ? link : link.name}>
        {typeof link === 'string' ? link : link.title}
      </NavLink>
    {/each}
  </ul>

  <ul class="flex flex-col lg:flex-row list-none lg:ml-auto">
    <li class="flex items-center">
      <a
        class="hover:text-gray-600 text-gray-800 px-3 py-2 flex items-center text-xs uppercase font-bold"
        href="https://twitter.com/creaton_io"
        target="_blank">
        <i class="text-gray-500 fab fa-twitter text-lg leading-lg" />
      </a>
    </li>

    <li class="flex items-center">
      <a
        class="hover:text-gray-600 text-gray-800 px-3 py-2 flex items-center text-xs uppercase font-bold"
        href="https://github.com/creaton-io/creaton?ref=homepage"
        target="_blank">
        <i class="text-gray-500 fab fa-github text-lg leading-lg" />
      </a>
    </li>

    <li class="flex items-center">
      <a
        class="hover:text-gray-600 text-gray-800 px-3 py-2 flex items-center text-xs uppercase font-bold"
        href="https://medium.com/creaton"
        target="_blank">
        <i class="text-gray-500 fab fa-medium-m text-lg leading-lg" />
      </a>
    </li>

    <li class="flex items-center">
      <a
        class="hover:text-gray-600 text-gray-800 px-3 py-2 flex items-center text-xs uppercase font-bold"
        href="https://creaton.on.fleek.co"
        target="_blank">
        <i class="text-gray-500 fab fa-telegram-plane text-lg leading-lg" />
      </a>
    </li>
    <li class="flex items-center mr-2">
      <Button
        class="w-max-content"
        label="connect via builtin wallet"
        disabled={!$builtin.available || $wallet.connecting}
        on:click={() => flow.connect('builtin')}>
        <i class="fas fa-sign-in-alt mr-2" />
        Connect Wallet
      </Button>
    </li>
  </ul>
</nav>
