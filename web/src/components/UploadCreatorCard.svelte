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

<Link id={creator.creatorContract} params={{id: creator.creatorContract}} name="CreatorUpload" class="block px-4 py-8 border rounded overflow-hidden">
  <h3 class="text-4xl leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">{creator.title}</h3>
  <img class="avatar" src={creator.avatarURL} alt={creator.title}/>
  <h3 class="text-1xl mt-3 leading-normal font-medium text-gray-900 dark:text-gray-500 truncate">Monthly fee: ${creator.subscriptionPrice}</h3>
  <p class="mt-2 text-base leading-6 text-gray-500 dark:text-gray-300 truncate mx-10">
    <slot />
  </p>
</Link>
