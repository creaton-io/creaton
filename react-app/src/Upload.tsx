import {TextileStore} from './stores/textileStore';
import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {NuCypherSocketContext} from "./Socket";
import {useCurrentCreator} from "./Utils";
import {Contract, utils} from "ethers";
import CreatorContract from "./Creator.json";
import {NuCypher} from "./NuCypher";


interface Values {
  file: string;
  description: string;
}

const Upload = () => {
  const context = useWeb3React<Web3Provider>()
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const [currentUpload, setCurrentUpload] = useState<any>({})
  const [textile, _] = useState(new TextileStore())
  useEffect(() => {
    textile.authenticate().then(function () {
      console.log('textile authenticated')
    })
  }, [textile])
  const socket = useContext(NuCypherSocketContext);
  const handleFileSelection = (event) => {
    const file = event.currentTarget.files[0];
    console.log(file)
    setCurrentFile(file)
  };

  const {loading, error, currentCreator} = useCurrentCreator()
  if (socket === null)
    return (<div>Not connected to NuCypher</div>)
  if (!context.account)
    return (<div>Not connected</div>)
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  if (currentCreator === undefined)
    return (<div>Please signup first. You are not a creator yet.</div>)
  const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(context.library!.getSigner())

  async function upload(file: File, contractAddress: string, creatorAddress: string) {
    const buf = await file.arrayBuffer();
    const b64File = textile.arrayBufferToBase64(buf);
    const nucypher = new NuCypher(socket!)
    const encryptedObject = await nucypher.encrypt(b64File, contractAddress, utils.getAddress(creatorAddress))
    encryptedObject['type'] = file.type
    const buffer = Buffer.from(JSON.stringify(encryptedObject))
    textile.pushFile(file, buffer).then(async function (encFile) {
      const metadata = {
        name: encFile.name,
        type: encFile.type,
        description: currentUpload.description,
        date: encFile.date,
        ipfs: encFile.ipfsPath,
      };
      console.log(metadata.ipfs);
      const receipt = await creatorContract.upload(JSON.stringify(metadata));
      console.log(receipt);
    })
  }

  //TODO: remove formik since it is pretty simple to handle without it
  return (
    <div>
      <h1>Welcome {currentCreator.title}</h1>
      <Formik
        initialValues={{
          file: '',
          description: '',
        }}
        onSubmit={(
          values: Values,
          {setSubmitting}: FormikHelpers<Values>
        ) => {
          if (currentFile !== undefined) {
            //encrypt via nucypher first
            setCurrentUpload({description: values.description, file: currentFile})
            upload(currentFile, currentCreator.creatorContract, currentCreator.user)
          }
          console.log(values)
          //TODO error handling on promise
          setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="file">Content</label>
          <Field id="file" onChange={(event) => handleFileSelection(event)} name="file" type="file"/>

          <label htmlFor="description">Description</label>
          <Field id="description" name="description" placeholder=""/>

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Upload;
