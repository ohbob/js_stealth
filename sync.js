// Sync wrapper - Python-like API with minimal await
// This doesn't truly eliminate await (JavaScript limitation), but makes code cleaner
import * as stealth from './index.js';
// The real solution: top-level await + parallel() handles most cases
// For single operations, you still need await when you need the result
export function createSync() {
    // Just re-export everything - the magic is in parallel() auto-awaiting promises
    // and using top-level await in your scripts
    return stealth;
}
// Better: export a helper that makes code cleaner
export { stealth as default };
