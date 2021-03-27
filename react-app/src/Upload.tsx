import React, {useContext, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {useCurrentCreator} from "./Utils";
import {Contract, utils} from "ethers";
import creaton_contracts from './contracts.json'
import {ErrorHandlerContext} from "./ErrorHandler";
import {UmbralAlice} from "./Umbral";
import {UmbralWasmContext} from "./UmbralWasm";
import {TextileContext} from "./TextileProvider";

const CreatorContract = creaton_contracts.Creator

interface Values {
  file: string;
  description: string;
}

const Upload = () => {
  const context = useWeb3React<Web3Provider>()
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)
  const textile = useContext(TextileContext)
  const [status, setStatus] = useState("")
  const handleFileSelection = (event) => {
    const file = event.currentTarget.files[0];
    console.log(file)
    setCurrentFile(file)
  };

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
  const creatorContract = new Contract(currentCreator.creatorContract, CreatorContract.abi).connect(context.library!.getSigner())

  async function upload(file: File, description: string, contractAddress: string, creatorAddress: string) {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const umbral = new UmbralAlice(umbralWasm, currentCreator!.user)
    await umbral.initMasterkey(context.library!.getSigner(context.account!))
    let encryptedObject;
    setStatus('Encrypting the file...')
    try {
      encryptedObject = umbral.encrypt(bytes)
    } catch (error) {
      errorHandler.setError(error.toString())
      return;
    }
    encryptedObject['type'] = file.type
    console.log(encryptedObject)
    const buffer = Buffer.from(JSON.stringify(encryptedObject))
    setStatus('Uploading encrypted content to IPFS...')
    textile!.pushFile(file, buffer).then(async function (encFile) {
      const metadata = {
        name: encFile.name,
        type: encFile.type,
        description: description,
        date: encFile.date,
        ipfs: encFile.ipfsPath,
      };
      console.log(metadata.ipfs);
      setStatus('Adding content metadata to your creator contract')
      let receipt;
      try {
        receipt = await creatorContract.upload(JSON.stringify(metadata));
      } catch (error) {
        errorHandler.setError('Could not upload the content to your contract' + error.message)
        return;
      }
      setStatus('Upload successful!')
      console.log(receipt);
    }).catch(function (error) {
      errorHandler.setError(error.toString())
    })
  }

  //TODO: remove formik since it is pretty simple to handle without it
  return (
    <div>
      <h1>Welcome {currentCreator.title}</h1>
      {status && (<h3>{status}</h3>)}
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
            upload(currentFile, values.description, currentCreator.creatorContract, currentCreator.user)
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
