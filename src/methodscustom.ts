// ============================================================================
// CUSTOM HELPER METHODS - NOT PART OF STANDARD STEALTH API
// ============================================================================
// These are custom convenience methods for JavaScript/TypeScript
// They don't exist in Python py_stealth - they're built on top of the standard API

// Import standard functions from index to avoid circular dependency
// These will be available as globals after the main index.js loads
declare const FindTypesArrayEx: (objTypes: number[], colors: number[], containers: number[], inSub: boolean) => Promise<number[]>;
declare const Ground: () => number;
declare const GetX: (objId: number) => Promise<number>;
declare const GetY: (objId: number) => Promise<number>;
declare const GetZ: (objId: number) => Promise<number>;

// Cache connection state getters and modules to avoid repeated dynamic imports (performance!)
let cachedGetConnectionState: any = null;
let cachedEnsureConnected: any = null;
let cachedCreateMethods: any = null;
let cachedConnectToStealth: any = null;

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
  
  const { protocol, methodsRaw } = cachedGetConnectionState();
  
  if (!protocol || !methodsRaw) {
    throw new Error('Must call connect() first');
  }
  
  // CRITICAL: Use ONE connection for all parallel calls
  // Each method call gets a unique ID, so they can execute in parallel on the same connection
  // This matches Python's behavior - one script, multiple parallel method calls
  const waitFunctions: Array<{ wait: () => Promise<any>, index: number }> = [];
  
  // First, resolve all promise arguments in parallel
  const resolvedCommands = await Promise.all(commands.map(async (cmd, index) => {
    if (Array.isArray(cmd)) {
      const [fn, ...args] = cmd;
      // Resolve any promise arguments
      const resolvedArgs = await Promise.all(args.map(arg => 
        arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg)
      ));
      return { type: 'array', fn, args: resolvedArgs, index };
    } else if (typeof cmd === 'function') {
      return { type: 'function', fn: cmd, index };
    } else if (cmd && typeof cmd.then === 'function') {
      return { type: 'promise', promise: cmd, index };
    } else {
      return { type: 'value', value: cmd, index };
    }
  }));
  
  // Now create wait functions - all methods will be called in parallel
  for (const resolved of resolvedCommands) {
    if (resolved.type === 'array') {
      waitFunctions.push({ wait: () => resolved.fn(...resolved.args), index: resolved.index });
    } else if (resolved.type === 'function') {
      waitFunctions.push({ wait: () => resolved.fn(), index: resolved.index });
    } else if (resolved.type === 'promise') {
      waitFunctions.push({ wait: () => resolved.promise, index: resolved.index });
    } else {
      waitFunctions.push({ wait: () => Promise.resolve(resolved.value), index: resolved.index });
    }
  }
  
  // At this point, ALL requests are queued in socket buffers
  // Step 3: Wait for ALL results in parallel - handle errors gracefully
  // Use Promise.allSettled so individual failures don't crash the batch
  // Bun's event loop will process all socket I/O concurrently
  const allPromises = waitFunctions.map(({ wait, index }) => 
    wait()
      .then(result => ({ success: true, result, index, error: null }))
      .catch(error => {
        // Log warning but don't crash - return null for failed operations
        // This allows methods like GetNotoriety to fail on invalid objects (e.g., items instead of creatures)
        const errorMsg = error?.message || String(error);
        if (errorMsg.includes('timeout') || errorMsg.includes('Method')) {
          // Log first few failures for debugging
          const cmd = commands[index];
          if (Array.isArray(cmd) && index < 10) {
            const methodName = (cmd[0] as any)?._methodName || cmd[0]?.name || 'unknown';
            console.warn(`Operation ${methodName} timed out at index ${index}:`, errorMsg.substring(0, 50));
          }
          // Silent failure for timeout/error - return null
          return { success: false, result: null, index, error: null };
        }
        // Other errors - still return null but log
        return { success: false, result: null, index, error: null };
      })
  );
  
  // Wait for all commands to complete (errors are handled, won't crash)
  const allIndexedResults = await Promise.all(allPromises);
  
  // Return results in order - null for failed operations
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
export async function FindProps(items: (number | { id: number; [key: string]: any })[], operations: Function[], keys?: string[], numConnections: number = 16): Promise<Array<{ id: number; [key: string]: any }>> {
  if (!items || items.length === 0) {
    return [];
  }
  
  if (!operations || operations.length === 0) {
    // If no operations, return objects as-is or convert IDs to objects
    return items.map(item => typeof item === 'number' ? { id: item } : item);
  }
  
  // Extract IDs and preserve existing objects
  const itemIds: number[] = [];
  const existingObjects = new Map<number, { id: number; [key: string]: any }>();
  
  for (const item of items) {
    if (typeof item === 'number') {
      itemIds.push(item);
    } else {
      itemIds.push(item.id);
      existingObjects.set(item.id, item);
    }
  }
  
  // If no keys provided, derive from function names
  if (!keys) {
    keys = operations.map(op => {
      // Try to get the original function name (might be wrapped by withAutoConnect)
      let name = (op as any)._methodName || op.name || 'unknown';
      
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
    const result: { id: number; [key: string]: any } = existingObjects.has(item.id)
      ? { ...existingObjects.get(item.id) }
      : { id: item.id };
    
    // Add new properties from operations (will overwrite if key exists)
    keys!.forEach((key, index) => {
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
//   Find({ objTypes: [0x190, 0x191], colors: [0xFFFF, 0x0000], containers: [Backpack(), Ground()], operations: [GetX, GetY] }) // multiple values (Backpack() promise auto-awaited)
//   Find({ objTypes: [0x190], operations: [GetX, GetY], keys: ['x', 'y'] }) // custom keys (optional, auto-derived if omitted)
//   Find({ objTypes: [0xFFFF], operations: [GetHP, GetDistance], filters: [(item) => item.hp > 0 && item.distance < 1000] }) // with filters
//   Find({ objTypes: [0xFFFF], operations: [GetHP], filters: [(item) => item.hp > 0], properties: [GetName, GetNotoriety] }) // with properties (runs FindProps after filters)
export async function Find(options) {
  // Support both object and legacy positional arguments
  let objTypes, colors, containers, inSub, operations, keys, numConnections, filters, properties;
  
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
    properties = options.properties || null; // New: properties to get after filtering
  } else {
    // Legacy positional API for backwards compatibility
    [objTypes, colors, containers, inSub, operations, keys = null, numConnections = 16, filters = null, properties = null] = arguments;
  }
  
  if (!objTypes) {
    throw new Error('Find requires objTypes');
  }
  
  // Ensure arrays (safety check for legacy API)
  if (!Array.isArray(objTypes)) objTypes = [objTypes];
  if (!Array.isArray(colors)) colors = colors !== undefined ? [colors] : [0xFFFF];
  if (!Array.isArray(containers)) containers = containers !== undefined ? [containers] : [Ground()];
  
  // Await any promises in containers array (e.g., Backpack() returns Promise<number>)
  // Promise.resolve() handles both promises and non-promises gracefully
  containers = await Promise.all(containers.map(container => Promise.resolve(container)));
  
  // Find items first (handle errors gracefully)
  let items: number[];
  try {
    items = await FindTypesArrayEx(objTypes, colors, containers, inSub);
  } catch (error) {
    // If FindTypesArrayEx fails (timeout, connection error, etc.), return empty array
    // This is better than crashing - the user can handle empty results
    const errorMsg = error?.message || String(error || 'Unknown error');
    console.warn(`FindTypesArrayEx failed: ${errorMsg}. Returning empty results.`);
    return [];
  }
  
  if (!items || items.length === 0) {
    return [];
  }
  
  // If no operations provided, just return objects with IDs
  if (!operations || operations.length === 0) {
    let results = items.map(id => ({ id }));
    
    // Apply filters if provided (even with no operations)
    if (filters) {
      const filterFunctions = Array.isArray(filters) ? filters : [filters];
      results = results.filter((item) => {
        return filterFunctions.every((filterFn) => {
          if (typeof filterFn !== 'function') {
            throw new Error('Filter must be a function that takes an item and returns boolean');
          }
          try {
            return filterFn(item) === true;
          } catch (error) {
            console.warn(`Filter error for item ${item.id}: ${error.message}`);
            return false;
          }
        });
      });
    }
    
    return results;
  }
  
  // If no keys provided, derive from function names
  if (!keys) {
    keys = operations.map(op => {
      // Try to get the original function name (might be wrapped by withAutoConnect)
      // Functions wrapped with withAutoConnect have _methodName property set
      let name = (op as any)._methodName || op.name || 'unknown';
      
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
        } catch (error) {
          // If filter throws an error (e.g., accessing undefined property), skip this item
          console.warn(`Filter error for item ${item.id}: ${error.message}`);
          return false;
        }
      });
    });
  }
  
  // If properties are specified, run FindProps on filtered results
  // This executes after filters, so you can filter first, then get additional properties
  if (properties && properties.length > 0 && results.length > 0) {
    results = await FindProps(results, properties, undefined, numConnections);
  }
  
  // Cleanup: Close excess connections after Find completes (async, don't block)
  // This prevents connection pool from growing indefinitely and causing timeouts
  // Run cleanup asynchronously so it doesn't slow down the return
  // Note: We keep a reasonable pool (up to 16) to avoid having to recreate connections on subsequent calls
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
          } catch (e) {
            // Ignore cleanup errors
          }
          connectionPool.splice(i, 1);
        }
      }
      
      // Keep a reasonable pool size (match numConnections, max 16) for future use
      // This prevents having to recreate connections on subsequent calls, which causes 3s delays
      // Only trim if we have significantly more than needed (e.g., >20 when we only need 16)
      const keepConnections = Math.min(16, Math.max(8, numConnections));
      if (connectionPool.length > 20) {
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
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    } catch (e) {
      // Ignore cleanup errors - not critical
    }
  });
  
  return results;
}

/**
 * Gets X and Y coordinates of an object in parallel
 * @param objId - Object ID
 * @returns Promise<[x, y]>
 */
export async function getXY(objId: number): Promise<[number, number]> {
  return await parallel([
    [GetX, objId],
    [GetY, objId]
  ]);
}

/**
 * Gets X, Y, and Z coordinates of an object in parallel
 * @param objId - Object ID
 * @returns Promise<[x, y, z]>
 */
export async function getXYZ(objId: number): Promise<[number, number, number]> {
  return await parallel([
    [GetX, objId],
    [GetY, objId],
    [GetZ, objId]
  ]);
}

