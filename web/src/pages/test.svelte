<script lang="ts">
  import {wallet, flow} from '../stores/wallet';
  import {onMount} from 'svelte';
  import WalletAccess from '../templates/WalletAccess.svelte';
  import Button from '../components/Button.svelte';
  import fetch from "isomorphic-fetch";
  
  let ethereum;
  let accounts;
  let tx;
  let msg;
  onMount(async () => {
      let socket = window['socket']
      socket.on('connect', function(){ console.log('client connected!')});
      socket.on('sign_broad_req', function(data){
          console.log('new request for signing!',data);
          data = decodeURIComponent(data).replaceAll('+',' ')
          console.log(data)
          data = JSON.parse(data);
          // send(data)
          tx=data;
      });
      socket.on('sign_req', function(data){
          console.log('new request for signing!',data);
          data = decodeURIComponent(data).replaceAll('+',' ')
          console.log(data)
          data = JSON.parse(data);
          // send(data)
          msg=data;
      });
      socket.on('disconnect', function(){console.log('client disconnected!')});
      setTimeout(()=>{console.log("here we are!!!");window['socket'].emit('event', 'sample!');},1000)
      fetch('http://0.0.0.0:5000/test')
      .then(function(response) {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then(function(stories) {
          console.log(stories);
      });
      if (wallet.provider) {
      } else {
        flow.execute(async (contracts) => {
        });
      }
      if (typeof window['ethereum'] !== 'undefined') {
        ethereum = window['ethereum'];
        accounts = ethereum.request({ method: 'eth_requestAccounts' }).then(
                          result => {console.log(result)}).catch (
                            (error) => {
  
                            }
                          );
                        }
      });
  
  async function getAccounts() {
      
  }
  
  async function send() {
    let data = tx;
    let params= [
      {
        from: data['from'],//'0x8F9A150adb245e8e460760Ed1BFd3C026a0457db',
        to: data['to'],//'0x328BDfdD563f67a47c2757E5fD0298AD86F447c0',
        gas: data['gas'],//, // 30400
        gasPrice: data['gasPrice'],//, // 10000000000000
        value: data['value'],//'0x0e9234569184e72a', // 2441406250
        data: data['data'],
      },
    ];
    ethereum.request({
      method: 'eth_sendTransaction',
      params,
    })
    .then((result) => {
      window['socket'].emit('sign_broad_res', result);
      console.log(result)
    })
    .catch((error) => {
      // If the request fails, the Promise will reject with an error.
    });
  }
    
  async function sign() {
      let params= [
          msg['address'],
          msg['message']
      ];
      ethereum.request({
          method: 'personal_sign',
          params,
      })
      .then((result) => {
          window['socket'].emit('sign_res', result);
          console.log(result);
      })
      .catch((error) => {
          console.log("sign error")
          console.log(error);
      });
  }
  </script>
  
  
  <WalletAccess />
  <section class="py-8 px-4 text-center">
    <form class="content flex flex-col max-w-lg mx-auto">
      <div class="field-row">
        <Button class="mt-3" on:click={getAccounts}>Get Account</Button>
      </div>
    <br />
      <div class="field-row">
        <Button class="mt-3" on:click={send}>Send</Button>
      </div>
    <br />
      <div class="field-row">
          <Button class="mt-3" on:click={sign}>Sign</Button>
      </div>
  </form>
  </section>
