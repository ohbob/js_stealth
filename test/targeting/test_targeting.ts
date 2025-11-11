import '../../src';
import { createTestRunner } from '../test_helper';

config.HOST = '192.168.88.13';

console.log('=== Targeting Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Basic targeting info
console.log('=== Step 1: Basic Targeting Info ===');
await testMethod('TargetID()', () => TargetID(), 'number');
await testMethod('TargetPresent()', () => TargetPresent(), 'boolean');
await testMethod('TargetCursor()', () => TargetCursor(), 'boolean');
await testMethod('LastTarget()', () => LastTarget(), 'number');
await testMethod('LastAttack()', () => LastAttack(), 'number');
await testMethod('WarTargetID()', () => WarTargetID(), 'number');

// Step 2: Target control
console.log('\n=== Step 2: Target Control ===');
await testMethod('CancelTarget()', () => CancelTarget());

// Step 3: WaitForTarget (with short timeout)
console.log('\n=== Step 3: WaitForTarget ===');
try {
  const waitResult = await WaitForTarget(1000);
  console.log(`✓ WaitForTarget(1000) = ${waitResult} (number)`);
} catch (error) {
  console.log(`⚠ WaitForTarget(1000) timed out (expected): ${error.message}`);
}

// Step 4: Client target info
console.log('\n=== Step 4: Client Target Info ===');
await testMethod('ClientTargetResponsePresent()', () => ClientTargetResponsePresent(), 'boolean');

// Step 5: Target methods (info only - not executing to avoid targeting)
console.log('\n=== Step 5: Target Methods (Available) ===');
const selfId = await Self();
const [x, y, z] = await parallel([
  [GetX, selfId],
  [GetY, selfId],
  [GetZ, selfId],
]);
console.log(`  Self ID: ${selfId}, Position: ${x}, ${y}, ${z}`);
console.log('  Available methods (not executed to avoid targeting):');
console.log('    - TargetToObject(objId)');
console.log('    - TargetToXYZ(x, y, z)');
console.log('    - WaitTargetObject(objId)');
console.log('    - WaitTargetSelf()');
console.log('    - WaitTargetLast()');
console.log('    - CancelWaitTarget()');
console.log('    - TargetToTile(x, y, z, tileType)');
console.log('    - WaitTargetTile(x, y, z, tileType)');
console.log('    - WaitTargetXYZ(x, y, z)');
console.log('    - WaitTargetType(objType)');
console.log('    - WaitTargetGround()');
console.log('    - ClientRequestObjectTarget()');
console.log('    - ClientRequestTileTarget()');
console.log('    - ClientTargetResponse()');

const stats = getStats();
console.log('\n=== Targeting Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

