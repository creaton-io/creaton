<script>
  import FileUpload from 'sveltefileuploadcomponent';
  
  function handleFile(files) {
    //do something with files
  }
</script>
<style>
  .wrapper {
    background: #eee;
    margin: 0 auto;
    max-width: 600px;
    padding: 0 20px;
    height: 300px;
    border-radius: 10px;
  }

    .dragging .someClass{
    color: red;
  }
</style>
<div class="wrapper">
  <FileUpload on:input={handleFile}>
    <div class="someClass">Whatever you want here.</div>
  </FileUpload>
</div>