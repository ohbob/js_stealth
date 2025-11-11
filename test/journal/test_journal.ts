import '../../src';
import { createTestRunner } from '../test_helper';

config.HOST = '192.168.88.13';

console.log('=== Journal Tests ===\n');

const { testMethod, getStats } = createTestRunner();

// Step 1: Basic journal info
console.log('=== Step 1: Basic Journal Info ===');
await testMethod('LowJournal()', () => LowJournal(), 'number');
await testMethod('HighJournal()', () => HighJournal(), 'number');
await testMethod('LastJournalMessage()', () => LastJournalMessage(), 'string');

// Step 2: Journal access
console.log('\n=== Step 2: Journal Access ===');
const lowJournal = await LowJournal();
const highJournal = await HighJournal();
const journalCount = highJournal - lowJournal;
console.log(`  Journal range: ${lowJournal} to ${highJournal} (${journalCount} entries)`);

if (journalCount > 0) {
  // Test Journal(index) for a few entries
  const testIndices = Math.min(3, journalCount);
  for (let i = 0; i < testIndices; i++) {
    const index = lowJournal + i;
    await testMethod(`Journal(${index})`, () => Journal(index), 'string');
  }
}

// Step 3: Journal search
console.log('\n=== Step 3: Journal Search ===');
await testMethod("InJournal('test')", () => InJournal('test'), 'number');

// Step 4: Journal modification
console.log('\n=== Step 4: Journal Modification ===');
await testMethod("AddToSystemJournal('Test message')", () => AddToSystemJournal('Test message from js_stealth'));
await testMethod('ClearJournal()', () => ClearJournal());

// Step 5: Journal ignore
console.log('\n=== Step 5: Journal Ignore ===');
await testMethod("AddJournalIgnore('System')", () => AddJournalIgnore('System'));
await testMethod('ClearJournalIgnore()', () => ClearJournalIgnore());

// Step 6: Chat user ignore
console.log('\n=== Step 6: Chat User Ignore ===');
await testMethod("AddChatUserIgnore('TestUser')", () => AddChatUserIgnore('TestUser'));
await testMethod('ClearChatUserIgnore()', () => ClearChatUserIgnore());

// Step 7: InJournalBetweenTimes
console.log('\n=== Step 7: InJournalBetweenTimes ===');
// Test with numeric timestamps (milliseconds)
const now = Date.now();
const timeBegin = now - 60000; // 1 minute ago
const timeEnd = now;
await testMethod("InJournalBetweenTimes('test', timestamp, timestamp)", () => InJournalBetweenTimes('test', timeBegin, timeEnd), 'number');

// Test with Date objects (method accepts Date objects)
const dateBegin = new Date(now - 60000);
const dateEnd = new Date(now);
await testMethod("InJournalBetweenTimes('test', Date, Date)", () => InJournalBetweenTimes('test', dateBegin, dateEnd), 'number');

// Step 8: SetJournalLine
console.log('\n=== Step 8: SetJournalLine ===');
if (highJournal > lowJournal) {
  await testMethod(`SetJournalLine(${lowJournal}, 'Modified')`, () => SetJournalLine(lowJournal, 'Modified journal line'));
}

// Step 9: Line methods
console.log('\n=== Step 9: Line Methods ===');
await testMethod('LineID()', () => LineID(), 'number');
await testMethod('LineType()', () => LineType(), 'number');
await testMethod('LineTime()', () => LineTime(), 'number');
await testMethod('LineMsgType()', () => LineMsgType(), 'number');
await testMethod('LineTextColor()', () => LineTextColor(), 'number');
await testMethod('LineTextFont()', () => LineTextFont(), 'number');
await testMethod('LineIndex()', () => LineIndex(), 'number');
await testMethod('LineCount()', () => LineCount(), 'number');
await testMethod('LineName()', () => LineName(), 'string');

const stats = getStats();
console.log('\n=== Journal Tests Complete ===');
console.log(`Passed: ${stats.passed}, Failed: ${stats.failed}, Total: ${stats.total}`);

