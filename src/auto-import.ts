// Auto-import all functions to global scope (Node.js/Bun)
// Usage: import './js_stealth';
// Then use: Self(), GetX(), etc. directly

/// <reference path="../global.d.ts" />

import * as stealth from './index.js';

// Get global object (works in Node.js, Bun, and browsers)
declare const window: any;
declare const global: any;

const globalObj = typeof globalThis !== 'undefined' ? globalThis : 
                  typeof window !== 'undefined' ? window : 
                  typeof global !== 'undefined' ? global : {};

// Assign all stealth functions to global scope
Object.assign(globalObj, stealth);

// Also export everything
export * from './index.js';
export default stealth;
