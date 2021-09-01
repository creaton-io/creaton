import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
interface MagicConnectorArguments {
    apiKey: string;
    chainId: number;
    email: string;
}
export declare class UserRejectedRequestError extends Error {
    constructor();
}
export declare class FailedVerificationError extends Error {
    constructor();
}
export declare class MagicLinkRateLimitError extends Error {
    constructor();
}
export declare class MagicLinkExpiredError extends Error {
    constructor();
}
export declare class MagicConnector extends AbstractConnector {
    private readonly apiKey;
    private readonly chainId;
    private readonly email;
    magic: any;
    constructor({ apiKey, chainId, email }: MagicConnectorArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number | string>;
    getAccount(): Promise<null | string>;
    deactivate(): void;
    close(): Promise<void>;
}
export {};
