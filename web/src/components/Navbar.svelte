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
<div class="bg-indigo-600">
  <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between flex-wrap">
      <div class="w-0 flex-1 flex items-center">
        <span class="flex p-2 rounded-lg bg-indigo-800">
          <!-- Heroicon name: speakerphone -->
          <svg
            class="h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </span>
        <p class="ml-3 font-medium text-white truncate">
          <span class="md:hidden"> We announced a new product! </span>
          <span class="hidden md:inline"> Big news! We won the ETHOnline Textile hackathon prize! </span>
        </p>
      </div>
      <div class="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
        <a
          href="https://blog.textile.io/creaton-ethonline-winner/"
          class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50">
          Blog post
        </a>
      </div>
      <div class="order-2 flex-shrink-0 sm:order-3 sm:ml-3 hidden">
        <button
          type="button"
          class="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2">
          <span class="sr-only">Dismiss</span>
          <!-- Heroicon name: x -->
          <svg
            class="h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
