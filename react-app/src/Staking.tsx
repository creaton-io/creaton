import React, {CSSProperties, useEffect, useRef} from "react";
import {Button} from "./elements/button";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import creaton_contracts from "./contracts.json";
import {Contract} from "ethers";
import {parseUnits} from "@ethersproject/units";


// TODO staking and token contract added to contracts.json

let abi = [{
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "send",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }]
const token = new Contract("0x76ADB8ea0bfB53242046AD1D6BeE2dDb3C6a866E", abi)

const Staking = (props) => {
  const context = useWeb3React<Web3Provider>()

  function stake() {
    const connectedContract = token.connect(context.library!.getSigner())
    connectedContract.send("0x5c23c5a4F279c6303e83906010429d6E82d49719", parseUnits("5", 18), "0x");
  }
  return (
    <div> Please insert amount to stake
       <Button type="submit" onClick={stake} label="Stake"></Button>
    </div>
    )
}

export {Staking}
