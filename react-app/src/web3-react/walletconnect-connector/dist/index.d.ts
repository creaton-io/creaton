import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { IWCEthRpcConnectionOptions } from '@walletconnect/types';
export declare const URI_AVAILABLE = "URI_AVAILABLE";
export interface WalletConnectConnectorArguments extends IWCEthRpcConnectionOptions {
    supportedChainIds?: number[];
}
export declare class UserRejectedRequestError extends Error {
    constructor();
}
export declare class WalletConnectConnector extends AbstractConnector {
    private readonly config;
    walletConnectProvider?: any;
    constructor(config: WalletConnectConnectorArguments);
    private handleChainChanged;
    private handleAccountsChanged;
    private handleDisconnect;
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number | string>;
    getAccount(): Promise<null | string>;
    deactivate(): void;
    close(): Promise<void>;
}
