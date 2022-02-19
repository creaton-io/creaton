import { FC, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Button } from "./elements/button";
import { Input } from "./elements/input";
import { Contract, ethers, providers } from "ethers";
import creaton_contracts from "./Contracts";
import { CREATE_TOKEN_ADDRESS, GOVERNANCE_SQUAD_TOKENS } from "./Config";
import { gql } from "@apollo/client";

// Stream GraphQL query
const streamQuery = gql`
   {
    id
    deposit
    recipient
    sender
    startTime
    stopTime
    token {
      id
      name
      symbol
    }
  }
`;


// Note: I didn't know the Sablier ID and smart contract ABI...
// so they are all fill in the blanks.


// To Do 
// Enable investors to redeem tokens 
// Call from smart contract


// Use Sablier to redeem investor types and then push the code!
// Sablier GraphQL

// Ethers integration 


const investorTokenType = ["Investor", "Team", "Advisor"];

// if token type is 0, stream token to that address


export const ClaimToken: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();

    const [createAmount, setCreateAmount] = useState<number>(0)
    const [sgtAmount, setSgtAmount] = useState<number>(0)
    const [sgtSymbol, setSgtSymbol] = useState<string>('CREATE')
    const [submitting, setSubmitting] = useState<boolean>(false)

    
// Polygon mainnet contract address: 0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06


    async function handleSubmit(e) {
        setSubmitting(true);
        e.preventDefault();
        const { library } = web3Context;
        if(!library) return;

        const signer: ethers.providers.JsonRpcSigner = library!.getSigner();
        const userAddress: string = await signer.getAddress();

        const reactionContractAddr: string = GOVERNANCE_SQUAD_TOKENS[sgtSymbol];
        const stakingTokenContract: Contract = new ethers.Contract(CREATE_TOKEN_ADDRESS, creaton_contracts.erc20.abi, signer);

        const preDecimals: ethers.BigNumber = await stakingTokenContract.decimals();
        const decimals: ethers.BigNumber = ethers.BigNumber.from(10).pow(preDecimals);
        const stakingAmount: ethers.BigNumber = ethers.BigNumber.from(sgtAmount).mul(decimals);

        const allowance: ethers.BigNumber = await stakingTokenContract.allowance(userAddress, reactionContractAddr);
        if(stakingAmount.gt(allowance)){
            await stakingTokenContract.approve(reactionContractAddr, stakingAmount);
            stakingTokenContract.once("Approval", async (owner, spender, amount) => {
                console.log('%s Tokens Approved', amount.toString());
                stakeAndMint(signer, reactionContractAddr, stakingAmount, stakingTokenContract.address, userAddress);
            });
        }else{
            stakeAndMint(signer, reactionContractAddr, stakingAmount, stakingTokenContract.address, userAddress);
        }
    }

    async function stakeAndMint(signer: ethers.providers.JsonRpcSigner, reactionContractAddr: string, stakingAmount: ethers.BigNumber, stakingTokenAddr: string, recipientAddr: string){
        const reactionContract: Contract = new ethers.Contract(reactionContractAddr, creaton_contracts.ReactionToken.abi, signer);
        await reactionContract.stakeAndMint(stakingAmount.toString(), stakingTokenAddr, recipientAddr, '0');
        reactionContract.once("Staked", async (author, amount, stakingTokenAddress, stakingSuperTokenAddress) => {
            console.log('Successfully Staked: ', author, amount.toString(), stakingTokenAddress, stakingSuperTokenAddress);
            setSubmitting(false);
        });
    }

    // MUST NEEDED 
    // Contract address 
    // Stream ID

    // Test branch

    async function createStream() {

        const recipient = "Wallet info";


        const deposit = "user deposit";

        const now = Math.round(new Date().getTime() / 1000);
        const startTime = now + 48; // 48 hours from now 
        const stopTime = now + 216 // 9 days from now 


        // get a handle for the token contract
        const token = new ethers.Contract("0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06", erc20ABI, signerOrProvider); 
        
        // This approves the transfer
        const approveTx = await token.approve(sablier.address, deposit); 
        await approveTx.wait();

        const createStreamTx = await sablier.createStream(recipient, deposit, token.address, startTime, stopTime);
        await createStreamTx.wait();

    }

    async function withdrawStream(contract: string, signer: ethers.providers.JsonRpcSigner, provider: providers) {
        ‌const sablier = new ethers.Contract("0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06", signer, provider);
        const streamId = 42;
        const amount = 100;
        const withdrawFromStreamTx = await sablier.withdrawFromStream(streamId, amount);
        await withdrawFromStreamTx.wait()
    }

    async function cancelStream() {
        ‌const sablier = new ethers.Contract("0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06", sablierABI, signerOrProvider);
        const streamId = 42;
        const cancelStreamTx = await sablier.cancelStream(streamId);
        await cancelStreamTx.wait()
    }

    async function handleInputChange(e) {
        setCreateAmount(e.target.value);
        setSgtAmount(e.target.value);
        e.preventDefault();
    }

    async function handleSelectChange(e) {
        setSgtSymbol(e.target.value);
        e.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 place-items-center w-max m-auto py-10 text-white">
            <h3 className="text-5xl pt-12 pb-6 text-white">Mint $CREATE token</h3>
            
          

            <div className="p-5 text-white">
                <Input onChange={(e) => handleInputChange(e)} className="bg-gray-900 text-white" type="text" name="amount" placeholder="Amount" label="Enter the amount"/>
            </div>

            <p className="mb-10 w-2/3">You will stake {createAmount} $CREATE to generate {sgtAmount} ${sgtSymbol}. Your $CREATE tokens will be fully streamed back to you in 1 season (4 months)</p>
            

            <select name="selectList" id="selectList">
              <option value="Creator">Creator</option>
              <option value="Investor">Investor</option>
              <option value="Advisor">Advisor</option>
            </select>

            {/* Have the wallet address to stream tokens to  */}
            

            <div>
                <Button type="submit" label={`Mint ${sgtAmount} ${sgtSymbol}`}/>
            </div>
        </form>
    )
};