<script lang="ts">
  import Button from '../components/Button.svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';
  const name = 'Creators spotlight';

  creators.fetch();
</script>

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
          <div class="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
            <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-l-full">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                  ▶️
                  <i class="fas fa-award" />
                </div>
                <h6 class="text-xl font-semibold">Support Creators</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Get exclusive content from creators through a stablecoin streaming subscription
                </p>
              </div>
            </div>
          </div>

          <div class="w-full md:w-4/12 px-4 text-center">
            <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-full">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                  💵
                  <i class="fas fa-retweet" />
                </div>
                <h6 class="text-xl font-semibold">Fund Your Creating</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Earn money by creating content for subscribers, with investors betting on your success
                </p>
              </div>
            </div>
          </div>

          <div class="pt-6 w-full md:w-4/12 px-4 text-center">
            <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-r-full">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                  📈
                  <i class="fas fa-fingerprint" />
                </div>
                <h6 class="text-xl font-semibold">Invest In Creators</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Kickstart creator careers by investing in creator tokens, receive a % of the profit with the % of
                  tokens you own
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
