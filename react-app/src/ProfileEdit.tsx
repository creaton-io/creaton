import {Button} from "./elements/button";
import React, {useContext, useEffect, useState} from "react";
import {Input} from "./elements/input";
import {Contract} from "ethers";
import creaton_contracts from "./contracts.json";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useCurrentProfile} from "./Utils";
import {Avatar} from "./components/avatar";
import {ARWEAVE_GATEWAY, ARWEAVE_URI} from "./Config";
import {NotificationHandlerContext} from "./ErrorHandler";

const ProfileEdit = (props) => {
  const web3Context = useWeb3React<Web3Provider>()
  const fileInput = React.createRef<any>();
  const [previewSrc, setPreviewSrc] = useState<any>('')
  const [username, setUsername] = useState<string>('')
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const {currentProfile, refetch} = useCurrentProfile()
  const notificationHandler = useContext(NotificationHandlerContext)
  useEffect(() => {
    console.log(currentProfile)
    if (currentProfile) {
      setUsername(currentProfile.username)
      if(currentProfile.image)
        setPreviewSrc(currentProfile.image)
    }
    else{
      setUsername('')
      setPreviewSrc('')
    }
  }, [currentProfile])

  const showPreviewImage = (file) => {
    if(!file)return;
    const reader = new FileReader();
    reader.onload = function (e) {
      setPreviewSrc(e.target!.result)
    };
    reader.readAsDataURL(file);
  }

  const handleFileSelection = (event) => {
    const file = event.currentTarget.files[0];
    console.log(file)
    setCurrentFile(file)
    showPreviewImage(file)
  };
  const CreatonAdminContract = creaton_contracts.CreatonAdmin
  const creatorFactoryContract = new Contract(CreatonAdminContract.address, CreatonAdminContract.abi)

  async function updateProfile(event) {
    event.preventDefault()
    const payload = {
      'username': username
    }
    if (currentFile) {
      const buf = await currentFile.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const file_type = currentFile.type
      const formData = new FormData();
      formData.append("file", new Blob([bytes], {
        type: file_type
      }));
      const response = await fetch(ARWEAVE_URI + '/upload', {
        method: 'POST',
        body: formData
      })
      const arweave_id = await response.text()
      payload['image'] = ARWEAVE_GATEWAY + arweave_id
    } else if (previewSrc) {
      payload['image'] = previewSrc
    }
    const {library} = web3Context;
    console.log(payload)
    const connectedContract = creatorFactoryContract.connect(library!.getSigner())
    let result
    try {
      result = await connectedContract.updateProfile(JSON.stringify(payload))
    } catch (error) {
      notificationHandler.setNotification({
        description: 'Could not create your profile' + error.message,
        type: 'error'
      });
      return;
    }
    await result.wait(1)
    notificationHandler.setNotification({description: 'Profile successfully updated', type: 'success'})
    refetch()
  }

  if (!web3Context.library)
    return (<div>Connect your wallet</div>)
  return (
    <form onSubmit={updateProfile} className="grid grid-cols-1 place-items-center">

      <input id="file" style={{display: 'none'}} accept="image/x-png,image/gif,image/jpeg"
             onChange={(event) => handleFileSelection(event)} name="file"
             type="file" ref={fileInput}/>
      <div className="flex flex-row">
        <div className="flex-shrink place-self-center p-5">
          <Button label="Upload Avatar" type="button" onClick={() => fileInput.current.click()}/>
        </div>
        <div className="p-5">
          <Avatar src={previewSrc}/>
        </div>
      </div>
      <div className="p-5"><Input type="text" name="username" placeholder="Your Username" label="Enter your username" value={username}
                                  onChange={(event) => {
                                    setUsername(event.target.value)
                                  }}/></div>
      <div><Button type="submit" label={currentProfile ? "Update Profile" : "Sign Up"}/></div>
    </form>)
}

export {ProfileEdit}
