import '../../src';
import { createTestRunner } from '../test_helper';

config.HOST = '192.168.88.13';

console.log('=== Abilities Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Abilities
console.log('=== Step 1: Abilities ===');
await testMethod('UsePrimaryAbility()', () => UsePrimaryAbility(), 'string');
await testMethod('UseSecondaryAbility()', () => UseSecondaryAbility(), 'string');
await testMethod("GetAbility('Primary')", () => GetAbility('Primary'), 'number');
await testMethod('ToggleFly()', () => ToggleFly(), 'number');

// Step 2: Virtues
console.log('\n=== Step 2: Virtues ===');
await testMethod('ReqVirtuesGump()', () => ReqVirtuesGump());

const stats = getStats();
console.log('\n=== Abilities Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

