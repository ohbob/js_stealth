import { packUInt32, packUInt16, unpackUInt32, unpackUInt16, unpackUInt8, unpackInt8, unpackInt16, unpackInt32, unpackBool, unpackString } from './datatypes.js';
import { EventEmitter } from 'events';
import type { Socket } from 'net';
import { EVENTS } from '../constants.js';

const VERSION = [2, 7, 0, 0];
const PACKET_TYPE_RESULT = 1;
const PACKET_TYPE_TERMINATE = 2;
const PACKET_TYPE_PAUSE = 4;
const PACKET_TYPE_EVENT = 6;
const PACKET_TYPE_REQ_SCRIPT_PATH = 9;

const EVENTS_NAMES = EVENTS;

// Event argument types (matching Python's EVENTS_ARGTYPES)
// Index corresponds to the type ID sent in the event packet
const EVENT_ARG_TYPES = [

  unpackString,   // 0 - _str
  unpackUInt32,   // 1 - _uint
  (buf: Buffer, offset: number) => unpackInt32(buf, offset), // 2 - _int
  unpackUInt16,  // 3 - _ushort
  (buf: Buffer, offset: number) => unpackInt16(buf, offset), // 4 - _short
  unpackUInt8,   // 5 - _ubyte
  (buf: Buffer, offset: number) => unpackInt8(buf, offset),  // 6 - _byte
  unpackBool,    // 7 - _bool
];

interface PendingPromise {
  resolve: (value: Buffer) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class Protocol extends EventEmitter {
  socket: Socket;
  private _id: number;
  private _buffer: Buffer;
  pause: boolean;
  results: Map<number, Buffer>;
  pendingPromises: Map<number, PendingPromise>;
  callbacks: Map<number, (...args: any[]) => void>;
  private _handlers: Array<{ handler: (...args: any[]) => void; args: any[] }> = []; // Queue for event handlers (like Python)

  private _backgroundPollLoop: NodeJS.Timeout | null = null;
  private _pollInterval: NodeJS.Timeout | null = null;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this._id = 0;
    this._buffer = Buffer.alloc(0);
    this.pause = false;
    this.results = new Map();
    this.pendingPromises = new Map();
    this.callbacks = new Map();
    
    
    // CRITICAL: Python uses NON-BLOCKING socket and ONLY manual receive() calls
    // However, in Node.js we need BOTH:
    // 1. Keep socket unpaused so data flows into internal buffer
    // 2. Manually read from that buffer (like Python's recv())
    // The 'data' event handler will accumulate data, but we manually drain it
    if (socket.isPaused()) {
      socket.resume();
    }
    
    // Set up 'data' event to accumulate data into our buffer
    // But we'll manually drain it via polling (matching Python's receive())
    socket.on('data', (data: Buffer) => {
      this._onData(data);
    });
    
    // CRITICAL: Start continuous background polling for events
    // Python calls receive() continuously - events only arrive when actively reading
    // This must run ALWAYS, not just during waitForResult
    // This manually drains the socket buffer (like Python's recv())
    this._startBackgroundPolling();
    
    socket.on('error', (err: Error) => {
      this._stopBackgroundPolling();
      this._rejectAllPending(new Error(`Connection error: ${err.message}`));
      this.emit('error', err);
    });
    
    socket.on('close', () => {
      this._stopBackgroundPolling();
      this._rejectAllPending(new Error('Connection closed'));
      this.emit('close');
    });
  }

  private _startBackgroundPolling() {
    // Stop any existing background poll
    this._stopBackgroundPolling();
    
    
    // CRITICAL: Python's receive() is called continuously, even when idle
    // Python uses non-blocking socket.setblocking(False) and ONLY manual recv() calls
    // Stealth only sends events when it detects active reading
    // We MUST continuously poll the socket to receive events
    // 
    // In Node.js: data accumulates via 'data' event, but we manually drain via socket.read()
    // This matches Python's behavior: data is received but we control when we process it
    this._backgroundPollLoop = setInterval(() => {
      if (this.socket.destroyed) {
        this._stopBackgroundPolling();
        return;
      }
      
      // Ensure socket is not paused (data should flow)
      if (this.socket.isPaused()) {
        this.socket.resume();
      }
      
      // Actively try to read from socket buffer (like Python's non-blocking recv(4096))
      // This drains data that accumulated from 'data' events
      // Python's receive() ALWAYS tries to read, regardless of socket state
      let chunk: Buffer | null;
      let totalRead = 0;
      while (null !== (chunk = this.socket.read())) {
        if (chunk && chunk.length > 0) {
          totalRead += chunk.length;
          // Don't call _onData again - data already accumulated via 'data' event
          // Just parse what we have in buffer
        }
      }
      
      // Parse buffer if we have data (data accumulates via 'data' event, we process here)
      if (this._buffer.length >= 4) {
        this._parseBuffer();
      }
    }, 5); // Poll every 5ms (matching Python's receive() frequency of ~0.005s)
    
  }

  private _stopBackgroundPolling() {
    if (this._backgroundPollLoop) {
      clearInterval(this._backgroundPollLoop);
      this._backgroundPollLoop = null;
    }
  }
  
  private _rejectAllPending(error: Error): void {
    for (const [id, pending] of this.pendingPromises.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pendingPromises.clear();
  }

  methodId(): number {
    this._id = (this._id + 1) % 65535;
    return this._id;
  }

  sendPacket(type: number, methodIndex: number, id: number, data: Buffer = Buffer.alloc(0)): void {
    const header = Buffer.concat([
      packUInt16(methodIndex),
      packUInt16(id)
    ]);
    const packet = Buffer.concat([header, data]);
    const size = packUInt32(packet.length);
    const fullPacket = Buffer.concat([size, packet]);
    
    const flushed = this.socket.write(fullPacket);
    
    if (!flushed) {
      
      // Force a read attempt to help drain the socket
      if (this.socket.readable) {
        let chunk: Buffer | null;
        while (null !== (chunk = this.socket.read())) {
          if (chunk && chunk.length > 0) {
            this._onData(chunk);
          }
        }
      }
    }
  }
  
  sendPacketsBatch(packets: Buffer[]): void {
    for (const packet of packets) {
      this.socket.write(packet);
    }
  }

  sendMethod(methodIndex: number, argData: Buffer, expectResult: boolean = false): number {
    if (methodIndex === 0) {
      return 0;
    }
    const id = expectResult ? this.methodId() : 0;
    this.sendPacket(PACKET_TYPE_RESULT, methodIndex, id, argData);
    return id;
  }

  private _onData(data: Buffer): void {
    // Log when we receive raw data (for debugging) - ALWAYS log, even if empty
    this._buffer = Buffer.concat([this._buffer, data]);
    this._parseBuffer();
  }

  private _parseBuffer(): void {
    let packetsParsed = 0;
    while (this._buffer.length >= 4) {
      const packetSize = unpackUInt32(this._buffer, 0);
      
      if (this._buffer.length < 4 + packetSize) {
        // Not enough data yet, wait for more
        break;
      }
      
      const packet = this._buffer.slice(4, 4 + packetSize);
      this._buffer = this._buffer.slice(4 + packetSize);
      packetsParsed++;
      
      this._handlePacket(packet);
    }
    if (packetsParsed > 0) {
    }
    
    // CRITICAL: Python calls event handlers AFTER parsing completes
    // Python: while len(self._handlers): handler = self._handlers.pop(0); handler['handler'](*handler['args'])
    while (this._handlers.length > 0) {
      const handler = this._handlers.shift()!;
      try {
        handler.handler(...handler.args);
      } catch (err) {
        console.error(`  ✗ Error in handler:`, err);
        this.emit('error', err);
      }
    }
  }

  private _handlePacket(packet: Buffer): void {
    if (packet.length < 2) {
      return;
    }
    
    const type = unpackUInt16(packet, 0);
    
    // Log ALL packet types to debug event reception - especially EVENT packets
    if (type === PACKET_TYPE_EVENT) {
      const eventIndex = packet.length >= 3 ? unpackUInt8(packet, 2) : -1;
      const eventName = EVENTS_NAMES[eventIndex] || `event${eventIndex}`;
    } else if (type === PACKET_TYPE_RESULT) {
      // Log result packets too for debugging
      const id = packet.length >= 4 ? unpackUInt16(packet, 2) : -1;
    } else {
      // Log other packet types
    }
    
    switch (type) {
      case PACKET_TYPE_RESULT:
        if (packet.length < 4) return;
        const id = unpackUInt16(packet, 2);
        this._handleResult(id, packet.slice(4));
        break;
      case PACKET_TYPE_TERMINATE:
        this.pause = true;
        break;
      case PACKET_TYPE_PAUSE:
        this.pause = true;
        break;
      case PACKET_TYPE_EVENT:
        // Event packet: after type(uint16), data is [index(uint8), count(uint8), ...args]
        // Skip the 2-byte type field, then parse index and count
        this._handleEvent(packet.slice(2));
        break;
      case PACKET_TYPE_REQ_SCRIPT_PATH:
        // Handle script path request
        break;
      default:
        // Log unknown packets to see if we're missing event packets
        if (type !== 1 && type !== 4 && type !== 2 && type !== 9) {
        }
        break;
    }
  }

  private _handleResult(id: number, data: Buffer): void {
    this.results.set(id, data);
    const pending = this.pendingPromises.get(id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingPromises.delete(id);
      pending.resolve(data);
    }
  }

  private _handleEvent(data: Buffer): void {
    // Parse event packet: [index(uint8), count(uint8), ...args]
    // Each arg: [type(uint8), value(...)]
    if (data.length < 2) {
      return;
    }
    
    const eventIndex = unpackUInt8(data, 0);
    const count = unpackUInt8(data, 1);
    const eventName = EVENTS_NAMES[eventIndex] || `event${eventIndex}`;
    
    let offset = 2;
    const args: any[] = [];
    
    // Parse each argument
    for (let i = 0; i < count && offset < data.length; i++) {
      if (offset >= data.length) {
        break;
      }
      
      const argType = unpackUInt8(data, offset);
      offset += 1;
      
      if (argType >= EVENT_ARG_TYPES.length || !EVENT_ARG_TYPES[argType]) {
        break;
      }
      
      try {
        const parser = EVENT_ARG_TYPES[argType];
        
        // Calculate size before parsing
        let argSize = 0;
        if (argType === 0) { // string
          if (offset + 4 > data.length) {
            break;
          }
          const strLen = unpackUInt32(data, offset);
          argSize = 4 + strLen;
          if (offset + argSize > data.length) {
            break;
          }
          const value = parser(data, offset);
          args.push(value);
          offset += argSize;
        } else if (argType === 1 || argType === 2) { // uint/int
          if (offset + 4 > data.length) {
            break;
          }
          const value = parser(data, offset);
          offset += 4;
          args.push(value);
        } else if (argType === 3 || argType === 4) { // ushort (_ushort) / short (_short)/short
          if (offset + 2 > data.length) {
            break;
          }
          const value = parser(data, offset);
          offset += 2;
          args.push(value);
        } else if (argType === 5 || argType === 6) { // ubyte (_ubyte) / byte (_byte)/byte
          if (offset + 1 > data.length) {
            break;
          }
          const value = parser(data, offset);
          offset += 1;
          args.push(value);
        } else if (argType === 7) { // bool (_bool)
          if (offset + 1 > data.length) {
            break;
          }
          const value = parser(data, offset);
          offset += 1;
          args.push(value);
        }
      } catch (err) {
        break;
      }
    }
    
    
    // CRITICAL: Python queues handlers and calls them AFTER receive() completes
    // Python pattern: handler = {'handler': self.callbacks[index], 'args': args}; self._handlers.append(handler)
    // Then later: while len(self._handlers): handler = self._handlers.pop(0); handler['handler'](*handler['args'])
    const callback = this.callbacks.get(eventIndex);
    if (callback) {
      // Queue handler instead of calling immediately (matching Python)
      this._handlers.push({
        handler: callback,
        args: args
      });
    } else {
    }
    
  }

  async waitForResult(id: number, timeout: number = 3000): Promise<Buffer> {
    // Check if socket is still connected
    if (this.socket.destroyed || !this.socket.writable) {
      throw new Error('Connection is closed');
    }
    
    // Check if result already available
    if (this.results.has(id)) {
      const result = this.results.get(id)!;
      this.results.delete(id);
      return result;
    }

    // Actively poll for results AND events (matching Python's behavior)
    // Python calls receive() in a loop while waiting - events are processed during this loop
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingPromises.delete(id);
        if (this._pollInterval) {
          clearInterval(this._pollInterval);
          this._pollInterval = null;
        }
        reject(new Error(`Timeout waiting for result ${id} - check if Stealth is running and connected`));
      }, timeout);

      this.pendingPromises.set(id, {
        resolve: (data: Buffer) => {
          clearTimeout(timeoutHandle);
          if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
          }
          resolve(data);
        },
        reject: (error: Error) => {
          clearTimeout(timeoutHandle);
          if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
          }
          reject(error);
        },
        timeout: timeoutHandle
      });

      // Active polling loop to process events (like Python's receive() in waitForResult loop)
      // Python calls receive() continuously in a while loop - we need to match this
      this._pollInterval = setInterval(() => {
        // CRITICAL: Actively read from socket FIRST (like Python's receive())
        // This is what makes events arrive - Stealth only sends them when we're actively reading
        if (this.socket.readable && !this.socket.destroyed) {
          let chunk: Buffer | null;
          let totalRead = 0;
          while (null !== (chunk = this.socket.read())) {
            if (chunk && chunk.length > 0) {
              totalRead += chunk.length;
              this._onData(chunk);
            }
          }
        }
        
        // Process any buffered data (this will handle events)
        if (this._buffer.length >= 4) {
          this._parseBuffer();
        }

        // Check if result arrived
        if (this.results.has(id)) {
          if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
          }
          const result = this.results.get(id)!;
          this.results.delete(id);
          const pending = this.pendingPromises.get(id);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingPromises.delete(id);
            pending.resolve(result);
          }
          return;
        }

        // Timeout check
        if (Date.now() - startTime > timeout) {
          if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
          }
          this.pendingPromises.delete(id);
          reject(new Error(`Timeout waiting for result ${id}`));
          return;
        }
      }, 5); // Poll every 5ms like Python's 0.005s sleep
    });
  }

  on(event: string, callback: (...args: any[]) => void): this {
    return super.on(event, callback);
  }

  // Public method to process receives (like Python's receive())
  // Called by Wait() and other methods that need to process events during idle
  // CRITICAL: This matches Python's receive() behavior - manually read from socket
  // Background polling already handles continuous reading, but this allows manual triggers
  processReceives(): void {
    if (this.socket.destroyed) {
      return;
    }
    
    // Temporarily resume to read (like Python's non-blocking socket)
    const wasPaused = this.socket.isPaused();
    if (wasPaused) {
      this.socket.resume();
    }
    
    // ALWAYS try to read (like Python's non-blocking recv())
    // Python's recv() on non-blocking socket returns immediately with data or raises exception
    // Node.js read() returns null if no data, but we should still try
    let chunk: Buffer | null;
    let totalRead = 0;
    while (null !== (chunk = this.socket.read())) {
      if (chunk && chunk.length > 0) {
        totalRead += chunk.length;
        this._onData(chunk);
      }
    }
    
    // Pause again if it was paused before (matching Python's manual control)
    if (wasPaused && totalRead === 0) {
      this.socket.pause();
    }
    
    // Parse buffer if we read data OR if we have buffered data (like Python does)
    if (totalRead > 0 || this._buffer.length >= 4) {
      if (this._buffer.length >= 4) {
        this._parseBuffer();
      }
    }
  }
}
