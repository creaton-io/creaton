import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
declare type AsyncSendable = {
    isMetaMask?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: any, callback: (error: any, response: any) => void) => void;
    send?: (request: any, callback: (error: any, response: any) => void) => void;
};
export declare class RequestError extends Error {
    code: number;
    data?: unknown;
    constructor(message: string, code: number, data?: unknown);
}
declare class MiniRpcProvider implements AsyncSendable {
    readonly isMetaMask: false;
    readonly chainId: number;
    readonly url: string;
    readonly host: string;
    readonly path: string;
    constructor(chainId: number, url: string);
    readonly sendAsync: (request: {
        jsonrpc: '2.0';
        id: number | string | null;
        method: string;
        params?: unknown[] | object;
    }, callback: (error: any, response: any) => void) => void;
    readonly request: (method: string | {
        method: string;
        params?: object | unknown[] | undefined;
    }, params?: object | unknown[] | undefined) => Promise<unknown>;
}
interface NetworkConnectorArguments {
    urls: {
        [chainId: number]: string;
    };
    defaultChainId?: number;
}
export declare class NetworkConnector extends AbstractConnector {
    private readonly providers;
    private currentChainId;
    constructor({ urls, defaultChainId }: NetworkConnectorArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<MiniRpcProvider>;
    getChainId(): Promise<number>;
    getAccount(): Promise<null>;
    deactivate(): void;
    changeChainId(chainId: number): void;
}
export {};
