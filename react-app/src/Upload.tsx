import {TextileStore} from './stores/textileStore';
import React, {CSSProperties, useState} from "react";
import {Contract} from "ethers";
import contracts from "./contracts.json";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {useQuery} from "@apollo/client";
import {CREATORS_QUERY} from "./Home";

const textile: TextileStore = new TextileStore();

interface Values {
  file: string;
  description: string;
  nucypherPassword: string;
}

const Upload = () => {
  const context = useWeb3React<Web3Provider>()
  const [currentFile, setCurrentFile] = useState(undefined)
  const handleFileSelection = (event) => {
    const file  =  event.currentTarget.files[0];
    setCurrentFile(file)
  };
  const {loading, error, data} = useQuery(CREATORS_QUERY);

  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  if(!context.account)
    return (<div>Not connected</div>)
  const matchingCreators = data.creators.filter(creator => creator.user.toLowerCase() === context.account?.toLowerCase())
  if(!matchingCreators)
    return (<div>Please signup first</div>) //TODO Test this is actually working by using a different account
  const currentCreator = matchingCreators[0]
  return (
    <div>
      <h1>Welcome {currentCreator.title}</h1>
      <Formik
        initialValues={{
          file: '',
          description: '',
          nucypherPassword: '',
        }}
        onSubmit={(
          values: Values,
          {setSubmitting}: FormikHelpers<Values>
        ) => {
          textile.authenticate();
          if(currentFile) {
            textile.uploadFile(currentFile!, currentCreator.contractAddress, currentCreator.user, values.nucypherPassword)
          }
          console.log(values)
          // const promise = connectedContract.deployCreator(values.avatarURL, values.creatorName, values.subscriptionPrice);
          //TODO error handling on promise
          setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="file">Content</label>
          <Field id="file" onChange={(event) => handleFileSelection(event)} name="file" type="file"/>

          <label htmlFor="description">Description</label>
          <Field id="description" name="description" placeholder=""/>

          <label htmlFor="nucypherPassword">NuCypher Password</label>
          <Field
            id="nucypherPassword"
            name="nucypherPassword"
            type="password"
          />

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

// class Upload extends React.Component<any, any> {
//   render() {
//     // textile.authenticate();
//     return ''
//   }
// }

export default Upload;
