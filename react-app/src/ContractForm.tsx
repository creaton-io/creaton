import React, {useState} from "react";
import {Input} from "./elements/input";
import {Button} from "./elements/button";


const ContractForm = (props) => {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')

  function handleSubmit(event) {
    props.createNFT(name, symbol)
    event.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input type="text" name="name" placeholder="name" value={name} onChange={(event) => {
        setName(event.target.value)
      }}/>
      <Input type="text" name="symbol" placeholder="symbol" value={symbol} onChange={(event) => {
        setSymbol(event.target.value)
      }}/>
      <Button type="submit" label="Submit"/>
    </form>)
}

export {ContractForm}
