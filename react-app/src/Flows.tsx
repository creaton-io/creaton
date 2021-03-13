import {useContext, useEffect, useState} from "react";
import {SuperfluidContext} from "./Superfluid";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";

const Flows = () => {
  const superfluid = useContext(SuperfluidContext);
  const web3Context = useWeb3React<Web3Provider>()
  const [flows, setFlows] = useState({})

  async function updateFlows() {
    const {sf, usdcx} = superfluid
    const user = sf.user({address: web3Context.account, token: usdcx.address})
    setFlows((await user.details()).cfa.flows)
  }
  useEffect(()=>{
    updateFlows()
  },[web3Context,superfluid])

  if (!superfluid)
    return (<div>Connect your wallet</div>)
  return (
    <div>
      <button onClick={() => {
        updateFlows()
      }}>Refresh
      </button>
      <h3></h3>
    </div>
  )
}

export default Flows
