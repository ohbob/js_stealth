/// <reference path="./types/global.d.ts" />
// @ts-nocheck - Large file, types added incrementally
import { connect as connectToStealth } from './core/connection.js';
import { createMethods } from './methods.js';
// Import and export all constants from constants file
import { LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId } from './constants.js';
export { LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId };
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
export async function ensureConnected() {
    if (protocol && methods) {
        return; // Already connected
    }
    if (connecting && connectPromise) {
        return connectPromise; // Wait for existing connection attempt
    }
    connecting = true;
    // Use current HOST/PORT (which may have been set via config)
    connectPromise = connect(null, null);
    try {
        await connectPromise;
        // Verify connection is actually ready by checking socket state
        if (!protocol || !protocol.socket || protocol.socket.destroyed || !protocol.socket.writable) {
            throw new Error('Connection established but socket is not writable');
        }
    }
    catch (error) {
        connecting = false;
        connectPromise = null;
        // Re-throw with better error message
        const host = HOST || 'localhost';
        const port = PORT || 'auto-discovered';
        const errorMsg = (error && error.message) ? error.message : String(error || 'Unknown error');
        // Check for timeout errors (from port discovery or connection) - case insensitive
        // Port discovery errors: "Socket timeout", "Connection timeout", "Response timeout"
        const lowerMsg = errorMsg.toLowerCase();
        if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
            throw new Error(`Connection timeout to ${host}:${port} - is Stealth running on ${host}?`);
        }
        // Check for connection refused errors
        if (lowerMsg.includes('econnrefused') ||
            lowerMsg.includes('refused') ||
            lowerMsg.includes('connection refused')) {
            throw new Error(`Connection refused to ${host}:${port} - is Stealth running on ${host}?`);
        }
        // Generic connection error - pass through the original message
        throw new Error(`Connection failed to ${host}:${port}: ${errorMsg}`);
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
        const { discoverPort } = await import('./core/connection.js');
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
    // Auto-disconnect when event loop is about to be empty
    // The 'beforeExit' event fires when Node.js would exit if there were no more work
    // Open sockets keep the event loop alive, so we disconnect them first
    let isDisconnecting = false;
    process.on('beforeExit', (code) => {
        // Only disconnect if we're connected and not already disconnecting
        if (!isDisconnecting && protocol && protocol.socket && !protocol.socket.destroyed) {
            isDisconnecting = true;
            // Disconnect and then exit
            disconnect()
                .then(() => {
                isDisconnecting = false;
                // After disconnect, exit immediately
                process.exit(code || 0);
            })
                .catch((e) => {
                isDisconnecting = false;
                // If disconnect fails, force exit anyway
                process.exit(code || 0);
            });
        }
        else {
            // No connection or already disconnecting, safe to exit
            process.exit(code || 0);
        }
    });
    // Handle signals
    process.once('SIGINT', () => {
        disconnect().then(() => process.exit(0)).catch(() => process.exit(1));
    });
    process.once('SIGTERM', () => {
        disconnect().then(() => process.exit(0)).catch(() => process.exit(1));
    });
    // Handle errors gracefully
    process.once('uncaughtException', async (error) => {
        const errorMsg = error.message || String(error);
        // Connection errors from ensureConnected have good messages - show them directly
        if (errorMsg.includes('Connection timeout') ||
            errorMsg.includes('Connection refused') ||
            errorMsg.includes('Connection failed to')) {
            console.error(errorMsg);
        }
        else if (errorMsg.includes('Timeout') || errorMsg.includes('Connection')) {
            console.error('Connection error:', errorMsg);
        }
        else {
            console.error('Uncaught exception:', errorMsg);
        }
        try {
            await disconnect();
        }
        catch (e) {
            // Ignore disconnect errors
        }
        process.exit(1);
    });
    process.once('unhandledRejection', async (reason) => {
        const errorMsg = reason instanceof Error ? reason.message : String(reason);
        // Connection errors from ensureConnected have good messages - show them directly
        if (errorMsg.includes('Connection timeout') ||
            errorMsg.includes('Connection refused') ||
            errorMsg.includes('Connection failed to')) {
            console.error(errorMsg);
        }
        else if (errorMsg.includes('Timeout') || errorMsg.includes('Connection')) {
            console.error('Connection error:', errorMsg);
        }
        else {
            console.error('Unhandled rejection:', errorMsg);
        }
        try {
            await disconnect();
        }
        catch (e) {
            // Ignore disconnect errors
        }
        process.exit(1);
    });
}
export function on(event, callback) {
    if (protocol) {
        protocol.on(event, callback);
    }
}
export async function disconnect() {
    if (protocol && protocol.socket) {
        // Clear all pending timeouts first
        if (protocol.pendingPromises) {
            for (const [id, promise] of protocol.pendingPromises) {
                if (promise.timeout) {
                    clearTimeout(promise.timeout);
                }
            }
            protocol.pendingPromises.clear();
        }
        // Remove all listeners before destroying
        protocol.socket.removeAllListeners();
        protocol.removeAllListeners();
        // Ensure socket is fully closed
        if (!protocol.socket.destroyed) {
            try {
                protocol.socket.end();
            }
            catch (e) {
                // Ignore end errors
            }
            try {
                protocol.socket.destroy();
            }
            catch (e) {
                // Ignore destroy errors
            }
        }
        protocol = null;
        methods = null;
        methodsRaw = null;
    }
    // Also close connection pool
    await closeConnectionPool();
}
// Wrapper helper for all methods - auto-connects if needed
function withAutoConnect(fn, methodName) {
    const wrapped = async (...args) => {
        try {
            await ensureConnected();
            // Re-get methods in case they weren't available when wrapper was created
            if (!methods || !protocol) {
                throw new Error('Connection failed - methods not available. Is Stealth running?');
            }
            // Small delay after connection to ensure handshake is processed
            if (protocol && protocol.socket && protocol.socket.readyState === 'open') {
                // Connection is ready, proceed
            }
            return await fn(...args);
        }
        catch (error) {
            const errorMsg = (error && error.message) ? error.message : String(error || '');
            const lowerMsg = errorMsg.toLowerCase();
            // Connection errors from ensureConnected already have good messages - pass them through
            // MUST check these FIRST before generic "Timeout" check
            if (lowerMsg.includes('connection timeout') ||
                lowerMsg.includes('connection refused') ||
                lowerMsg.includes('connection failed to')) {
                throw error; // Already a connection error with good message
            }
            // Method timeout errors - the connection worked but method call timed out waiting for response
            if (lowerMsg.includes('timeout waiting for result') ||
                lowerMsg.includes('timeout in')) {
                const name = methodName || fn.name || 'method';
                // Check if connection is still alive
                const isConnected = protocol && methods && protocol.socket && !protocol.socket.destroyed && protocol.socket.writable;
                if (!isConnected) {
                    throw new Error(`Connection lost during ${name} - Stealth may have disconnected`);
                }
                throw new Error(`Method ${name} timed out waiting for response from Stealth - check if Stealth is processing the request`);
            }
            if (lowerMsg.includes('closed')) {
                const name = methodName || fn.name || 'method';
                throw new Error(`Connection closed during ${name}: ${errorMsg}`);
            }
            throw error;
        }
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
export const Wait = withAutoConnect(async function (ms) { return methods.Wait(ms); }, 'Wait');
export const Str = withAutoConnect(async function () { return methods.Str(); });
export const Int = withAutoConnect(async function () { return methods.Int(); });
export const Dex = withAutoConnect(async function () { return methods.Dex(); });
export const HP = withAutoConnect(async function () { return methods.HP(); });
export const Mana = withAutoConnect(async function () { return methods.Mana(); });
export const Stam = withAutoConnect(async function () { return methods.Stam(); });
export const Connected = withAutoConnect(async function () { return methods.Connected(); });
export function Ground() { return 0; } // Returns 0 directly, no connection needed (matches Python)
export const SetFindDistance = withAutoConnect(async function (value) { return methods.SetFindDistance(value); }, 'SetFindDistance');
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
export const Ignore = withAutoConnect(async (objId) => { return methods.Ignore(objId); }, 'Ignore');
export const IgnoreOff = withAutoConnect(async (objId) => { return methods.IgnoreOff(objId); }, 'IgnoreOff');
export const IgnoreReset = withAutoConnect(async () => { return methods.IgnoreReset(); }, 'IgnoreReset');
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
export const GetNotoriety = withAutoConnect(async (objId) => { return methods.GetNotoriety(objId); }, 'GetNotoriety');
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
export const UOSay = withAutoConnect(async (text) => { return methods.UOSay(text); }, 'UOSay');
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
export const RequestContextMenu = withAutoConnect(async (objId) => { return methods.RequestContextMenu(objId); }, 'RequestContextMenu');
export const GetContextMenu = withAutoConnect(async () => { return methods.GetContextMenu(); });
export const GetContextMenuRec = withAutoConnect(async () => { return methods.GetContextMenuRec(); });
export const SetContextMenuHook = withAutoConnect(async (objId, entryId) => { return methods.SetContextMenuHook(objId, entryId); }, 'SetContextMenuHook');
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
export const AutoBuy = withAutoConnect(async (itemType, itemColor, quantity) => { return methods.AutoBuy(itemType, itemColor, quantity); }, 'AutoBuy');
export const AutoBuyEx = withAutoConnect(async (itemType, itemColor, quantity, price, itemName) => { return methods.AutoBuyEx(itemType, itemColor, quantity, price, itemName); }, 'AutoBuyEx');
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
export const FindTypesArrayEx = withAutoConnect(async (objTypes, colors, containers, inSub) => {
    await methods.FindTypesArrayEx(objTypes, colors, containers, inSub);
    return methods.GetFindedList();
}, 'FindTypesArrayEx');
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
// Export connection state getters for custom methods
export function getConnectionState() {
    return { HOST, PORT, connectionPool, protocol, methodsRaw };
}
// Cleanup connection pool (call when done)
// Note: This is used by custom methods, but kept in index.ts as it's used by disconnect()
export async function closeConnectionPool() {
    for (const conn of connectionPool) {
        if (conn.protocol && conn.protocol.socket) {
            // Clear all pending timeouts
            if (conn.protocol.pendingPromises) {
                for (const [id, promise] of conn.protocol.pendingPromises) {
                    if (promise.timeout) {
                        clearTimeout(promise.timeout);
                    }
                }
                conn.protocol.pendingPromises.clear();
            }
            // Remove all listeners and destroy socket
            conn.protocol.socket.removeAllListeners();
            conn.protocol.removeAllListeners();
            conn.protocol.socket.destroy();
        }
    }
    connectionPool = [];
}
// Config (like protocol.HOST)
export const config = {
    get HOST() { return HOST; },
    set HOST(value) { HOST = value; },
    get PORT() { return PORT; },
    set PORT(value) { PORT = value; }
};
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
// Create auto-awaited exports - automatically collects all exported const functions
function createAutoAwaitedExports() {
    // Collect all exports automatically
    const rawExports = {
        // Functions from exports (automatically included)
        Self, GetX, GetY, GetZ, GetType, GetName, GetHP, GetMana, GetStam,
        GetQuantity, GetDistance, GetColor, ClickOnObject, Wait, Str, Int, Dex,
        HP, Mana, Stam, Connected, Ground, SetFindDistance, FindType, FindTypeEx,
        GetFindedList, GetAltName, GetTitle, GetTooltip, GetStr, GetInt, GetDex,
        GetMaxHP, GetMaxMana, GetMaxStam, GetPrice, GetDirection, IsObjectExists,
        UseObject, UseType, UseFromGround, Attack,
        MaxHP, MaxMana, MaxStam, Gold, Weight, MaxWeight, Armor, Luck, Race, Sex,
        WorldNum, CharName, Backpack, ShardName, ProfileName,
        Hidden, Poisoned, Paralyzed, Dead, WarMode, SetWarMode, WarTargetID,
        TargetID, TargetPresent, TargetCursor, WaitForTarget, CancelTarget, TargetToObject, TargetToXYZ, WaitTargetObject,
        WaitTargetSelf, WaitTargetLast, CancelWaitTarget,
        LastTarget, LastAttack, LastContainer, LastObject,
        PredictedX, PredictedY, PredictedZ,
        GetFindDistance, FindAtCoord, FindItem, FindCount, FindFullQuantity, Ignore, IgnoreOff,
        IgnoreReset, GetIgnoreList,
        InJournal, LastJournalMessage, Journal, LowJournal, HighJournal,
        ClearJournal, AddToSystemJournal,
        UseSkill, UseSkillID, GetSkillValue, GetSkillCap, GetSkillID,
        Cast, CastToObj, CastToObject, CastToSelf, CastSelf, CastSpell,
        IsActiveSpellAbility,
        SetCatchBag, UnsetCatchBag,
        GetNotoriety, GetParent, IsNPC, IsDead, IsRunning, IsContainer,
        IsMovable, IsYellowHits, IsFemale, GetLayer, IsHouse,
        DragItem, DropItem, OpenDoor, Bow, Salute, WearItem, ObjAtLayerEx,
        Step, StepQ, MoveXYZ, MoveXY, newMoveXY, newMoveXYZ, SetBadLocation,
        SetGoodLocation, ClearBadLocationList, SetBadObject, ClearBadObjectList,
        CheckLOS,
        AutoBuy, AutoBuyEx, GetAutoBuyDelay, SetAutoBuyDelay, AutoSell, GetAutoSellDelay, SetAutoSellDelay, GetShopList, ClearShopList,
        WaitMenu, AutoMenu, MenuPresent, CancelMenu, CloseMenu, WaitGump, WaitTextEntry, GumpAutoTextEntry, GumpAutoRadiobutton, GumpAutoCheckBox,
        NumGumpButton, NumGumpTextEntry, NumGumpRadiobutton, NumGumpCheckBox, GetGumpsCount, CloseSimpleGump, GetGumpSerial, GetGumpID, IsGumpCanBeClosed,
        GetGumpTextLines, GetGumpFullLines, GetGumpShortLines, GetGumpButtonsDescription, GetGumpInfo, AddGumpIgnoreByID, AddGumpIgnoreBySerial, ClearGumpsIgnore,
        UOSay, UOSayColor,
        InviteToParty, RemoveFromParty, PartySay, PartyCanLootMe, PartyAcceptInvite, PartyMessageTo, PartyDeclineInvite, PartyLeave, InParty, PartyMembersList,
        FireResist, ColdResist, PoisonResist, EnergyResist,
        MaxPets, PetsCurrent,
        IsTrade, GetTradeContainer, GetTradeOpponent, TradeCount, GetTradeOpponentName, TradeCheck, ConfirmTrade, CancelTrade,
        InJournalBetweenTimes, SetJournalLine, AddJournalIgnore, ClearJournalIgnore, AddChatUserIgnore, ClearChatUserIgnore, AddToSystemJournalEx, ClearSystemJournal,
        LineID, LineType, LineTime, LineMsgType, LineTextColor, LineTextFont, LineIndex, LineCount, LineName,
        GetConnectedTime, GetDisconnectedTime, ChangeProfile, ChangeProfileEx, GetARStatus, SetARStatus, ProfileShardName, GetCharTitle, GetClilocByID, GetFoundedParamID,
        GetStealthInfo, GetClientVersionInt, StealthPath, GetStealthProfilePath, GetShardPath, SetGlobal, Alarm, SetSilentMode, GetSilentMode, CheckLag,
        ClientPrint, ClientPrintEx, ProxyIP, ProxyPort, UseProxy, GetExtInfo, LastStatus, GameServerIPString, ClientRequestObjectTarget, ClientRequestTileTarget,
        ClientTargetResponsePresent, ClientTargetResponse,
        UsePrimaryAbility, UseSecondaryAbility, GetAbility, ToggleFly,
        ReqVirtuesGump, UseVirtue,
        UseSelfPaperdollScroll, UseOtherPaperdollScroll,
        SetStatState, GetStatLockState,
        GetQuestArrow, RequestStats, HelpRequest, QuestRequest, RenameMobile, MobileCanBeRenamed,
        GetMenu, GetLastMenu, MenuHookPresent, GetMenuItemsEx,
        RequestContextMenu, GetContextMenu, GetContextMenuRec, SetContextMenuHook, ClearContextMenu,
        GetPickupedItem, SetPickupedItem, GetDropCheckCoord, SetDropCheckCoord, GetDropDelay, SetDropDelay,
        GetTileFlags, GetLandTileData, GetStaticTileData, GetLayerCount, ReadStaticsXY, GetSurfaceZ, IsCellPassable, GetCell, GetStaticsArray, GetLandsArray,
        SetRunUnmountTimer, SetWalkMountTimer, SetRunMountTimer, SetWalkUnmountTimer, GetRunMountTimer, GetWalkMountTimer, GetRunUnmountTimer, GetWalkUnmountTimer, GetLastStepQUsedDoor,
        SetMoveOpenDoor, GetMoveOpenDoor, SetMoveThroughNPC, GetMoveThroughNPC, SetMoveCheckStamina, GetMoveCheckStamina,
        SetMoveThroughCorner, GetMoveThroughCorner, SetMoveHeuristicMult, GetMoveHeuristicMult, SetMoveTurnCost, GetMoveTurnCost, SetMoveBetweenTwoCorners, GetMoveBetweenTwoCorners,
        PredictedDirection, GetPathArray, GetPathArray3D, GetNextStepZ, StopMover,
        SetFindInNulPoint, GetFindInNulPoint, FindQuantity, FindTypesArrayEx,
        GetSkillCurrentValue, GetSkillLockState, ChangeSkillLockState,
        TargetToTile, WaitTargetTile, WaitTargetXYZ, WaitTargetType, WaitTargetGround,
        GetDressSpeed, SetDressSpeed, SetDress, EquipDressSet, UnequipItemsSetMacro, EquipItemsSetMacro,
        CloseClientUIWindow, CloseClientGump, ClientHide,
        GetMultis, ClearInfoWindow,
        GetBuffBarInfo,
        BandageSelf,
        UseItemOnMobile,
        GlobalChatJoinChannel, GlobalChatLeaveChannel, GlobalChatSendMsg, GlobalChatActiveChannel, GlobalChatChannelsList,
        HTTP_Get, HTTP_Post, HTTP_Body, HTTP_Header,
        Connect, Disconnect, GetPauseScriptOnDisconnectStatus, SetPauseScriptOnDisconnectStatus,
        SetARExtParams,
        ConvertIntegerToFlags,
        ICQConnected, ICQConnect, ICQDisconnect, ICQSetStatus, ICQSetXStatus, ICQSendText,
        MessengerGetConnected, MessengerSetConnected, MessengerGetToken, MessengerSetToken, MessengerGetName, MessengerSendMessage,
        GetToolTipRec,
        // Special exports (don't wrap with autoAwait)
        parallel, parallel_items, Find,
        config, connect, disconnect, on,
        LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId
    };
    // Wrap all async functions with auto-await (except special ones)
    const wrappedExports = {};
    const skipWrap = new Set(['parallel', 'parallel_items', 'Find', 'config', 'connect', 'disconnect', 'on', 'LAYERS', 'DIRECTIONS', 'NOTORIETY', 'SPELLS', 'SKILL_NAMES', 'EVENTS', 'METHOD_INDICES', 'getSpellId']);
    for (const [key, value] of Object.entries(rawExports)) {
        if (skipWrap.has(key)) {
            wrappedExports[key] = value;
        }
        else if (typeof value === 'function') {
            wrappedExports[key] = autoAwaitWrapper(value);
        }
        else {
            wrappedExports[key] = value;
        }
    }
    return wrappedExports;
}
// Auto-import: Assign all exports to global scope (Python-like behavior)
// This allows: import './js_stealth'; then use Self(), GetX(), etc. directly
/// <reference path="./types/global.d.ts" />
// Import and re-export custom methods (at module level for static imports)
// Using dynamic import in top-level await context
const customMethods = await import('./methodscustom.js');
export const parallel = customMethods.parallel;
export const parallel_items = customMethods.parallel_items;
export const Find = customMethods.Find;
if (typeof globalThis !== 'undefined') {
    const exports = createAutoAwaitedExports(customMethods);
    // Also export constants to global scope
    Object.assign(globalThis, exports, { LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId });
}
