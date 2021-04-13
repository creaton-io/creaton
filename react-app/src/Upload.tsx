import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {useCurrentCreator} from "./Utils";
import {Contract, utils} from "ethers";
import creaton_contracts from './contracts.json'
import {ErrorHandlerContext} from "./ErrorHandler";
import {UmbralCreator} from "./Umbral";
import {UmbralWasmContext} from "./UmbralWasm";
import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg";
import {TextileContext} from "./TextileProvider";
import {Base64} from "js-base64";


const CreatorContract = creaton_contracts.Creator

let ARWEAVE_URI
if (false && process.env.NODE_ENV === 'development')
  ARWEAVE_URI = 'http://localhost:1984'
else
  ARWEAVE_URI = 'https://report.creaton.io'


interface NFTValues {
  name: string;
  symbol: string;
}

const ARWEAVE_GATEWAY = 'https://arweave.net/';
const Upload = () => {
  const context = useWeb3React<Web3Provider>()
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const [uploadEncrypted, setUploadEncrypted] = useState<boolean>(false);
  const textile = useContext(TextileContext)
  const [status, setStatus] = useState("")
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
  const errorHandler = useContext(ErrorHandlerContext)
  const umbralWasm = useContext(UmbralWasmContext)
  if (!context.account)
    return (<div>Not connected</div>)
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  if (currentCreator === undefined)
    return (<div>Please signup first. You are not a creator yet.</div>)
  if (!umbralWasm)
    return (<div>Umbral wasm not loaded yet</div>)
  console.log(context.library);
  const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(context.library!.getSigner())

  async function createNFT(name: string, symbol: string) {
    try {
      let receipt = await creatorContract.createTier(name, symbol);
    } catch (error) {
      errorHandler.setError('Could not create your NFT contract' + error.message);
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
        errorHandler.setError(error.toString())
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
          errorHandler.setError('Could not upload the content to your contract' + error.message)
          return;
        }
        setStatus('Upload successful!')
        console.log(receipt);
      })
    }).catch(function (error) {
      errorHandler.setError(error.toString())
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

  return (
    <div>
      <h1>Welcome {currentCreator.title}</h1>
      {status && (<h3>{status}</h3>)}
      <Formik
        initialValues={{
          name: '',
          symbol: '',
        }}
        onSubmit={(
          values: NFTValues,
          {setSubmitting}: FormikHelpers<NFTValues>
        ) => {
          createNFT(values.name, values.symbol)
          // console.log(values)
          //TODO error handling on promise
          setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="name">name</label>
          <Field id="name" name="name" placeholder=""/>

          <label htmlFor="symbol">symbol</label>
          <Field id="symbol" name="symbol" placeholder=""/>

          <button type="submit">Submit</button>
        </Form>
      </Formik>
      <form onSubmit={handleSubmit}>
        <label htmlFor="file">Content</label>
        <input id="file" style={{display: 'none'}} onChange={(event) => handleFileSelection(event)} name="file"
               type="file" ref={fileInput}/>
        <button type="button" onClick={() => fileInput.current.click()}>
          Choose file
        </button>
        <small>
          {currentFile ? currentFile.name || "Error" : "No file chosen"}
        </small>
        {(currentFile?.type === 'video/mp4' && ffmpeg !== undefined) &&
        <div>
          <label htmlFor="isStreaming">Convert to streaming format?</label>
          <input type="checkbox" id="isStreaming" name="isStreaming" checked={isStreaming}
                 onChange={() => {
                   setIsStreaming(!isStreaming)
                 }}/>
        </div>}
        <br/>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" placeholder="name" value={fileName} onChange={(event) => {
          setFileName(event.target.value)
        }}/>
        <label htmlFor="description">Description</label>
        <input type="text" name="description" placeholder="description" value={description} onChange={(event) => {
          setDescription(event.target.value)
        }}/>
        <input type="checkbox" id="encrypted" name="encrypted" checked={uploadEncrypted}
               onChange={() => {
                 setUploadEncrypted(!uploadEncrypted)
               }}/>
        <label htmlFor="encrypted">Encrypted?</label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Upload;
