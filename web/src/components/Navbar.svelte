<script lang="ts">
  type LinkInfo = string | {name: string; title: string};
  export let links: LinkInfo[];
  import NavLink from './NavLink.svelte';
  import {wallet, builtin, chain, flow} from '../stores/wallet';
</script>

<nav class="top-0 fixed z-50 w-full flex flex-wrap items-center justify-between navbar-expand-lg bg-white shadow">
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

    <li class="flex items-center">
      <button
        class="bg-green-500 text-white active:bg-red-600 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
        type="button">
        <i class="fas fa-sign-in-alt" />
        Connect Wallet
      </button>
    </li>
  </ul>
</nav>
