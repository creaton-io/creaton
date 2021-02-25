import {useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {NuCypherSocketContext} from "./Socket";
import {EncryptedObject, TextileStore} from "./stores/textileStore";
import {NuCypher} from "./NuCypher";
interface params{
  id: string;
}
export function Creator() {
  let { id } = useParams<params>();
  const creatorContractAddress = id
  function getContents(){
    //this should be replaced by a graph query
    return ['/ipfs/bafkreif5cq7y7uk2fpl2r7vrms72no5svh7yy4wgivjjgn2bdo4munewhe','/ipfs/bafybeibkelvgjzum7zo5t3kmehsxkxhjcfi2dbkgbrpp72526ho5iq3jaa']
  }
  const contents = getContents()
  const [textile, _] = useState(new TextileStore())
  useEffect(()=>{
    textile.authenticate().then(function(){
      console.log('textile authenticated')
    })
  },[textile])
  const [subscription, setSubscription] = useState('not subscribed') // should be '',pending,accepted
  const context = useWeb3React<Web3Provider>()
  const socket = useContext(NuCypherSocketContext);
  const [keyPair, setKeyPair] = useState({})
  function downloadURL(data, fileName) {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }
  function downloadBlob(decrypted: ArrayBuffer) {
    const blob = new Blob([new Uint8Array(decrypted)]);
    const url = window.URL.createObjectURL(blob);
    downloadURL(url, 'download');
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  async function subscribe() {
    setSubscription('pending')
    if (!(context.account)) {
      alert('Connect to metamask')
      return;
    }
    if (socket == null) {
      alert('connect to wallet')
      return
    }
    const nucypher = new NuCypher(socket)
    const result = await nucypher.getKeyPair(context.account)
    setKeyPair(result)
  }
  async function download(ipfsPath){
    console.log(ipfsPath)
    const encObject: EncryptedObject = await textile.downloadEncryptedFile(ipfsPath)
    if (socket == null) {
      alert('connect to wallet')
      return
    }
    const nucypher = new NuCypher(socket)
    const data = await nucypher.decrypt(encObject.policy_pubkey, encObject.alice_sig_pubkey, encObject.enc_file_content,
      creatorContractAddress, context.account!)
    const decrypted = textile.base64ToArrayBuffer(data['decrypted_content']);
    await downloadBlob(decrypted);
  }
  return (
    <div>
      <h3>ID: {id}</h3>
      <h3>Status: {subscription}</h3>
      <h3>Account: {context.account}</h3>
      {Object.entries(keyPair).map((x) => <h3 key={x[0]}>{x[0]} : {x[1]}</h3>)}
      <button onClick={() => {
            subscribe()
          }}>Subscribe</button>
      {
        contents.map((x)=><h3 key={x}>{x}: <button onClick={()=>{download(x)}}>Download</button></h3>)
      }
    </div>
  );
}
