import {Button} from "./elements/button";
import React, {useContext, useEffect, useState} from "react";
import {Input} from "./elements/input";
import {Contract} from "ethers";
import creaton_contracts from "./Contracts";
import {useWeb3React} from "@web3-react/core";
import {BaseProvider, JsonRpcProvider, Provider, Web3Provider} from "@ethersproject/providers";
import {useCurrentCreator, useCurrentProfile} from "./Utils";
import {CeramicStore} from "./stores/ceramicStore";
import {AvatarUpload} from "./components/avatarUpload";
import {ARWEAVE_GATEWAY, ARWEAVE_URI, BICONOMY_SIGNUP_ENABLED} from "./Config";
import {NotificationHandlerContext} from "./ErrorHandler";
import {Web3UtilsContext, Web3UtilsProviderContext} from "./Web3Utils";
import { CeramicProvider } from "./CeramicProvider";
import { useMetaTx } from "./hooks/metatx";
import {Example} from './components/error-notification';
import WalletModal from './components/walletModal';
import { Web3Storage } from "web3.storage";

const ProfileEdit = (props) => {
  const web3Context = useWeb3React()
  const fileInput = React.createRef<any>();
  const coverInput = React.createRef<any>();
  const [previewSrc, setPreviewSrc] = useState<any>('')
  const [coverSrc, setCoverSrc] = useState<any>('')
  const [username, setUsername] = useState<string>('')
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const [currentCoverFile, setCurrentCoverFile] = useState<File | undefined>(undefined)
  const {currentProfile, refetch} = useCurrentProfile()
  const {currentCreator} = useCurrentCreator()
  const notificationHandler = useContext(NotificationHandlerContext)
  const web3utils = useContext(Web3UtilsContext)
  const [ceramic, setCeramic] = useState<CeramicStore | null>(null);
  const { executeMetaTx } = useMetaTx();

  useEffect(() => {
    console.log(currentProfile)
    if (currentProfile) {
      setUsername(currentProfile.username)
      if (currentProfile.image)
        setPreviewSrc(currentProfile.image)
      if (currentProfile.cover)
        setCoverSrc(currentProfile.cover)
    } else {
      setUsername('')
      setPreviewSrc('')
      setCoverSrc('')
    }
  }, [currentProfile])

  const showPreviewImage = (file, setSrc) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      setSrc(e.target!.result)
    };
    reader.readAsDataURL(file);
  }

  const handleFileSelection = (event) => {
    const file = event.currentTarget.files[0];
    setCurrentFile(file)
    showPreviewImage(file, setPreviewSrc)
  };
  const handleCoverSelection = (event) => {
    const file = event.currentTarget.files[0];
    setCurrentCoverFile(file)
    showPreviewImage(file, setCoverSrc)
  };

  async function storeIpfsWithProgress(file) {
    // show the root cid as soon as it's ready
    const onRootCidReady = cid => {
      console.log('uploading files with cid:', cid)
    }
  
    // when each chunk is stored, update the percentage complete and display
    const totalSize = file.size
    let uploaded = 0
  
    const onStoredChunk = size => {
      uploaded += size
      const pct = totalSize / uploaded
      console.log(`Uploading... ${pct.toFixed(2)}% complete`)
    }
  
    // makeStorageClient returns an authorized Web3.Storage client instance
    const client = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEFFZjI1MDgyODE2RjQ2MzAwNjZkMTFkRkRDNzVCRTZhOWY2QzJFNjMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTIyMTM3MjE5NzUsIm5hbWUiOiJDcmVhdG9uIn0.KTulJ6Oj8gR_AdmLlWMXAyv8ZBZ92djn5CFsnJWlNpI" })
  
    // client.put will invoke our callbacks during the upload
    // and return the root cid when the upload completes
    return client.put(file, { wrapWithDirectory: false, onRootCidReady, onStoredChunk })
  }

  const CreatonAdminContract = creaton_contracts.CreatonAdmin
  const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi)

  async function updateProfile(event) {
    event.preventDefault()
    const payload = {
      'username': username
    }
    // if(ceramic) {
    //   ceramic.updateProfile(payload.username, "test description hardcoded");
    // }
    if (currentFile) {
      const cid = await storeIpfsWithProgress([currentFile]);
      payload['image'] = "https://dweb.link/ipfs/" + cid;
    } else if (previewSrc) {
      payload['image'] = previewSrc
    }
    if (currentCoverFile) {
      const cid = await storeIpfsWithProgress([currentFile]);
      payload['cover'] = "https://dweb.link/ipfs/" + cid;
    } else if (coverSrc) {
      payload['cover'] = previewSrc
    }
    
    const provider = web3Context.provider as Web3Provider;
    const connectedContract = creatorFactoryContract.connect(provider.getSigner());
    let result
    try {
      if(BICONOMY_SIGNUP_ENABLED){
        executeMetaTx("CreatonAdmin", "updateProfile", [JSON.stringify(payload)], undefined, async() => {
          notificationHandler.setNotification({description: 'Profile successfully updated', type: 'success'})
          refetch()  
        })
      }else{
        web3utils.setIsWaiting(true);
        result = await connectedContract.updateProfile(JSON.stringify(payload))
        await result.wait(1)
        web3utils.setIsWaiting(false);
        notificationHandler.setNotification({description: 'Profile successfully updated', type: 'success'})
        refetch()
      }
    } catch (error: any) {

      return (<Example/>);
    }
  }

  if (!web3Context.isActive)
    return (<WalletModal openBool={true} embed={true}/>)

  return (
    // <CeramicProvider>
      <form onSubmit={updateProfile} className="grid grid-cols-1 place-items-center">

        <input id="file" style={{display: 'none'}} accept="image/x-png,image/gif,image/jpeg"
               onChange={(event) => handleFileSelection(event)} name="file"
               type="file" ref={fileInput}/>

        <input id="file" style={{display: 'none'}} accept="image/x-png,image/gif,image/jpeg"
               onChange={(event) => handleCoverSelection(event)} name="file"
               type="file" ref={coverInput}/>
        <div className="flex flex-row">
          <div className="p-5 cursor-pointer" onClick={() => fileInput.current.click()}>
            <AvatarUpload src={previewSrc}/>
          </div>
        </div>
        {currentCreator && (<div className="flex flex-col">
          <div className="flex-shrink place-self-center p-5">
            <Button label="Upload Cover Photo" type="button" onClick={() => coverInput.current.click()}/>
          </div>
        </div>)}


        <div className="p-5 text-white"><Input className="bg-gray-900 text-white" type="text" name="username" placeholder="Your Username" label="Enter your username" value={username}
                                    onChange={(event) => {
                                      setUsername(event.target.value)
                                    }}/></div>
        <div><Button type="submit" label={currentProfile ? "Update Profile" : "Sign Up"}/></div>
      </form>
    /* </CeramicProvider>) */
    )
}

export {ProfileEdit}
