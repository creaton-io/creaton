import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import Web3ProviderEngine from 'web3-provider-engine';
interface TrezorConnectorArguments {
    chainId: number;
    url: string;
    pollingInterval?: number;
    requestTimeoutMs?: number;
    config?: any;
    manifestEmail: string;
    manifestAppUrl: string;
}
export declare class TrezorConnector extends AbstractConnector {
    private readonly chainId;
    private readonly url;
    private readonly pollingInterval?;
    private readonly requestTimeoutMs?;
    private readonly config;
    private readonly manifestEmail;
    private readonly manifestAppUrl;
    private provider;
    constructor({ chainId, url, pollingInterval, requestTimeoutMs, config, manifestEmail, manifestAppUrl }: TrezorConnectorArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<Web3ProviderEngine>;
    getChainId(): Promise<number>;
    getAccount(): Promise<null>;
    deactivate(): void;
}
export {};
