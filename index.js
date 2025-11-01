// @ts-nocheck - Large file, types added incrementally
import { connect as connectToStealth } from './connection.js';
import { createMethods } from './methods.js';
// Layer constants (from py_stealth methods.py)
export const LAYERS = {
    Rhand: 0x01,
    Lhand: 0x02,
    Shoes: 0x03,
    Pants: 0x04,
    Shirt: 0x05,
    Hat: 0x06,
    Gloves: 0x07,
    Ring: 0x08,
    Talisman: 0x09,
    Neck: 0x0A,
    Hair: 0x0B,
    Waist: 0x0C,
    Torso: 0x0D,
    Brace: 0x0E,
    Beard: 0x10,
    TorsoH: 0x11,
    Ear: 0x12,
    Arms: 0x13,
    Cloak: 0x14,
    Bpack: 0x15,
    Robe: 0x16,
    Eggs: 0x17,
    Legs: 0x18,
    Horse: 0x19,
    Rstk: 0x1A,
    NRstk: 0x1B,
    Sell: 0x1C,
    Bank: 0x1D,
};
// Direction constants (from CalcDir in py_stealth)
export const DIRECTIONS = {
    North: 0,
    Northeast: 1,
    East: 2,
    Southeast: 3,
    South: 4,
    Southwest: 5,
    West: 6,
    Northwest: 7,
};
// Notoriety constants (from UO standard)
export const NOTORIETY = {
    Innocent: 1, // Blue
    Ally: 2, // Green
    Attackable: 3, // Grey
    Criminal: 4, // Grey
    Enemy: 5, // Orange/Red
    Murderer: 6, // Red
    Invulnerable: 7, // Yellow
};
// Global connection state (like py_stealth module-level)
let protocol = null;
let methods = null;
let methodsRaw = null; // Raw methods object for batch operations
let HOST = 'localhost';
let PORT = null;
let connecting = false; // Track if we're currently connecting
let connectPromise = null; // Cache connection promise
// Connection pool for parallel operations (reused across calls)
let connectionPool = [];
// Auto-connect helper - called automatically on first method use
async function ensureConnected() {
    if (protocol && methods) {
        return; // Already connected
    }
    if (connecting && connectPromise) {
        return connectPromise; // Wait for existing connection attempt
    }
    connecting = true;
    connectPromise = connect();
    try {
        await connectPromise;
    }
    finally {
        connecting = false;
        connectPromise = null;
    }
}
export async function connect(host = null, port = null) {
    // If already connected, just return
    if (protocol && methods) {
        return;
    }
    // Use provided host/port, or fall back to module-level HOST/PORT (which can be set via config)
    const connectHost = host !== null ? host : HOST;
    let connectPort = port !== null ? port : PORT;
    // If port is null, discover it
    if (connectPort === null) {
        const { discoverPort } = await import('./connection.js');
        connectPort = await discoverPort(connectHost);
    }
    protocol = await connectToStealth(connectHost, connectPort);
    methodsRaw = createMethods(protocol);
    methods = methodsRaw;
    // Store HOST/PORT for connection pooling (now we know the port!)
    if (host !== null)
        HOST = host;
    PORT = connectPort; // Store discovered port for reuse
    // Setup auto-disconnect on process exit
    setupAutoDisconnect();
}
let autoDisconnectSetup = false;
function setupAutoDisconnect() {
    // Only setup once
    if (autoDisconnectSetup) {
        return;
    }
    autoDisconnectSetup = true;
    // Auto-disconnect on various exit signals
    process.once('exit', async () => {
        await disconnect();
    });
    process.once('SIGINT', () => {
        disconnect().then(() => process.exit(0)).catch(() => process.exit(1));
    });
    process.once('SIGTERM', () => {
        disconnect().then(() => process.exit(0)).catch(() => process.exit(1));
    });
}
export function on(event, callback) {
    if (protocol) {
        protocol.on(event, callback);
    }
}
export async function disconnect() {
    if (protocol && protocol.socket) {
        protocol.socket.destroy();
        protocol = null;
        methods = null;
    }
    // Also close connection pool
    await closeConnectionPool();
}
// Wrapper helper for all methods - auto-connects if needed
function withAutoConnect(fn, methodName) {
    const wrapped = async (...args) => {
        await ensureConnected();
        // Re-get methods in case they weren't available when wrapper was created
        if (!methods) {
            throw new Error('Connection failed - methods not available');
        }
        return fn(...args);
    };
    // Preserve method name for parallel execution
    // Use explicit name if provided, otherwise try fn.name
    wrapped._methodName = methodName || fn.name;
    return wrapped;
}
// Export all methods directly (like py_stealth's from py_stealth import *)
// All methods auto-connect on first use
export const Self = withAutoConnect(async function () { return methods.Self(); }, 'Self');
export const GetX = withAutoConnect(async function (objId) { return methods.GetX(objId); }, 'GetX');
export const GetY = withAutoConnect(async function (objId) { return methods.GetY(objId); }, 'GetY');
export const GetZ = withAutoConnect(async function (objId) { return methods.GetZ(objId); }, 'GetZ');
export const GetType = withAutoConnect(async function (objId) { return methods.GetType(objId); }, 'GetType');
export const GetName = withAutoConnect(async function (objId) { return methods.GetName(objId); }, 'GetName');
export const GetHP = withAutoConnect(async function (objId) { return methods.GetHP(objId); }, 'GetHP');
export const GetMana = withAutoConnect(async function (objId) { return methods.GetMana(objId); }, 'GetMana');
export const GetStam = withAutoConnect(async function (objId) { return methods.GetStam(objId); }, 'GetStam');
export const GetQuantity = withAutoConnect(async function (objId) { return methods.GetQuantity(objId); }, 'GetQuantity');
export const GetDistance = withAutoConnect(async function (objId) { return methods.GetDistance(objId); }, 'GetDistance');
export const GetColor = withAutoConnect(async function (objId) { return methods.GetColor(objId); }, 'GetColor');
export const ClickOnObject = withAutoConnect(async function (objId) { return methods.ClickOnObject(objId); });
export const Wait = withAutoConnect(async function (ms) { return methods.Wait(ms); });
export const Str = withAutoConnect(async function () { return methods.Str(); });
export const Int = withAutoConnect(async function () { return methods.Int(); });
export const Dex = withAutoConnect(async function () { return methods.Dex(); });
export const HP = withAutoConnect(async function () { return methods.HP(); });
export const Mana = withAutoConnect(async function () { return methods.Mana(); });
export const Stam = withAutoConnect(async function () { return methods.Stam(); });
export const Connected = withAutoConnect(async function () { return methods.Connected(); });
export function Ground() { return methods.Ground(); } // Sync, no auto-connect needed
export const SetFindDistance = withAutoConnect(async function (value) { return methods.SetFindDistance(value); });
export const FindType = withAutoConnect(async function (objType, container = null) {
    await methods.FindType(objType, container);
    return methods.GetFindedList();
});
export const FindTypeEx = withAutoConnect(async function (objType, color, container = 0, inSub = true) {
    await methods.FindTypeEx(objType, color, container, inSub);
    return methods.GetFindedList();
});
export const GetFindedList = withAutoConnect(async function () { return methods.GetFindedList(); });
// Additional object methods
export const GetAltName = withAutoConnect(async (objId) => { return methods.GetAltName(objId); });
export const GetTitle = withAutoConnect(async (objId) => { return methods.GetTitle(objId); });
export const GetTooltip = withAutoConnect(async (objId) => { return methods.GetTooltip(objId); });
export const GetStr = withAutoConnect(async (objId) => { return methods.GetStr(objId); });
export const GetInt = withAutoConnect(async (objId) => { return methods.GetInt(objId); });
export const GetDex = withAutoConnect(async (objId) => { return methods.GetDex(objId); });
export const GetMaxHP = withAutoConnect(async (objId) => { return methods.GetMaxHP(objId); });
export const GetMaxMana = withAutoConnect(async (objId) => { return methods.GetMaxMana(objId); });
export const GetMaxStam = withAutoConnect(async (objId) => { return methods.GetMaxStam(objId); });
export const GetPrice = withAutoConnect(async (objId) => { return methods.GetPrice(objId); });
export const GetDirection = withAutoConnect(async (objId) => { return methods.GetDirection(objId); });
export const IsObjectExists = withAutoConnect(async (objId) => { return methods.IsObjectExists(objId); });
// Actions
export const UseObject = withAutoConnect(async (objId) => { return methods.UseObject(objId); });
export const UseType = withAutoConnect(async (objType, color) => { return methods.UseType(objType, color); });
export const UseFromGround = withAutoConnect(async (objType, color) => { return methods.UseFromGround(objType, color); });
export const Attack = withAutoConnect(async (objId) => { return methods.Attack(objId); });
// Self stats
export const MaxHP = withAutoConnect(async () => { return methods.MaxHP(); });
export const MaxMana = withAutoConnect(async () => { return methods.MaxMana(); });
export const MaxStam = withAutoConnect(async () => { return methods.MaxStam(); });
export const Gold = withAutoConnect(async () => { return methods.Gold(); });
export const Weight = withAutoConnect(async () => { return methods.Weight(); });
export const MaxWeight = withAutoConnect(async () => { return methods.MaxWeight(); });
export const Armor = withAutoConnect(async () => { return methods.Armor(); });
export const Luck = withAutoConnect(async () => { return methods.Luck(); });
export const Race = withAutoConnect(async () => { return methods.Race(); });
export const Sex = withAutoConnect(async () => { return methods.Sex(); });
export const WorldNum = withAutoConnect(async () => { return methods.WorldNum(); });
export const CharName = withAutoConnect(async () => { return methods.CharName(); });
export const Backpack = withAutoConnect(async () => { return methods.Backpack(); });
export const ShardName = withAutoConnect(async () => { return methods.ShardName(); });
export const ProfileName = withAutoConnect(async () => { return methods.ProfileName(); });
// Status checks
export const Hidden = withAutoConnect(async () => { return methods.Hidden(); });
export const Poisoned = withAutoConnect(async () => { return methods.Poisoned(); });
export const Paralyzed = withAutoConnect(async () => { return methods.Paralyzed(); });
export const Dead = withAutoConnect(async () => { return methods.Dead(); });
export const WarMode = withAutoConnect(async () => { return methods.WarMode(); });
// Combat
export const SetWarMode = withAutoConnect(async (value) => { return methods.SetWarMode(value); });
export const WarTargetID = withAutoConnect(async () => { return methods.WarTargetID(); });
// Targeting
export const TargetID = withAutoConnect(async () => { return methods.TargetID(); });
export const TargetPresent = withAutoConnect(async () => { return methods.TargetPresent(); });
export const TargetCursor = withAutoConnect(async () => { return methods.TargetPresent(); }); // Alias
export const WaitForTarget = withAutoConnect(async (maxWaitTimeMS) => { return methods.WaitForTarget(maxWaitTimeMS); });
export const CancelTarget = withAutoConnect(async () => { return methods.CancelTarget(); });
export const TargetToObject = withAutoConnect(async (objId) => { return methods.TargetToObject(objId); });
export const TargetToXYZ = withAutoConnect(async (x, y, z) => { return methods.TargetToXYZ(x, y, z); });
export const WaitTargetObject = withAutoConnect(async (objId) => { return methods.WaitTargetObject(objId); });
export const WaitTargetSelf = withAutoConnect(async () => { return methods.WaitTargetSelf(); });
export const WaitTargetLast = withAutoConnect(async () => { return methods.WaitTargetLast(); });
export const CancelWaitTarget = withAutoConnect(async () => { return methods.CancelWaitTarget(); });
// Last actions
export const LastTarget = withAutoConnect(async () => { return methods.LastTarget(); });
export const LastAttack = withAutoConnect(async () => { return methods.LastAttack(); });
export const LastContainer = withAutoConnect(async () => { return methods.LastContainer(); });
export const LastObject = withAutoConnect(async () => { return methods.LastObject(); });
// Position
export const PredictedX = withAutoConnect(async () => { return methods.PredictedX(); });
export const PredictedY = withAutoConnect(async () => { return methods.PredictedY(); });
export const PredictedZ = withAutoConnect(async () => { return methods.PredictedZ(); });
// Finding
export const GetFindDistance = withAutoConnect(async () => { return methods.GetFindDistance(); });
export const GetFindVertical = withAutoConnect(async () => { return methods.GetFindVertical(); });
export const SetFindVertical = withAutoConnect(async (value) => { return methods.SetFindVertical(value); });
export const FindNotoriety = withAutoConnect(async (objType, notoriety) => { return methods.FindNotoriety(objType, notoriety); });
export const FindAtCoord = withAutoConnect(async (x, y) => { return methods.FindAtCoord(x, y); });
export const FindItem = withAutoConnect(async () => { return methods.FindItem(); });
export const FindCount = withAutoConnect(async () => { return methods.FindCount(); });
export const FindFullQuantity = withAutoConnect(async (objId) => { return methods.FindFullQuantity(objId); });
export const Ignore = withAutoConnect(async (objId) => { return methods.Ignore(objId); });
export const IgnoreOff = withAutoConnect(async (objId) => { return methods.IgnoreOff(objId); });
export const IgnoreReset = withAutoConnect(async () => { return methods.IgnoreReset(); });
export const GetIgnoreList = withAutoConnect(async () => { return methods.GetIgnoreList(); });
// Journal
export const InJournal = withAutoConnect(async (text) => { return methods.InJournal(text); });
export const LastJournalMessage = withAutoConnect(async () => { return methods.LastJournalMessage(); });
export const Journal = withAutoConnect(async (index) => { return methods.Journal(index); });
export const LowJournal = withAutoConnect(async () => { return methods.LowJournal(); });
export const HighJournal = withAutoConnect(async () => { return methods.HighJournal(); });
export const ClearJournal = withAutoConnect(async () => { return methods.ClearJournal(); });
export const AddToSystemJournal = withAutoConnect(async (text) => { return methods.AddToSystemJournal(text); });
// Skills
export const UseSkill = withAutoConnect(async (skillNameOrId) => { return methods.UseSkill(skillNameOrId); });
export const UseSkillID = withAutoConnect(async (skillId) => { return methods.UseSkillID(skillId); });
export const GetSkillValue = withAutoConnect(async (skillNameOrId) => { return methods.GetSkillValue(skillNameOrId); });
export const GetSkillCap = withAutoConnect(async (skillNameOrId) => { return methods.GetSkillCap(skillNameOrId); });
export const GetSkillID = withAutoConnect(async (skillName) => { return methods.GetSkillID(skillName); });
// Spells
export const Cast = withAutoConnect(async (spellName, objId = null) => { return methods.Cast(spellName, objId); });
export const CastToObj = withAutoConnect(async (spellName, objId) => { return methods.CastToObj(spellName, objId); });
export const CastToObject = withAutoConnect(async (spellName, objId) => { return methods.CastToObject(spellName, objId); });
export const CastToSelf = withAutoConnect(async (spellName) => { return methods.CastToSelf(spellName); });
export const CastSelf = withAutoConnect(async (spellName) => { return methods.CastSelf(spellName); });
export const CastSpell = withAutoConnect(async (spellId) => { return methods.CastSpell(spellId); });
export const IsActiveSpellAbility = withAutoConnect(async (spellNameOrId) => { return methods.IsActiveSpellAbility(spellNameOrId); });
// Container/Item operations
export const SetCatchBag = withAutoConnect(async (objId) => { return methods.SetCatchBag(objId); });
export const UnsetCatchBag = withAutoConnect(async () => { return methods.UnsetCatchBag(); });
// Object status checks
export const GetNotoriety = withAutoConnect(async (objId) => { return methods.GetNotoriety(objId); });
export const GetParent = withAutoConnect(async (objId) => { return methods.GetParent(objId); });
export const IsNPC = withAutoConnect(async (objId) => { return methods.IsNPC(objId); });
export const IsDead = withAutoConnect(async (objId) => { return methods.IsDead(objId); });
export const IsRunning = withAutoConnect(async (objId) => { return methods.IsRunning(objId); });
export const IsContainer = withAutoConnect(async (objId) => { return methods.IsContainer(objId); });
export const IsMovable = withAutoConnect(async (objId) => { return methods.IsMovable(objId); });
export const IsYellowHits = withAutoConnect(async (objId) => { return methods.IsYellowHits(objId); });
export const IsFemale = withAutoConnect(async (objId) => { return methods.IsFemale(objId); });
export const GetLayer = withAutoConnect(async (objId) => { return methods.GetLayer(objId); });
export const IsHouse = withAutoConnect(async (objId) => { return methods.IsHouse(objId); });
// Item manipulation
export const DragItem = withAutoConnect(async (objId, count) => { return methods.DragItem(objId, count); });
export const DropItem = withAutoConnect(async (objId, x, y, z) => { return methods.DropItem(objId, x, y, z); });
export const OpenDoor = withAutoConnect(async (objId) => { return methods.OpenDoor(objId); });
export const Bow = withAutoConnect(async () => { return methods.Bow(); });
export const Salute = withAutoConnect(async () => { return methods.Salute(); });
export const WearItem = withAutoConnect(async (layer, objId) => { return methods.WearItem(layer, objId); });
export const ObjAtLayerEx = withAutoConnect(async (layer, objId) => { return methods.ObjAtLayerEx(layer, objId); });
// Movement
export const Step = withAutoConnect(async (direction, run) => { return methods.Step(direction, run); });
export const StepQ = withAutoConnect(async (direction, run) => { return methods.StepQ(direction, run); });
export const MoveXYZ = withAutoConnect(async (x, y, z, accuracyXY, accuracyZ, running) => { return methods.MoveXYZ(x, y, z, accuracyXY, accuracyZ, running); });
export const MoveXY = withAutoConnect(async (x, y, accuracyXY, running, exact) => { return methods.MoveXY(x, y, accuracyXY, running, exact); });
export const newMoveXY = withAutoConnect(async (x, y, optimized, accuracy, running) => { return methods.newMoveXY(x, y, optimized, accuracy, running); });
export const newMoveXYZ = withAutoConnect(async (x, y, z, accuracyXY, accuracyZ, running, callback) => { return methods.newMoveXYZ(x, y, z, accuracyXY, accuracyZ, running, callback); });
export const SetBadLocation = withAutoConnect(async (x, y) => { return methods.SetBadLocation(x, y); });
export const SetGoodLocation = withAutoConnect(async (x, y) => { return methods.SetGoodLocation(x, y); });
export const ClearBadLocationList = withAutoConnect(async () => { return methods.ClearBadLocationList(); });
export const SetBadObject = withAutoConnect(async (objType, color, radius) => { return methods.SetBadObject(objType, color, radius); });
export const ClearBadObjectList = withAutoConnect(async () => { return methods.ClearBadObjectList(); });
export const CheckLOS = withAutoConnect(async (x1, y1, z1, x2, y2, z2, worldNum, flags, objId) => { return methods.CheckLOS(x1, y1, z1, x2, y2, z2, worldNum, flags, objId); });
// Gumps/Menus
export const WaitMenu = withAutoConnect(async (caption, prompt) => { return methods.WaitMenu(caption, prompt); });
export const AutoMenu = withAutoConnect(async (caption, prompt) => { return methods.AutoMenu(caption, prompt); });
export const MenuPresent = withAutoConnect(async (caption) => { return methods.MenuPresent(caption); });
export const CancelMenu = withAutoConnect(async () => { return methods.CancelMenu(); });
export const CloseMenu = withAutoConnect(async () => { return methods.CloseMenu(); });
export const WaitGump = withAutoConnect(async (gumpId) => { return methods.WaitGump(gumpId); });
export const WaitTextEntry = withAutoConnect(async (text) => { return methods.WaitTextEntry(text); });
export const GumpAutoTextEntry = withAutoConnect(async (entryId, text) => { return methods.GumpAutoTextEntry(entryId, text); });
export const GumpAutoRadiobutton = withAutoConnect(async (groupId, number) => { return methods.GumpAutoRadiobutton(groupId, number); });
export const GumpAutoCheckBox = withAutoConnect(async (checkBoxId, state) => { return methods.GumpAutoCheckBox(checkBoxId, state); });
export const NumGumpButton = withAutoConnect(async (gumpId, buttonId) => { return methods.NumGumpButton(gumpId, buttonId); });
export const NumGumpTextEntry = withAutoConnect(async (gumpId, entryId, text) => { return methods.NumGumpTextEntry(gumpId, entryId, text); });
export const NumGumpRadiobutton = withAutoConnect(async (gumpId, groupId, number) => { return methods.NumGumpRadiobutton(gumpId, groupId, number); });
export const NumGumpCheckBox = withAutoConnect(async (gumpId, checkBoxId, state) => { return methods.NumGumpCheckBox(gumpId, checkBoxId, state); });
export const GetGumpsCount = withAutoConnect(async (gumpId) => { return methods.GetGumpsCount(gumpId); });
export const CloseSimpleGump = withAutoConnect(async (gumpIndex) => { return methods.CloseSimpleGump(gumpIndex); });
export const GetGumpSerial = withAutoConnect(async (gumpIndex) => { return methods.GetGumpSerial(gumpIndex); });
export const GetGumpID = withAutoConnect(async (gumpIndex) => { return methods.GetGumpID(gumpIndex); });
export const IsGumpCanBeClosed = withAutoConnect(async (gumpIndex) => { return methods.IsGumpCanBeClosed(gumpIndex); });
// Trade
export const IsTrade = withAutoConnect(async (tradeWindowNum, itemNum) => { return methods.IsTrade(tradeWindowNum, itemNum); });
export const GetTradeContainer = withAutoConnect(async (tradeWindowNum, itemNum) => { return methods.GetTradeContainer(tradeWindowNum, itemNum); });
export const GetTradeOpponent = withAutoConnect(async (tradeWindowNum) => { return methods.GetTradeOpponent(tradeWindowNum); });
export const TradeCount = withAutoConnect(async (tradeWindowNum) => { return methods.TradeCount(tradeWindowNum); });
export const GetTradeOpponentName = withAutoConnect(async (tradeWindowNum) => { return methods.GetTradeOpponentName(tradeWindowNum); });
export const TradeCheck = withAutoConnect(async (tradeWindowNum, itemNum) => { return methods.TradeCheck(tradeWindowNum, itemNum); });
export const ConfirmTrade = withAutoConnect(async (tradeWindowNum) => { return methods.ConfirmTrade(tradeWindowNum); });
export const CancelTrade = withAutoConnect(async (tradeWindowNum) => { return methods.CancelTrade(tradeWindowNum); });
// Communication
export const UOSay = withAutoConnect(async (text) => { return methods.UOSay(text); });
export const UOSayColor = withAutoConnect(async (text, color) => { return methods.UOSayColor(text, color); });
// Party
export const InviteToParty = withAutoConnect(async (objId) => { return methods.InviteToParty(objId); });
export const RemoveFromParty = withAutoConnect(async (objId) => { return methods.RemoveFromParty(objId); });
export const PartySay = withAutoConnect(async (text) => { return methods.PartySay(text); });
export const PartyCanLootMe = withAutoConnect(async (value) => { return methods.PartyCanLootMe(value); });
export const PartyAcceptInvite = withAutoConnect(async () => { return methods.PartyAcceptInvite(); });
// Resistance
export const FireResist = withAutoConnect(async () => { return methods.FireResist(); });
export const ColdResist = withAutoConnect(async () => { return methods.ColdResist(); });
export const PoisonResist = withAutoConnect(async () => { return methods.PoisonResist(); });
export const EnergyResist = withAutoConnect(async () => { return methods.EnergyResist(); });
// Pets
export const MaxPets = withAutoConnect(async () => { return methods.MaxPets(); });
export const PetsCurrent = withAutoConnect(async () => { return methods.PetsCurrent(); });
// Utilities
export const GetConnectedTime = withAutoConnect(async () => { return methods.GetConnectedTime(); });
export const GetDisconnectedTime = withAutoConnect(async () => { return methods.GetDisconnectedTime(); });
export const ChangeProfile = withAutoConnect(async (profileName) => { return methods.ChangeProfile(profileName); });
export const ChangeProfileEx = withAutoConnect(async (profileName, shardName, charName) => { return methods.ChangeProfileEx(profileName, shardName, charName); });
export const GetARStatus = withAutoConnect(async () => { return methods.GetARStatus(); });
export const SetARStatus = withAutoConnect(async (value) => { return methods.SetARStatus(value); });
export const ProfileShardName = withAutoConnect(async () => { return methods.ProfileShardName(); });
export const GetCharTitle = withAutoConnect(async () => { return methods.GetCharTitle(); });
export const GetClilocByID = withAutoConnect(async (clilocId) => { return methods.GetClilocByID(clilocId); });
export const GetFoundedParamID = withAutoConnect(async () => { return methods.GetFoundedParamID(); });
export const FindQuantity = withAutoConnect(async (objId) => { return methods.FindQuantity(objId); });
export const PredictedDirection = withAutoConnect(async () => { return methods.PredictedDirection(); });
// Movement settings
export const SetMoveOpenDoor = withAutoConnect(async (value) => { return methods.SetMoveOpenDoor(value); });
export const GetMoveOpenDoor = withAutoConnect(async () => { return methods.GetMoveOpenDoor(); });
export const SetMoveThroughNPC = withAutoConnect(async (value) => { return methods.SetMoveThroughNPC(value); });
export const GetMoveThroughNPC = withAutoConnect(async () => { return methods.GetMoveThroughNPC(); });
export const SetMoveCheckStamina = withAutoConnect(async (value) => { return methods.SetMoveCheckStamina(value); });
export const GetMoveCheckStamina = withAutoConnect(async () => { return methods.GetMoveCheckStamina(); });
// Advanced targeting
export const TargetToTile = withAutoConnect(async (x, y, z, tileType) => { return methods.TargetToTile(x, y, z, tileType); });
export const WaitTargetTile = withAutoConnect(async (x, y, z, tileType) => { return methods.WaitTargetTile(x, y, z, tileType); });
export const WaitTargetXYZ = withAutoConnect(async (x, y, z) => { return methods.WaitTargetXYZ(x, y, z); });
export const WaitTargetType = withAutoConnect(async (objType) => { return methods.WaitTargetType(objType); });
export const WaitTargetGround = withAutoConnect(async () => { return methods.WaitTargetGround(); });
// Abilities
export const UsePrimaryAbility = withAutoConnect(async () => { return methods.UsePrimaryAbility(); });
export const UseSecondaryAbility = withAutoConnect(async () => { return methods.UseSecondaryAbility(); });
export const GetAbility = withAutoConnect(async (abilityName) => { return methods.GetAbility(abilityName); });
export const ToggleFly = withAutoConnect(async () => { return methods.ToggleFly(); });
// Virtues
export const ReqVirtuesGump = withAutoConnect(async () => { return methods.ReqVirtuesGump(); });
export const UseVirtue = withAutoConnect(async (virtueId) => { return methods.UseVirtue(virtueId); });
// Paperdoll
export const UseSelfPaperdollScroll = withAutoConnect(async (objId) => { return methods.UseSelfPaperdollScroll(objId); });
export const UseOtherPaperdollScroll = withAutoConnect(async (objId) => { return methods.UseOtherPaperdollScroll(objId); });
// Skill locking
export const ChangeSkillLockState = withAutoConnect(async (skillId, lockState) => { return methods.ChangeSkillLockState(skillId, lockState); });
export const GetSkillLockState = withAutoConnect(async (skillId) => { return methods.GetSkillLockState(skillId); });
// Journal extended
export const InJournalBetweenTimes = withAutoConnect(async (text, timeBegin, timeEnd) => { return methods.InJournalBetweenTimes(text, timeBegin, timeEnd); });
export const SetJournalLine = withAutoConnect(async (index, text) => { return methods.SetJournalLine(index, text); });
export const AddJournalIgnore = withAutoConnect(async (text) => { return methods.AddJournalIgnore(text); });
export const ClearJournalIgnore = withAutoConnect(async (text) => { return methods.ClearJournalIgnore(text); });
export const AddChatUserIgnore = withAutoConnect(async (name) => { return methods.AddChatUserIgnore(name); });
export const ClearChatUserIgnore = withAutoConnect(async (name) => { return methods.ClearChatUserIgnore(name); });
// Line methods
export const LineID = withAutoConnect(async () => { return methods.LineID(); });
export const LineType = withAutoConnect(async () => { return methods.LineType(); });
export const LineTime = withAutoConnect(async () => { return methods.LineTime(); });
export const LineMsgType = withAutoConnect(async () => { return methods.LineMsgType(); });
export const LineTextColor = withAutoConnect(async () => { return methods.LineTextColor(); });
export const LineTextFont = withAutoConnect(async () => { return methods.LineTextFont(); });
export const LineIndex = withAutoConnect(async () => { return methods.LineIndex(); });
export const LineCount = withAutoConnect(async () => { return methods.LineCount(); });
export const LineName = withAutoConnect(async () => { return methods.LineName(); });
// Find extended
export const SetFindInNulPoint = withAutoConnect(async (value) => { return methods.SetFindInNulPoint(value); });
export const GetFindInNulPoint = withAutoConnect(async () => { return methods.GetFindInNulPoint(); });
// Connection/Profile
export const Connect = withAutoConnect(async () => { return methods.Connect(); });
export const Disconnect = withAutoConnect(async () => { return methods.Disconnect(); });
export const GetPauseScriptOnDisconnectStatus = withAutoConnect(async () => { return methods.GetPauseScriptOnDisconnectStatus(); });
export const SetPauseScriptOnDisconnectStatus = withAutoConnect(async (value) => { return methods.SetPauseScriptOnDisconnectStatus(value); });
// Proxy
export const ProxyIP = withAutoConnect(async () => { return methods.ProxyIP(); });
export const ProxyPort = withAutoConnect(async () => { return methods.ProxyPort(); });
export const UseProxy = withAutoConnect(async () => { return methods.UseProxy(); });
// Extended info
export const GetExtInfo = withAutoConnect(async () => { return methods.GetExtInfo(); });
export const LastStatus = withAutoConnect(async () => { return methods.LastStatus(); });
// Client methods
export const ClientPrint = withAutoConnect(async (text) => { return methods.ClientPrint(text); });
export const ClientPrintEx = withAutoConnect(async (objId, color, font, text) => { return methods.ClientPrintEx(objId, color, font, text); });
// System journal extended
export const AddToSystemJournalEx = withAutoConnect(async (text, textColor, bgColor, fontSize, fontName) => { return methods.AddToSystemJournalEx(text, textColor, bgColor, fontSize, fontName); });
export const ClearSystemJournal = withAutoConnect(async () => { return methods.ClearSystemJournal(); });
// HTTP
export const HTTP_Get = withAutoConnect(async (url) => { return methods.HTTP_Get(url); });
export const HTTP_Post = withAutoConnect(async (url, data) => { return methods.HTTP_Post(url, data); });
export const HTTP_Body = withAutoConnect(async (requestId) => { return methods.HTTP_Body(requestId); });
export const HTTP_Header = withAutoConnect(async (requestId) => { return methods.HTTP_Header(requestId); });
// Party extended
export const PartyMessageTo = withAutoConnect(async (objId, text) => { return methods.PartyMessageTo(objId, text); });
export const PartyDeclineInvite = withAutoConnect(async (objId) => { return methods.PartyDeclineInvite(objId); });
export const PartyLeave = withAutoConnect(async () => { return methods.PartyLeave(); });
export const InParty = withAutoConnect(async (objId) => { return methods.InParty(objId); });
// Game server
export const GameServerIPString = withAutoConnect(async () => { return methods.GameServerIPString(); });
// Client target
export const ClientRequestObjectTarget = withAutoConnect(async () => { return methods.ClientRequestObjectTarget(); });
export const ClientRequestTileTarget = withAutoConnect(async () => { return methods.ClientRequestTileTarget(); });
export const ClientTargetResponsePresent = withAutoConnect(async () => { return methods.ClientTargetResponsePresent(); });
// Utility
export const Alarm = withAutoConnect(async (text) => { return methods.Alarm(text); });
export const SetSilentMode = withAutoConnect(async (value) => { return methods.SetSilentMode(value); });
export const GetSilentMode = withAutoConnect(async () => { return methods.GetSilentMode(); });
export const CheckLag = withAutoConnect(async (value) => { return methods.CheckLag(value); });
// Gump extended
export const GetGumpTextLines = withAutoConnect(async (gumpIndex) => { return methods.GetGumpTextLines(gumpIndex); });
export const GetGumpFullLines = withAutoConnect(async (gumpIndex) => { return methods.GetGumpFullLines(gumpIndex); });
export const GetGumpShortLines = withAutoConnect(async (gumpIndex) => { return methods.GetGumpShortLines(gumpIndex); });
export const GetGumpButtonsDescription = withAutoConnect(async (gumpIndex) => { return methods.GetGumpButtonsDescription(gumpIndex); });
export const GetGumpInfo = withAutoConnect(async (gumpIndex) => { return methods.GetGumpInfo(gumpIndex); });
export const AddGumpIgnoreByID = withAutoConnect(async (gumpId) => { return methods.AddGumpIgnoreByID(gumpId); });
export const AddGumpIgnoreBySerial = withAutoConnect(async (serial) => { return methods.AddGumpIgnoreBySerial(serial); });
export const ClearGumpsIgnore = withAutoConnect(async () => { return methods.ClearGumpsIgnore(); });
// Menu
export const GetMenu = withAutoConnect(async (caption) => { return methods.GetMenu(caption); });
export const GetLastMenu = withAutoConnect(async () => { return methods.GetLastMenu(); });
export const MenuHookPresent = withAutoConnect(async (caption) => { return methods.MenuHookPresent(caption); });
// Context menu
export const RequestContextMenu = withAutoConnect(async (objId) => { return methods.RequestContextMenu(objId); });
export const GetContextMenu = withAutoConnect(async () => { return methods.GetContextMenu(); });
export const GetContextMenuRec = withAutoConnect(async () => { return methods.GetContextMenuRec(); });
export const SetContextMenuHook = withAutoConnect(async (objId, entryId) => { return methods.SetContextMenuHook(objId, entryId); });
export const ClearContextMenu = withAutoConnect(async (menuId, entryId) => { return methods.ClearContextMenu(menuId, entryId); });
// Item pickup/drop
export const GetPickupedItem = withAutoConnect(async () => { return methods.GetPickupedItem(); });
export const SetPickupedItem = withAutoConnect(async (objId) => { return methods.SetPickupedItem(objId); });
export const GetDropCheckCoord = withAutoConnect(async () => { return methods.GetDropCheckCoord(); });
export const SetDropCheckCoord = withAutoConnect(async (value) => { return methods.SetDropCheckCoord(value); });
export const GetDropDelay = withAutoConnect(async () => { return methods.GetDropDelay(); });
export const SetDropDelay = withAutoConnect(async (value) => { return methods.SetDropDelay(value); });
// Pathfinding
export const GetPathArray = withAutoConnect(async (x, y, running, accuracyXY) => { return methods.GetPathArray(x, y, running, accuracyXY); });
export const GetPathArray3D = withAutoConnect(async (x1, y1, z1, x2, y2, z2, worldNum, accuracyXY, accuracyZ, running) => { return methods.GetPathArray3D(x1, y1, z1, x2, y2, z2, worldNum, accuracyXY, accuracyZ, running); });
export const GetNextStepZ = withAutoConnect(async (x1, y1, z1, x2, y2, worldNum, stepZ) => { return methods.GetNextStepZ(x1, y1, z1, x2, y2, worldNum, stepZ); });
// Tile/Map
export const GetTileFlags = withAutoConnect(async (worldNum, tileType) => { return methods.GetTileFlags(worldNum, tileType); });
export const GetLandTileData = withAutoConnect(async (tileType) => { return methods.GetLandTileData(tileType); });
export const GetStaticTileData = withAutoConnect(async (tileType) => { return methods.GetStaticTileData(tileType); });
export const GetLayerCount = withAutoConnect(async (x, y, worldNum) => { return methods.GetLayerCount(x, y, worldNum); });
export const ReadStaticsXY = withAutoConnect(async (x, y, worldNum) => { return methods.ReadStaticsXY(x, y, worldNum); });
export const GetSurfaceZ = withAutoConnect(async (x, y, worldNum) => { return methods.GetSurfaceZ(x, y, worldNum); });
export const IsCellPassable = withAutoConnect(async (x1, y1, z1, x2, y2, worldNum) => { return methods.IsCellPassable(x1, y1, z1, x2, y2, worldNum); });
export const GetCell = withAutoConnect(async (x, y, worldNum) => { return methods.GetCell(x, y, worldNum); });
// Movement timers
export const SetRunUnmountTimer = withAutoConnect(async (value) => { return methods.SetRunUnmountTimer(value); });
export const SetWalkMountTimer = withAutoConnect(async (value) => { return methods.SetWalkMountTimer(value); });
export const SetRunMountTimer = withAutoConnect(async (value) => { return methods.SetRunMountTimer(value); });
export const SetWalkUnmountTimer = withAutoConnect(async (value) => { return methods.SetWalkUnmountTimer(value); });
export const GetRunMountTimer = withAutoConnect(async () => { return methods.GetRunMountTimer(); });
export const GetWalkMountTimer = withAutoConnect(async () => { return methods.GetWalkMountTimer(); });
export const GetRunUnmountTimer = withAutoConnect(async () => { return methods.GetRunUnmountTimer(); });
export const GetWalkUnmountTimer = withAutoConnect(async () => { return methods.GetWalkUnmountTimer(); });
export const GetLastStepQUsedDoor = withAutoConnect(async () => { return methods.GetLastStepQUsedDoor(); });
// Movement advanced
export const SetMoveThroughCorner = withAutoConnect(async (value) => { return methods.SetMoveThroughCorner(value); });
export const GetMoveThroughCorner = withAutoConnect(async () => { return methods.GetMoveThroughCorner(); });
export const SetMoveHeuristicMult = withAutoConnect(async (value) => { return methods.SetMoveHeuristicMult(value); });
export const GetMoveHeuristicMult = withAutoConnect(async () => { return methods.GetMoveHeuristicMult(); });
export const SetMoveTurnCost = withAutoConnect(async (value) => { return methods.SetMoveTurnCost(value); });
export const GetMoveTurnCost = withAutoConnect(async () => { return methods.GetMoveTurnCost(); });
export const SetMoveBetweenTwoCorners = withAutoConnect(async (value) => { return methods.SetMoveBetweenTwoCorners(value); });
export const GetMoveBetweenTwoCorners = withAutoConnect(async () => { return methods.GetMoveBetweenTwoCorners(); });
// Dress/Equipment
export const GetDressSpeed = withAutoConnect(async () => { return methods.GetDressSpeed(); });
export const SetDressSpeed = withAutoConnect(async (value) => { return methods.SetDressSpeed(value); });
export const SetDress = withAutoConnect(async () => { return methods.SetDress(); });
export const EquipDressSet = withAutoConnect(async () => { return methods.EquipDressSet(); });
// Shop/AutoBuy
export const AutoBuy = withAutoConnect(async (shopNum, itemType, itemColor) => { return methods.AutoBuy(shopNum, itemType, itemColor); });
export const AutoBuyEx = withAutoConnect(async (shopNum, itemType, itemColor, quantity, name) => { return methods.AutoBuyEx(shopNum, itemType, itemColor, quantity, name); });
export const GetAutoBuyDelay = withAutoConnect(async (shopNum) => { return methods.GetAutoBuyDelay(shopNum); });
export const SetAutoBuyDelay = withAutoConnect(async (shopNum, value) => { return methods.SetAutoBuyDelay(shopNum, value); });
export const AutoSell = withAutoConnect(async (shopNum, itemType, itemColor) => { return methods.AutoSell(shopNum, itemType, itemColor); });
export const GetAutoSellDelay = withAutoConnect(async (shopNum) => { return methods.GetAutoSellDelay(shopNum); });
export const SetAutoSellDelay = withAutoConnect(async (shopNum, value) => { return methods.SetAutoSellDelay(shopNum, value); });
// Client UI
export const CloseClientUIWindow = withAutoConnect(async (windowType, objId) => { return methods.CloseClientUIWindow(windowType, objId); });
export const CloseClientGump = withAutoConnect(async (gumpId) => { return methods.CloseClientGump(gumpId); });
export const ClientHide = withAutoConnect(async (objId) => { return methods.ClientHide(objId); });
export const ClientTargetResponse = withAutoConnect(async () => { return methods.ClientTargetResponse(); });
// Quest/Help
export const GetQuestArrow = withAutoConnect(async () => { return methods.GetQuestArrow(); });
export const RequestStats = withAutoConnect(async (objId) => { return methods.RequestStats(objId); });
export const HelpRequest = withAutoConnect(async (objId) => { return methods.HelpRequest(objId); });
export const QuestRequest = withAutoConnect(async (objId) => { return methods.QuestRequest(objId); });
export const RenameMobile = withAutoConnect(async (objId, newName) => { return methods.RenameMobile(objId, newName); });
export const MobileCanBeRenamed = withAutoConnect(async (objId) => { return methods.MobileCanBeRenamed(objId); });
// Stat locking
export const SetStatState = withAutoConnect(async (statType, lockState) => { return methods.SetStatState(statType, lockState); });
export const GetStatLockState = withAutoConnect(async (statType) => { return methods.GetStatLockState(statType); });
// Stealth info
export const GetStealthInfo = withAutoConnect(async () => { return methods.GetStealthInfo(); });
export const GetClientVersionInt = withAutoConnect(async () => { return methods.GetClientVersionInt(); });
// Paths
export const StealthPath = withAutoConnect(async (pathType, createDir) => { return methods.StealthPath(pathType, createDir); });
export const GetStealthProfilePath = withAutoConnect(async (profileNum, createDir) => { return methods.GetStealthProfilePath(profileNum, createDir); });
export const GetShardPath = withAutoConnect(async (shardNum, createDir) => { return methods.GetShardPath(shardNum, createDir); });
// Global variables
export const SetGlobal = withAutoConnect(async (varType, varName, varValue) => { return methods.SetGlobal(varType, varName, varValue); });
// Multi
export const GetMultis = withAutoConnect(async () => { return methods.GetMultis(); });
export const ClearInfoWindow = withAutoConnect(async () => { return methods.ClearInfoWindow(); });
// Buff bar
export const GetBuffBarInfo = withAutoConnect(async () => { return methods.GetBuffBarInfo(); });
// FindTypesArrayEx
export const FindTypesArrayEx = withAutoConnect(async (objTypes, colors, containers, inSub) => { return methods.FindTypesArrayEx(objTypes, colors, containers, inSub); });
// Bandage
export const BandageSelf = withAutoConnect(async () => { return methods.BandageSelf(); });
// Use item on mobile
export const UseItemOnMobile = withAutoConnect(async (itemId, targetId) => { return methods.UseItemOnMobile(itemId, targetId); });
// Global chat
export const GlobalChatJoinChannel = withAutoConnect(async (channelName) => { return methods.GlobalChatJoinChannel(channelName); });
export const GlobalChatLeaveChannel = withAutoConnect(async () => { return methods.GlobalChatLeaveChannel(); });
export const GlobalChatSendMsg = withAutoConnect(async (text) => { return methods.GlobalChatSendMsg(text); });
export const GlobalChatActiveChannel = withAutoConnect(async () => { return methods.GlobalChatActiveChannel(); });
export const GlobalChatChannelsList = withAutoConnect(async () => { return methods.GlobalChatChannelsList(); });
// Menu items extended
export const GetMenuItemsEx = withAutoConnect(async (caption) => { return methods.GetMenuItemsEx(caption); });
// Equipment macros
export const UnequipItemsSetMacro = withAutoConnect(async () => { return methods.UnequipItemsSetMacro(); });
export const EquipItemsSetMacro = withAutoConnect(async () => { return methods.EquipItemsSetMacro(); });
// Stop mover
export const StopMover = withAutoConnect(async () => { return methods.StopMover(); });
// AR extended params
export const SetARExtParams = withAutoConnect(async (shardName, charName, useAtEveryConnect) => { return methods.SetARExtParams(shardName, charName, useAtEveryConnect); });
// Convert integer to flags
export const ConvertIntegerToFlags = withAutoConnect(async (group, flags) => { return methods.ConvertIntegerToFlags(group, flags); });
// Party extended
export const PartyMembersList = withAutoConnect(async () => { return methods.PartyMembersList(); });
// ICQ
export const ICQConnected = withAutoConnect(async () => { return methods.ICQConnected(); });
export const ICQConnect = withAutoConnect(async (uin, password) => { return methods.ICQConnect(uin, password); });
export const ICQDisconnect = withAutoConnect(async () => { return methods.ICQDisconnect(); });
export const ICQSetStatus = withAutoConnect(async (statusNum) => { return methods.ICQSetStatus(statusNum); });
export const ICQSetXStatus = withAutoConnect(async (statusNum) => { return methods.ICQSetXStatus(statusNum); });
export const ICQSendText = withAutoConnect(async (uin, text) => { return methods.ICQSendText(uin, text); });
// Messenger
export const MessengerGetConnected = withAutoConnect(async (messengerNum) => { return methods.MessengerGetConnected(messengerNum); });
export const MessengerSetConnected = withAutoConnect(async (messengerNum, value) => { return methods.MessengerSetConnected(messengerNum, value); });
export const MessengerGetToken = withAutoConnect(async (messengerNum) => { return methods.MessengerGetToken(messengerNum); });
export const MessengerSetToken = withAutoConnect(async (messengerNum, token) => { return methods.MessengerSetToken(messengerNum, token); });
export const MessengerGetName = withAutoConnect(async (messengerNum) => { return methods.MessengerGetName(messengerNum); });
export const MessengerSendMessage = withAutoConnect(async (messengerNum, recipient, message) => { return methods.MessengerSendMessage(messengerNum, recipient, message); });
// Missing methods
export const SetEventProc = withAutoConnect(async (eventIndex) => { return methods.SetEventProc(eventIndex); });
export const ClearEventProc = withAutoConnect(async (eventIndex) => { return methods.ClearEventProc(eventIndex); });
export const GetStaticArtBitmap = withAutoConnect(async (id, hue) => { return methods.GetStaticArtBitmap(id, hue); });
export const PrintScriptMethodsList = withAutoConnect(async (fileName, sortedList) => { return methods.PrintScriptMethodsList(fileName, sortedList); });
export const FillNewWindow = withAutoConnect(async (text) => { return methods.FillNewWindow(text); });
export const AddToJournal = withAutoConnect(async (msg) => { return methods.AddToJournal(msg); });
export const ConsoleEntryUnicodeReply = withAutoConnect(async (text) => { return methods.ConsoleEntryUnicodeReply(text); });
export const GetStaticsArray = withAutoConnect(async () => { return methods.GetStaticsArray(); });
export const GetLandsArray = withAutoConnect(async () => { return methods.GetLandsArray(); });
export const GetShopList = withAutoConnect(async () => { return methods.GetShopList(); });
export const ClearShopList = withAutoConnect(async () => { return methods.ClearShopList(); });
export const GetToolTipRec = withAutoConnect(async (objId) => { return methods.GetToolTipRec(objId); });
export const GetSkillCurrentValue = withAutoConnect(async (skillName) => { return methods.GetSkillCurrentValue(skillName); });
// Export raw methods for batch operations
export function getRawMethods() { return methodsRaw; }
// Parallel executor with connection pooling (like Python ThreadPoolExecutor)
// numConnections: Number of parallel connections (not CPU-bound, can be higher than CPU cores)
// Optimal range: 4-16 for most cases. Too many (>32) may cause server overhead
// Enhanced parallel that auto-awaits promises in arguments
// Usage: parallel([[GetX, Self()], [GetY, Self()]]) - Self() promise is auto-awaited!
// Default to 8 connections like Python's ThreadPoolExecutor
export async function parallel(commands, numConnections = 8) {
    // Don't pre-await everything - it slows things down!
    // Instead, await promise arguments on-demand during execution
    return await parallelInternal(commands, numConnections);
}
// Internal parallel implementation
async function parallelInternal(commands, numConnections = 8) {
    if (!protocol || !methodsRaw || !PORT) {
        throw new Error('Must call connect() first');
    }
    const { createMethods } = await import('./methods.js');
    const { connect: connectToStealth } = await import('./connection.js');
    // Reuse or expand connection pool (skip port discovery - we already know PORT!)
    if (connectionPool.length < numConnections) {
        const needed = numConnections - connectionPool.length;
        const newConnections = await Promise.all(Array(needed).fill(null).map(async () => {
            // Direct connect with known port - NO port discovery!
            const connProtocol = await connectToStealth(HOST, PORT);
            const connMethods = createMethods(connProtocol);
            return { protocol: connProtocol, methods: connMethods, _instances: connMethods._instances };
        }));
        connectionPool.push(...newConnections);
    }
    // Use pool connections (trim if we need fewer)
    const connections = connectionPool.slice(0, numConnections);
    // Optimized for Bun: True parallelism by batching all sends first, then all waits
    // Step 1: Resolve all promise arguments in parallel (if any)
    const preparedCommands = await Promise.all(commands.map(async (cmd, index) => {
        if (Array.isArray(cmd)) {
            const [fn, ...args] = cmd;
            const hasPromises = args.some(arg => arg && typeof arg.then === 'function');
            const resolvedArgs = hasPromises
                ? await Promise.all(args.map(arg => arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg)))
                : args;
            return { type: 'method', cmd: [fn, ...resolvedArgs], index };
        }
        else if (typeof cmd === 'function') {
            return { type: 'function', cmd, index };
        }
        else if (cmd && typeof cmd.then === 'function') {
            const result = await cmd;
            return { type: 'value', cmd: result, index };
        }
        else {
            return { type: 'value', cmd, index };
        }
    }));
    // Step 2: Send ALL requests immediately (non-blocking TCP writes)
    // All packets queue up in socket buffers concurrently
    // Do ALL sends synchronously without any awaits - pure I/O batching
    const waitFunctions = [];
    for (const { type, cmd, index } of preparedCommands) {
        const connIdx = index % numConnections;
        const conn = connections[connIdx];
        const instances = conn._instances;
        if (type === 'method') {
            const [fn, ...args] = cmd;
            // Use _methodName property (set by withAutoConnect) or fallback to fn.name
            const methodName = fn._methodName || fn.name;
            const instance = instances[methodName];
            if (instance && typeof instance.send === 'function') {
                // Send NOW - synchronous call that queues packet in socket buffer
                // No await here - we batch all sends, then wait for all results
                const waitFn = instance.send(...args);
                waitFunctions.push({ wait: waitFn, index });
            }
            else {
                // Fallback: execute as promise (this is slower!)
                waitFunctions.push({ wait: () => fn(...args), index });
            }
        }
        else if (type === 'function') {
            waitFunctions.push({ wait: () => cmd(), index });
        }
        else {
            waitFunctions.push({ wait: () => Promise.resolve(cmd), index });
        }
    }
    // At this point, ALL 144 requests are queued in socket buffers
    // Step 3: Wait for ALL results in parallel
    // Bun's event loop will process all socket I/O concurrently
    const allPromises = waitFunctions.map(({ wait, index }) => wait().then(result => ({ result, index })));
    // Wait for all commands to complete concurrently
    const allIndexedResults = await Promise.all(allPromises);
    // DON'T close connections - keep them in pool for reuse!
    // Connections are reused across parallel() calls for speed
    // Flatten, sort by original index, and return results in order
    return allIndexedResults
        .flat()
        .sort((a, b) => a.index - b.index)
        .map(r => r.result);
}
// Cleanup connection pool (call when done)
export async function closeConnectionPool() {
    for (const conn of connectionPool) {
        if (conn.protocol.socket) {
            conn.protocol.socket.destroy();
        }
    }
    connectionPool = [];
}
// Helper: process items with operations in parallel (like Python's parallel_items with @timeit decorator)
export async function parallel_items(items, operations, numConnections = 16) {
    const start = performance.now();
    const commands = [];
    for (const item of items) {
        for (const operation of operations) {
            commands.push([operation, item]);
        }
    }
    const allResults = await parallel(commands, numConnections);
    // Group results back by item
    const opsPerItem = operations.length;
    const packed = items.map((item, itemIndex) => {
        const startIndex = itemIndex * opsPerItem;
        const itemData = allResults.slice(startIndex, startIndex + opsPerItem);
        return { id: item, data: itemData };
    });
    const elapsed = ((performance.now() - start) / 1000).toFixed(4);
    console.log(`parallel_items: ${elapsed}s`);
    return packed;
}
// Config (like protocol.HOST)
export const config = {
    get HOST() { return HOST; },
    set HOST(value) { HOST = value; },
    get PORT() { return PORT; },
    set PORT(value) { PORT = value; }
};
// Auto-import helper: automatically makes all exports available in current scope
// Usage: await importStealth(); then use GetX(), GetY(), etc directly
export async function importStealth(scope = globalThis) {
    const module = await import('./index.js');
    Object.assign(scope, module);
}
// Run helper: wraps your script - you only need ONE await at the top
// Usage: 
//   import './js_stealth';
//   await run(async () => {
//     const self = Self();  // No await needed!
//     const hp = GetHP(self);  // No await needed!
//     if (hp < 50) {
//       Cast('heal');  // No await needed!
//     }
//   });
//
// This creates a context where all stealth functions auto-await
export async function run(fn) {
    // Create wrapped versions that auto-await
    const wrapped = {};
    const moduleExports = {
        Self, GetX, GetY, GetZ, GetType, GetName, GetHP, GetMana, GetStam,
        Cast, Wait, UseSkill, WaitForTarget, TargetToObject, WaitTargetSelf,
        parallel, config, connect, disconnect, on
        // Add all other exports...
    };
    // Wrap all functions to auto-await
    for (const [key, value] of Object.entries(moduleExports)) {
        if (typeof value === 'function') {
            wrapped[key] = (...args) => {
                return Promise.all(args.map(arg => arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg))).then(resolvedArgs => value(...resolvedArgs));
            };
        }
        else {
            wrapped[key] = value;
        }
    }
    // Replace globals temporarily
    const originals = {};
    for (const key of Object.keys(wrapped)) {
        originals[key] = globalThis[key];
        globalThis[key] = wrapped[key];
    }
    try {
        // Run the function
        await fn();
    }
    finally {
        // Restore originals
        for (const [key, value] of Object.entries(originals)) {
            globalThis[key] = value;
        }
    }
}
// Sync wrapper: automatically awaits all promises - Python-like synchronous API
// Usage: 
//   import { sync } from './index.js';
//   const stealth = sync();
//   stealth.GetX(stealth.Self()); // No await needed!
export function sync() {
    // Create a proxy that auto-awaits all method calls
    const handler = {
        get(target, prop) {
            const value = target[prop];
            // If it's a function, wrap it to auto-await
            if (typeof value === 'function') {
                return new Proxy(value, {
                    apply(fn, thisArg, args) {
                        // Recursively await any promise arguments
                        const awaitedArgs = args.map(arg => {
                            if (arg && typeof arg.then === 'function') {
                                throw new Error(`Cannot auto-await argument. Use await ${String(arg)} or pass resolved value.`);
                            }
                            return arg;
                        });
                        const result = fn.apply(thisArg, awaitedArgs);
                        // If result is a promise, throw - we can't auto-await at call site
                        // Instead, we'll create a sync context
                        return result;
                    }
                });
            }
            return value;
        }
    };
    return new Proxy({
        ...module,
        // Override to create sync context
        run: (fn) => {
            // Run function with automatic await handling
            return (async () => {
                const syncContext = {
                    get(target, prop) {
                        const value = target[prop];
                        if (typeof value === 'function') {
                            return (...args) => {
                                // Auto-await all promises
                                return Promise.all(args.map(arg => arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg))).then(resolvedArgs => value(...resolvedArgs));
                            };
                        }
                        return value;
                    }
                };
                const syncStealth = new Proxy(module, syncContext);
                // Replace all stealth functions in scope
                const originalFn = fn.toString();
                // This is complex - instead, let's use a simpler approach
                return fn();
            })();
        }
    }, handler);
}
// Better approach: create a sync context that wraps everything
export function createSyncContext() {
    const awaitedCache = new WeakMap();
    const autoAwait = (value) => {
        if (!value)
            return value;
        if (typeof value.then === 'function') {
            if (awaitedCache.has(value)) {
                return awaitedCache.get(value);
            }
            const syncValue = value.then(resolved => {
                awaitedCache.set(value, resolved);
                return resolved;
            });
            awaitedCache.set(value, syncValue);
            return syncValue;
        }
        if (typeof value === 'object') {
            return new Proxy(value, {
                get(target, prop) {
                    return autoAwait(target[prop]);
                }
            });
        }
        return value;
    };
    // Return proxy that auto-awaits
    return new Proxy(module, {
        get(target, prop) {
            const value = target[prop];
            if (typeof value === 'function') {
                return (...args) => {
                    // Auto-await arguments that are promises
                    const awaitedArgs = Promise.all(args.map(arg => arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg)));
                    return awaitedArgs.then(resolvedArgs => {
                        const result = value(...resolvedArgs);
                        return autoAwait(result);
                    });
                };
            }
            return autoAwait(value);
        }
    });
}
// Note: JavaScript cannot truly block synchronously like Python because:
// 1. Promise callbacks run in microtask queue, which only executes after current sync code
// 2. Busy-wait loops prevent the event loop from processing microtasks
// 3. True blocking requires native modules like 'deasync' or 'sync-rpc'
//
// The best we can do is minimize await usage with auto-awaited promise arguments
// and using parallel() for batch operations.
// Auto-await wrapper: Automatically awaits promise arguments (non-blocking version)
function autoAwaitWrapper(fn) {
    const wrapped = async function (...args) {
        // Auto-await all promise arguments
        const resolvedArgs = await Promise.all(args.map(arg => arg && typeof arg.then === 'function' ? arg : Promise.resolve(arg)));
        // Call the function and return its result
        return fn(...resolvedArgs);
    };
    // Preserve _methodName property for parallel execution
    if (fn._methodName) {
        wrapped._methodName = fn._methodName;
    }
    return wrapped;
}
// Create auto-awaited exports
function createAutoAwaitedExports() {
    const rawExports = {
        // Basic
        Self, GetX, GetY, GetZ, GetType, GetName, GetHP, GetMana, GetStam,
        GetQuantity, GetDistance, GetColor, ClickOnObject, Wait, Str, Int, Dex,
        HP, Mana, Stam, Connected, Ground, SetFindDistance, FindType, FindTypeEx,
        GetFindedList, GetAltName, GetTitle, GetTooltip, GetStr, GetInt, GetDex,
        GetMaxHP, GetMaxMana, GetMaxStam, GetPrice, GetDirection, IsObjectExists,
        // Actions
        UseObject, UseType, UseFromGround, Attack,
        // Self stats
        MaxHP, MaxMana, MaxStam, Gold, Weight, MaxWeight, Armor, Luck, Race, Sex,
        WorldNum, CharName, Backpack, ShardName, ProfileName,
        // Status
        Hidden, Poisoned, Paralyzed, Dead, WarMode, SetWarMode, WarTargetID,
        // Targeting
        TargetID, TargetPresent, TargetCursor, WaitForTarget, CancelTarget, TargetToObject, TargetToXYZ, WaitTargetObject,
        WaitTargetSelf, WaitTargetLast, CancelWaitTarget,
        // Last
        LastTarget, LastAttack, LastContainer, LastObject,
        // Position
        PredictedX, PredictedY, PredictedZ,
        // Finding
        GetFindDistance, GetFindVertical, SetFindVertical, FindNotoriety,
        FindAtCoord, FindItem, FindCount, FindFullQuantity, Ignore, IgnoreOff,
        IgnoreReset, GetIgnoreList,
        // Journal
        InJournal, LastJournalMessage, Journal, LowJournal, HighJournal,
        ClearJournal, AddToSystemJournal,
        // Skills
        UseSkill, UseSkillID, GetSkillValue, GetSkillCap, GetSkillID,
        // Spells
        Cast, CastToObj, CastToObject, CastToSelf, CastSelf, CastSpell,
        IsActiveSpellAbility,
        // Container/Item
        SetCatchBag, UnsetCatchBag,
        // Object status
        GetNotoriety, GetParent, IsNPC, IsDead, IsRunning, IsContainer,
        IsMovable, IsYellowHits, IsFemale, GetLayer, IsHouse,
        // Item manipulation
        DragItem, DropItem, OpenDoor, Bow, Salute, WearItem, ObjAtLayerEx,
        // Movement
        Step, StepQ, MoveXYZ, MoveXY, newMoveXY, newMoveXYZ, SetBadLocation,
        SetGoodLocation, ClearBadLocationList, SetBadObject, ClearBadObjectList,
        CheckLOS,
        // Parallel (don't wrap - it already handles awaiting)
        parallel, parallel_items,
        // Config and connection (don't wrap)
        config, connect, disconnect, on,
        // Constants (don't wrap)
        LAYERS, DIRECTIONS, NOTORIETY
    };
    // Wrap all async functions with auto-await
    const wrappedExports = {};
    for (const [key, value] of Object.entries(rawExports)) {
        if (typeof value === 'function') {
            wrappedExports[key] = autoAwaitWrapper(value);
        }
        else {
            wrappedExports[key] = value;
        }
    }
    return wrappedExports;
}
// JavaScript cannot truly block synchronously without native modules
// This function is a no-op - we keep it for API compatibility
// Use await - it's the JavaScript way!
export function enableBlocking() {
    console.warn('enableBlocking() does not work in JavaScript. Use await instead.');
}
// Auto-import: Assign all exports to global scope (Python-like behavior)
// This allows: import './js_stealth'; then use Self(), GetX(), etc. directly
/// <reference path="../global.d.ts" />
if (typeof globalThis !== 'undefined') {
    const exports = createAutoAwaitedExports();
    // Also export constants to global scope
    Object.assign(globalThis, exports, { LAYERS, DIRECTIONS, NOTORIETY });
}
