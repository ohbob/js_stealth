import { Protocol } from './protocol.js';
export declare function discoverPort(host?: string): Promise<number>;
export declare function connect(host?: string, port?: number | null): Promise<Protocol>;
