import { useWeb3React } from "../web3-react/core";
import { createContext, useEffect, useMemo, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Biconomy } from "../assets/mexa/common-js";
import { BICONOMY_API } from "../Config";

export interface IBiconomyContext {
    biconomy: undefined | any;
    isBiconomyReady: boolean;
}
const BiconomyContext = createContext<IBiconomyContext | null>(null);

const BiconomyProvider = (props: any) => {
    const [isBiconomyReady, setIsBiconomyReady] = useState(false);
    const web3Context = useWeb3React<Web3Provider>();

    const biconomy: any = useMemo(() => {
        if(!web3Context.library) return

        return new Biconomy(web3Context.library, {
            apiKey: BICONOMY_API,
            walletProvider: web3Context.library.provider,
            debug: true,
            strictMode: true,
        });
    }, [web3Context]);

    useEffect(() => {
        if (!biconomy) return;

        biconomy
          .onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            setIsBiconomyReady(true);
          })
          .onEvent(biconomy.ERROR, (error: any, message: any) => {
            // Handle error while initializing mexa
            console.log(error);
            console.log(message);
            setIsBiconomyReady(false);
          });
    }, [biconomy]);

    return <BiconomyContext.Provider value={{isBiconomyReady, biconomy }}>{props.children}</BiconomyContext.Provider>;
};

export { BiconomyContext, BiconomyProvider };