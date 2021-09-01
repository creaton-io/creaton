import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import Web3ProviderEngine from 'web3-provider-engine';
interface LatticeConnectorArguments {
    chainId: number;
    url: string;
    pollingInterval?: number;
    requestTimeoutMs?: number;
    appName: string;
}
export declare class LatticeConnector extends AbstractConnector {
    private readonly chainId;
    private readonly url;
    private readonly pollingInterval?;
    private readonly requestTimeoutMs?;
    private readonly appName;
    private provider;
    constructor({ chainId, url, pollingInterval, requestTimeoutMs, appName }: LatticeConnectorArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<Web3ProviderEngine>;
    getChainId(): Promise<number>;
    getAccount(): Promise<null>;
    deactivate(): void;
    close(): Promise<null>;
}
export {};
