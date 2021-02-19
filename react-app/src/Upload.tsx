import {TextileStore} from './stores/textileStore';
import React, {CSSProperties, useState} from "react";
import {Contract} from "ethers";
import contracts from "./contracts.json";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {gql, useQuery} from "@apollo/client";

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
    const file = event.currentTarget.files[0];
    setCurrentFile(file)
  };
  const CREATOR_USER = gql`
  query GET_CREATOR_WITH_USER($user: Bytes!) {
  creators(where: { user: $user }) {
    id
    user
    creatorContract
    title
    subscriptionPrice
    avatarURL
    timestamp
  }
}
`;

  const {loading, error, data} = useQuery(CREATOR_USER, {variables: {user: context.account?.toLowerCase()}});
  if (!context.account)
    return (<div>Not connected</div>)
  if (loading) return (<p>Loading...</p>);
  if (error) return (<p>Error :(</p>);
  const matchingCreators = data.creators
  if (matchingCreators.length === 0)
    return (<div>Please signup first. You are not a creator yet.</div>)
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
