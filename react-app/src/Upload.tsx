import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "./web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useCurrentCreator} from "./Utils";
import {Contract} from "ethers";
import creaton_contracts from "./Contracts";
import {NotificationHandlerContext} from "./ErrorHandler";
import {LitContext, LitProvider} from "./LitProvider";
import {createFFmpeg, fetchFile} from "./assets/ffmpeg/src";
import {Base64} from "js-base64";
import {Button} from "./elements/button";
import {Input} from "./elements/input";
import {Textarea} from "./elements/textArea";
import {ARWEAVE_URI, ARWEAVE_GATEWAY} from "./Config";
import SignUp from "./Signup";
import {Toggle} from "./elements/toggle";
import {Web3UtilsContext, Web3UtilsProviderContext} from "./Web3Utils";
import {Icon} from "./icons";
import Tooltip from "./elements/tooltip";
import {useCanBecomeCreator} from "./Whitelist";
import LitJsSdk from 'lit-js-sdk'
import { ExecutableDefinitionsRule } from "graphql";
import { Editor } from '@tinymce/tinymce-react'; 

const CreatorContract = creaton_contracts.Creator

const Upload = () => {
  const context = useWeb3React<Web3Provider>()
  const web3utils = useContext(Web3UtilsContext)
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const [uploadEncrypted, setUploadEncrypted] = useState<boolean>(false);
  const [description, setDescription] = useState("")
  const [fileName, setFileName] = useState("")
  const [isStreaming, setIsStreaming] = useState(false);
  const handleFileSelection = (event) => {
    const file = event.currentTarget.files[0];
    console.log(file)
    setFileName(file.name)
    setIsStreaming(true);
    setCurrentFile(file)
  };
  const fileInput = React.createRef<any>();
  const [ffmpeg, setffmpeg] = useState<any>(undefined)
  const {biconomyProvider, setBiconomyProvider} = useContext(Web3UtilsProviderContext);
  useEffect(() => {
    // if (ffmpeg === undefined) {
    //   const _ffmpeg = createFFmpeg({corePath: 'http://localhost:3000/ffmpeg-core.js', log: true})
    //   _ffmpeg.load().then(() => {
    //     setffmpeg(_ffmpeg)
    //   })
    // }
  }, [ffmpeg])

  const {loading, error, currentCreator} = useCurrentCreator()
  const canBecomeCreator = useCanBecomeCreator()


  const notificationHandler = useContext(NotificationHandlerContext)
  const litNode = useContext(LitContext)
  if (!biconomyProvider)
    return (<div>Not connected</div>)
  if (!canBecomeCreator)
    return (<div>Not allowed, you are not whitelisted</div>)
  if (loading) return (<p>Loading...</p>);
  if (currentCreator === undefined)
    return (<SignUp/>)
  if (!litNode)
    return (<div>Lit Node not loaded yet</div>)
  const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(biconomyProvider.getSignerByAddress(context.account))

  async function upload(file: File, file_type: string) {
    let response
    if (uploadEncrypted && currentCreator !== undefined) {
      web3utils.setIsWaiting('Encrypting the file...')
      let zipBlobFile;
      try {
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'mumbai'});
        const subConditions = [
          {
            contractAddress: currentCreator.creatorContract,
            standardContractType: 'Creaton',
            chain: "mumbai",
            method: 'subscribers',
            parameters: [
              ':userAddress',
            ],
            returnValueTest: {
              comparator: '=',
              value: 'true'
            }
          }
        ]

        const { zipBlob, encryptedSymmetricKey } = await LitJsSdk.encryptFileAndZipWithMetadata({authSig, accessControlConditions: subConditions, chain: "mumbai", file: file, litNodeClient: litNode, readme: "test"});
        
        web3utils.setIsWaiting('Uploading encrypted content to arweave...');
        const formData = new FormData();
        formData.append("file", zipBlob); //do not change "file"!
        response = await fetch(ARWEAVE_URI + '/upload', {
          method: 'POST',
          body: formData
        })
      } catch (error: any) {
        notificationHandler.setNotification({description: error.toString(), type: 'error'})
        web3utils.setIsWaiting(false)
        return;
      }

    } else {
      web3utils.setIsWaiting('Uploading content to Arweave...')
      const formData = new FormData();
      
      const buf = await file.arrayBuffer();
      let bytes = new Uint8Array(buf);

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
        web3utils.setIsWaiting('Adding content metadata to your creator contract')
        let receipt;
        try {
          let tier = 0
          if (uploadEncrypted)
            tier = 1
          receipt = await creatorContract.upload(ARWEAVE_GATEWAY + nft_arweave_id, JSON.stringify(metadata), tier);
        } catch (error: any) {
          notificationHandler.setNotification({
            description: 'Could not upload the content to your contract' + error.message,
            type: 'error'
          })
          web3utils.setIsWaiting(false)
          return;
        }
        web3utils.setIsWaiting(true);
        await receipt.wait(1)
        web3utils.setIsWaiting(false);
        notificationHandler.setNotification({description: 'New NFT minted successfully!', type: 'success'})
        console.log(receipt);
      })
    }).catch(function (error) {
      notificationHandler.setNotification({description: error.toString(), type: 'error'})
      web3utils.setIsWaiting(false)
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
      // eslint-disable-next-line no-loop-func
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
    const status_text = 'Splitting and Encrypting video. Progress: '
    web3utils.setIsWaiting(status_text + 0)
    const {name} = file
    ffmpeg.FS('writeFile', name, await fetchFile(file))
    console.log('starting to run transcoding')
    ffmpeg.setProgress((progress) => {
      web3utils.setIsWaiting(status_text + (Math.round(progress.ratio * 100)) + '%')
    })

    const key = new Uint8Array(16);
    window.crypto.getRandomValues(key)
    const iv = new Uint8Array(16);
    window.crypto.getRandomValues(iv)
    const keyinfo = 'data:application/octet-stream;base64,' + Base64.fromUint8Array(key) + '\nenc.key\n' + bufferToHex(iv);
    ffmpeg.FS('writeFile', 'enc.key', key)
    ffmpeg.FS('writeFile', 'enc.keyinfo', keyinfo)
    await ffmpeg.run('-i', name, '-hls_time', '6', '-hls_key_info_file', 'enc.keyinfo',
      '-hls_list_size', '0', '-c', 'copy', 'output.m3u8')
    const playlistData = ffmpeg.FS('readFile', 'output.m3u8')
    let playlistText: string = (new TextDecoder()).decode(playlistData);
    console.log(playlistText) //playlist/output.m3u8 is now stored in ffmpeg, so no need to return var here
  }

  function bufferToHex(buffer) {
    return [...buffer]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function uploadContent() {
    if (currentFile !== undefined) {
      let bytes
      let file
      let type
      if (currentFile?.type === 'video/mp4') {
        await splitAndEncrypt(currentFile);
        const text = await uploadChunks()
        console.log('playlist text', text)
        //bytes = (new TextEncoder()).encode(text)
        type = 'application/vnd.apple.mpegurl'

        let file = new File([text], "output.m3u8", {
          type: "application/vnd.apple.mpegurl",
        });

        upload(file, type)
        return
      }
      upload(currentFile, type)
    }else{
      //upload((new TextEncoder()).encode(""), "text");
    }
  }

  function handleSubmit(event) {
    uploadContent()
    event.preventDefault()
  }

  return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 place-items-center w-max m-auto py-10 text-white">
        <div className="w-full">
          <Input className="text-black w-full" type="text" label="Title" placeholder="Title" value={fileName} onChange={(event) => {
            setFileName(event.target.value)
          }}/>
        </div>

        <div className="w-full m-5">
          <div className="flex items-center mb-1">
            <label className="block font-semibold mb-1">Description</label>
          </div>
          <Editor
            apiKey="onu4668y0hkvss8rf10j9bfaz4ijluey87k92e4z0fqstj6w"
            initialValue="<p></p>"
            init={{
              height: 500,
              menubar: false,
              plugins: [
                'advlist autolink lists link image', 
                'charmap print preview anchor help',
                'searchreplace visualblocks code',
                'insertdatetime media table paste wordcount'
              ],
              toolbar:
                'undo redo | formatselect | bold italic | \
                alignleft aligncenter alignright | \
                bullist numlist outdent indent | help'
            }}
            onChange={(e) => setDescription(e.target.getContent())}
          />
        </div>

        <div className="w-full m-5">
          <div className="flex items-center mb-1">
            <label className="block font-semibold mb-1">Attach a file</label>
          </div>
          <input id="file" style={{display: 'none'}} onChange={(event) => handleFileSelection(event)} name="file"
                type="file" ref={fileInput}/>
          <Button label="Choose file" type="button" onClick={() => fileInput.current.click()}>
          </Button>
          <small className="text-white">
            {currentFile ? currentFile.name || "Error" : "No file chosen"}
          </small>
          {(currentFile?.type === 'video/mp4' && ffmpeg !== undefined) &&
          <div className="w-full m-5 hidden">
            <label className="float-left">
              Convert to streaming format (fragmented video for faster looading)
            </label>

            <div className="float-right"><Toggle state={isStreaming} onClick={(e) => {
              e.preventDefault()
              setIsStreaming(!isStreaming)
            }}/></div>
          </div>
          }
        </div>

        <div className="w-full m-5">
          <label className="flex float-left">
            <span className="mr-1">Only for subscribers</span> <Tooltip content={<div>Title and description of the content are still visible for everyone</div>} hover>
            <Icon name="question-circle" className="text-gray-500 " />
              </Tooltip>
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
