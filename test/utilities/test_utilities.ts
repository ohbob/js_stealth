import '../../src';
import { createTestRunner } from '../test_helper';

config.HOST = '192.168.88.13';

console.log('=== Utilities Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Basic utilities
console.log('=== Step 1: Basic Utilities ===');
const startTime = Date.now();
await testMethod('Wait(100)', async () => {
  await Wait(100);
  return Date.now() - startTime;
}, 'number');
// Note: Ground() is a simple constant function (returns 0xFFFFFFFF) - not tested separately

// Step 2: Last actions
console.log('\n=== Step 2: Last Actions ===');
await testMethod('LastContainer()', () => LastContainer(), 'number');
await testMethod('LastObject()', () => LastObject(), 'number');

// Step 3: Object info
console.log('\n=== Step 3: Object Info ===');
const selfId = await Self();
await testMethod(`ObjAtLayerEx(0, ${selfId})`, () => ObjAtLayerEx(0, selfId), 'number');

// Step 4: Container operations
console.log('\n=== Step 4: Container Operations ===');
const backpack = await Backpack();
await testMethod(`SetCatchBag(${backpack})`, () => SetCatchBag(backpack));
await testMethod('UnsetCatchBag()', () => UnsetCatchBag());

// Step 5: Party methods
console.log('\n=== Step 5: Party Methods ===');
await testMethod(`InParty(${selfId})`, () => InParty(selfId), 'boolean');
await testMethod('PartyMembersList()', () => PartyMembersList(), 'object');

// Step 6: Trade methods
console.log('\n=== Step 6: Trade Methods ===');
await testMethod('TradeCount(0)', () => TradeCount(0), 'number');

// Step 7: Gump methods
console.log('\n=== Step 7: Gump Methods ===');
await testMethod('GetGumpsCount(0)', () => GetGumpsCount(0), 'number');

// Step 8: Menu methods
console.log('\n=== Step 8: Menu Methods ===');
await testMethod("MenuPresent('Test')", () => MenuPresent('Test'), 'boolean');

// Step 9: Stealth info
console.log('\n=== Step 9: Stealth Info ===');
await testMethod('GetStealthInfo()', () => GetStealthInfo(), 'string');
await testMethod('GetClientVersionInt()', () => GetClientVersionInt(), 'number');

// Step 10: Paths
console.log('\n=== Step 10: Paths ===');
await testMethod('StealthPath(0, false)', () => StealthPath(0, false), 'string');

// Step 11: Proxy
console.log('\n=== Step 11: Proxy ===');
await testMethod('ProxyIP()', () => ProxyIP(), 'string');
await testMethod('ProxyPort()', () => ProxyPort(), 'number');
await testMethod('UseProxy()', () => UseProxy(), 'boolean');

// Step 12: Silent mode
console.log('\n=== Step 12: Silent Mode ===');
await testMethod('GetSilentMode()', () => GetSilentMode(), 'boolean');

// Step 13: Check lag
console.log('\n=== Step 13: Check Lag ===');
await testMethod('CheckLag(1000)', () => CheckLag(1000), 'boolean');

// Step 14: Buff bar
console.log('\n=== Step 14: Buff Bar ===');
await testMethod('GetBuffBarInfo()', () => GetBuffBarInfo(), 'object');

// Step 15: Multis
console.log('\n=== Step 15: Multis ===');
await testMethod('GetMultis()', () => GetMultis(), 'object');

// Step 16: Shop list
console.log('\n=== Step 16: Shop List ===');
await testMethod('GetShopList()', () => GetShopList(), 'object');
await testMethod('ClearShopList()', () => ClearShopList());

// Step 17: Info window
console.log('\n=== Step 17: Info Window ===');
await testMethod('ClearInfoWindow()', () => ClearInfoWindow());

// Step 18: Available but not executed methods
console.log('\n=== Step 18: Available Methods (Not Executed) ===');
console.log('  Item manipulation:');
console.log('    - DragItem(objId, count)');
console.log('    - DropItem(objId, x, y, z)');
console.log('    - WearItem(layer, objId)');
console.log('    - OpenDoor(objId)');
console.log('    - Bow()');
console.log('    - Salute()');
console.log('  Communication:');
console.log('    - UOSay(text)');
console.log('    - UOSayColor(text, color)');
console.log('  Actions:');
console.log('    - ClickOnObject(objId)');
console.log('    - UseObject(objId)');
console.log('    - UseType(objType, color)');
console.log('    - UseFromGround(objType, color)');
console.log('    - Attack(objId)');
console.log('  Client:');
console.log('    - ClientPrint(text)');
console.log('    - ClientPrintEx(objId, color, font, text)');
console.log('  Alarm:');
console.log('    - Alarm(text)');
console.log('  HTTP:');
console.log('    - HTTP_Get(url)');
console.log('    - HTTP_Post(url, data)');

const stats = getStats();
console.log('\n=== Utilities Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

