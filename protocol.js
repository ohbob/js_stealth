import { packUInt32, packUInt16, unpackUInt32, unpackUInt16 } from './datatypes.js';
import { EventEmitter } from 'events';
const VERSION = [2, 7, 0, 0];
const PACKET_TYPE_RESULT = 1;
const PACKET_TYPE_TERMINATE = 2;
const PACKET_TYPE_PAUSE = 4;
const PACKET_TYPE_EVENT = 6;
const PACKET_TYPE_REQ_SCRIPT_PATH = 9;
const EVENTS_NAMES = [
    'eviteminfo', 'evitemdeleted', 'evspeech', 'evdrawgameplayer',
    'evmoverejection', 'evdrawcontainer', 'evadditemtocontainer',
    'evaddmultipleitemsincont', 'evrejectmoveitem', 'evupdatechar',
    'evdrawobject', 'evmenu', 'evmapmessage', 'evallowrefuseattack',
    'evclilocspeech', 'evclilocspeechaffix', 'evunicodespeech',
    'evbuffdebuffsystem', 'evclientsendresync', 'evcharanimation',
    'evicqdisconnect', 'evicqconnect', 'evicqincomingtext', 'evicqerror',
    'evincominggump', 'evtimer1', 'evtimer2', 'evwindowsmessage', 'evsound',
    'evdeath', 'evquestarrow', 'evpartyinvite', 'evmappin', 'evgumptextentry',
    'evgraphicaleffect', 'evircincomingtext', 'evmessengerevent',
    'evsetglobalvar', 'evupdateobjstats', 'evglobalchat', 'evwardamage',
    'evcontextmenu'
];
export class Protocol extends EventEmitter {
    socket;
    _id;
    _buffer;
    pause;
    results;
    pendingPromises;
    callbacks;
    constructor(socket) {
        super();
        this.socket = socket;
        this._id = 0;
        this._buffer = Buffer.alloc(0);
        this.pause = false;
        this.results = new Map();
        this.pendingPromises = new Map();
        this.callbacks = new Map();
        socket.on('data', (data) => {
            this._onData(data);
        });
        socket.on('error', (err) => this.emit('error', err));
        socket.on('close', () => this.emit('close'));
    }
    methodId() {
        this._id = (this._id + 1) % 65535;
        return this._id;
    }
    sendPacket(type, methodIndex, id, data = Buffer.alloc(0)) {
        const header = Buffer.concat([
            packUInt16(methodIndex),
            packUInt16(id)
        ]);
        const packet = Buffer.concat([header, data]);
        const size = packUInt32(packet.length);
        const fullPacket = Buffer.concat([size, packet]);
        const flushed = this.socket.write(fullPacket);
        if (!flushed) {
            console.warn(`Socket buffer full for method ${methodIndex}, id ${id}`);
        }
    }
    sendPacketsBatch(packets) {
        for (const packet of packets) {
            this.socket.write(packet);
        }
    }
    sendMethod(methodIndex, argData, expectResult = false) {
        if (methodIndex === 0) {
            return 0;
        }
        const id = expectResult ? this.methodId() : 0;
        this.sendPacket(PACKET_TYPE_RESULT, methodIndex, id, argData);
        return id;
    }
    sendMethodAsync(methodIndex, argData) {
        const id = this.methodId();
        this.sendPacket(PACKET_TYPE_RESULT, methodIndex, id, argData);
        return () => this.waitForResult(id);
    }
    _onData(data) {
        this._buffer = Buffer.concat([this._buffer, data]);
        this._parseBuffer();
    }
    _parseBuffer() {
        while (this._buffer.length >= 4) {
            const packetSize = unpackUInt32(this._buffer, 0);
            if (this._buffer.length < 4 + packetSize) {
                break;
            }
            const packet = this._buffer.slice(4, 4 + packetSize);
            this._buffer = this._buffer.slice(4 + packetSize);
            this._handlePacket(packet);
        }
    }
    _handlePacket(packet) {
        if (packet.length < 4)
            return;
        const type = unpackUInt16(packet, 0);
        const subType = unpackUInt16(packet, 2);
        switch (type) {
            case PACKET_TYPE_RESULT:
                this._handleResult(subType, packet.slice(4));
                break;
            case PACKET_TYPE_TERMINATE:
                this.pause = true;
                break;
            case PACKET_TYPE_PAUSE:
                this.pause = true;
                break;
            case PACKET_TYPE_EVENT:
                this._handleEvent(subType, packet.slice(4));
                break;
            case PACKET_TYPE_REQ_SCRIPT_PATH:
                // Handle script path request
                break;
        }
    }
    _handleResult(id, data) {
        this.results.set(id, data);
        const pending = this.pendingPromises.get(id);
        if (pending) {
            clearTimeout(pending.timeout);
            this.pendingPromises.delete(id);
            pending.resolve(data);
        }
    }
    _handleEvent(eventIndex, data) {
        const callback = this.callbacks.get(eventIndex);
        if (callback) {
            try {
                callback(data);
            }
            catch (err) {
                this.emit('error', err);
            }
        }
        this.emit(EVENTS_NAMES[eventIndex] || `event${eventIndex}`, data);
    }
    async waitForResult(id, timeout = 30000) {
        if (this.results.has(id)) {
            const result = this.results.get(id);
            this.results.delete(id);
            return result;
        }
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                this.pendingPromises.delete(id);
                reject(new Error(`Timeout waiting for result ${id}`));
            }, timeout);
            this.pendingPromises.set(id, {
                resolve: (data) => {
                    clearTimeout(timeoutHandle);
                    resolve(data);
                },
                reject: (error) => {
                    clearTimeout(timeoutHandle);
                    reject(error);
                },
                timeout: timeoutHandle
            });
        });
    }
    on(event, callback) {
        return super.on(event, callback);
    }
}
