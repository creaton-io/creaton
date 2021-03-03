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
      contents(orderBy: date, orderDirection: desc, where: { creatorContract: $user }) {
        name
        type
        description
        date
        ipfs
      }
    }
    `;
  const SUBSCRIPTION_QUERY = gql`
      query GET_SUBSCRIPTION_STATUS($user: Bytes!, $creator: Bytes!) {
      subscribers(where: { user: $user, creatorContract: $creator}) {
        status
      }
    }
    `;

  const [textile, _] = useState(new TextileStore())
  useEffect(() => {
    textile.authenticate().then(function () {
      console.log('textile authenticated')
    })
  }, [textile])
  const context = useWeb3React<Web3Provider>()
  const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {user: creatorContractAddress}, pollInterval: 10000});
  const subscriptionQuery = useQuery(SUBSCRIPTION_QUERY, {
    variables: {
      user: context.account,
      creator: creatorContractAddress
    }
  });
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

  function downloadBlob(decrypted: ArrayBuffer, content) {
    const blob = new Blob([new Uint8Array(decrypted)], {type: content.type});
    const url = window.URL.createObjectURL(blob);
    downloadURL(url, content.name);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  async function subscribe() {
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

  async function download(content) {
    console.log(content)
    const encObject: EncryptedObject = await textile.downloadEncryptedFile(content.ipfs)
    if (socket == null) {
      alert('connect to wallet')
      return
    }
    const nucypher = new NuCypher(socket)
    const data = await nucypher.decrypt(encObject.policy_pubkey, encObject.alice_sig_pubkey, encObject.enc_file_content,
      creatorContractAddress, context.account!)
    const decrypted = textile.base64ToArrayBuffer(data['decrypted_content']);
    await downloadBlob(decrypted, content);
  }
  if(!context.account)
    return (<div>Connect to metamask</div>)
  if (contentsQuery.loading || subscriptionQuery.loading) {
    return (<div>Loading</div>)
  }
  if (contentsQuery.error || subscriptionQuery.error) {
    return (<div>Error</div>)
  }
  const contents = contentsQuery.data.contents;
  let subscription = 'unsubscribed'
  if (subscriptionQuery.data.subscribers.length > 0)
    subscription = subscriptionQuery.data.subscribers[0].status
  return (
    <div>
      <h3>ID: {id}</h3>
      <h3>Status: {subscription}</h3>
      <h3>Account: {context.account}</h3>
      {Object.entries(keyPair).map((x) => <h3 key={x[0]}>{x[0]} : {x[1]}</h3>)}
      {(subscription == 'unsubscribed') && (<button onClick={() => {
        subscribe()
      }}>Subscribe</button>)}
      <h3>Uploaded Contents</h3>
      <ul>
        {
          contents.map((x) => <li key={x.ipfs}>{x.name}({x.description}):
            {subscription === 'subscribed' && (<button onClick={() => {
              download(x)
            }}>Download</button>)}
          </li>)
        }
      </ul>
    </div>
  );
}
