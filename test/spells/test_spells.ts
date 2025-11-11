import '../../src';
import { SPELLS } from '../../src';
import { createTestRunner } from '../test_helper';

config.HOST = '192.168.88.13';

console.log('=== Spells Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Test spell methods
console.log('=== Step 1: Testing IsActiveSpellAbility ===');
const spellNames = Object.keys(SPELLS).slice(0, 10);
for (const spellName of spellNames) {
  await testMethod(`IsActiveSpellAbility('${spellName}')`, () => IsActiveSpellAbility(spellName), 'boolean');
}

// Step 2: Test Cast methods
console.log('\n=== Step 2: Testing Cast methods ===');
const selfId = await Self();
console.log(`Self ID: ${selfId}`);
const testSpell = 'Heal';

await testMethod(`Cast('${testSpell}')`, () => Cast(testSpell));
await testMethod(`CastToSelf('${testSpell}')`, () => CastToSelf(testSpell));
await testMethod(`CastSelf('${testSpell}')`, () => CastSelf(testSpell));
await testMethod(`CastToObj('${testSpell}', ${selfId})`, () => CastToObj(testSpell, selfId));
await testMethod(`CastToObject('${testSpell}', ${selfId})`, () => CastToObject(testSpell, selfId));

// Step 3: Test abilities
console.log('\n=== Step 3: Testing abilities ===');
await testMethod('UsePrimaryAbility()', () => UsePrimaryAbility(), 'string');
await testMethod('UseSecondaryAbility()', () => UseSecondaryAbility(), 'string');
await testMethod("GetAbility('Primary')", () => GetAbility('Primary'), 'number');
await testMethod('ToggleFly()', () => ToggleFly(), 'number');

// Step 4: Test virtues
console.log('\n=== Step 4: Testing virtues ===');
await testMethod('ReqVirtuesGump()', () => ReqVirtuesGump());

const stats = getStats();
console.log('\n=== Spells Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

