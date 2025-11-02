// ============================================================================
// CUSTOM HELPER METHODS - NOT PART OF STANDARD STEALTH API
// ============================================================================
// These are custom convenience methods for JavaScript/TypeScript
// They don't exist in Python py_stealth - they're built on top of the standard API
// Cache connection state getters and modules to avoid repeated dynamic imports (performance!)
let cachedGetConnectionState = null;
let cachedEnsureConnected = null;
let cachedCreateMethods = null;
let cachedConnectToStealth = null;
// Parallel executor with connection pooling (like Python ThreadPoolExecutor)
// numConnections: Number of parallel connections (not CPU-bound, can be higher than CPU cores)
// Optimal range: 4-16 for most cases. Too many (>32) may cause server overhead
// Enhanced parallel that auto-awaits promises in arguments
// Usage: parallel([[GetX, Self()], [GetY, Self()]]) - Self() promise is auto-awaited!
// Default to 8 connections like Python's ThreadPoolExecutor
// This is a custom convenience method - it doesn't exist in Python py_stealth
export async function parallel(commands, numConnections = 16) {
    // Don't pre-await everything - it slows things down!
    // Instead, await promise arguments on-demand during execution
    return await parallelInternal(commands, numConnections);
}
// Internal parallel implementation
async function parallelInternal(commands, numConnections = 16) {
    // Early return if no commands - no need to set up connections
    if (!commands || commands.length === 0) {
        return [];
    }
    // Cache connection state getters to avoid repeated dynamic imports (performance!)
    if (!cachedGetConnectionState || !cachedEnsureConnected) {
        const indexModule = await import('./index.js');
        cachedGetConnectionState = indexModule.getConnectionState;
        cachedEnsureConnected = indexModule.ensureConnected;
    }
    // Ensure main connection is ready first (returns immediately if already connected)
    await cachedEnsureConnected();
    const { HOST, PORT, connectionPool, protocol, methodsRaw } = cachedGetConnectionState();
    if (!protocol || !methodsRaw || !PORT) {
        throw new Error('Must call connect() first');
    }
    // Cache module imports too for performance (only once)
    if (!cachedCreateMethods || !cachedConnectToStealth) {
        const methodsModule = await import('./methods.js');
        const connectionModule = await import('./core/connection.js');
        cachedCreateMethods = methodsModule.createMethods;
        cachedConnectToStealth = connectionModule.connect;
    }
    // Reuse or expand connection pool (skip port discovery - we already know PORT!)
    // Only create new connections if we actually need them
    if (connectionPool.length < numConnections) {
        const needed = numConnections - connectionPool.length;
        // Create ALL connections in parallel for maximum speed!
        const connectPromises = Array(needed).fill(null).map(async () => {
            // Direct connect with known port - NO port discovery!
            const connProtocol = await cachedConnectToStealth(HOST, PORT);
            const connMethods = cachedCreateMethods(connProtocol);
            return { protocol: connProtocol, methods: connMethods, _instances: connMethods._instances };
        });
        const newConnections = await Promise.all(connectPromises);
        connectionPool.push(...newConnections);
    }
    // Use pool connections (trim if we need fewer)
    // Don't verify connections here - just use them, they'll error if dead (faster!)
    const connections = connectionPool.slice(0, numConnections);
    // Step 2: Send ALL requests immediately (non-blocking TCP writes)
    // All packets queue up in socket buffers concurrently
    // Direct loop - no intermediate object creation for speed!
    const waitFunctions = [];
    for (let index = 0; index < commands.length; index++) {
        const cmd = commands[index];
        const connIdx = index % numConnections;
        const conn = connections[connIdx];
        if (Array.isArray(cmd)) {
            const [fn, ...args] = cmd;
            // Direct access to instances - faster!
            const instance = conn._instances[fn._methodName || fn.name];
            if (instance?.send) {
                // Send NOW - synchronous call that queues packet in socket buffer
                waitFunctions.push({ wait: instance.send(...args), index });
            }
            else {
                // Fallback: execute as promise
                waitFunctions.push({ wait: () => fn(...args), index });
            }
        }
        else if (typeof cmd === 'function') {
            waitFunctions.push({ wait: () => cmd(), index });
        }
        else if (cmd && typeof cmd.then === 'function') {
            waitFunctions.push({ wait: () => cmd, index });
        }
        else {
            waitFunctions.push({ wait: () => Promise.resolve(cmd), index });
        }
    }
    // At this point, ALL requests are queued in socket buffers
    // Step 3: Wait for ALL results in parallel (fast path - minimal error handling overhead)
    // Bun's event loop will process all socket I/O concurrently
    // Direct Promise.all for maximum speed - no error handling wrapper overhead
    const allPromises = waitFunctions.map(({ wait, index }) => wait().then(result => ({ success: true, result, index })));
    // Wait for all commands to complete (fast path - let errors propagate naturally)
    const allIndexedResults = await Promise.all(allPromises);
    // Return results in order (simple and fast)
    return allIndexedResults
        .sort((a, b) => a.index - b.index)
        .map(r => r.result);
}
// Helper: process items with operations in parallel (like Python's parallel_items with @timeit decorator)
// This is a custom convenience method - it doesn't exist in Python py_stealth
export async function parallel_items(items, operations, numConnections = 16) {
    // Early return if no items or operations
    if (!items || items.length === 0 || !operations || operations.length === 0) {
        return [];
    }
    const start = performance.now();
    const commands = [];
    for (const item of items) {
        for (const operation of operations) {
            commands.push([operation, item]);
        }
    }
    const allResults = await parallel(commands, numConnections);
    // Group results back by item
    const opsPerItem = operations.length;
    const packed = items.map((item, itemIndex) => {
        const startIndex = itemIndex * opsPerItem;
        const itemData = allResults.slice(startIndex, startIndex + opsPerItem);
        return { id: item, data: itemData };
    });
    const elapsed = ((performance.now() - start) / 1000).toFixed(4);
    console.log(`parallel_items: ${elapsed}s`);
    return packed;
}
// Run operations on objects or object IDs and return/update objects with results as properties
// Usage:
//   const objects = await FindProps([obj1, obj2], [GetX, GetY, GetName])  // IDs only
//   // Returns: [{ id: obj1, x: 100, y: 200, name: 'item' }, { id: obj2, x: 150, y: 250, name: 'other' }]
//   const objects = await FindProps([{ id: obj1, hp: 100 }, { id: obj2, hp: 200 }], [GetName])
//   // Returns: [{ id: obj1, hp: 100, name: 'item' }, { id: obj2, hp: 200, name: 'other' }] (preserves existing properties!)
// This is a custom convenience method - it doesn't exist in Python py_stealth
export async function FindProps(items, operations, keys, numConnections = 16) {
    if (!items || items.length === 0) {
        return [];
    }
    if (!operations || operations.length === 0) {
        // If no operations, return objects as-is or convert IDs to objects
        return items.map(item => typeof item === 'number' ? { id: item } : item);
    }
    // Extract IDs and preserve existing objects
    const itemIds = [];
    const existingObjects = new Map();
    for (const item of items) {
        if (typeof item === 'number') {
            itemIds.push(item);
        }
        else {
            itemIds.push(item.id);
            existingObjects.set(item.id, item);
        }
    }
    // If no keys provided, derive from function names
    if (!keys) {
        keys = operations.map(op => {
            // Try to get the original function name (might be wrapped by withAutoConnect)
            let name = op._methodName || op.name || 'unknown';
            // Convert GetX -> x, GetName -> name, GetDistance -> distance, etc.
            const key = name.replace(/^Get/, '').replace(/^Is/, '').replace(/^Has/, '').toLowerCase();
            return key || 'value'; // fallback if extraction fails
        });
    }
    if (keys.length !== operations.length) {
        throw new Error('Number of keys must match number of operations');
    }
    // Get properties in parallel
    const itemsWithData = await parallel_items(itemIds, operations, numConnections);
    // Map to objects with keys, preserving existing properties if provided
    return itemsWithData.map((item) => {
        // Start with existing object properties if available, otherwise just id
        const result = existingObjects.has(item.id)
            ? { ...existingObjects.get(item.id) }
            : { id: item.id };
        // Add new properties from operations (will overwrite if key exists)
        keys.forEach((key, index) => {
            result[key] = item.data[index];
        });
        return result;
    });
}
// Find items and get their properties in one call (combines FindTypesArrayEx + parallel_items with automatic key mapping)
// Supports multiple objTypes, colors, and containers - finds items matching ANY combination
// This is a custom convenience method for JavaScript/TypeScript - it doesn't exist in Python py_stealth
// 
// Usage:
//   Find({ objTypes: [0x190], color: 0xFFFF, container: Ground(), operations: [GetX, GetY, GetName] }) // single values auto-converted
//   Find({ objTypes: [0x190, 0x191], colors: [0xFFFF, 0x0000], containers: [Backpack(), Ground()], operations: [GetX, GetY] }) // multiple values
//   Find({ objTypes: [0x190], operations: [GetX, GetY], keys: ['x', 'y'] }) // custom keys (optional, auto-derived if omitted)
//   Find({ objTypes: [0xFFFF], operations: [GetHP, GetDistance], filters: [(item) => item.hp > 0 && item.distance < 1000] }) // with filters
export async function Find(options) {
    // Support both object and legacy positional arguments
    let objTypes, colors, containers, inSub, operations, keys, numConnections, filters;
    if (typeof options === 'object' && !Array.isArray(options)) {
        // New friendly API with options object
        const objTypeValue = options.objTypes || options.objType;
        objTypes = objTypeValue ? (Array.isArray(objTypeValue) ? objTypeValue : [objTypeValue]) : null;
        const colorValue = options.colors || options.color;
        colors = colorValue !== undefined ? (Array.isArray(colorValue) ? colorValue : [colorValue]) : [0xFFFF];
        const containerValue = options.containers || options.container;
        containers = containerValue !== undefined ? (Array.isArray(containerValue) ? containerValue : [containerValue]) : [Ground()];
        inSub = options.inSub ?? false;
        operations = options.operations;
        keys = options.keys || null;
        numConnections = options.numConnections || 16;
        filters = options.filters || null;
    }
    else {
        // Legacy positional API for backwards compatibility
        [objTypes, colors, containers, inSub, operations, keys = null, numConnections = 16] = arguments;
    }
    if (!objTypes || !operations) {
        throw new Error('Find requires objTypes and operations');
    }
    // Ensure arrays (safety check for legacy API)
    if (!Array.isArray(objTypes))
        objTypes = [objTypes];
    if (!Array.isArray(colors))
        colors = colors !== undefined ? [colors] : [0xFFFF];
    if (!Array.isArray(containers))
        containers = containers !== undefined ? [containers] : [Ground()];
    // Find items first (handle errors gracefully)
    let items;
    try {
        items = await FindTypesArrayEx(objTypes, colors, containers, inSub);
    }
    catch (error) {
        // If FindTypesArrayEx fails (timeout, connection error, etc.), return empty array
        // This is better than crashing - the user can handle empty results
        const errorMsg = error?.message || String(error || 'Unknown error');
        console.warn(`FindTypesArrayEx failed: ${errorMsg}. Returning empty results.`);
        return [];
    }
    if (!items || items.length === 0) {
        return [];
    }
    // If no keys provided, derive from function names
    if (!keys) {
        keys = operations.map(op => {
            // Try to get the original function name (might be wrapped by withAutoConnect)
            // Functions wrapped with withAutoConnect have _methodName property set
            let name = op._methodName || op.name || 'unknown';
            // Convert GetX -> x, GetName -> name, GetDistance -> distance, etc.
            // Simply remove Get/Is/Has prefix and convert to lowercase
            const key = name.replace(/^Get/, '').replace(/^Is/, '').replace(/^Has/, '').toLowerCase();
            return key || 'value'; // fallback if extraction fails
        });
    }
    // Get properties in parallel
    const itemsWithData = await parallel_items(items, operations, numConnections);
    // Map to objects with keys
    let results = itemsWithData.map((item) => {
        const result = { id: item.id };
        keys.forEach((key, index) => {
            result[key] = item.data[index];
        });
        return result;
    });
    // Apply filters if provided
    if (filters) {
        // Support single filter function or array of filters
        const filterFunctions = Array.isArray(filters) ? filters : [filters];
        // Apply all filters (all must pass - AND logic)
        results = results.filter((item) => {
            return filterFunctions.every((filterFn) => {
                if (typeof filterFn !== 'function') {
                    throw new Error('Filter must be a function that takes an item and returns boolean');
                }
                try {
                    return filterFn(item) === true;
                }
                catch (error) {
                    // If filter throws an error (e.g., accessing undefined property), skip this item
                    console.warn(`Filter error for item ${item.id}: ${error.message}`);
                    return false;
                }
            });
        });
    }
    // Cleanup: Close excess connections after Find completes (async, don't block)
    // This prevents connection pool from growing indefinitely and causing timeouts
    // Run cleanup asynchronously so it doesn't slow down the return
    Promise.resolve().then(async () => {
        try {
            // Use cached getter if available, otherwise import
            if (!cachedGetConnectionState) {
                const indexModule = await import('./index.js');
                cachedGetConnectionState = indexModule.getConnectionState;
            }
            const { connectionPool } = cachedGetConnectionState();
            // Clean up dead connections first
            for (let i = connectionPool.length - 1; i >= 0; i--) {
                const conn = connectionPool[i];
                if (!conn.protocol || !conn.protocol.socket || conn.protocol.socket.destroyed || !conn.protocol.socket.writable) {
                    try {
                        if (conn.protocol && conn.protocol.socket && !conn.protocol.socket.destroyed) {
                            conn.protocol.socket.destroy();
                        }
                    }
                    catch (e) {
                        // Ignore cleanup errors
                    }
                    connectionPool.splice(i, 1);
                }
            }
            // Keep only a small pool (2-4 connections) for future use to prevent overwhelming Stealth
            const keepConnections = Math.min(4, Math.max(2, numConnections));
            if (connectionPool.length > keepConnections) {
                const excess = connectionPool.splice(keepConnections);
                for (const conn of excess) {
                    try {
                        if (conn.protocol && conn.protocol.socket && !conn.protocol.socket.destroyed) {
                            // Clear pending promises first
                            if (conn.protocol.pendingPromises) {
                                for (const [id, promise] of conn.protocol.pendingPromises) {
                                    if (promise.timeout) {
                                        clearTimeout(promise.timeout);
                                    }
                                }
                                conn.protocol.pendingPromises.clear();
                            }
                            conn.protocol.socket.removeAllListeners();
                            conn.protocol.removeAllListeners();
                            conn.protocol.socket.destroy();
                        }
                    }
                    catch (e) {
                        // Ignore cleanup errors
                    }
                }
            }
        }
        catch (e) {
            // Ignore cleanup errors - not critical
        }
    });
    return results;
}
