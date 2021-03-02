import {useParams} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {NuCypherSocketContext} from "./Socket";
import {EncryptedObject, TextileStore} from "./stores/textileStore";
import {NuCypher} from "./NuCypher";
import {gql, useQuery} from "@apollo/client";
interface params{
  id: string;
}
export function Creator() {
  let { id } = useParams<params>();
  const creatorContractAddress = id

  const CONTENTS_QUERY = gql`
      query GET_CONTENTS($user: Bytes!) {
      contents(where: { creatorContract: $user }) {
        name
        type
        description
        date
        ipfs
      }
    }
    `;

  const [textile, _] = useState(new TextileStore())
  useEffect(()=>{
    textile.authenticate().then(function(){
      console.log('textile authenticated')
    })
  },[textile])
  const [subscription, setSubscription] = useState('not subscribed') // should be '',pending,accepted
  const context = useWeb3React<Web3Provider>()
  const {loading, error, data} = useQuery(CONTENTS_QUERY,{variables: {user: creatorContractAddress}});
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
  if(loading){
    return(<div>Loading</div>)
  }
  if(error){
    return(<div>Error</div>)
  }
  const contents = data.contents;
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
        contents.map((x)=><h3 key={x.ipfs}>{x.description}: <button onClick={()=>{download(x)}}>Download</button></h3>)
      }
    </div>
  );
}
