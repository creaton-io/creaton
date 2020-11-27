<script lang="ts">
  import Button from '../components/Button.svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';
  import SignUp from '../components/SignUp.svelte';
  import About from '../components/About.svelte';
  const name = 'Creators spotlight';

  creators.fetch();
</script>

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
          <span class="md:hidden"> We won the ETHOnline Textile hackathon prize! </span>
          <span class="hidden md:inline"> Big news! We won the ETHOnline Textile hackathon prize! </span>
        </p>
      </div>
      <div class="order-3 mt-2 flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
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

<div>
  <main>
    <div class="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
      <div
        class="absolute top-0 w-full h-full bg-center bg-cover"
        style="
          background-image: url(https://ipfs.rarible.com/ipfs/QmUPQQC2G5mwjZV22K5Nv1Y5ARad4jgR8cv2UEK4Ltx3Cq/image.gif);
        ">
        <span id="blackOverlay" class="w-full h-full absolute opacity-75 bg-black" />
      </div>
      <div class="container relative mx-auto">
        <div class="items-center flex flex-wrap">
          <div class="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div class="pr-0">
              <img
                alt="..."
                src="https://i.imgur.com/cHC8Uqs.png"
                class="shadow-xl rounded-l-full  max-w-150-px text-white text-sm font-bold leading-relaxed inline-block whitespace-no-wrap uppercase" />
              <p class="mt-4 text-lg text-gray-300">Decentralized Content Sharing Platform</p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
        style="transform: translateZ(0);">
        <svg
          class="absolute bottom-0 overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          version="1.1"
          viewBox="0 0 2560 100"
          x="0"
          y="0">
          <polygon class="text-gray-300 fill-current" points="2560 0 2560 100 0 100" />
        </svg>
      </div>
    </div>

    <section class="pb-20 bg-gradient-to-r from-indigo-200 to-indigo-100 -mt-24">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap">
          <div class="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center md:mt-16">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-l-3xl border-indigo-500 border-2">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                  <i class="fas fa-play" />
                </div>
                <h6 class="text-xl font-semibold">Support Creators</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Get exclusive content from creators through a stablecoin streaming subscription
                </p>
              </div>
            </div>
          </div>

          <div class="w-full md:w-4/12 px-4 text-center">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-t-3xl border-indigo-500 border-2">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                  <i class="fas fa-dollar-sign" />
                </div>
                <h6 class="text-xl font-semibold">Fund Your Creating</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Earn money by creating content for subscribers, with investors betting on your success
                </p>
              </div>
            </div>
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-b-3xl border-indigo-500 border-2">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                  <i class="fas fa-tractor" />
                </div>
                <h6 class="text-xl font-semibold">Farm CREATE</h6>
                <p class="mt-2 mb-4 text-gray-600">Earn rewards for farming CREATE token, our burning utility token</p>
              </div>
            </div>
          </div>

          <div class="pt-6 w-full md:w-4/12 px-4 text-center md:mt-16">
            <div
              class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-r-3xl border-indigo-500 border-2">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                  <i class="fas fa-hands-helping" />
                </div>
                <h6 class="text-xl font-semibold">Invest In Creators</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Kickstart creator careers by investing in creatonks (creator tokens), receive a % of the profit with
                  the % of creatonks you farm
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 w-full md:w-10/12">
          <div class="items-center flex flex-wrap">
            <div class="w-full md:w-4/12 ml-auto mr-auto px-4" />
            <img alt="..." src="https://i.imgur.com/IM7pQmM.jpg" class="w-full align-middle rounded-lg" />
          </div>
        </div>

        <About />
      </div>
    </section>
  </main>
</div>

<section class="py-8 px-4 text-center">
  <div class="max-w-auto md:max-w-lg mx-auto mt-4 mb-10">
    <h1 class="text-indigo-600 font-bold text-6xl mb-2 font-heading">{name}</h1>
  </div>
  <div class="py-4 dark:bg-black bg-white">
    <div class="mx-auto px-4 sm:px-6 lg:max-w-screen-xl lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#if !$creators.state}
          <div>creators not loaded</div>
        {:else if $creators.error}
          <div>Error: {$creators.error}</div>
        {:else if $creators.state === 'Fetching'}
          <div>Loading creators...</div>
        {:else}
          {#each $creators.data as creator, index}
            <CreatorCard {creator}>{creator.creatorContract}</CreatorCard>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</section>

<section class="pt-20 pb-48">
  <div class="container mx-auto px-4">
    <div class="flex flex-wrap text-center">
      <div class="w-full px-4">
        <h4 class="text-3xl font-semibold">Keep updated on our progress!</h4>
        <SignUp />
        <h5 class="text-lg mt-0 mb-2 text-gray-700">Find us on any of these platforms.</h5>
        <div class="mt-6 lg:mb-0 mb-6">
          <a
            class="hover:text-gray-600 text-gray-800 px-3 py-2 items-center justify-center align-center text-xs uppercase font-bold"
            href="https://twitter.com/creaton_io"
            target="_blank">
            <i class="text-gray-500 fab fa-twitter text-lg leading-lg" />
          </a>
          <a
            class="hover:text-gray-600 text-gray-800 px-3 py-2 items-center justify-center align-center text-xs uppercase font-bold"
            href="https://github.com/creaton-io/creaton?ref=homepage"
            target="_blank">
            <i class="text-gray-500 fab fa-github text-lg leading-lg" />
          </a>
          <a
            class="hover:text-gray-600 text-gray-800 px-3 py-2 items-center justify-center align-center text-xs uppercase font-bold"
            href="https://medium.com/creaton"
            target="_blank">
            <i class="text-gray-500 fab fa-medium-m text-lg leading-lg" />
          </a>
          <a
            class="hover:text-gray-600 text-gray-800 px-3 py-2 items-center justify-center align-center text-xs uppercase font-bold"
            href="https://creaton.on.fleek.co"
            target="_blank">
            <i class="text-gray-500 fab fa-telegram-plane text-lg leading-lg" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
