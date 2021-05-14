import React, {CSSProperties, useContext, useEffect, useRef, useState} from "react";
import {Button} from "./elements/button";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import creaton_contracts from "./Contracts";
import {BigNumber, Contract} from "ethers";
import clsx from 'clsx';
import {parseUnits, formatEther} from "@ethersproject/units";
import {Input} from "./elements/input";
import {NotificationHandlerContext} from "./ErrorHandler";
import {Web3UtilsContext} from "./Web3Utils";
import StakeInputGroup from "./components/stake-input-group";


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
  const [expanded, setExpanded] = useState(false);
  const [createToken, setCreateToken] = useState('')
  const [stakedToken, setStakedToken] = useState('')
  const [minStake, setMinStake] = useState('')
  const [earnedToken, setEarnedToken] = useState('')
  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(1))
  const [rewardRate, setRewardRate] = useState<BigNumber>(BigNumber.from(0))

  let APR = BigNumber.from(0)
  if (!totalSupply.eq(0))
    APR = rewardRate.div(totalSupply)


  function beautifyAmount(balance) {
    return formatEther(balance)
    // return '' + balance.div(parseUnits('1', 15)).toNumber() / 1000
  }

  function updateStakingValues() {
    if (!context.library) return;
    console.log('updating values')
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
    connectedStaking.totalSupply().then(totalSupply => {
      setTotalSupply(totalSupply)
    })
    connectedStaking.rewardRate().then(rewardRate => {
      setRewardRate(rewardRate)
    })
  }

  useEffect(() => {
    updateStakingValues()
    const interval = setInterval(() => {
      updateStakingValues()
    }, 5000);
    return () => {
      clearInterval(interval)
    };
  }, []);

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

  function StatItem(props) {
    return (<div className="w-40">
      <div className="text-xs uppercase">
        {props.name}
      </div>
      <div>
        {props.value}
      </div>
    </div>)
  }

  return (
    <div className="bg-gray-800 h-full border-t-2 border-white border-opacity-40 pt-4">
      <div className="text-white text-sm font-bold mx-auto max-w-5xl">
        <h3 className="text-2xl">Staking</h3>
        <div
          className={clsx('w-full transition-all my-5 bg-white bg-opacity-5 hover:bg-opacity-10 border-2 border-white overflow-hidden rounded-md', expanded ? 'max-h-screen' : 'max-h-24')}>
          <div className="h-24 flex flex-row place-items-center cursor-pointer border-b-2" onClick={() => {
            setExpanded(!expanded);
          }}>
            <div className="flex-grow">
              <img className="inline w-10 h-10 ml-4 p-2 bg-cover" src="./assets/images/logo.png"/>
              <span>CREATE</span>
            </div>
            <StatItem name="Your Balance" value={createToken}/>
            <StatItem name="Pending Reward" value={earnedToken}/>
            <StatItem name="Staked" value={stakedToken}/>
            <StatItem name="APR" value={APR.toString()}/>
          </div>
          {expanded && <div className="flex flex-row flex-wrap place-items center">
            <div className="w-1/2">
              <StakeInputGroup buttonLabel="Stake" label={"Enter amount to stake: " + createToken} max={createToken}
                               amount={inputStakeAmount}
                               setStakeAmount={setInputStakeAmount}
                               stakeAction={stake}/>
            </div>
            <div className="w-1/2">
              <StakeInputGroup buttonLabel="Unstake" label={"Enter amount to unstake: " + createToken} max={stakedToken}
                               amount={inputUnstakeAmount}
                               setStakeAmount={setInputUnstakeAmount}
                               stakeAction={unstake}/>
            </div>
            <div className="w-1/2">
              <div className="m-2 p-2 border-2 rounded-md  border-white border-opacity-10">

                <div className="block text-sm font-medium text-white font-semibold">
                  Pending Reward
                </div>
                <div className="mt-1 flex justify-between rounded-md shadow-sm">
                  <div className="flex-grow block text-xl mt-2 font-medium text-white font-semibold">
                    {earnedToken}
                  </div>
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex items-end m-2 px-4 py-4",
                      "font-medium rounded-md leading-4",
                      "bg-white bg-opacity-10 text-white",
                      "hover:bg-opacity-5",
                      "active:bg-opacity-5",
                      "focus:outline-none focus:bg-opacity-5 focus:ring-1 focus:ring-white focus:ring-offset-2",
                      "disabled:bg-grey disabled:text-grey-dark",
                    )}
                    onClick={harvest}
                  >
                    Harvest
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex m-2 items-end px-4 py-4",
                      "font-medium rounded-md leading-4",
                      "bg-white bg-opacity-10 text-white",
                      "hover:bg-opacity-5",
                      "active:bg-opacity-5",
                      "focus:outline-none focus:bg-opacity-5 focus:ring-1 focus:ring-white focus:ring-offset-2",
                      "disabled:bg-grey disabled:text-grey-dark",
                    )}
                    onClick={harvestAndExit}
                  >
                    Harvest and exit
                  </button>
                </div>
              </div>

            </div>

          </div>}
        </div>
      </div>
      </div>
  )
}

export {Staking}
