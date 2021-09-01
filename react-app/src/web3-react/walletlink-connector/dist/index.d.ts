import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
interface WalletLinkConnectorArguments {
    url: string;
    appName: string;
    appLogoUrl?: string;
    darkMode?: boolean;
    supportedChainIds?: number[];
}
export declare class WalletLinkConnector extends AbstractConnector {
    private readonly url;
    private readonly appName;
    private readonly appLogoUrl?;
    private readonly darkMode;
    walletLink: any;
    private provider;
    constructor({ url, appName, appLogoUrl, darkMode, supportedChainIds }: WalletLinkConnectorArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number>;
    getAccount(): Promise<null | string>;
    deactivate(): void;
    close(): Promise<void>;
    private handleChainChanged;
    private handleAccountsChanged;
}
export {};
