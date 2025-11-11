import '../../src';
import { createTestRunner } from '../test_helper';

config.HOST = '192.168.88.13';

console.log('=== Basic Object Information Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Self and position
console.log('=== Step 1: Self and Position ===');
await testMethod('Self()', () => Self(), 'number');
const selfId = await Self();
const [x, y, z] = await parallel([
  [GetX, selfId],
  [GetY, selfId],
  [GetZ, selfId],
]);
await testMethod(`GetX(${selfId})`, () => GetX(selfId), 'number');
await testMethod(`GetY(${selfId})`, () => GetY(selfId), 'number');
await testMethod(`GetZ(${selfId})`, () => GetZ(selfId), 'number');
console.log(`  Position: ${x}, ${y}, ${z}`);

// Step 2: Object properties
console.log('\n=== Step 2: Object Properties ===');
await testMethod(`GetType(${selfId})`, () => GetType(selfId), 'number');
await testMethod(`GetName(${selfId})`, () => GetName(selfId), 'string');
await testMethod(`GetColor(${selfId})`, () => GetColor(selfId), 'number');
await testMethod(`GetDistance(${selfId})`, () => GetDistance(selfId), 'number');
await testMethod(`GetAltName(${selfId})`, () => GetAltName(selfId), 'string');
await testMethod(`GetTitle(${selfId})`, () => GetTitle(selfId), 'string');

// Step 3: Stats
console.log('\n=== Step 3: Stats ===');
const [hp, mana, stam] = await parallel([
  [GetHP, selfId],
  [GetMana, selfId],
  [GetStam, selfId],
]);
await testMethod(`GetHP(${selfId})`, () => GetHP(selfId), 'number');
await testMethod(`GetMana(${selfId})`, () => GetMana(selfId), 'number');
await testMethod(`GetStam(${selfId})`, () => GetStam(selfId), 'number');
console.log(`  Stats: HP=${hp}, Mana=${mana}, Stam=${stam}`);

// Step 4: Attributes
console.log('\n=== Step 4: Attributes ===');
const [str, int, dex] = await parallel([
  [GetStr, selfId],
  [GetInt, selfId],
  [GetDex, selfId],
]);
await testMethod(`GetStr(${selfId})`, () => GetStr(selfId), 'number');
await testMethod(`GetInt(${selfId})`, () => GetInt(selfId), 'number');
await testMethod(`GetDex(${selfId})`, () => GetDex(selfId), 'number');
console.log(`  Attributes: Str=${str}, Int=${int}, Dex=${dex}`);

// Step 5: Max stats
console.log('\n=== Step 5: Max Stats ===');
const [maxHP, maxMana, maxStam] = await parallel([
  [GetMaxHP, selfId],
  [GetMaxMana, selfId],
  [GetMaxStam, selfId],
]);
await testMethod(`GetMaxHP(${selfId})`, () => GetMaxHP(selfId), 'number');
await testMethod(`GetMaxMana(${selfId})`, () => GetMaxMana(selfId), 'number');
await testMethod(`GetMaxStam(${selfId})`, () => GetMaxStam(selfId), 'number');
console.log(`  Max Stats: MaxHP=${maxHP}, MaxMana=${maxMana}, MaxStam=${maxStam}`);

// Step 6: Object checks
console.log('\n=== Step 6: Object Checks ===');
await testMethod(`IsObjectExists(${selfId})`, () => IsObjectExists(selfId), 'boolean');
const [isNPC, isDead, isContainer, isMovable, isFemale, isHouse] = await parallel([
  [IsNPC, selfId],
  [IsDead, selfId],
  [IsContainer, selfId],
  [IsMovable, selfId],
  [IsFemale, selfId],
  [IsHouse, selfId],
]);
await testMethod(`IsNPC(${selfId})`, () => IsNPC(selfId), 'boolean');
await testMethod(`IsDead(${selfId})`, () => IsDead(selfId), 'boolean');
await testMethod(`IsContainer(${selfId})`, () => IsContainer(selfId), 'boolean');
await testMethod(`IsMovable(${selfId})`, () => IsMovable(selfId), 'boolean');
await testMethod(`IsFemale(${selfId})`, () => IsFemale(selfId), 'boolean');
await testMethod(`IsHouse(${selfId})`, () => IsHouse(selfId), 'boolean');

// Step 7: Other properties
console.log('\n=== Step 7: Other Properties ===');
await testMethod(`GetDirection(${selfId})`, () => GetDirection(selfId), 'number');
await testMethod(`GetNotoriety(${selfId})`, () => GetNotoriety(selfId), 'number');
await testMethod(`GetParent(${selfId})`, () => GetParent(selfId), 'number');
await testMethod(`GetLayer(${selfId})`, () => GetLayer(selfId), 'number');

const stats = getStats();
console.log('\n=== Basic Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

