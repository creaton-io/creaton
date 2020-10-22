<script lang="ts">
  import WalletAccess from '../templates/WalletAccess.svelte';
  import {Contract} from '@ethersproject/contracts';
  import {contracts} from '../contracts.json';
  import {wallet, flow, chain} from '../stores/wallet';
  import { onMount } from 'svelte';

  let contractAddress;

  if (typeof window !== 'undefined') {
    contractAddress = window.location.pathname.split('/')[2];

    onMount(async () => {
      flow.execute(async () => {
        const creatorContract = new Contract(
            contractAddress, 
            contracts.Creator.abi,
            wallet.provider
          )
        console.log(creatorContract)
      })
    })
  }
</script>
<WalletAccess>
  <section class="py-8 px-4 text-center">
    {contractAddress}
  </section>
</WalletAccess>