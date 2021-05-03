import React, {CSSProperties, useContext, useEffect, useRef, useState} from "react";
import {Button} from "./elements/button";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import creaton_contracts from "./contracts.json";
import {Contract} from "ethers";
import {parseUnits, formatEther} from "@ethersproject/units";
import {Input} from "./elements/input";
import {NotificationHandlerContext} from "./ErrorHandler";
import {Web3UtilsContext} from "./Web3Utils";


let abi = [{
  "inputs": [
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  "name": "balanceOf",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "balance",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}, {
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
const tokenContract = new Contract(creaton_contracts.CreatonToken.address, abi)
const stakingContract = new Contract(creaton_contracts.CreatonStaking.address, creaton_contracts.CreatonStaking.abi)

const Staking = (props) => {
  const context = useWeb3React<Web3Provider>()
  const notificationHandler = useContext(NotificationHandlerContext)
  const web3utils = useContext(Web3UtilsContext)

  const [inputStakeAmount, setInputStakeAmount] = useState('')
  const [inputUnstakeAmount, setInputUnstakeAmount] = useState('')
  const [createToken, setCreateToken] = useState('')
  const [stakedToken, setStakedToken] = useState('')
  const [minStake, setMinStake] = useState('')
  const [earnedToken, setEarnedToken] = useState('')

  function beautifyAmount(balance) {
    return formatEther(balance)
    // return '' + balance.div(parseUnits('1', 15)).toNumber() / 1000
  }

  function updateStakingValues() {
    if(!context.library)return;
    const connectedToken = tokenContract.connect(context.library!.getSigner())
    connectedToken.balanceOf(context.account).then(balance => {
      setCreateToken(beautifyAmount(balance))
    })
    const connectedStaking = stakingContract.connect(context.library!.getSigner())
    connectedStaking.balanceOf(context.account).then(balance => {
      setStakedToken(beautifyAmount(balance))
    })
    connectedStaking.earned(context.account).then(balance => {
      setEarnedToken(beautifyAmount(balance))
    })
    connectedStaking.minStake().then(balance => {
      setMinStake(beautifyAmount(balance))
    })
  }

  useEffect(() => {
    updateStakingValues()
    const interval = setInterval(() => {
      updateStakingValues()
    }, 5000);
    return () => clearInterval(interval);
  }, [updateStakingValues]);

  async function stake() {
    const connectedToken = tokenContract.connect(context.library!.getSigner())
    let receipt
    try {
      receipt = await connectedToken.send(creaton_contracts.CreatonStaking.address, parseUnits(inputStakeAmount, 18), "0x");
    } catch (error) {
      notificationHandler.setNotification({
        description: 'Could not stake CRT tokens' + error.message,
        type: 'error'
      })
      return;
    }
    web3utils.setIsWaiting(true);
    await receipt.wait(1)
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({
      description: 'Staked ' + inputStakeAmount + ' tokens successfully!',
      type: 'success'
    })
    updateStakingValues()
  }

  async function unstake() {
    const connectedStaking = stakingContract.connect(context.library!.getSigner())
    let receipt
    try {
      receipt = await connectedStaking.withdraw(parseUnits(inputUnstakeAmount, 18));
    } catch (error) {
      notificationHandler.setNotification({
        description: 'Could not unstake CRT tokens' + error.message,
        type: 'error'
      })
      return;
    }
    web3utils.setIsWaiting(true);
    await receipt.wait(1)
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({
      description: 'Unstaked ' + inputUnstakeAmount + ' tokens successfully!',
      type: 'success'
    })
    updateStakingValues()
  }

  async function harvest(){
    const connectedStaking = stakingContract.connect(context.library!.getSigner())
    let receipt
    try {
      receipt = await connectedStaking.getReward();
    } catch (error) {
      notificationHandler.setNotification({
        description: 'Could not get reward' + error.message,
        type: 'error'
      })
      return;
    }
    web3utils.setIsWaiting(true);
    await receipt.wait(1)
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({
      description: 'Reward received!',
      type: 'success'
    })
    updateStakingValues()
  }

  async function harvestAndExit(){
    const connectedStaking = stakingContract.connect(context.library!.getSigner())
    let receipt
    try {
      receipt = await connectedStaking.exit();
    } catch (error) {
      notificationHandler.setNotification({
        description: 'Could not exit staking' + error.message,
        type: 'error'
      })
      return;
    }
    web3utils.setIsWaiting(true);
    await receipt.wait(1)
    web3utils.setIsWaiting(false);
    notificationHandler.setNotification({
      description: 'All staking tokens are withdrawn and rewards are received!',
      type: 'success'
    })
    updateStakingValues()
  }

  return (
    <div className="grid grid-cols-1 place-items-center">
      <div>
        CRT Token in your account: {createToken}
      </div>
      <div>
        Staked tokens: {stakedToken}
      </div>
      <div>
        Minimum Staking tokens needed: {minStake}
      </div>
      <div>
        Earned token: {earnedToken}
      </div>
      <div className="my-5 mx-auto max-w-md w-full">
        <div className="flex my-4 justify-between items-center">
          <Input type="number" label={"Balance: " + createToken} placeholder="5" value={inputStakeAmount}
                 onChange={(event) => {
                   setInputStakeAmount(event.target.value)
                 }}></Input>
          <Button type="submit" size="small" onClick={stake} label="Stake"></Button>
        </div>
        <div className="flex my-4 justify-between items-center">
          <Input type="number" label={"Staked: " + stakedToken} placeholder="5" value={inputUnstakeAmount}
                 onChange={(event) => {
                   setInputUnstakeAmount(event.target.value)
                 }}></Input>
          <Button type="submit" size="small" onClick={unstake} label="Unstake"></Button>
        </div>
        <div className="flex my-4 justify-between items-center">
          <Button type="submit" size="small" onClick={harvest} label="Harvest"></Button>
          <Button type="submit" size="small" onClick={harvestAndExit} label="Harvest and exit"></Button>
        </div>
      </div>
    </div>
  )
}

export {Staking}
