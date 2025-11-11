import '../../src';
import { createTestRunner } from '../test_helper';

// Character stats and information tests
config.HOST = '192.168.88.13';

console.log('=== Character Stats Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Basic character info
console.log('=== Step 1: Basic Character Info ===');
// Note: Self() is tested in basic/test_basic.ts
await testMethod('CharName()', () => CharName(), 'string');
await testMethod('GetCharTitle()', () => GetCharTitle(), 'string');
await testMethod('ProfileName()', () => ProfileName(), 'string');
await testMethod('ShardName()', () => ShardName(), 'string');

// Step 2: World info
console.log('\n=== Step 2: World Info ===');
await testMethod('WorldNum()', () => WorldNum(), 'number');

// Step 3: Stats (Str, Int, Dex)
console.log('\n=== Step 3: Stats (Str, Int, Dex) ===');
await testMethod('Str()', () => Str(), 'number');
await testMethod('Int()', () => Int(), 'number');
await testMethod('Dex()', () => Dex(), 'number');

// Step 4: Health, Mana, Stamina
console.log('\n=== Step 4: Health, Mana, Stamina ===');
await testMethod('HP()', () => HP(), 'number');
await testMethod('Mana()', () => Mana(), 'number');
await testMethod('Stam()', () => Stam(), 'number');
await testMethod('MaxHP()', () => MaxHP(), 'number');
await testMethod('MaxMana()', () => MaxMana(), 'number');
await testMethod('MaxStam()', () => MaxStam(), 'number');

// Step 5: Weight and Gold
console.log('\n=== Step 5: Weight and Gold ===');
await testMethod('Weight()', () => Weight(), 'number');
await testMethod('MaxWeight()', () => MaxWeight(), 'number');
await testMethod('Gold()', () => Gold(), 'number');

// Step 6: Armor and Resistances
console.log('\n=== Step 6: Armor and Resistances ===');
await testMethod('Armor()', () => Armor(), 'number');
await testMethod('FireResist()', () => FireResist(), 'number');
await testMethod('ColdResist()', () => ColdResist(), 'number');
await testMethod('PoisonResist()', () => PoisonResist(), 'number');
await testMethod('EnergyResist()', () => EnergyResist(), 'number');

// Step 7: Status flags
console.log('\n=== Step 7: Status Flags ===');
await testMethod('Hidden()', () => Hidden(), 'boolean');
await testMethod('Poisoned()', () => Poisoned(), 'boolean');
await testMethod('Paralyzed()', () => Paralyzed(), 'boolean');
await testMethod('Dead()', () => Dead(), 'boolean');
await testMethod('WarMode()', () => WarMode(), 'boolean');

// Step 8: Character attributes
console.log('\n=== Step 8: Character Attributes ===');
await testMethod('Sex()', () => Sex(), 'number');
await testMethod('Race()', () => Race(), 'number');
await testMethod('Luck()', () => Luck(), 'number');

// Step 9: Pets
console.log('\n=== Step 9: Pets ===');
await testMethod('MaxPets()', () => MaxPets(), 'number');
await testMethod('PetsCurrent()', () => PetsCurrent(), 'number');

// Step 10: Backpack
console.log('\n=== Step 10: Backpack ===');
// Note: Backpack() is used in other tests but tested here as it's character-specific
await testMethod('Backpack()', () => Backpack(), 'number');

// Step 11: Connection info
console.log('\n=== Step 11: Connection Info ===');
await testMethod('Connected()', () => Connected(), 'boolean');
await testMethod('GetConnectedTime()', () => GetConnectedTime());
await testMethod('GameServerIPString()', () => GameServerIPString(), 'string');

const stats = getStats();
console.log('\n=== Character Stats Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

