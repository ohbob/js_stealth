import net from 'net';
import { Protocol } from './protocol.js';
import { packUInt32, packUInt16, unpackUInt16, packUInt8 } from './datatypes.js';
const HOST = 'localhost';
const PORT = 47602;
const VERSION = [2, 7, 0, 0];
const GET_PORT_ATTEMPT_COUNT = 5;
const SOCK_TIMEOUT = 5000; // 5 seconds
export async function discoverPort(host = HOST) {
    for (let attempt = 0; attempt < GET_PORT_ATTEMPT_COUNT; attempt++) {
        try {
            const port = await attemptPortDiscovery(host, attempt + 1);
            if (port) {
                return port;
            }
        }
        catch (err) {
            if (attempt === GET_PORT_ATTEMPT_COUNT - 1) {
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    throw new Error('Port discovery failed after all attempts');
}
function attemptPortDiscovery(host, attemptNum) {
    return new Promise((resolve, reject) => {
        const sock = net.createConnection(PORT, host);
        sock.setTimeout(2000); // 2 seconds for port discovery
        let buffer = Buffer.alloc(0);
        const startTime = Date.now();
        const timeout = SOCK_TIMEOUT;
        let connectTimeout;
        let checkInterval;
        const cleanup = () => {
            clearTimeout(connectTimeout);
            if (checkInterval)
                clearInterval(checkInterval);
        };
        connectTimeout = setTimeout(() => {
            cleanup();
            sock.destroy();
            reject(new Error(`Connection timeout on attempt ${attemptNum} to ${host}:${PORT}`));
        }, timeout);
        sock.on('timeout', () => {
            cleanup();
            sock.destroy();
            reject(new Error(`Socket timeout on attempt ${attemptNum} - Stealth may not be running on ${host}:${PORT}`));
        });
        sock.on('connect', () => {
            cleanup();
            const packet = Buffer.concat([
                packUInt16(4),
                packUInt32(0xDEADBEEF)
            ]);
            sock.write(packet);
            checkInterval = setInterval(() => {
                if (buffer.length >= 2) {
                    const length = unpackUInt16(buffer, 0);
                    if (buffer.length >= 2 + length) {
                        const port = unpackUInt16(buffer, 2);
                        cleanup();
                        sock.destroy();
                        resolve(port);
                    }
                }
                if (Date.now() - startTime > timeout) {
                    cleanup();
                    sock.destroy();
                    reject(new Error(`Response timeout on attempt ${attemptNum}`));
                }
            }, 10);
        });
        sock.on('data', (data) => {
            buffer = Buffer.concat([buffer, data]);
        });
        sock.on('error', (err) => {
            cleanup();
            reject(new Error(`Connection error on attempt ${attemptNum}: ${err.message}`));
        });
        sock.on('close', () => {
            cleanup();
            if (buffer.length < 2) {
                reject(new Error(`Connection closed before receiving response on attempt ${attemptNum}`));
            }
        });
    });
}
export async function connect(host = HOST, port = null) {
    if (!port) {
        port = await discoverPort(host);
    }
    return new Promise((resolve, reject) => {
        const socket = net.createConnection(port, host);
        const connectTimeout = setTimeout(() => {
            socket.destroy();
            reject(new Error(`Connection timeout to ${host}:${port}`));
        }, SOCK_TIMEOUT);
        socket.setTimeout(SOCK_TIMEOUT);
        socket.on('timeout', () => {
            socket.destroy();
            clearTimeout(connectTimeout);
            reject(new Error(`Socket timeout connecting to ${host}:${port}`));
        });
        socket.on('connect', () => {
            clearTimeout(connectTimeout);
            socket.setNoDelay(true); // Disable Nagle's algorithm for low latency
            const protocol = new Protocol(socket);
            const data = Buffer.concat([
                packUInt16(5),
                packUInt16(0),
                packUInt8(3),
                ...VERSION.map(v => packUInt8(v))
            ]);
            const size = packUInt32(data.length);
            socket.write(Buffer.concat([size, data]));
            resolve(protocol);
        });
        socket.on('error', (err) => {
            clearTimeout(connectTimeout);
            reject(err);
        });
    });
}
