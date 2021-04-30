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
const token = new Contract("0xdCc5FfBB4d818F84d2717EebCdeD28d066385ea0", abi)

const Staking = (props) => {
  const context = useWeb3React<Web3Provider>()

  function stake() {
    const connectedContract = token.connect(context.library!.getSigner())
    let x = connectedContract.send("0x28825b401340d6246B0a4148481FFCA71B8991Bc", parseUnits("5", 18), "0x");
    console.log(x)
  }
  return (
    <div> Please insert amount to stake
       <Button type="submit" onClick={stake} label="Stake"></Button>
    </div>
    )
}

export {Staking}
