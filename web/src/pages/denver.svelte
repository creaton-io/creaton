<script lang="ts">
import Button from '../components/Button.svelte';
</script>

<style>
    ::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}

.friends-container {
    height: 200px;
}

.small-button {
    max-width: 100px;
    margin: 10px auto;
}

</style>


<section class="py-8 px-4 text-center bg-indigo-100">

<div class="border-b-4 py-4">

    <div class="max-w-5xl  mx-auto">
        <div class="w-full lg:flex items-center">
            <div class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden flex-1">
                <img src="https://i.pravatar.cc/300" />
            </div>
            
            <div class=" p-4 flex flex-col justify-between leading-normal flex-grow flex-1">
              <div class="mb-8">
                <div class="text-black font-bold text-xl mb-2">Amin</div>
                <p class="text-grey-darker text-base">0xcDde21d9eE3deC9e00da930ce40e5BEceDE46799</p>
              </div>

              <div class="small-button">
                <Button>Subscribe</Button>
              </div>
             
            </div>


<!--  Subsribers Notification-->

            <div class="overflow-scroll flex-1 px-4 h-20 friends-container">
                <div class="flex justify-between bg-white p-5 rounded-lg mb-3 shadow-lg">
                    <h2 class="text-xl font-bold text-left mr-5">Ziggy Zeidan</h2>
                    <Button class="flex-1">Grant</Button>
                </div>

                <div class="flex justify-between bg-white p-5 rounded-lg mb-3 shadow-lg">
                    <h2 class="text-xl font-bold text-left mr-5">Ziggy Zeidan</h2>

                    <Button class="flex-1">Grant</Button>
                </div>

                <div class="flex justify-between bg-white p-5 rounded-lg mb-3 shadow-lg">
                    <h2 class="text-xl font-bold text-left mr-5">Ziggy Zeidan</h2>

                    <Button class="flex-1">Grant</Button>
                </div>

                <div class="flex justify-between bg-white p-5 rounded-lg mb-3 shadow-lg">
                    <h2 class="text-xl font-bold text-left mr-5">Ziggy Zeidan</h2>

                    <Button class="flex-1">Grant</Button>
                </div>

                <div class="flex justify-between bg-white p-5 rounded-lg mb-3 shadow-lg">
                    <h2 class="text-xl font-bold text-left mr-5">Ziggy Zeidan</h2>

                    <Button class="flex-1">Grant</Button>
                </div>

                <div class="flex justify-between bg-white p-5 rounded-lg mb-3 shadow-lg">
                    <h2 class="text-xl font-bold text-left mr-5">Ziggy Zeidan</h2>

                    <Button class="flex-1">Grant</Button>
                </div>
            </div>
           
          </div>
    </div>

</div>

   
<!--  Content of the images-->
   
<div class="border-b-4">
    <div class="max-w-5xl  mx-auto">
        <div class="flex pt-4">
            <div class="flex-1 text-center px-4 py-2 m-2">
                <div class="flex flex-col justify-between pt-4 pb-5 px-3 bg-white shadow-lg rounded-lg">
                    <h3 class="text-2xl leading-normal font-medium text-gray-900 truncate text-center mb-2">Name</h3> 
                   </div>
                   
                   <img class="w-full object-cover object-center mb-1" src="https://picsum.photos/800">

                    <div class="bg-white ">
                        <div class="flex justify-evenly py-4 mb-2">
                            <i class="fa fa-heart text-3xl  hover:text-purple-600" aria-hidden="true"></i>
                            <i class="fa fa-thumbs-down text-4xl  hover:text-purple-600" aria-hidden="true"></i>
                        </div>
    
                        <p class="pb-5">
                            This is the decription of the image here.
                        </p>
                    </div>
                    
              
            </div>
            
            <div class="flex-1 text-center px-4 py-2 m-2">
                <div class="flex flex-col justify-between pt-4 pb-5 px-3 bg-white shadow-lg rounded-lg">
                    <h3 class="text-2xl leading-normal font-medium text-gray-900 truncate text-center mb-2">Name</h3> 
                   </div>
                    <img class="w-full object-cover object-center mb-1" src="https://picsum.photos/800">

                    <div class="bg-white ">
                        <div class="flex justify-evenly py-4 mb-2">
                            <i class="fa fa-heart text-3xl  hover:text-purple-600" aria-hidden="true"></i>
                            <i class="fa fa-thumbs-down text-4xl  hover:text-purple-600" aria-hidden="true"></i>
                        </div>
    
                        <p class="pb-5">
                            This is the decription of the image here.
                        </p>
                    </div>
            </div>


              <div class="flex-1 text-center px-4 py-2 m-2">
                    <div class="flex flex-col justify-between pt-4 pb-5 px-3 bg-white shadow-lg rounded-lg">
                        <h3 class="text-2xl leading-normal font-medium text-gray-900 truncate text-center mb-2">Name</h3> 
                   </div>
                    
                   <img class="w-full object-cover object-center mb-1" src="https://picsum.photos/800">

                    <div class="bg-white ">
                        <div class="flex justify-evenly py-4 mb-2">
                            <i class="fa fa-heart text-3xl  hover:text-purple-600" aria-hidden="true"></i>
                            <i class="fa fa-thumbs-down text-4xl  hover:text-purple-600" aria-hidden="true"></i>
                        </div>
    
                        <p class="pb-5">
                            This is the decription of the image here.
                        </p>
                    </div>
            </div>
    </div>

</div>
   

</section>