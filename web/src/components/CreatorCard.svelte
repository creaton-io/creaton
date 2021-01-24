<script lang="ts">
  export let creator: {
    user: string;
    title: string;
    creatorContract: string;
    subscriptionPrice: number;
    avatarURL: string;
  };

  import Link from '../_routing/curi/Link.svelte';
</script>

<style>
  .avatar {
    height: 300px;
    object-fit: cover;
    width: 100%;
  }
</style>

<Link
  id={creator.creatorContract}
  params={{id: creator.creatorContract}}
  name="Creator"
  class="block border rounded overflow-hidden p border-gray-300 shadow-2xl">
  <div class="flex justify-between pt-4 pb-5 px-3 bg-white">
    <h3 class="text-2xl leading-normal font-medium text-gray-900 truncate text-left">{creator.title}</h3>
    <button class="bg-blue-800 py-2 px-5 rounded text-white">SUBSCRIBE FOR ${creator.subscriptionPrice}</button>
  </div>
  <img class="avatar" src={creator.avatarURL} alt={creator.title} />
</Link>
