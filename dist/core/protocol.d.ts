import { EventEmitter } from 'events';
import type { Socket } from 'net';
interface PendingPromise {
    resolve: (value: Buffer) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
}
export declare class Protocol extends EventEmitter {
    socket: Socket;
    private _id;
    private _buffer;
    pause: boolean;
    results: Map<number, Buffer>;
    pendingPromises: Map<number, PendingPromise>;
    callbacks: Map<number, (...args: any[]) => void>;
    private _handlers;
    private _backgroundPollLoop;
    private _pollInterval;
    constructor(socket: Socket);
    private _startBackgroundPolling;
    private _stopBackgroundPolling;
    private _rejectAllPending;
    methodId(): number;
    sendPacket(type: number, methodIndex: number, id: number, data?: Buffer): void;
    sendPacketsBatch(packets: Buffer[]): void;
    sendMethod(methodIndex: number, argData: Buffer, expectResult?: boolean): number;
    private _onData;
    private _parseBuffer;
    private _handlePacket;
    private _handleResult;
    private _handleEvent;
    waitForResult(id: number, timeout?: number): Promise<Buffer>;
    on(event: string, callback: (...args: any[]) => void): this;
    processReceives(): void;
}
export {};
