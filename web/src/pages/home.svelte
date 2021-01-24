<script lang="ts">
  import Button from '../components/Button.svelte';
  import CreatorCard from '../components/CreatorCard.svelte';
  import {creators} from '../stores/queries';
  import SignUp from '../components/SignUp.svelte';
  import About from '../components/About.svelte';
  import {quintOut} from 'svelte/easing';
  import {fade, draw, fly} from 'svelte/transition';
  import {expand} from '../utils/custom-transitions.js';
  import {onMount} from 'svelte';
  import 'pathseg';

  import Particles from 'svelte-particles';

  let visible = false;

  const inner = `M99.95 1.57L2.05 1.57L2.05 99.48L99.95 99.48L84.49 83.65L17.51 83.65L17.51 17.4L84.49 17.4L99.95 1.57Z`;
  const outer = `M31.33 64.18L56 77.86L80.68 64.18L80.68 36.83L56 23.16L31.33 36.83L31.33 64.18Z`;

  let particlesConfig = {
    detectRetina: false,
    fpsLimit: 60,
    interactivity: {
      detectsOn: 'canvas',
      events: {
        onHover: {
          enable: true,
          mode: 'bubble',
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 60,
          duration: 10,
          opacity: 1,
          size: 10,
        },
      },
    },
    particles: {
      color: {
        value: '#30DAAC',
      },
      links: {
        blink: false,
        color: '#18CFCD',
        consent: false,
        distance: 50,
        enable: true,
        opacity: 0.9,
        width: 2.5,
      },
      move: {
        attract: {
          enable: false,
          rotate: {
            x: 300,
            y: 600,
          },
        },
        bounce: false,
        direction: 'none',
        enable: true,
        outMode: 'bounce',
        random: true,
        speed: 0.7,
        straight: false,
      },
      number: {
        density: {
          enable: false,
          area: 1000,
        },
        limit: 0,
        value: 300,
      },
      opacity: {
        animation: {
          enable: false,
          minimumValue: 0.05,
          speed: 2,
          sync: false,
        },
        random: false,
        value: 0.5,
      },
      shape: {
        type: 'circle',
      },
      size: {
        animation: {
          enable: false,
          minimumValue: 0.5,
          speed: 20,
          sync: true,
        },
        random: true,
        value: 1,
      },
    },
    polygon: {
      draw: {
        enable: true,
        lineColor: 'rgba(0,255,255,0.2)',
        lineWidth: 0.5,
      },
      move: {
        radius: 7,
      },
      position: {
        x: 20,
        y: 15,
      },
      inlineArrangement: 'equidistant',
      scale: 5,
      type: 'inline',
      data: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 636 636" xml:space="preserve"><defs><clipPath id="_clipPath_ufUKWNh03Q0ow8cg9bS2G9dNbT4C2wP3"><rect width="636" height="636"/></clipPath></defs><g><path d="M99.95 1.57L2.05 1.57L2.05 99.48L99.95 99.48L84.49 83.65L17.51 83.65L17.51 17.4L84.49 17.4L99.95 1.57Z M31.33 64.18L56 77.86L80.68 64.18L80.68 36.83L56 23.16L31.33 36.83L31.33 64.18Z M31.33 64.18L80.68 64.18L56 23.16 Z M31.33 36.83L80.68 36.83L56 77.86 Z M56 23.16L 56 77.86 M 31.33 64.18L80.68 36.83 M31.33 36.83L80.68 64.18 M99.95 1.57L17.51 17.4 M2.05 1.57L84.49 17.4 M17.51 83.65L2.05 99.48L84.49 83.65 M2.05 1.57L17.51 17.4 M17.51 83.65L99.95 99.48 M17.51 17.4L2.05 20.36L17.51 83.65L2.05 80.69L17.51 17.4"/></g></svg>`,
    },
  };

  onMount(() => {
    visible = true;
  });

  let onParticlesLoaded = (event) => {
    const particlesContainer = event.detail.particles;
    particlesContainer.play();
    // you can use particlesContainer to call all the Container class
    // (from the core library) methods like play, pause, refresh, start, stop
  };

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
          <span class="md:hidden"> Announcement: Partnership with NuCypher for Development & Scaling </span>
          <span class="hidden md:inline"> Announcement: Partnership with NuCypher for Development & Scaling </span>
        </p>
      </div>
      <div class="order-3 mt-2 flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
        <a
          href="https://medium.com/creaton/creaton-partners-with-nucypher-for-development-and-scaling-33bbe1b82111"
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
            class="h-6 w-6 text-red"
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
    <!--<Particles class="hidden" options={particlesConfig} on:particlesLoaded={onParticlesLoaded} />-->
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
            <div class="relative pr-0 w-4/5 ml-auto mr-auto">
              {#if visible}
                <!-- add logo here-->
                <img class="m-auto" alt="..." src="/images/logo-04.svg" />
                <div
                  class="mt-8 mb-6 text-md lg:text-xl text-gray-300 whitespace-nowrap"
                  out:fly={{y: -20, duration: 800}}>
                  {#each 'Create & Earn as Creator.' as char, i}
                    <span in:fade={{delay: 1000 + i * 15, duration: 800}}>{char}</span>
                  {/each}
                  <br />
                  {#each 'Subscribe & Invest as Fan.' as char, i}
                    <span in:fade={{delay: 1000 + i * 15, duration: 800}}>{char}</span>
                  {/each}
                </div>
              {/if}
            </div>
            <button
              type="button"
              class="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold px-6 py-3 rounded-md">
              Join the Creator Economy
            </button>
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

    <section class="bg-gradient-to-b from-green-400 via-green-400 to-green-400 -mt-24 hidden">
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
                  Earn money by creating content for subscribers, with investors betting on your farming reward success
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
                <h6 class="text-xl font-semibold">Farm CreaTokens</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Kickstart creator careers by buying CreaTokens, receive rewards for farming
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gradient-to-b from-blue-600 via-teal-400 to-teal-400 text-gray-700 body-font">
      <div class="container flex flex-col items-center px-5 py-16 mx-auto lg:px-20 lg:py-24 md:flex-row">
        <div class="w-5/6 lg:w-75 md:w-1/2 md:hidden">
          <img class="object-cover object-center rounded-lg" alt="hero" src="images/creatorcommunity.png" />
        </div>
        <div
          class="flex flex-col items-center w-full pt-0 mb-16 text-left lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 md:items-start md:text-left md:mb-0 lg:text-center">
          <h1
            class="mb-8 text-2xl font-bold tracking-tighter text-center text-blue-800 lg:text-left lg:text-5xl title-font">
            Create exclusive content for subscribers.
          </h1>
          <div class="flex flex-wrap -mx-4 -mt-4 -mb-10 sm:-m-4 ">
            <div class="flex flex-col items-center p-4 mb-6 text-center md:w-1/2 md:mb-0 lg:text-left lg:items-start">
              <div
                class="inline-flex items-center justify-center flex-shrink-0 w-12 h-12 mb-5 text-blue-800 bg-gray-200 rounded-full">
                <i class="fab fa-ethereum" />
              </div>
              <div class="flex-grow">
                <h2 class="mb-3 text-lg font-medium tracking-tighter text-gray-800 title-font">Earn Crypto Income</h2>
                <p class="text-base leading-relaxed">Earn subscription income for <br /> creating exclusive content</p>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="inline-flex items-center font-semibold text-blue-700 md:mb-2 lg:mb-0 hover:text-blue-400 hidden">
                  Learn More
                  <svg
                    class="w-4 h-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div class="flex flex-col items-center p-4 mb-6 text-center md:w-1/2 md:mb-0 lg:text-left lg:items-start">
              <div
                class="inline-flex items-center justify-center flex-shrink-0 w-12 h-12 mb-5 text-blue-800 bg-gray-200 rounded-full">
                <i class="fas fa-coins" />
              </div>
              <div class="flex-grow">
                <h2 class="mb-3 text-lg font-medium tracking-tighter text-gray-800 title-font">Tokenize your career</h2>
                <p class="text-base leading-relaxed">Launch your own Creator Token</p>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="inline-flex items-center font-semibold text-blue-700 md:mb-2 lg:mb-0 hover:text-blue-400 hidden">
                  Learn More
                  <svg
                    class="w-4 h-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="w-5/6 lg:w-75 md:w-1/2">
          <img
            class="object-cover object-center rounded-lg hidden md:block"
            alt="hero"
            src="images/creatorcommunity.png" />
        </div>
      </div>
    </section>

    <section class="bg-gradient-to-b from-teal-400 via-teal-400 to-gray-100 text-gray-700 body-font">
      <div class="container flex flex-col items-center px-5 py-16 mx-auto lg:px-20 lg:py-24 md:flex-row">
        <div class="w-5/6 lg:w-75 md:w-1/2 md:-mr-10">
          <img class="object-cover object-center rounded-lg" alt="hero" src="images/supporter.png" />
        </div>
        <div
          class="flex flex-col items-center w-full pt-0 mb-16 text-left lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 md:items-start md:text-left md:mb-0 lg:text-center">
          <h2 class="mb-1 text-xs font-medium tracking-widest text-blue-500 title-font">Support</h2>
          <h1
            class="mb-8 text-2xl font-bold tracking-tighter text-center text-blue-800 lg:text-left lg:text-5xl title-font">
            Join the community of your favorite creator.
          </h1>
          <div class="flex flex-wrap -mx-4 -mt-4 -mb-10 sm:-m-4 ">
            <div class="flex flex-col items-center p-4 mb-6 text-center md:w-1/2 md:mb-0 lg:text-left lg:items-start">
              <div
                class="inline-flex items-center justify-center flex-shrink-0 w-12 h-12 mb-5 text-blue-800 bg-gray-200 rounded-full">
                <i class="fas fa-play" />
              </div>
              <div class="flex-grow">
                <h2 class="mb-3 text-lg font-medium tracking-tighter text-gray-800 title-font">
                  Watch exclusive content
                </h2>
                <p class="text-base leading-relaxed">Unlock exclusive content from your favorite creators</p>
                <a
                  href="#"
                  class="inline-flex items-center font-semibold text-blue-700 md:mb-2 lg:mb-0 hover:text-blue-400 hidden">
                  Learn More
                  <svg
                    class="w-4 h-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div class="flex flex-col items-center p-4 mb-6 text-center md:w-1/2 md:mb-0 lg:text-left lg:items-start">
              <div
                class="inline-flex items-center justify-center flex-shrink-0 w-12 h-12 mb-5 text-blue-800 bg-gray-200 rounded-full">
                <i class="fas fa-chart-line" />
              </div>
              <div class="flex-grow">
                <h2 class="mb-3 text-lg font-medium tracking-tighter text-gray-800 title-font">
                  Get rewarded for supporting
                </h2>
                <p class="text-base leading-relaxed">
                  Get rewarded in personal creator tokens for being an early subscriber
                </p>
                <a
                  href="#"
                  class="inline-flex items-center font-semibold text-blue-700 md:mb-2 lg:mb-0 hover:text-blue-400 hidden">
                  Learn More
                  <svg
                    class="w-4 h-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pt-4 pb-16 px-4 text-center bg-gray-100">
      <div class="w-fill mx-auto mt-4 mb-10">
        <h1 class="text-blue-800 font-bold text-6xl mb-10 font-heading">{name}</h1>
      </div>
      <div class="py-4">
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
                <CreatorCard {creator} />
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </section>

    <About />
  </main>
</div>

<section class="pt-20 bg-gradient-to-b from-teal-400 to-white">
  <div class="container px-4 mx-auto w-4/6 lg:w-2/6 mb-12">
    <h2 class="text-5xl font-semibold text-center mb-6">Partners & Investors</h2>
    <div class="grid grid-flow-row-dense grid-cols-1 grid-rows-2 gap-4 lg:gap-10">
      <img class="justify-self-center" alt="..." src="/images/nucypher.png" />
      <img alt="..." src="/images/btselab.png" />
    </div>
  </div>
</section>

<section>
  <div class="container px-4 mx-auto w-5/6 lg:w-3/6 mb-24">
    <h2 class="text-5xl font-semibold text-center">Technologies</h2>
    <div class="grid grid-flow-row-dense grid-cols-3 grid-rows-2 gap-4 lg:gap-20 items-center align-middle">
      <img alt="..." src="/images/ethereum.png" />
      <img alt="..." src="/images/nucypher.png" />
      <img alt="..." src="/images/filecoin.png" />
      <img alt="..." src="/images/superfluid.png" />
      <img alt="..." src="/images/textile.png" />
      <img alt="..." src="/images/thegraph.png" />
    </div>
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
              href="https://t.me/creaton_io"
              target="_blank">
              <i class="text-gray-500 fab fa-telegram-plane text-lg leading-lg" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
