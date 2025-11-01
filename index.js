// Re-export from dist for cleaner imports
// This allows: import './js_stealth' instead of './js_stealth/dist/index.js'
// Note: We need to import and re-export everything manually to handle relative paths correctly
import * as stealth from './dist/index.js';
export * from './dist/index.js';

// Also handle side-effects (global assignment happens in dist/index.js)
// Just importing it runs the side-effect code