# js-stealth

JavaScript client for Stealth with async/await API. Minimal implementation matching py_stealth functionality.

## Installation

```bash
# No dependencies - pure Node.js/Bun
```

## Quick Start

```javascript
import * as stealth from './index.js';

stealth.config.HOST = '192.168.88.13';
await stealth.connect();

const selfId = await stealth.Self();
const [x, y, z] = await stealth.parallel([
  [stealth.GetX, selfId],
  [stealth.GetY, selfId],
  [stealth.GetZ, selfId],
]);

console.log(`Position: ${x}, ${y}, ${z}`);
await stealth.disconnect();
```

## Connection

### `connect(host, port)`
Connect to Stealth client. Port is auto-discovered if not provided.

```javascript
await stealth.connect('192.168.88.13', 50026);
// or
stealth.config.HOST = '192.168.88.13';
await stealth.connect();
```

### `disconnect()`
Close connection to Stealth.

```javascript
await stealth.disconnect();
```

### `on(event, callback)`
Subscribe to Stealth events.

```javascript
stealth.on('evspeech', (data) => {
  console.log('Speech:', data);
});
```

## Parallel Operations

### `parallel(commands)`
Execute multiple commands in parallel for maximum performance.

```javascript
const [x, y, z, type, name] = await stealth.parallel([
  [stealth.GetX, selfId],
  [stealth.GetY, selfId],
  [stealth.GetZ, selfId],
  [stealth.GetType, selfId],
  [stealth.GetName, selfId],
]);
```

### `parallel_items(items, operations)`
Execute operations on multiple items in parallel.

```javascript
const items = await stealth.FindType(0xFFFF, stealth.Ground());
const results = await stealth.parallel_items(items, [
  stealth.GetX,
  stealth.GetY,
  stealth.GetZ,
  stealth.GetType,
  stealth.GetName,
]);

// Returns array of {id, data: [x, y, z, type, name]}
```

## Player Information

### Self & Identity
- `Self()` - Get player's object ID
- `CharName()` - Get character name
- `ProfileName()` - Get profile name
- `ShardName()` - Get shard name
- `WorldNum()` - Get current world number

### Position
- `GetX(objId)` - Get X coordinate
- `GetY(objId)` - Get Y coordinate
- `GetZ(objId)` - Get Z coordinate
- `PredictedX()` - Get predicted X (for movement)
- `PredictedY()` - Get predicted Y (for movement)
- `PredictedZ()` - Get predicted Z (for movement)
- `PredictedDirection()` - Get predicted facing direction

### Attributes (Self)
- `Str()` - Get strength
- `Int()` - Get intelligence
- `Dex()` - Get dexterity
- `HP()` - Get current hit points
- `Mana()` - Get current mana
- `Stam()` - Get current stamina
- `MaxHP()` - Get maximum hit points
- `MaxMana()` - Get maximum mana
- `MaxStam()` - Get maximum stamina
- `Weight()` - Get current weight
- `MaxWeight()` - Get maximum weight
- `Gold()` - Get gold amount
- `Armor()` - Get armor rating
- `Luck()` - Get luck value
- `Race()` - Get race
- `Sex()` - Get gender
- `Backpack()` - Get backpack ID

### Attributes (Objects)
- `GetStr(objId)` - Get strength
- `GetInt(objId)` - Get intelligence
- `GetDex(objId)` - Get dexterity
- `GetHP(objId)` - Get hit points
- `GetMana(objId)` - Get mana
- `GetStam(objId)` - Get stamina
- `GetMaxHP(objId)` - Get max hit points
- `GetMaxMana(objId)` - Get max mana
- `GetMaxStam(objId)` - Get max stamina

### Status
- `Connected()` - Check if connected to server
- `Dead()` - Check if dead
- `Hidden()` - Check if hidden
- `Poisoned()` - Check if poisoned
- `Paralyzed()` - Check if paralyzed
- `WarMode()` - Check if in war mode
- `IsDead(objId)` - Check if object is dead
- `IsRunning(objId)` - Check if object is running
- `IsNPC(objId)` - Check if object is NPC
- `IsContainer(objId)` - Check if object is container
- `IsMovable(objId)` - Check if object is movable

## Object Information

### Basic Properties
- `GetType(objId)` - Get object type (graphic ID)
- `GetName(objId)` - Get object name
- `GetAltName(objId)` - Get alternate name
- `GetTitle(objId)` - Get title
- `GetColor(objId)` - Get color
- `GetDirection(objId)` - Get facing direction
- `GetLayer(objId)` - Get equipped layer
- `GetDistance(objId)` - Get distance to object
- `GetQuantity(objId)` - Get quantity
- `GetPrice(objId)` - Get price
- `GetTooltip(objId)` - Get tooltip text
- `GetParent(objId)` - Get parent container ID
- `GetNotoriety(objId)` - Get notoriety
- `IsObjectExists(objId)` - Check if object exists

### Object Checks
- `IsYellowHits(objId)` - Check if yellow hits
- `IsFemale(objId)` - Check if female
- `IsHouse(objId)` - Check if house

## Finding Objects

### Search Configuration
- `SetFindDistance(value)` - Set find distance
- `GetFindDistance()` - Get find distance
- `SetFindVertical(value)` - Set vertical find range
- `GetFindVertical()` - Get vertical find range
- `Ground()` - Ground container constant (0)

### Finding
- `FindType(objType, container)` - Find objects by type
  - Returns array of object IDs (automatically calls GetFindedList)
  - `container` defaults to backpack if null, use `Ground()` for ground
  
```javascript
const items = await stealth.FindType(0x0EED, stealth.Ground());
const backpackItems = await stealth.FindType(0x0EED); // null = backpack
```

- `FindTypeEx(objType, color, container, inSub)` - Find objects by type and color
  - Returns array of object IDs (automatically calls GetFindedList)
  
```javascript
const redApples = await stealth.FindTypeEx(0x09D0, 0x0021, stealth.Ground(), false);
```

- `GetFindedList()` - Get list of found objects (usually auto-called)
- `FindCount()` - Get count of found objects
- `FindItem()` - Get first found item
- `FindAtCoord(x, y)` - Find items at coordinates
- `FindNotoriety(objType, notoriety)` - Find by notoriety
- `FindFullQuantity(objId)` - Get full quantity of found item

### Ignore List
- `Ignore(objId)` - Add object to ignore list
- `IgnoreOff(objId)` - Remove object from ignore list
- `IgnoreReset()` - Clear ignore list
- `GetIgnoreList()` - Get ignore list

## Actions

### Interaction
- `ClickOnObject(objId)` - Click object
- `UseObject(objId)` - Use object
- `UseType(objType, color)` - Use object by type/color
- `UseFromGround(objType, color)` - Use object from ground
- `Attack(objId)` - Attack object
- `DragItem(objId, count)` - Drag item
- `DropItem(objId, x, y, z)` - Drop item at coordinates
- `OpenDoor(objId)` - Open door
- `Bow()` - Bow gesture
- `Salute()` - Salute gesture

### Equipment
- `WearItem(layer, objId)` - Equip item to layer
- `ObjAtLayerEx(layer, objId)` - Get object at layer

### War Mode
- `SetWarMode(value)` - Set war mode on/off
- `WarTargetID()` - Get war target ID
- `Attack(objId)` - Attack target

## Targeting

### Target Selection
- `TargetID()` - Get current target ID
- `LastTarget()` - Get last target ID
- `CancelTarget()` - Cancel current target
- `TargetToObject(objId)` - Target object
- `TargetToXYZ(x, y, z)` - Target coordinates
- `TargetToTile(tileType, x, y)` - Target tile

### Wait Target
- `WaitTargetObject(objId)` - Wait for target on object
- `WaitTargetSelf()` - Wait for target on self
- `WaitTargetLast()` - Wait for target on last target
- `WaitTargetType(objType, color)` - Wait for target on type
- `WaitTargetGround()` - Wait for target on ground
- `CancelWaitTarget()` - Cancel wait target

## Movement

### Basic Movement
- `Step(direction, run)` - Step in direction (0-7, 0=North, 2=East, 4=South, 6=West)
- `StepQ(direction, run)` - Quick step with queue

### Advanced Movement
- `MoveXY(x, y, accuracyXY, running, exact)` - Move to X, Y coordinates
- `MoveXYZ(x, y, z, accuracyXY, accuracyZ, running)` - Move to X, Y, Z coordinates
- `newMoveXY(x, y, optimized, accuracy, running)` - Wrapper for MoveXYZ with Z=0
- `newMoveXYZ(x, y, z, accuracyXY, accuracyZ, running, callback)` - Pathfinding movement

```javascript
// Simple movement
await stealth.MoveXY(2800, 480, 0, false, false);

// Pathfinding movement (may take longer)
await stealth.newMoveXYZ(2800, 480, 15, 0, 0, false);
```

### Bad Locations
- `SetBadLocation(x, y)` - Mark location as bad (avoid)
- `SetGoodLocation(x, y)` - Mark location as good
- `ClearBadLocationList()` - Clear bad location list
- `SetBadObject(objType, color, radius)` - Mark object type as bad
- `ClearBadObjectList()` - Clear bad object list

### Pathfinding
- `GetPathArray(x, y, running, accuracyXY)` - Get 2D path array
- `GetPathArray3D(x1, y1, z1, x2, y2, z2, worldNum, accuracyXY, accuracyZ, running)` - Get 3D path array
- `GetNextStepZ(x1, y1, z1, x2, y2, worldNum, stepZ)` - Get next step Z coordinate
- `CheckLOS(x1, y1, z1, x2, y2, z2, worldNum, flags, objId)` - Check line of sight

## Skills

### Skill Usage
- `UseSkill(skillNameOrId)` - Use skill by name (recommended) or ID
- `UseSkillID(skillId)` - Use skill by ID
- `GetSkillValue(skillNameOrId)` - Get skill value by name or ID
- `GetSkillCap(skillNameOrId)` - Get skill cap by name or ID
- `GetSkillID(skillName)` - Get skill ID from name
- `GetSkillCurrentValue(skillName)` - Get skill value by name

```javascript
// Use skill by name (recommended)
await stealth.UseSkill('hiding');
await stealth.UseSkill('stealth');
await stealth.UseSkill('detect hidden');

// Get skill values by name
const hidingValue = await stealth.GetSkillValue('hiding');
const hidingCap = await stealth.GetSkillCap('hiding');

// Or use by ID
await stealth.UseSkillID(14); // hiding
await stealth.UseSkill(14); // also works with ID
const value = await stealth.GetSkillValue(14); // also works with ID
```

### Available Skill Names

**Combat**: `'alchemy'`, `'anatomy'`, `'archery'`, `'arms lore'`, `'fencing'`, `'healing'`, `'mace fighting'`, `'parrying'`, `'swordsmanship'`, `'tactics'`, `'wrestling'`

**Magic**: `'magery'`, `'necromancy'`, `'chivalry'`, `'bushido'`, `'ninjitsu'`, `'spellweaving'`, `'mysticism'`, `'evaluating intelligence'`, `'meditation'`, `'resisting spells'`, `'spirit speak'`

**Bard**: `'discordance'`, `'musicianship'`, `'peacemaking'`, `'provocation'`

**Crafting**: `'alchemy'`, `'blacksmithy'`, `'bowcraft'`, `'fletching'`, `'carpentry'`, `'cooking'`, `'inscription'`, `'tailoring'`, `'tinkering'`, `'imbuing'`, `'glassblowing'`, `'masonry'`

**Wilderness**: `'animal lore'`, `'animal taming'`, `'camping'`, `'fishing'`, `'herding'`, `'lumberjacking'`, `'mining'`, `'tracking'`, `'veterinary'`

**Thief**: `'detect hidden'`, `'hiding'`, `'lockpicking'`, `'poisoning'`, `'remove trap'`, `'snooping'`, `'stealing'`, `'stealth'`

**Miscellaneous**: `'begging'`, `'cartography'`, `'focus'`, `'forensic evaluation'`, `'item identification'`, `'taste identification'`, `'throwing'`

Note: Skill names are case-insensitive and should match UO skill names exactly. Use `GetSkillID('skill name')` to verify a skill name is valid.

## Spells

### Casting
- `Cast(spellName, objId)` - Cast spell by name, optionally target object
- `CastToObj(spellName, objId)` - Cast spell and target object
- `CastToObject(spellName, objId)` - Alias for CastToObj
- `CastToSelf(spellName)` - Cast spell and target self
- `CastSelf(spellName)` - Alias for CastToSelf
- `CastSpell(spellId)` - Cast spell by ID
- `IsActiveSpellAbility(spellNameOrId)` - Check if spell ability is active

```javascript
// Cast without target
await stealth.Cast('heal');
await stealth.Cast('greater heal');
await stealth.Cast('teleport');

// Cast with target object (waits for target cursor, then casts)
const targetId = await stealth.WarTargetID();
await stealth.Cast('heal', targetId);

// Cast to self
await stealth.CastToSelf('heal');
await stealth.CastSelf('greater heal'); // Alias

// Or use CastToObj
await stealth.CastToObj('greater heal', targetId);
await stealth.CastToObject('harm', enemyId);

// Or cast by ID
await stealth.CastSpell(4); // heal
```

### Available Spell Names

**1st Circle**: `'clumsy'`, `'create food'`, `'feeblemind'`, `'heal'`, `'magic arrow'`, `'night sight'`, `'reactive armor'`, `'weaken'`

**2nd Circle**: `'agility'`, `'cunning'`, `'cure'`, `'harm'`, `'magic trap'`, `'magic untrap'`, `'protection'`, `'strength'`

**3rd Circle**: `'bless'`, `'fireball'`, `'magic lock'`, `'poison'`, `'telekinesis'`, `'teleport'`, `'unlock'`, `'wall of stone'`

**4th Circle**: `'arch cure'`, `'arch protection'`, `'curse'`, `'fire field'`, `'greater heal'`, `'lightning'`, `'mana drain'`, `'recall'`

**5th Circle**: `'blade spirit'`, `'dispel field'`, `'incognito'`, `'magic reflection'`, `'spell reflection'`, `'mind blast'`, `'paralyze'`, `'poison field'`, `'summon creature'`

**6th Circle**: `'dispel'`, `'energy bolt'`, `'explosion'`, `'invisibility'`, `'mark'`, `'mass curse'`, `'paralyze field'`, `'reveal'`

**7th Circle**: `'chain lightning'`, `'energy field'`, `'flame strike'`, `'gate travel'`, `'mana vampire'`, `'mass dispel'`, `'meteor swarm'`, `'polymorph'`

**8th Circle**: `'earthquake'`, `'energy vortex'`, `'resurrection'`, `'summon air elemental'`, `'summon daemon'`, `'summon earth elemental'`, `'summon fire elemental'`, `'summon water elemental'`

**Necromancy**: `'animate dead'`, `'blood oath'`, `'corpse skin'`, `'curse weapon'`, `'evil omen'`, `'horrific beast'`, `'lich form'`, `'mind rot'`, `'pain spike'`, `'poison strike'`, `'strangle'`, `'summon familiar'`, `'vampiric embrace'`, `'vengeful spirit'`, `'wither'`, `'wraith form'`, `'exorcism'`

**Paladin**: `'cleanse by fire'`, `'close wounds'`, `'consecrate weapon'`, `'dispel evil'`, `'divine fury'`, `'enemy of one'`, `'holy light'`, `'noble sacrifice'`, `'remove curse'`, `'sacred journey'`

**Bushido**: `'confidence'`, `'counter attack'`, `'evasion'`, `'honorable execution'`, `'lightning strike'`, `'momentum strike'`

**Ninjitsu**: `'animal form'`, `'backstab'`, `'death strike'`, `'focus attack'`, `'ki attack'`, `'mirror image'`, `'shadow jump'`, `'surprise attack'`

**Spellweaving**: `'arcane circle'`, `'arcane empowerment'`, `'attune weapon'`, `'dryad allure'`, `'essence of wind'`, `'ethereal voyage'`, `'gift of life'`, `'gift of renewal'`, `'immolating weapon'`, `'mana phantasm'`, `'nature's fury'`, `'reaper form'`, `'rising colossus'`, `'soul seeker'`, `'summon fey'`, `'summon fiend'`, `'thunderstorm'`, `'wildfire'`, `'word of death'`

**Mysticism**: `'animated weapon'`, `'bombard'`, `'cleansing winds'`, `'eagle strike'`, `'enchant'`, `'healing stone'`, `'hail storm'`, `'mass sleep'`, `'nether bolt'`, `'purge magic'`, `'rising colossus'`, `'sleep'`, `'spell plague'`, `'stone form'`, `'spell trigger'`, `'spellweaving'`

## Journal

### Journal Access
- `InJournal(text)` - Search for text in journal
- `LastJournalMessage()` - Get last journal message
- `Journal(index)` - Get journal entry by index
- `LowJournal()` - Get lowest journal index
- `HighJournal()` - Get highest journal index
- `ClearJournal()` - Clear journal
- `AddToSystemJournal(text)` - Add message to system journal

## Last Actions

- `LastTarget()` - Get last target ID
- `LastAttack()` - Get last attack ID
- `LastContainer()` - Get last container ID
- `LastObject()` - Get last object ID

## Utilities

### Timing
- `Wait(ms)` - Wait specified milliseconds

```javascript
await stealth.Wait(1000); // Wait 1 second
```

### Event Handling
- `on(event, callback)` - Subscribe to events

```javascript
stealth.on('evspeech', (data) => {
  console.log('Speech event:', data);
});
```

## Configuration

```javascript
stealth.config.HOST = '192.168.88.13';
stealth.config.PORT = 50026; // Optional, auto-discovered if not set
```

## Examples

### Find and Use Items

```javascript
const apples = await stealth.FindType(0x09D0, stealth.Ground());
for (const appleId of apples) {
  await stealth.UseObject(appleId);
  await stealth.Wait(1000);
}
```

### Combat Loop

```javascript
const target = await stealth.WarTargetID();
if (target) {
  await stealth.Attack(target);
  const hp = await stealth.GetHP(target);
  if (hp < 50) {
    await stealth.CastSpell('heal'); // Heal
  }
}
```

### Movement Pattern

```javascript
const selfId = await stealth.Self();
const [x, y] = await stealth.parallel([
  [stealth.GetX, selfId],
  [stealth.GetY, selfId],
]);

// Move to coordinates
await stealth.MoveXY(x + 4, y + 4, 0, false, false);
```

### Parallel Data Gathering

```javascript
const items = await stealth.FindType(0xFFFF, stealth.Ground());
const data = await stealth.parallel_items(items, [
  stealth.GetX,
  stealth.GetY,
  stealth.GetZ,
  stealth.GetType,
  stealth.GetName,
  stealth.GetHP,
]);

// data = [{id: 123, data: [x, y, z, type, name, hp]}, ...]
```

## Notes

- All methods are async and must be awaited
- Use `parallel()` for multiple operations to maximize performance
- `FindType` and `FindTypeEx` automatically return the found list
- Method signatures match py_stealth for easy porting
