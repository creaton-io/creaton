import { FC, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Button } from "./elements/button";
import { Input } from "./elements/input";
import { Contract, ethers } from "ethers";
import creaton_contracts from "./Contracts";
import { CREATE_TOKEN_ADDRESS, GOVERNANCE_SQUAD_TOKENS } from "./Config";

export const ClaimToken: FC = () => {
    const web3Context = useWeb3React<Web3Provider>();

    const [createAmount, setCreateAmount] = useState<number>(0)
    const [sgtAmount, setSgtAmount] = useState<number>(0)
    const [sgtSymbol, setSgtSymbol] = useState<string>('CREATE')
    const [submitting, setSubmitting] = useState<boolean>(false)

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
            <h3 className="text-5xl pt-12 pb-6 text-white">Mint $CREATE governance token</h3>
            
          

            <div className="p-5 text-white">
                <Input onChange={(e) => handleInputChange(e)} className="bg-gray-900 text-white" type="text" name="amount" placeholder="Amount" label="Enter the amount"/>
            </div>

            <p className="mb-10 w-2/3">You will stake {createAmount} $CREATE to generate {sgtAmount} ${sgtSymbol}. Your $CREATE tokens will be fully streamed back to you in 1 season (4 months)</p>
            
            <div>
                <Button type="submit" label={`Mint ${sgtAmount} ${sgtSymbol}`}/>
            </div>
        </form>
    )
};
