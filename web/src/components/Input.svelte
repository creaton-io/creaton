<script lang="ts">
  export let value = '';
  export let placeholder = '';
  export let className = '';
  export let type = '';
  const onInput = (e) => {
    value = e.target.value;
  };
</script>

<style>
  input {
    @apply p-1 border-gray-300 rounded-md border flex-grow;
  }
</style>

<input {type} class={className} {placeholder} {value} on:input={onInput}/>
