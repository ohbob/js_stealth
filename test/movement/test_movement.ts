import '../../src';
import { DIRECTIONS } from '../../src';
import { createTestRunner } from '../test_helper';

declare const process: { exit(code: number): void };

config.HOST = '192.168.88.13';

console.log('=== Movement Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Connection check
console.log('=== Step 1: Connection Check ===');
// Note: Connected() is tested in character/test_character_stats.ts
const connected = await Connected();
if (!connected) {
  console.error('✗ Not connected to Stealth');
  process.exit(1);
}
console.log('✓ Connected to Stealth');

// Step 2: Get current position
console.log('\n=== Step 2: Current Position ===');
const selfId = await Self();
const [x, y, z] = await parallel([
  [GetX, selfId],
  [GetY, selfId],
  [GetZ, selfId],
]);
console.log(`  Position: ${x}, ${y}, ${z}`);

// Step 3: Movement settings
console.log('\n=== Step 3: Movement Settings ===');
await testMethod('GetMoveOpenDoor()', () => GetMoveOpenDoor(), 'number');
await testMethod('GetMoveThroughNPC()', () => GetMoveThroughNPC(), 'number');
await testMethod('GetMoveCheckStamina()', () => GetMoveCheckStamina(), 'number');
await testMethod('GetMoveThroughCorner()', () => GetMoveThroughCorner(), 'number');
await testMethod('GetMoveHeuristicMult()', () => GetMoveHeuristicMult(), 'number');
await testMethod('GetMoveTurnCost()', () => GetMoveTurnCost(), 'number');
await testMethod('GetMoveBetweenTwoCorners()', () => GetMoveBetweenTwoCorners(), 'number');

// Step 4: Movement timers
console.log('\n=== Step 4: Movement Timers ===');
await testMethod('GetRunMountTimer()', () => GetRunMountTimer(), 'number');
await testMethod('GetWalkMountTimer()', () => GetWalkMountTimer(), 'number');
await testMethod('GetRunUnmountTimer()', () => GetRunUnmountTimer(), 'number');
await testMethod('GetWalkUnmountTimer()', () => GetWalkUnmountTimer(), 'number');
await testMethod('GetLastStepQUsedDoor()', () => GetLastStepQUsedDoor(), 'boolean');

// Step 5: Bad location methods
console.log('\n=== Step 5: Bad Location Methods ===');
await testMethod(`SetBadLocation(${x}, ${y})`, () => SetBadLocation(x, y));
await testMethod(`SetGoodLocation(${x}, ${y})`, () => SetGoodLocation(x, y));
await testMethod('ClearBadLocationList()', () => ClearBadLocationList());

// Step 6: Bad object methods
console.log('\n=== Step 6: Bad Object Methods ===');
await testMethod('SetBadObject(0x0190, 0x0000, 5)', () => SetBadObject(0x0190, 0x0000, 5));
await testMethod('ClearBadObjectList()', () => ClearBadObjectList());

// Step 7: CheckLOS
console.log('\n=== Step 7: CheckLOS ===');
await testMethod(`CheckLOS(${x}, ${y}, ${z}, ${x + 1}, ${y + 1}, ${z})`, () => CheckLOS(x, y, z, x + 1, y + 1, z, 0, 0, 0), 'boolean');

// Step 8: Pathfinding
console.log('\n=== Step 8: Pathfinding ===');
await testMethod(`GetPathArray(${x + 5}, ${y + 5})`, () => GetPathArray(x + 5, y + 5, false, 1), 'object');
await testMethod(`GetPathArray3D(${x}, ${y}, ${z}, ${x + 5}, ${y + 5}, ${z})`, () => GetPathArray3D(x, y, z, x + 5, y + 5, z, 0, 1, 1, false), 'object');
await testMethod(`GetNextStepZ(${x}, ${y}, ${x + 1}, ${y + 1})`, () => GetNextStepZ(x, y, x + 1, y + 1, 0, z), 'number');

// Step 9: Stop mover
console.log('\n=== Step 9: Stop Mover ===');
await testMethod('StopMover()', () => StopMover());

// Step 10: Step methods (info only - not executing to avoid movement)
console.log('\n=== Step 10: Step Methods (Available) ===');
const [dead, hidden] = await parallel([
  [Dead],
  [Hidden],
]);
console.log(`  Character status: Dead=${dead}, Hidden=${hidden}`);
if (dead) {
  console.log('  ⚠ Character is dead - cannot test movement');
} else {
  console.log('  Available methods (not executed to avoid movement):');
  console.log('    - Step(direction, run, ensureDirection)');
  console.log('    - StepQ(direction, run, ensureDirection)');
  console.log('    - MoveXYZ(x, y, z, accuracyXY, accuracyZ, run)');
  console.log('    - MoveXY(x, y, accuracy, run)');
  console.log('    - newMoveXY(x, y, accuracy, run)');
  console.log('    - newMoveXYZ(x, y, z, accuracyXY, accuracyZ, run)');
}

const stats = getStats();
console.log('\n=== Movement Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

