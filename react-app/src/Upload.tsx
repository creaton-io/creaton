import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useCurrentCreator} from "./Utils";
import {Contract} from "ethers";
import creaton_contracts from './contracts.json'
import {NotificationHandlerContext} from "./ErrorHandler";
import {UmbralCreator} from "./Umbral";
import {UmbralWasmContext} from "./UmbralWasm";
import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg";
import {Base64} from "js-base64";
import {Button} from "./elements/button";
import {Input} from "./elements/input";
import {ContractForm} from "./ContractForm"
import {Checkbox} from "./elements/checkbox";
import {ARWEAVE_URI, ARWEAVE_GATEWAY} from "./Config";
import SignUp from "./Signup";
import {Toggle} from "./elements/toggle";

const CreatorContract = creaton_contracts.Creator


const Upload = () => {
  const context = useWeb3React<Web3Provider>()
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const [uploadEncrypted, setUploadEncrypted] = useState<boolean>(false);
  const [status, setStatus] = useState("")
  const [nftContractStatus, setNftContractStatus] = useState<any>(undefined)
  const [description, setDescription] = useState("")
  const [fileName, setFileName] = useState("")
  const [isStreaming, setIsStreaming] = useState(false);
  const handleFileSelection = (event) => {
    const file = event.currentTarget.files[0];
    console.log(file)
    setFileName(file.name)
    setIsStreaming(false);
    setCurrentFile(file)
  };
  const fileInput = React.createRef<any>();
  const [ffmpeg, setffmpeg] = useState<any>(undefined)
  useEffect(() => {
    if (ffmpeg === undefined) {
      const _ffmpeg = createFFmpeg({log: true})
      _ffmpeg.load().then(() => {
        setffmpeg(_ffmpeg)
      })
    }
  }, [ffmpeg])
  const {loading, error, currentCreator} = useCurrentCreator()

  function updateNFTContractStatus(){
    if (!context.account || currentCreator === undefined)
      return;
    const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(context.library!.getSigner())
    creatorContract.postNFT().then((address)=>{
      if(address === '0x0000000000000000000000000000000000000000'){
        setNftContractStatus('not-created')
      }
      else
        setNftContractStatus('created')
    })
  }

  useEffect(()=>{
    updateNFTContractStatus();
  },[currentCreator, context])


  const notificationHandler = useContext(NotificationHandlerContext)
  const umbralWasm = useContext(UmbralWasmContext)
  if (!context.account)
    return (<div>Not connected</div>)
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  if (currentCreator === undefined)
    return (<div className="grid grid-cols-1 place-items-center w-max m-auto"><h3>Please signup first. You are not a creator yet.</h3>
      <SignUp/></div>)
  if (!umbralWasm)
    return (<div>Umbral wasm not loaded yet</div>)
  if (nftContractStatus===undefined)
    return (<div>Checking your nft contract status</div>)
  const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(context.library!.getSigner())
  async function createNFT(name: string, symbol: string) {
    try {
      await creatorContract.createPostNFT(name, symbol);
      setNftContractStatus('created');
    } catch (error) {
      notificationHandler.setNotification({
        description: 'Could not create your NFT contract' + error.message,
        type: 'error'
      });
      return;
    }
  }

  async function upload(bytes: Uint8Array, file_type: string) {
    let response
    if (uploadEncrypted) {
      const umbral = new UmbralCreator(umbralWasm, currentCreator!.creatorContract)
      await umbral.initMasterkey(context.library!.getSigner(context.account!), currentCreator!.creatorContract, true)
      let encryptedObject;
      setStatus('Encrypting the file...')
      try {
        encryptedObject = umbral.encrypt(bytes)
      } catch (error) {
        notificationHandler.setNotification({description: error.toString(), type: 'error'})
        return;
      }
      encryptedObject['type'] = file_type
      console.log(encryptedObject)
      setStatus('Uploading encrypted content to arweave...')
      const formData = new FormData();
      formData.append("file", new Blob([JSON.stringify(encryptedObject)], {
        type: "application/json"
      }));
      response = await fetch(ARWEAVE_URI + '/upload', {
        method: 'POST',
        body: formData
      })
    } else {
      setStatus('Uploading content to arweave...')
      const formData = new FormData();
      formData.append("file", new Blob([bytes], {
        type: file_type
      }));
      response = await fetch(ARWEAVE_URI + '/upload', {
        method: 'POST',
        body: formData
      })
    }
    response.text().then(async function (arweave_id) {
      const metadata = {
        name: fileName,
        type: file_type,
        description: description,
        date: (new Date()).getTime().toString(),
        ipfs: arweave_id,
      };
      const NFTMetadata = {
        description: description,
        name: fileName,
        image: ARWEAVE_GATEWAY + arweave_id
      }
      const formData = new FormData();
      formData.append("file", new Blob([JSON.stringify(NFTMetadata)], {
        type: "application/json"
      }));
      const response = await fetch(ARWEAVE_URI + '/upload', {
        method: 'POST',
        body: formData
      })
      response.text().then(async function (nft_arweave_id) {
        console.log(metadata.ipfs);
        setStatus('Adding content metadata to your creator contract')
        let receipt;
        try {
          let tier = 0
          if (uploadEncrypted)
            tier = 1
          receipt = await creatorContract.upload(ARWEAVE_GATEWAY + nft_arweave_id, JSON.stringify(metadata), tier);
        } catch (error) {
          notificationHandler.setNotification({
            description: 'Could not upload the content to your contract' + error.message,
            type: 'error'
          })
          return;
        }
        setStatus('Upload successful!')
        await receipt.wait(1)
        notificationHandler.setNotification({description: 'New NFT minted successfully!', type: 'success'})
        console.log(receipt);
      })
    }).catch(function (error) {
      notificationHandler.setNotification({description: error.toString(), type: 'error'})
    })
  }

  async function uploadChunks() {
    const playlistData = ffmpeg.FS('readFile', 'output.m3u8')
    let playlistText: string = (new TextDecoder()).decode(playlistData);
    console.log(playlistText)
    const matches = playlistText.matchAll(/output(\d+).ts/g)
    const promises: Array<Promise<any>> = []
    // @ts-ignore
    for (const match of matches) {
      const segmentData = ffmpeg.FS('readFile', match[0])
      const formData = new FormData();
      formData.append("file", new Blob([segmentData], {
        type: "video/mp2t"
      }));
      const promise = new Promise((resolve, reject) => {
        fetch(ARWEAVE_URI + '/upload', {
          method: 'POST', body: formData
        }).then(response => {
          response.text().then(arweave_id => {
            playlistText = playlistText.replace(match[0], ARWEAVE_GATEWAY + arweave_id)
            resolve(arweave_id);
          })
        }).catch(() => {
          reject()
        });
      });
      console.log('started uploading ' + match[0])
      promises.push(promise)
    }
    await Promise.all(promises)
    return playlistText
  }

  async function splitAndEncrypt(file) {
    const status_text = 'Splitting and Encrypting video. Progress: %'
    setStatus(status_text + 0)
    const {name} = file
    ffmpeg.FS('writeFile', name, await fetchFile(file))
    console.log('starting to run transcoding')
    ffmpeg.setProgress((progress) => {
      setStatus(status_text + (Math.round(progress.ratio * 100)))
    })

    const key = new Uint8Array(16);
    window.crypto.getRandomValues(key)
    const iv = new Uint8Array(16);
    window.crypto.getRandomValues(iv)
    const keyinfo = 'data:application/octet-stream;base64,' + Base64.fromUint8Array(key) + '\nenc.key\n' + bufferToHex(iv);
    ffmpeg.FS('writeFile', 'enc.key', key)
    ffmpeg.FS('writeFile', 'enc.keyinfo', keyinfo)
    await ffmpeg.run('-i', name, '-hls_time', '60', '-hls_key_info_file', 'enc.keyinfo',
      '-hls_list_size', '0', '-c', 'copy', 'output.m3u8')
    const playlistData = ffmpeg.FS('readFile', 'output.m3u8')
    let playlistText: string = (new TextDecoder()).decode(playlistData);
    console.log(playlistText)
  }

  function bufferToHex(buffer) {
    return [...buffer]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function uploadContent() {
    if (currentFile !== undefined) {
      let bytes
      let type
      if (isStreaming) {
        await splitAndEncrypt(currentFile);
        const text = await uploadChunks()
        console.log('playlist text', text)
        bytes = (new TextEncoder()).encode(text)
        type = 'application/vnd.apple.mpegurl'
      } else {
        const buf = await currentFile.arrayBuffer();
        bytes = new Uint8Array(buf);
        type = currentFile.type
      }
      upload(bytes, type)
    }
  }

  function handleSubmit(event) {
    uploadContent()
    event.preventDefault()
  }

  if(nftContractStatus==='not-created'){
    return (<div className="grid grid-cols-1 place-items-center">
      <h2>You have not created your NFT contract yet.</h2>
      {status && (<h3>{status}</h3>)}
      <ContractForm createNFT={createNFT}/>
    </div>)
  }
  else
  return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 place-items-center w-max m-auto">
        {status && (<h3>{status}</h3>)}
        <input id="file" style={{display: 'none'}} onChange={(event) => handleFileSelection(event)} name="file"
               type="file" ref={fileInput}/>
        <Button label="Choose file" type="button" onClick={() => fileInput.current.click()}>
        </Button>
        <small>
          {currentFile ? currentFile.name || "Error" : "No file chosen"}
        </small>
        {(currentFile?.type === 'video/mp4' && ffmpeg !== undefined) &&
        <div className="w-full m-5">
          <label className="float-left">
            Convert to streaming format
          </label>

          <div className="float-right"><Toggle state={isStreaming} onClick={(e) => {
            e.preventDefault()
            setIsStreaming(!isStreaming)
          }}/></div>
        </div>
        }
        <label htmlFor="name" className="place-self-start">Name</label>
        <Input type="text" name="name" placeholder="Title" value={fileName} onChange={(event) => {
          setFileName(event.target.value)
        }}/>
        <label htmlFor="description" className="place-self-start mt-3">Description</label>
        <Input type="text" name="description" placeholder="Description" value={description} onChange={(event) => {
          setDescription(event.target.value)
        }}/>
        <div className="w-full m-5">
          <label className="float-left">
            Only for subscribers
          </label>

          <div className="float-right"><Toggle state={uploadEncrypted} onClick={(e) => {
            e.preventDefault()
            setUploadEncrypted(!uploadEncrypted)
          }}/></div>
        </div>
        <Button type="submit" label="Upload"/>
      </form>
  );
};

export default Upload;
