// ============================================================================
// CUSTOM HELPER METHODS - NOT PART OF STANDARD STEALTH API
// ============================================================================
// These are custom convenience methods for JavaScript/TypeScript
// They don't exist in Python py_stealth - they're built on top of the standard API
// Parallel executor with connection pooling (like Python ThreadPoolExecutor)
// numConnections: Number of parallel connections (not CPU-bound, can be higher than CPU cores)
// Optimal range: 4-16 for most cases. Too many (>32) may cause server overhead
// Enhanced parallel that auto-awaits promises in arguments
// Usage: parallel([[GetX, Self()], [GetY, Self()]]) - Self() promise is auto-awaited!
// Default to 8 connections like Python's ThreadPoolExecutor
// This is a custom convenience method - it doesn't exist in Python py_stealth
export async function parallel(commands, numConnections = 8) {
    // Don't pre-await everything - it slows things down!
    // Instead, await promise arguments on-demand during execution
    return await parallelInternal(commands, numConnections);
}
// Internal parallel implementation
async function parallelInternal(commands, numConnections = 8) {
    // Get connection state from index.ts via exported getter
    const { getConnectionState, ensureConnected } = await import('./index.js');
    // Ensure main connection is ready first (this waits if needed)
    await ensureConnected();
    const { HOST, PORT, connectionPool, protocol, methodsRaw } = getConnectionState();
    if (!protocol || !methodsRaw || !PORT) {
        throw new Error('Must call connect() first');
    }
    const { createMethods } = await import('./methods.js');
    const { connect: connectToStealth } = await import('./core/connection.js');
    // Reuse or expand connection pool (skip port discovery - we already know PORT!)
    if (connectionPool.length < numConnections) {
        const needed = numConnections - connectionPool.length;
        // Create connections in parallel but with slight stagger to avoid overwhelming Stealth
        // Only add small delay for first connection, rest can be parallel
        const newConnections = [];
        for (let i = 0; i < needed; i++) {
            try {
                // Direct connect with known port - NO port discovery!
                const connProtocol = await connectToStealth(HOST, PORT);
                // Only wait for first connection handshake, rest can proceed
                if (i === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
                const connMethods = createMethods(connProtocol);
                newConnections.push({ protocol: connProtocol, methods: connMethods, _instances: connMethods._instances });
            }
            catch (error) {
                throw new Error(`Failed to create pool connection: ${error.message}`);
            }
        }
        connectionPool.push(...newConnections);
    }
    // Use pool connections (trim if we need fewer)
    const connections = connectionPool.slice(0, numConnections);
    // Verify all pool connections are still alive
    for (const conn of connections) {
        if (!conn.protocol || !conn.protocol.socket || conn.protocol.socket.destroyed || !conn.protocol.socket.writable) {
            throw new Error('Pool connection is dead - cannot proceed');
        }
    }
    // Optimized for Bun: True parallelism by batching all sends first, then all waits
    // Step 1: Resolve all promise arguments in parallel (if any)
    const preparedCommands = await Promise.all(commands.map(async (cmd, index) => {
        if (Array.isArray(cmd)) {
            const [fn, ...args] = cmd;
            const hasPromises = args.some(arg => arg && typeof arg.then === 'function');
            const resolvedArgs = hasPromises
                ? await Promise.all(args.map(arg => arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg)))
                : args;
            return { type: 'method', cmd: [fn, ...resolvedArgs], index };
        }
        else if (typeof cmd === 'function') {
            return { type: 'function', cmd, index };
        }
        else if (cmd && typeof cmd.then === 'function') {
            const result = await cmd;
            return { type: 'value', cmd: result, index };
        }
        else {
            return { type: 'value', cmd, index };
        }
    }));
    // Step 2: Send ALL requests immediately (non-blocking TCP writes)
    // All packets queue up in socket buffers concurrently
    // Do ALL sends synchronously without any awaits - pure I/O batching
    const waitFunctions = [];
    for (const { type, cmd, index } of preparedCommands) {
        const connIdx = index % numConnections;
        const conn = connections[connIdx];
        const connInstances = conn._instances;
        if (type === 'method') {
            const [fn, ...args] = cmd;
            // Use _methodName property (set by withAutoConnect) or fallback to fn.name
            const methodName = fn._methodName || fn.name || 'unknown';
            const instance = connInstances[methodName];
            if (instance && typeof instance.send === 'function') {
                // Send NOW - synchronous call that queues packet in socket buffer
                // No await here - we batch all sends, then wait for all results
                const waitFn = instance.send(...args);
                waitFunctions.push({ wait: waitFn, index, methodName });
            }
            else {
                // Fallback: execute as promise (this is slower!)
                // Wrap in try/catch to handle timeout errors from wrapped functions
                waitFunctions.push({
                    wait: async () => {
                        try {
                            return await fn(...args);
                        }
                        catch (error) {
                            // Re-throw so it gets caught by the outer try/catch in allPromises.map
                            throw error;
                        }
                    },
                    index,
                    methodName
                });
            }
        }
        else if (type === 'function') {
            const methodName = cmd?._methodName || (typeof cmd === 'function' ? cmd.name : 'unknown');
            waitFunctions.push({ wait: () => cmd(), index, methodName });
        }
        else {
            waitFunctions.push({ wait: () => Promise.resolve(cmd), index });
        }
    }
    // At this point, ALL requests are queued in socket buffers
    // Step 3: Wait for ALL results in parallel with error handling
    // Bun's event loop will process all socket I/O concurrently
    const allPromises = waitFunctions.map(async ({ wait, index, methodName }) => {
        try {
            const result = await wait();
            return { success: true, result, index, error: null };
        }
        catch (error) {
            const errorMsg = error?.message || String(error || 'Unknown error');
            // Log timeout errors but don't crash - return error info instead
            // Catch various timeout error formats: "Timeout waiting for result", "Method X timed out", etc.
            const lowerMsg = errorMsg.toLowerCase();
            if (lowerMsg.includes('timeout') ||
                lowerMsg.includes('timed out') ||
                lowerMsg.includes('timeout waiting')) {
                const name = methodName || `command[${index}]`;
                // Don't log individual timeouts - they'll be summarized at the end
                // Only log if it's a connection-level issue (which would affect all calls)
                return { success: false, result: null, index, error: errorMsg, methodName: name };
            }
            // Re-throw unexpected errors (connection errors, etc.)
            throw error;
        }
    });
    // Wait for all commands to complete (some may have failed gracefully)
    const allIndexedResults = await Promise.all(allPromises);
    // Count failures for reporting (group by method name for cleaner output)
    const failures = allIndexedResults.filter(r => !r.success);
    if (failures.length > 0) {
        const failureCounts = new Map();
        failures.forEach(f => {
            const methodName = f.methodName || 'unknown';
            failureCounts.set(methodName, (failureCounts.get(methodName) || 0) + 1);
        });
        // Only show summary if there are failures (not individual warnings for each)
        const failureSummary = Array.from(failureCounts.entries())
            .map(([method, count]) => `${method} (${count}x)`)
            .join(', ');
        console.error(`⚠️  ${failures.length} operation(s) failed: ${failureSummary}`);
    }
    // Clean up dead connections from pool (connections that errored or closed)
    for (let i = connectionPool.length - 1; i >= 0; i--) {
        const conn = connectionPool[i];
        if (!conn.protocol || !conn.protocol.socket || conn.protocol.socket.destroyed || !conn.protocol.socket.writable) {
            // Connection is dead, remove from pool
            try {
                if (conn.protocol && conn.protocol.socket && !conn.protocol.socket.destroyed) {
                    conn.protocol.socket.destroy();
                }
            }
            catch (e) {
                // Ignore errors when destroying
            }
            connectionPool.splice(i, 1);
        }
    }
    // Keep pool size reasonable - if we have more connections than needed, close excess
    // Keep at least 2 connections for future use, but don't keep too many
    const maxPoolSize = Math.max(2, numConnections);
    if (connectionPool.length > maxPoolSize) {
        const excess = connectionPool.splice(maxPoolSize);
        for (const conn of excess) {
            try {
                if (conn.protocol && conn.protocol.socket && !conn.protocol.socket.destroyed) {
                    conn.protocol.socket.destroy();
                }
            }
            catch (e) {
                // Ignore errors when destroying
            }
        }
    }
    // Flatten, sort by original index, and return results in order
    // Failed operations will have null results, caller can handle them
    return allIndexedResults
        .sort((a, b) => a.index - b.index)
        .map(r => r.result);
}
// Helper: process items with operations in parallel (like Python's parallel_items with @timeit decorator)
// This is a custom convenience method - it doesn't exist in Python py_stealth
export async function parallel_items(items, operations, numConnections = 16) {
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
    // Find items first
    const items = await FindTypesArrayEx(objTypes, colors, containers, inSub);
    if (items.length === 0) {
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
            const { getConnectionState } = await import('./index.js');
            const { connectionPool } = getConnectionState();
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
