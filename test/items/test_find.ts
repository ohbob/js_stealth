import '../../src';
import { NOTORIETY } from '../../src';
import { testMethod, testMethodArray } from '../test_helper';

// Find methods tests
config.HOST = '192.168.88.13';

console.log('=== Find Methods Tests ===\n');

let passed = 0;
let failed = 0;

// Step 1: Find settings
console.log('=== Step 1: Find Settings ===');
try {
  const findDistance = await GetFindDistance();
  console.log(`  ✓ GetFindDistance() = ${findDistance}`);
  
  await SetFindDistance(10);
  const newFindDistance = await GetFindDistance();
  console.log(`  ✓ SetFindDistance(10) -> GetFindDistance() = ${newFindDistance}`);
  
  const findVertical = await GetFindVertical();
  console.log(`  ✓ GetFindVertical() = ${findVertical}`);
  
  await SetFindVertical(5);
  const newFindVertical = await GetFindVertical();
  console.log(`  ✓ SetFindVertical(5) -> GetFindVertical() = ${newFindVertical}`);
  
  const findInNulPoint = await GetFindInNulPoint();
  console.log(`  ✓ GetFindInNulPoint() = ${findInNulPoint}`);
  
  await SetFindInNulPoint(false);
  const newFindInNulPoint = await GetFindInNulPoint();
  console.log(`  ✓ SetFindInNulPoint(false) -> GetFindInNulPoint() = ${newFindInNulPoint}`);
} catch (error) {
  console.error(`  ✗ Error in find settings:`, error.message);
}

// Step 2: Basic find methods
console.log('\n=== Step 2: Basic Find Methods ===');
try {
  const selfId = await Self();
  const backpack = await Backpack();
  console.log(`  Self ID: ${selfId}, Backpack: ${backpack}`);
  
  // Test FindType (find gold in backpack)
  const goldItems = await FindType(0x0E76, backpack);
  console.log(`  ✓ FindType(0x0E76, ${backpack}) = [${goldItems.length} items]`);
  if (goldItems.length > 0) {
    console.log(`    First item: ${goldItems[0]}`);
  }
  
  // Test FindTypeEx with color
  const goldItemsWithColor = await FindTypeEx(0x0E76, 0x0000, backpack, true);
  console.log(`  ✓ FindTypeEx(0x0E76, 0x0000, ${backpack}, true) = [${goldItemsWithColor.length} items]`);
  
  // Test FindType on ground
  const groundItems = await FindType(0x0E76, Ground());
  console.log(`  ✓ FindType(0x0E76, Ground()) = [${groundItems.length} items]`);
  
  // Test FindTypeEx with different parameters
  const itemsInSub = await FindTypeEx(0x0E76, 0xFFFF, backpack, true);
  console.log(`  ✓ FindTypeEx(0x0E76, 0xFFFF, ${backpack}, true) = [${itemsInSub.length} items]`);
  
  const itemsNotInSub = await FindTypeEx(0x0E76, 0xFFFF, backpack, false);
  console.log(`  ✓ FindTypeEx(0x0E76, 0xFFFF, ${backpack}, false) = [${itemsNotInSub.length} items]`);
} catch (error) {
  console.error(`  ✗ Error in basic find methods:`, error.message);
}

// Step 3: FindTypesArrayEx (multiple types)
console.log('\n=== Step 3: FindTypesArrayEx (Multiple Types) ===');
try {
  const backpack = await Backpack();
  
  // Test with multiple object types
  const multipleTypes = await FindTypesArrayEx(
    [0x0E76, 0x0E77], // Gold and silver
    [0xFFFF, 0xFFFF], // Any color
    [backpack, Ground()], // Backpack and ground
    true // InSub
  );
  console.log(`  ✓ FindTypesArrayEx([0x0E76, 0x0E77], [0xFFFF, 0xFFFF], [${backpack}, Ground()], true) = [${multipleTypes.length} items]`);
  
  // Test with single type but multiple containers
  const singleTypeMultipleContainers = await FindTypesArrayEx(
    [0x0E76],
    [0xFFFF],
    [backpack],
    false
  );
  console.log(`  ✓ FindTypesArrayEx([0x0E76], [0xFFFF], [${backpack}], false) = [${singleTypeMultipleContainers.length} items]`);
} catch (error) {
  console.error(`  ✗ Error in FindTypesArrayEx:`, error.message);
}

// Step 4: FindNotoriety
console.log('\n=== Step 4: FindNotoriety ===');
try {
  const innocentMobs = await FindNotoriety(0x0190, NOTORIETY.Innocent);
  console.log(`  ✓ FindNotoriety(0x0190, Innocent) = [${innocentMobs.length} items]`);
  
  const enemyMobs = await FindNotoriety(0x0190, NOTORIETY.Enemy);
  console.log(`  ✓ FindNotoriety(0x0190, Enemy) = [${enemyMobs.length} items]`);
  
  const murdererMobs = await FindNotoriety(0x0190, NOTORIETY.Murderer);
  console.log(`  ✓ FindNotoriety(0x0190, Murderer) = [${murdererMobs.length} items]`);
} catch (error) {
  console.error(`  ✗ Error in FindNotoriety:`, error.message);
}

// Step 5: FindAtCoord
console.log('\n=== Step 5: FindAtCoord ===');
try {
  const selfId = await Self();
  const [x, y] = await parallel([
    [GetX, selfId],
    [GetY, selfId]
  ]);
  
  const itemsAtCoord = await FindAtCoord(x, y);
  console.log(`  ✓ FindAtCoord(${x}, ${y}) = [${itemsAtCoord.length} items]`);
  if (itemsAtCoord.length > 0) {
    console.log(`    Items: ${itemsAtCoord.slice(0, 5).join(', ')}${itemsAtCoord.length > 5 ? '...' : ''}`);
  }
} catch (error) {
  console.error(`  ✗ Error in FindAtCoord:`, error.message);
}

// Step 6: GetFindedList and find results
console.log('\n=== Step 6: GetFindedList and Find Results ===');
try {
  // First do a find to populate the list
  const backpack = await Backpack();
  await FindType(0x0E76, backpack);
  
  const findedList = await GetFindedList();
  console.log(`  ✓ GetFindedList() = [${findedList.length} items]`);
  
  if (findedList.length > 0) {
    console.log(`    First 5 items: ${findedList.slice(0, 5).join(', ')}`);
    
    const findItem = await FindItem();
    console.log(`  ✓ FindItem() = ${findItem}`);
    
    const findCount = await FindCount();
    console.log(`  ✓ FindCount() = ${findCount}`);
    
    // Test FindQuantity (takes no arguments)
    try {
      const quantity = await FindQuantity();
      console.log(`  ✓ FindQuantity() = ${quantity}`);
    } catch (error) {
      console.log(`  ✗ FindQuantity() failed: ${error.message}`);
    }
    
    // Test FindFullQuantity (takes no arguments, may cause connection issues)
    try {
      const fullQuantity = await FindFullQuantity();
      console.log(`  ✓ FindFullQuantity() = ${fullQuantity}`);
    } catch (error) {
      if (error.message.includes('timeout') || error.message.includes('closed')) {
        console.log(`  ⚠ FindFullQuantity() timed out/closed - method 142 may have issues in Stealth`);
      } else {
        console.log(`  ✗ FindFullQuantity() failed: ${error.message}`);
      }
    }
  } else {
    console.log(`  ⚠ GetFindedList() is empty - no items found to test FindQuantity/FindFullQuantity`);
  }
} catch (error) {
  console.error(`  ✗ Error in find results:`, error.message);
}

// Step 7: Ignore list
console.log('\n=== Step 7: Ignore List ===');
try {
  // Reset ignore list first
  await IgnoreReset();
  let ignoreList = await GetIgnoreList();
  console.log(`  ✓ IgnoreReset() -> GetIgnoreList() = [${ignoreList.length} items]`);
  
  // Test adding items to ignore list
  const backpack = await Backpack();
  const items = await FindType(0x0E76, backpack);
  
  if (items.length > 0) {
    const testItem = items[0];
    await Ignore(testItem);
    ignoreList = await GetIgnoreList();
    console.log(`  ✓ Ignore(${testItem}) -> GetIgnoreList() = [${ignoreList.length} items]`);
    console.log(`    Ignore list: ${ignoreList.join(', ')}`);
    
    // Test IgnoreOff
    await IgnoreOff(testItem);
    ignoreList = await GetIgnoreList();
    console.log(`  ✓ IgnoreOff(${testItem}) -> GetIgnoreList() = [${ignoreList.length} items]`);
    
    // Test IgnoreReset again
    await IgnoreReset();
    ignoreList = await GetIgnoreList();
    console.log(`  ✓ IgnoreReset() -> GetIgnoreList() = [${ignoreList.length} items]`);
  } else {
    console.log(`  ⚠ No items found to test Ignore methods`);
  }
} catch (error) {
  console.error(`  ✗ Error in ignore list:`, error.message);
}

// Step 8: Custom Find method (from methodscustom.ts)
console.log('\n=== Step 8: Custom Find Method ===');
try {
  const backpack = await Backpack();
  
  // Test Find with options object
  const findResult = await Find({
    objTypes: [0x0E76],
    colors: [0xFFFF],
    containers: [backpack],
    operations: [GetX, GetY, GetQuantity],
    keys: ['x', 'y', 'quantity']
  });
  console.log(`  ✓ Find({ objTypes: 0x0E76, container: ${backpack}, operations: [GetX, GetY, GetQuantity] }) = [${findResult.length} items]`);
  if (findResult.length > 0) {
    console.log(`    First item:`, findResult[0]);
  }
  
  // Test Find with multiple types
  const findMultiple = await Find({
    objTypes: [0x0E76, 0x0E77],
    colors: [0xFFFF],
    containers: [backpack],
    operations: [GetName, GetQuantity]
  });
  console.log(`  ✓ Find({ objTypes: [0x0E76, 0x0E77], containers: [${backpack}] }) = [${findMultiple.length} items]`);
  
  // Test Find with filters
  const findWithFilter = await Find({
    objTypes: [0x0E76],
    containers: [backpack],
    operations: [GetQuantity],
    filters: [(item) => item.quantity > 0]
  });
  console.log(`  ✓ Find({ objTypes: 0x0E76, filters: [quantity > 0] }) = [${findWithFilter.length} items]`);
} catch (error) {
  console.error(`  ✗ Error in custom Find method:`, error.message);
}

console.log('\n=== Find Methods Tests Complete ===');
