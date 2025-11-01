// @ts-nocheck - Large file, types added incrementally
import { 
  packUInt32, packUInt16, packInt16, packUInt8, packInt8, packBool, packString, packDouble, packFloat, packInt32,
  unpackUInt32, unpackUInt16, unpackInt16, unpackUInt8, unpackInt8, unpackBool, unpackString, unpackDouble, unpackFloat, unpackInt32
} from './datatypes.js';
import type { Protocol } from './protocol.js';

// Spell names mapped to IDs (from py_stealth)
const SPELLS = {
  // 1st circle
  'clumsy': 1,
  'create food': 2,
  'feeblemind': 3,
  'heal': 4,
  'magic arrow': 5,
  'night sight': 6,
  'reactive armor': 7,
  'weaken': 8,
  // 2nd circle
  'agility': 9,
  'cunning': 10,
  'cure': 11,
  'harm': 12,
  'magic trap': 13,
  'magic untrap': 14,
  'protection': 15,
  'strength': 16,
  // 3rd circle
  'bless': 17,
  'fireball': 18,
  'magic lock': 19,
  'poison': 20,
  'telekinesis': 21,
  'teleport': 22,
  'unlock': 23,
  'wall of stone': 24,
  // 4th circle
  'arch cure': 25,
  'arch protection': 26,
  'curse': 27,
  'fire field': 28,
  'greater heal': 29,
  'lightning': 30,
  'mana drain': 31,
  'recall': 32,
  // 5th circle
  'blade spirit': 33,
  'dispel field': 34,
  'incognito': 35,
  'magic reflection': 36,
  'spell reflection': 36,
  'mind blast': 37,
  'paralyze': 38,
  'poison field': 39,
  'summon creature': 40,
  // 6th circle
  'dispel': 41,
  'energy bolt': 42,
  'explosion': 43,
  'invisibility': 44,
  'mark': 45,
  'mass curse': 46,
  'paralyze field': 47,
  'reveal': 48,
  // 7th circle
  'chain lightning': 49,
  'energy field': 50,
  'flame strike': 51,
  'gate travel': 52,
  'mana vampire': 53,
  'mass dispel': 54,
  'meteor swarm': 55,
  'polymorph': 56,
  // 8th circle
  'earthquake': 57,
  'energy vortex': 58,
  'resurrection': 59,
  'summon air elemental': 60,
  'summon daemon': 61,
  'summon earth elemental': 62,
  'summon fire elemental': 63,
  'summon water elemental': 64,
  // Necromancy
  'animate dead': 101,
  'blood oath': 102,
  'corpse skin': 103,
  'curse weapon': 104,
  'evil omen': 105,
  'horrific beast': 106,
  'lich form': 107,
  'mind rot': 108,
  'pain spike': 109,
  'poison strike': 110,
  'strangle': 111,
  'summon familiar': 112,
  'vampiric embrace': 113,
  'vengeful spirit': 114,
  'wither': 115,
  'wraith form': 116,
  'exorcism': 117,
  // Paladin spells
  'cleanse by fire': 201,
  'close wounds': 202,
  'consecrate weapon': 203,
  'dispel evil': 204,
  'divine fury': 205,
  'enemy of one': 206,
  'holy light': 207,
  'noble sacrifice': 208,
  'remove curse': 209,
  'sacred journey': 210,
  // Bushido
  'confidence': 401,
  'counter attack': 402,
  'evasion': 403,
  'honorable execution': 404,
  'lightning strike': 405,
  'momentum strike': 406,
  // Ninjitsu
  'animal form': 501,
  'backstab': 502,
  'death strike': 503,
  'focus attack': 504,
  'ki attack': 505,
  'mirror image': 506,
  'shadow jump': 507,
  'surprise attack': 508,
  // Spellweaving
  'arcane circle': 601,
  'arcane empowerment': 602,
  'attune weapon': 603,
  'dryad allure': 604,
  'essence of wind': 605,
  'ethereal voyage': 606,
  'gift of life': 607,
  'gift of renewal': 608,
  'immolating weapon': 609,
  'mana phantasm': 610,
  'nature\'s fury': 611,
  'reaper form': 612,
  'rising colossus': 613,
  'soul seeker': 614,
  'summon fey': 615,
  'summon fiend': 616,
  'thunderstorm': 617,
  'wildfire': 618,
  'word of death': 619,
  // Mysticism
  'animated weapon': 701,
  'bombard': 702,
  'cleansing winds': 703,
  'eagle strike': 704,
  'enchant': 705,
  'healing stone': 706,
  'hail storm': 707,
  'mass sleep': 708,
  'nether bolt': 709,
  'purge magic': 710,
  'rising colossus': 711,
  'sleep': 712,
  'spell plague': 713,
  'stone form': 714,
  'spell trigger': 715,
  'spellweaving': 716,
};

function getSpellId(name) {
  const lowerName = name.toLowerCase();
  if (!(lowerName in SPELLS)) {
    throw new Error(`Unknown spell name "${name}".`);
  }
  return SPELLS[lowerName];
}

// Method indices (from py_stealth methods.py) - comprehensive list
const METHOD_INDICES = {
  // Basic
  Wait: 0,
  SetEventProc: 7,
  ClearEventProc: 8,
  ProfileName: 11,
  GetConnectedStatus: 12,
  AddToSystemJournal: 13,
  GetSelfID: 14,
  GetX: 15,
  GetY: 16,
  GetZ: 17,
  GetWorldNum: 18,
  GetCharName: 19,
  ChangeProfile: 20,
  GetARStatus: 21,
  SetARStatus: 22,
  GetPauseScriptOnDisconnectStatus: 23,
  SetPauseScriptOnDisconnectStatus: 24,
  GetSelfSex: 25,
  GetCharTitle: 26,
  GetSelfGold: 27,
  GetSelfArmor: 28,
  GetSelfWeight: 29,
  GetSelfMaxWeight: 30,
  GetSelfRace: 31,
  GetSelfPetsMax: 32,
  GetSelfPetsCurrent: 33,
  GetSelfFireResist: 34,
  GetSelfColdResist: 35,
  GetSelfPoisonResist: 36,
  GetSelfEnergyResist: 37,
  GetConnectedTime: 38,
  GetDisconnectedTime: 39,
  GetLastContainer: 40,
  GetLastTarget: 41,
  GetLastAttack: 42,
  GetLastStatus: 43,
  GetLastObject: 44,
  Connect: 45,
  Disconnect: 46,
  GetShardName: 47,
  GetBackpackID: 48,
  // Stats
  GetSelfStr: 49,
  GetSelfInt: 50,
  GetSelfDex: 51,
  GetSelfLife: 52,
  GetSelfMana: 53,
  GetSelfStam: 54,
  GetSelfMaxLife: 55,
  GetSelfMaxMana: 56,
  GetMaxStam: 57,
  GetSelfLuck: 58,
  GetExtInfo: 59,
  GetProxyIP: 60,
  GetProxyPort: 61,
  GetUseProxy: 62,
  GetHiddenStatus: 63,
  GetPoisonedStatus: 64,
  GetParalyzedStatus: 65,
  GetDeadStatus: 66,
  GetWarTargetID: 67,
  SetWarMode: 68,
  Attack: 69,
  UseSelfPaperdollScroll: 70,
  UseOtherPaperdollScroll: 71,
  GetTargetID: 72,
  CancelTarget: 73,
  TargetToObject: 74,
  TargetToXYZ: 75,
  TargetToTile: 76,
  WaitTargetObject: 77,
  WaitTargetTile: 78,
  WaitTargetXYZ: 79,
  WaitTargetSelf: 80,
  WaitTargetType: 81,
  CancelWaitTarget: 82,
  WaitTargetGround: 83,
  WaitTargetLast: 84,
  UsePrimaryAbility: 85,
  UseSecondaryAbility: 86,
  GetAbility: 87,
  ToggleFly: 88,
  GetSkillID: 89,
  UseSkill: 90,
  ChangeSkillLockState: 91,
  GetSkillCap: 92,
  GetSkillValue: 93,
  ReqVirtuesGump: 94,
  UseVirtue: 95,
  CastSpell: 96,
  IsActiveSpellAbility: 98,
  SetCatchBag: 99,
  UnsetCatchBag: 100,
  UseObject: 101,
  UseType: 102,
  UseFromGround: 103,
  ClickOnObject: 104,
  GetFoundedParamID: 105,
  GetLineID: 106,
  GetLineType: 107,
  GetLineTime: 108,
  GetLineMsgType: 109,
  GetLineTextColor: 110,
  GetLineTextFont: 111,
  GetLineIndex: 112,
  GetLineCount: 113,
  GetLineName: 114,
  AddJournalIgnore: 115,
  ClearJournalIgnore: 116,
  AddChatUserIgnore: 117,
  ClearChatUserIgnore: 118,
  ClearJournal: 119,
  LastJournalMessage: 120,
  InJournal: 121,
  InJournalBetweenTimes: 122,
  Journal: 123,
  SetJournalLine: 124,
  LowJournal: 125,
  HighJournal: 126,
  SetFindDistance: 127,
  GetFindDistance: 128,
  SetFindVertical: 129,
  GetFindVertical: 130,
  FindTypeEx: 131,
  FindNotoriety: 132,
  FindAtCoord: 133,
  Ignore: 134,
  IgnoreOff: 135,
  IgnoreReset: 136,
  GetIgnoreList: 137,
  GetFindedList: 138,
  GetFindItem: 139,
  GetFindCount: 140,
  FindQuantity: 141,
  FindFullQuantity: 142,
  PredictedX: 143,
  PredictedY: 144,
  PredictedZ: 145,
  PredictedDirection: 146,
  GetName: 147,
  GetAltName: 148,
  GetTitle: 149,
  GetTooltip: 150,
  GetType: 151,
  GetToolTipRec: 152,
  GetClilocByID: 153,
  GetQuantity: 154,
  IsObjectExists: 155,
  GetPrice: 156,
  GetDirection: 157,
  GetDistance: 158,
  GetColor: 159,
  GetStr: 160,
  GetInt: 161,
  GetDex: 162,
  GetHP: 163,
  GetMaxHP: 164,
  GetMana: 165,
  GetMaxMana: 166,
  GetStam: 167,
  GetMaxStam: 168,
  GetNotoriety: 169,
  GetParent: 170,
  IsWarMode: 171,
  IsNPC: 172,
  IsDead: 173,
  IsRunning: 174,
  IsContainer: 175,
  IsHidden: 176,
  IsMovable: 177,
  IsYellowHits: 178,
  IsPoisoned: 179,
  IsParalyzed: 180,
  IsFemale: 181,
  OpenDoor: 182,
  Bow: 183,
  Salute: 184,
  GetPickupedItem: 185,
  SetPickupedItem: 186,
  GetDropCheckCoord: 187,
  SetDropCheckCoord: 188,
  GetDropDelay: 189,
  SetDropDelay: 190,
  DragItem: 191,
  DropItem: 192,
  RequestContextMenu: 193,
  SetContextMenuHook: 194,
  GetContextMenu: 195,
  ClearContextMenu: 196,
  IsTrade: 197,
  GetTradeContainer: 198,
  GetTradeOpponent: 199,
  TradeCount: 200,
  GetTradeOpponentName: 201,
  TradeCheck: 202,
  ConfirmTrade: 203,
  CancelTrade: 204,
  WaitMenu: 205,
  AutoMenu: 206,
  MenuHookPresent: 207,
  MenuPresent: 208,
  CancelMenu: 209,
  CloseMenu: 210,
  WaitGump: 211,
  WaitTextEntry: 212,
  GumpAutoTextEntry: 213,
  GumpAutoRadiobutton: 214,
  GumpAutoCheckBox: 215,
  NumGumpButton: 216,
  NumGumpTextEntry: 217,
  NumGumpRadiobutton: 218,
  NumGumpCheckBox: 219,
  GetGumpsCount: 220,
  CloseSimpleGump: 221,
  GetGumpSerial: 222,
  GetGumpID: 223,
  IsGumpCanBeClosed: 224,
  GetGumpTextLines: 225,
  GetGumpFullLines: 226,
  GetGumpShortLines: 227,
  GetGumpButtonsDescription: 228,
  GetGumpInfo: 229,
  AddGumpIgnoreByID: 230,
  AddGumpIgnoreBySerial: 231,
  ClearGumpsIgnore: 232,
  ObjAtLayerEx: 233,
  GetLayer: 234,
  WearItem: 235,
  GetDressSpeed: 236,
  SetDressSpeed: 237,
  SetDress: 238,
  EquipDressSet: 239,
  AutoBuy: 240,
  GetShopList: 241,
  ClearShopList: 242,
  AutoBuyEx: 243,
  GetAutoBuyDelay: 244,
  SetAutoBuyDelay: 245,
  GetAutoSellDelay: 246,
  SetAutoSellDelay: 247,
  AutoSell: 248,
  RequestStats: 249,
  HelpRequest: 250,
  QuestRequest: 251,
  RenameMobile: 252,
  MobileCanBeRenamed: 253,
  SetStatState: 254,
  GetStaticArtBitmap: 255,
  PrintScriptMethodsList: 256,
  Alarm: 257,
  HTTP_Get: 258,
  HTTP_Post: 259,
  HTTP_Body: 260,
  HTTP_Header: 261,
  InviteToParty: 262,
  RemoveFromParty: 263,
  PartyMessageTo: 264,
  PartySay: 265,
  PartyCanLootMe: 266,
  PartyAcceptInvite: 267,
  PartyDeclineInvite: 268,
  PartyLeave: 269,
  PartyMembersList: 270,
  InParty: 271,
  ICQConnected: 272,
  ICQConnect: 273,
  ICQDisconnect: 274,
  ICQSetStatus: 275,
  ICQSetXStatus: 276,
  ICQSendText: 277,
  GetTileFlags: 279,
  GetLandTileData: 280,
  GetStaticTileData: 281,
  GetLayerCount: 282,
  ReadStaticsXY: 283,
  GetSurfaceZ: 284,
  IsCellPassable: 285,
  GetStaticsArray: 286,
  GetLandsArray: 287,
  ClientPrint: 289,
  ClientPrintEx: 290,
  CloseClientUIWindow: 291,
  ClientRequestObjectTarget: 292,
  ClientRequestTileTarget: 293,
  ClientTargetResponsePresent: 294,
  ClientTargetResponse: 295,
  CheckLag: 297,
  GetQuestArrow: 300,
  SetSilentMode: 301,
  GetSilentMode: 302,
  FillNewWindow: 303,
  AddToJournal: 304,
  StealthPath: 305,
  GetStealthProfilePath: 306,
  GetShardPath: 307,
  UOSay: 308,
  UOSayColor: 309,
  SetGlobal: 310,
  ConsoleEntryUnicodeReply: 313,
  SetRunUnmountTimer: 316,
  SetWalkMountTimer: 317,
  SetRunMountTimer: 318,
  SetWalkUnmountTimer: 319,
  GetRunMountTimer: 320,
  GetWalkMountTimer: 321,
  GetRunUnmountTimer: 322,
  GetWalkUnmountTimer: 323,
  Step: 324,
  StepQ: 325,
  MoveXYZ: 326,
  MoveXY: 327,
  SetBadLocation: 328,
  SetGoodLocation: 329,
  ClearBadLocationList: 330,
  SetBadObject: 331,
  ClearBadObjectList: 332,
  CheckLOS: 333,
  GetPathArray: 334,
  GetPathArray3D: 335,
  SetFindInNulPoint: 336,
  GetFindInNulPoint: 337,
  GetMenu: 338,
  GetLastMenu: 339,
  FindTypesArrayEx: 340,
  GameServerIPString: 341,
  CloseClientGump: 342,
  ProfileShardName: 343,
  GetLastStepQUsedDoor: 344,
  GetContextMenuRec: 345,
  ClearSystemJournal: 346,
  GetMultis: 347,
  ClearInfoWindow: 348,
  GetBuffBarInfo: 349,
  ConvertIntegerToFlags: 350,
  GetSkillCurrentValue: 351,
  ChangeProfileEx: 352,
  StopMover: 353,
  SetARExtParams: 354,
  GetClientVersionInt: 355,
  UnequipItemsSetMacro: 356,
  EquipItemsSetMacro: 357,
  GetMenuItemsEx: 358,
  UseItemOnMobile: 359,
  BandageSelf: 360,
  GlobalChatJoinChannel: 361,
  GlobalChatLeaveChannel: 362,
  GlobalChatSendMsg: 363,
  GlobalChatActiveChannel: 364,
  GlobalChatChannelsList: 365,
  GetNextStepZ: 367,
  ClientHide: 368,
  GetSkillLockState: 371,
  GetStatLockState: 372,
  IsHouse: 382,
  AddToSystemJournalEx: 386,
  GetStealthInfo: 387,
  GetCell: 388,
  SetMoveOpenDoor: 400,
  GetMoveOpenDoor: 401,
  SetMoveThroughNPC: 402,
  GetMoveThroughNPC: 403,
  SetMoveThroughCorner: 404,
  GetMoveThroughCorner: 405,
  SetMoveHeuristicMult: 406,
  GetMoveHeuristicMult: 407,
  SetMoveCheckStamina: 408,
  GetMoveCheckStamina: 409,
  SetMoveTurnCost: 410,
  GetMoveTurnCost: 411,
  SetMoveBetweenTwoCorners: 412,
  GetMoveBetweenTwoCorners: 413,
  MessengerGetConnected: 501,
  MessengerSetConnected: 502,
  MessengerGetToken: 503,
  MessengerSetToken: 504,
  MessengerGetName: 505,
  MessengerSendMessage: 506,
};

class ScriptMethod {
  constructor(protocol, methodIndex, argTypes, returnType) {
    this.protocol = protocol;
    this.methodIndex = methodIndex;
    this.argTypes = argTypes;
    this.returnType = returnType;
  }

  async call(...args) {
    // Handle pause
    while (this.protocol.pause) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Pack arguments
    let argData;
    if (this.argTypes.length > 0 && args.length > 0) {
      const buffers = [];
      for (let i = 0; i < args.length; i++) {
        buffers.push(this.argTypes[i](args[i]));
      }
      argData = Buffer.concat(buffers);
    } else {
      argData = Buffer.alloc(0);
    }

    // Send method and wait for result
    if (this.returnType) {
      const id = this.protocol.sendMethod(this.methodIndex, argData, true);
      const result = await this.protocol.waitForResult(id);
      return this.returnType(result, 0);
    } else {
      this.protocol.sendMethod(this.methodIndex, argData, false);
    }
  }

  // Send without waiting - for batch operations
  send(...args) {
    // NO pause check - we're sending immediately
    // Pack arguments
    let argData;
    if (this.argTypes.length > 0 && args.length > 0) {
      const buffers = [];
      for (let i = 0; i < args.length; i++) {
        buffers.push(this.argTypes[i](args[i]));
      }
      argData = Buffer.concat(buffers);
    } else {
      argData = Buffer.alloc(0);
    }

    if (this.returnType) {
      const id = this.protocol.sendMethod(this.methodIndex, argData, true);
      // Return a function that waits for the result
      return () => this.protocol.waitForResult(id).then(result => this.returnType(result, 0));
    } else {
      this.protocol.sendMethod(this.methodIndex, argData, false);
      return () => Promise.resolve();
    }
  }
}

export function createMethods(protocol) {
  // Create ScriptMethod instances for send() access (for parallel execution)
  const methodInstances = {
    GetX: new ScriptMethod(protocol, METHOD_INDICES.GetX, [packUInt32], (buf) => unpackUInt16(buf)),
    GetY: new ScriptMethod(protocol, METHOD_INDICES.GetY, [packUInt32], (buf) => unpackUInt16(buf)),
    GetZ: new ScriptMethod(protocol, METHOD_INDICES.GetZ, [packUInt32], (buf) => unpackInt8(buf)),
    GetType: new ScriptMethod(protocol, METHOD_INDICES.GetType, [packUInt32], (buf) => unpackUInt16(buf)),
    GetName: new ScriptMethod(protocol, METHOD_INDICES.GetName, [packUInt32], (buf) => unpackString(buf)),
    GetHP: new ScriptMethod(protocol, METHOD_INDICES.GetHP, [packUInt32], (buf) => unpackInt16(buf)),
    GetMana: new ScriptMethod(protocol, METHOD_INDICES.GetMana, [packUInt32], (buf) => unpackInt16(buf)),
    GetStam: new ScriptMethod(protocol, METHOD_INDICES.GetStam, [packUInt32], (buf) => unpackInt16(buf)),
    GetQuantity: new ScriptMethod(protocol, METHOD_INDICES.GetQuantity, [packUInt32], (buf) => unpackInt16(buf)),
    GetDistance: new ScriptMethod(protocol, METHOD_INDICES.GetDistance, [packUInt32], (buf) => unpackInt16(buf)),
    GetColor: new ScriptMethod(protocol, METHOD_INDICES.GetColor, [packUInt32], (buf) => unpackUInt16(buf)),
    GetAltName: new ScriptMethod(protocol, METHOD_INDICES.GetAltName, [packUInt32], (buf) => unpackString(buf)),
    GetTitle: new ScriptMethod(protocol, METHOD_INDICES.GetTitle, [packUInt32], (buf) => unpackString(buf)),
    GetTooltip: new ScriptMethod(protocol, METHOD_INDICES.GetTooltip, [packUInt32], (buf) => unpackString(buf)),
    GetStr: new ScriptMethod(protocol, METHOD_INDICES.GetStr, [packUInt32], (buf) => unpackInt16(buf)),
    GetInt: new ScriptMethod(protocol, METHOD_INDICES.GetInt, [packUInt32], (buf) => unpackInt16(buf)),
    GetDex: new ScriptMethod(protocol, METHOD_INDICES.GetDex, [packUInt32], (buf) => unpackInt16(buf)),
    GetMaxHP: new ScriptMethod(protocol, METHOD_INDICES.GetMaxHP, [packUInt32], (buf) => unpackInt16(buf)),
    GetMaxMana: new ScriptMethod(protocol, METHOD_INDICES.GetMaxMana, [packUInt32], (buf) => unpackInt16(buf)),
    GetMaxStam: new ScriptMethod(protocol, METHOD_INDICES.GetMaxStam, [packUInt32], (buf) => unpackInt16(buf)),
    GetPrice: new ScriptMethod(protocol, METHOD_INDICES.GetPrice, [packUInt32], (buf) => unpackUInt32(buf)),
    GetDirection: new ScriptMethod(protocol, METHOD_INDICES.GetDirection, [packUInt32], (buf) => unpackUInt8(buf)),
    IsObjectExists: new ScriptMethod(protocol, METHOD_INDICES.IsObjectExists, [packUInt32], (buf) => unpackBool(buf)),
    PredictedX: new ScriptMethod(protocol, METHOD_INDICES.PredictedX, [], (buf) => unpackUInt16(buf)),
    PredictedY: new ScriptMethod(protocol, METHOD_INDICES.PredictedY, [], (buf) => unpackUInt16(buf)),
    PredictedZ: new ScriptMethod(protocol, METHOD_INDICES.PredictedZ, [], (buf) => unpackInt8(buf)),
  };

  const returnObj = {
    // Connection
    Connected: () => new ScriptMethod(protocol, METHOD_INDICES.GetConnectedStatus, [], (buf) => unpackBool(buf)).call(),
    
    // Self info
    Self: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfID, [], (buf) => unpackUInt32(buf)).call(),
    GetX: (objId) => methodInstances.GetX.call(objId),
    GetY: (objId) => methodInstances.GetY.call(objId),
    GetZ: (objId) => methodInstances.GetZ.call(objId),
    GetType: (objId) => methodInstances.GetType.call(objId),
    GetName: (objId) => methodInstances.GetName.call(objId),
    GetHP: (objId) => methodInstances.GetHP.call(objId),
    GetMana: (objId) => methodInstances.GetMana.call(objId),
    GetStam: (objId) => methodInstances.GetStam.call(objId),
    GetQuantity: (objId) => methodInstances.GetQuantity.call(objId),
    GetDistance: (objId) => methodInstances.GetDistance.call(objId),
    GetColor: (objId) => methodInstances.GetColor.call(objId),
    GetAltName: (objId) => methodInstances.GetAltName.call(objId),
    GetTitle: (objId) => methodInstances.GetTitle.call(objId),
    GetTooltip: (objId) => methodInstances.GetTooltip.call(objId),
    GetStr: (objId) => methodInstances.GetStr.call(objId),
    GetInt: (objId) => methodInstances.GetInt.call(objId),
    GetDex: (objId) => methodInstances.GetDex.call(objId),
    GetMaxHP: (objId) => methodInstances.GetMaxHP.call(objId),
    GetMaxMana: (objId) => methodInstances.GetMaxMana.call(objId),
    GetMaxStam: (objId) => methodInstances.GetMaxStam.call(objId),
    GetPrice: (objId) => methodInstances.GetPrice.call(objId),
    GetDirection: (objId) => methodInstances.GetDirection.call(objId),
    IsObjectExists: (objId) => methodInstances.IsObjectExists.call(objId),
    
    // Actions
    ClickOnObject: (objId) => new ScriptMethod(protocol, METHOD_INDICES.ClickOnObject, [packUInt32], null).call(objId),
    UseObject: (objId) => new ScriptMethod(protocol, METHOD_INDICES.UseObject, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    UseType: (objType, color = 0xFFFF) => new ScriptMethod(protocol, METHOD_INDICES.UseType, [packUInt16, packUInt16], (buf) => unpackUInt32(buf)).call(objType, color),
    UseFromGround: (objType, color = 0xFFFF) => new ScriptMethod(protocol, METHOD_INDICES.UseFromGround, [packUInt16, packUInt16], (buf) => unpackUInt32(buf)).call(objType, color),
    Attack: (objId) => new ScriptMethod(protocol, METHOD_INDICES.Attack, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    
    // Wait - method 0 is special (doesn't send to server, just waits)
    Wait: (ms) => {
      // In Python, Wait() calls _wait() repeatedly in a loop
      // Method 0 doesn't send anything to server, just checks pause/events
      // For JavaScript, we just use setTimeout
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Stats (player only, no args)
    Str: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfStr, [], (buf) => unpackInt16(buf)).call(),
    Int: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfInt, [], (buf) => unpackInt16(buf)).call(),
    Dex: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfDex, [], (buf) => unpackInt16(buf)).call(),
    HP: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfLife, [], (buf) => unpackInt16(buf)).call(),
    Mana: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfMana, [], (buf) => unpackInt16(buf)).call(),
    Stam: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfStam, [], (buf) => unpackInt16(buf)).call(),
    MaxHP: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfMaxLife, [], (buf) => unpackInt16(buf)).call(),
    MaxMana: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfMaxMana, [], (buf) => unpackInt16(buf)).call(),
    MaxStam: () => new ScriptMethod(protocol, METHOD_INDICES.GetMaxStam, [], (buf) => unpackInt16(buf)).call(),
    Gold: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfGold, [], (buf) => unpackUInt32(buf)).call(),
    Weight: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfWeight, [], (buf) => unpackUInt16(buf)).call(),
    MaxWeight: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfMaxWeight, [], (buf) => unpackUInt16(buf)).call(),
    Armor: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfArmor, [], (buf) => unpackUInt16(buf)).call(),
    Luck: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfLuck, [], (buf) => unpackUInt16(buf)).call(),
    Race: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfRace, [], (buf) => unpackUInt8(buf)).call(),
    Sex: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfSex, [], (buf) => unpackUInt8(buf)).call(),
    WorldNum: () => new ScriptMethod(protocol, METHOD_INDICES.GetWorldNum, [], (buf) => unpackUInt8(buf)).call(),
    CharName: () => new ScriptMethod(protocol, METHOD_INDICES.GetCharName, [], (buf) => unpackString(buf)).call(),
    Backpack: () => new ScriptMethod(protocol, METHOD_INDICES.GetBackpackID, [], (buf) => unpackUInt32(buf)).call(),
    ShardName: () => new ScriptMethod(protocol, METHOD_INDICES.GetShardName, [], (buf) => unpackString(buf)).call(),
    ProfileName: () => new ScriptMethod(protocol, METHOD_INDICES.ProfileName, [], (buf) => unpackString(buf)).call(),
    
    // Status checks (player)
    Hidden: () => new ScriptMethod(protocol, METHOD_INDICES.GetHiddenStatus, [], (buf) => unpackBool(buf)).call(),
    Poisoned: () => new ScriptMethod(protocol, METHOD_INDICES.GetPoisonedStatus, [], (buf) => unpackBool(buf)).call(),
    Paralyzed: () => new ScriptMethod(protocol, METHOD_INDICES.GetParalyzedStatus, [], (buf) => unpackBool(buf)).call(),
    Dead: () => new ScriptMethod(protocol, METHOD_INDICES.GetDeadStatus, [], (buf) => unpackBool(buf)).call(),
    WarMode: () => new ScriptMethod(protocol, METHOD_INDICES.IsWarMode, [], (buf) => unpackBool(buf)).call(),
    
    // Combat
    SetWarMode: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetWarMode, [packBool], null).call(value),
    WarTargetID: () => new ScriptMethod(protocol, METHOD_INDICES.GetWarTargetID, [], (buf) => unpackUInt32(buf)).call(),
    
    // Targeting
    TargetID: () => new ScriptMethod(protocol, METHOD_INDICES.GetTargetID, [], (buf) => unpackUInt32(buf)).call(),
    TargetPresent: async () => {
      const targetId = await new ScriptMethod(protocol, METHOD_INDICES.GetTargetID, [], (buf) => unpackUInt32(buf)).call();
      return targetId !== 0;
    },
    WaitForTarget: async (maxWaitTimeMS) => {
      const startTime = Date.now();
      while (Date.now() - startTime < maxWaitTimeMS) {
        const targetId = await new ScriptMethod(protocol, METHOD_INDICES.GetTargetID, [], (buf) => unpackUInt32(buf)).call();
        if (targetId !== 0) {
          return true;
        }
        await methods.Wait(10);
      }
      return false;
    },
    CancelTarget: () => new ScriptMethod(protocol, METHOD_INDICES.CancelTarget, [], null).call(),
    TargetToObject: (objId) => new ScriptMethod(protocol, METHOD_INDICES.TargetToObject, [packUInt32], null).call(objId),
    TargetToXYZ: (x, y, z) => new ScriptMethod(protocol, METHOD_INDICES.TargetToXYZ, [packUInt16, packUInt16, packInt8], null).call(x, y, z),
    WaitTargetObject: (objId) => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetObject, [packUInt32], null).call(objId),
    WaitTargetSelf: () => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetSelf, [], null).call(),
    WaitTargetLast: () => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetLast, [], (buf) => unpackString(buf)).call(),
    CancelWaitTarget: () => new ScriptMethod(protocol, METHOD_INDICES.CancelWaitTarget, [], null).call(),
    
    // Last actions
    LastTarget: () => new ScriptMethod(protocol, METHOD_INDICES.GetLastTarget, [], (buf) => unpackUInt32(buf)).call(),
    LastAttack: () => new ScriptMethod(protocol, METHOD_INDICES.GetLastAttack, [], (buf) => unpackUInt32(buf)).call(),
    LastContainer: () => new ScriptMethod(protocol, METHOD_INDICES.GetLastContainer, [], (buf) => unpackUInt32(buf)).call(),
    LastObject: () => new ScriptMethod(protocol, METHOD_INDICES.GetLastObject, [], (buf) => unpackUInt32(buf)).call(),
    
    // Position (predicted)
    PredictedX: () => methodInstances.PredictedX.call(),
    PredictedY: () => methodInstances.PredictedY.call(),
    PredictedZ: () => methodInstances.PredictedZ.call(),
    
    // Search/Finding
    Ground: () => 0, // Ground() just returns 0
    SetFindDistance: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetFindDistance, [packUInt32], null).call(value),
    FindTypeEx: (objType, color, container = 0, inSub = true) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.FindTypeEx, 
        [packUInt16, packUInt16, packUInt32, packBool], 
        (buf) => unpackUInt32(buf));
      return method.call(objType, color, container, inSub);
    },
    FindType: (objType, container = null) => {
      // FindType uses FindTypeEx with color=0xFFFF, inSub=false
      // If container is null, use Backpack() (0x40000000), but for Ground we pass 0
      const cont = container === null ? 0x40000000 : (container === 0 ? 0 : container);
      const method = new ScriptMethod(protocol, METHOD_INDICES.FindTypeEx, 
        [packUInt16, packUInt16, packUInt32, packBool], 
        (buf) => unpackUInt32(buf));
      return method.call(objType, 0xFFFF, cont, false);
    },
    GetFindedList: () => {
      // Returns array of uint32s
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetFindedList, [], 
        (buf) => {
          const count = unpackUInt32(buf, 0);
          const items = [];
          let offset = 4;
          for (let i = 0; i < count; i++) {
            items.push(unpackUInt32(buf, offset));
            offset += 4;
          }
          return items;
        });
      return method.call();
    },
    GetFindDistance: () => new ScriptMethod(protocol, METHOD_INDICES.GetFindDistance, [], (buf) => unpackUInt32(buf)).call(),
    GetFindVertical: () => new ScriptMethod(protocol, METHOD_INDICES.GetFindVertical, [], (buf) => unpackUInt32(buf)).call(),
    SetFindVertical: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetFindVertical, [packUInt32], null).call(value),
    FindNotoriety: (objType, notoriety) => new ScriptMethod(protocol, METHOD_INDICES.FindNotoriety, [packUInt16, packUInt8], (buf) => unpackUInt32(buf)).call(objType, notoriety),
    FindAtCoord: (x, y) => new ScriptMethod(protocol, METHOD_INDICES.FindAtCoord, [packUInt16, packUInt16], (buf) => unpackUInt32(buf)).call(x, y),
    FindItem: () => new ScriptMethod(protocol, METHOD_INDICES.GetFindItem, [], (buf) => unpackUInt32(buf)).call(),
    FindCount: () => new ScriptMethod(protocol, METHOD_INDICES.GetFindCount, [], (buf) => unpackInt32(buf)).call(),
    FindFullQuantity: (objId) => new ScriptMethod(protocol, METHOD_INDICES.FindFullQuantity, [packUInt32], (buf) => unpackInt32(buf)).call(objId),
    Ignore: (objId) => new ScriptMethod(protocol, METHOD_INDICES.Ignore, [packUInt32], null).call(objId),
    IgnoreOff: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IgnoreOff, [packUInt32], null).call(objId),
    IgnoreReset: () => new ScriptMethod(protocol, METHOD_INDICES.IgnoreReset, [], null).call(),
    GetIgnoreList: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetIgnoreList, [], 
        (buf) => {
          const count = unpackUInt32(buf, 0);
          const items = [];
          let offset = 4;
          for (let i = 0; i < count; i++) {
            items.push(unpackUInt32(buf, offset));
            offset += 4;
          }
          return items;
        });
      return method.call();
    },
    
    // Journal
    InJournal: (text) => new ScriptMethod(protocol, METHOD_INDICES.InJournal, [packString], (buf) => unpackInt32(buf)).call(text),
    LastJournalMessage: () => new ScriptMethod(protocol, METHOD_INDICES.LastJournalMessage, [], (buf) => unpackString(buf)).call(),
    Journal: (index) => new ScriptMethod(protocol, METHOD_INDICES.Journal, [packUInt32], (buf) => unpackString(buf)).call(index),
    LowJournal: () => new ScriptMethod(protocol, METHOD_INDICES.LowJournal, [], (buf) => unpackInt32(buf)).call(),
    HighJournal: () => new ScriptMethod(protocol, METHOD_INDICES.HighJournal, [], (buf) => unpackInt32(buf)).call(),
    ClearJournal: () => new ScriptMethod(protocol, METHOD_INDICES.ClearJournal, [], null).call(),
    AddToSystemJournal: (text) => new ScriptMethod(protocol, METHOD_INDICES.AddToSystemJournal, [packString], null).call(text),
    
    // Skills
    UseSkill: async function(skillNameOrId) {
      let skillId;
      if (typeof skillNameOrId === 'string') {
        // Use GetSkillID to convert name to ID
        const getSkillIdMethod = new ScriptMethod(protocol, METHOD_INDICES.GetSkillID, [packString], (buf) => unpackInt32(buf));
        skillId = await getSkillIdMethod.call(skillNameOrId);
        if (skillId < 0) {
          throw new Error(`Unknown skill name "${skillNameOrId}".`);
        }
      } else {
        skillId = skillNameOrId;
      }
      const method = new ScriptMethod(protocol, METHOD_INDICES.UseSkill, [packInt32], null);
      await method.call(skillId);
      return true;
    },
    UseSkillID: (skillId) => new ScriptMethod(protocol, METHOD_INDICES.UseSkill, [packInt32], null).call(skillId),
    GetSkillValue: async function(skillNameOrId) {
      let skillId;
      if (typeof skillNameOrId === 'string') {
        const getSkillIdMethod = new ScriptMethod(protocol, METHOD_INDICES.GetSkillID, [packString], (buf) => unpackInt32(buf));
        skillId = await getSkillIdMethod.call(skillNameOrId);
        if (skillId < 0) {
          throw new Error(`Unknown skill name "${skillNameOrId}".`);
        }
      } else {
        skillId = skillNameOrId;
      }
      return new ScriptMethod(protocol, METHOD_INDICES.GetSkillValue, [packInt32], (buf) => unpackDouble(buf)).call(skillId);
    },
    GetSkillCap: async function(skillNameOrId) {
      let skillId;
      if (typeof skillNameOrId === 'string') {
        const getSkillIdMethod = new ScriptMethod(protocol, METHOD_INDICES.GetSkillID, [packString], (buf) => unpackInt32(buf));
        skillId = await getSkillIdMethod.call(skillNameOrId);
        if (skillId < 0) {
          throw new Error(`Unknown skill name "${skillNameOrId}".`);
        }
      } else {
        skillId = skillNameOrId;
      }
      return new ScriptMethod(protocol, METHOD_INDICES.GetSkillCap, [packInt32], (buf) => unpackDouble(buf)).call(skillId);
    },
    GetSkillID: (skillName) => new ScriptMethod(protocol, METHOD_INDICES.GetSkillID, [packString], (buf) => unpackInt32(buf)).call(skillName),
    
    // Spells
    Cast: async (spellName, objId = null) => {
      if (objId !== null) {
        await methods.WaitTargetObject(objId);
      }
      const spellId = getSpellId(spellName);
      const method = new ScriptMethod(protocol, METHOD_INDICES.CastSpell, [packInt32], null);
      await method.call(spellId);
      return true;
    },
    CastToObj: async (spellName, objId) => {
      await methods.WaitTargetObject(objId);
      const spellId = getSpellId(spellName);
      const method = new ScriptMethod(protocol, METHOD_INDICES.CastSpell, [packInt32], null);
      await method.call(spellId);
      return true;
    },
    CastToObject: async (spellName, objId) => {
      await methods.WaitTargetObject(objId);
      const spellId = getSpellId(spellName);
      const method = new ScriptMethod(protocol, METHOD_INDICES.CastSpell, [packInt32], null);
      await method.call(spellId);
      return true;
    },
    CastToSelf: async (spellName) => {
      await methods.WaitTargetSelf();
      const spellId = getSpellId(spellName);
      const method = new ScriptMethod(protocol, METHOD_INDICES.CastSpell, [packInt32], null);
      await method.call(spellId);
      return true;
    },
    CastSelf: async (spellName) => {
      await methods.WaitTargetSelf();
      const spellId = getSpellId(spellName);
      const method = new ScriptMethod(protocol, METHOD_INDICES.CastSpell, [packInt32], null);
      await method.call(spellId);
      return true;
    },
    CastSpell: (spellId) => new ScriptMethod(protocol, METHOD_INDICES.CastSpell, [packInt32], null).call(spellId),
    IsActiveSpellAbility: (spellNameOrId) => {
      const spellId = typeof spellNameOrId === 'string' ? getSpellId(spellNameOrId) : spellNameOrId;
      return new ScriptMethod(protocol, METHOD_INDICES.IsActiveSpellAbility, [packInt32], (buf) => unpackBool(buf)).call(spellId);
    },
    
    // Container/Item operations
    SetCatchBag: (objId) => new ScriptMethod(protocol, METHOD_INDICES.SetCatchBag, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    UnsetCatchBag: () => new ScriptMethod(protocol, METHOD_INDICES.UnsetCatchBag, [], (buf) => unpackUInt32(buf)).call(),
    
    // Object status checks
    GetNotoriety: (objId) => new ScriptMethod(protocol, METHOD_INDICES.GetNotoriety, [packUInt32], (buf) => unpackUInt8(buf)).call(objId),
    GetParent: (objId) => new ScriptMethod(protocol, METHOD_INDICES.GetParent, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    IsNPC: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsNPC, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    IsDead: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsDead, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    IsRunning: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsRunning, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    IsContainer: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsContainer, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    IsMovable: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsMovable, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    IsYellowHits: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsYellowHits, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    IsFemale: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsFemale, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    GetLayer: (objId) => new ScriptMethod(protocol, METHOD_INDICES.GetLayer, [packUInt32], (buf) => unpackUInt8(buf)).call(objId),
    IsHouse: (objId) => new ScriptMethod(protocol, METHOD_INDICES.IsHouse, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    
    // Item manipulation
    DragItem: (objId, count) => new ScriptMethod(protocol, METHOD_INDICES.DragItem, [packUInt32, packInt32], (buf) => unpackBool(buf)).call(objId, count),
    DropItem: (objId, x, y, z) => new ScriptMethod(protocol, METHOD_INDICES.DropItem, [packUInt32, packInt32, packInt32, packInt32], (buf) => unpackBool(buf)).call(objId, x, y, z),
    OpenDoor: (objId) => new ScriptMethod(protocol, METHOD_INDICES.OpenDoor, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    Bow: () => new ScriptMethod(protocol, METHOD_INDICES.Bow, [], (buf) => unpackUInt32(buf)).call(),
    Salute: () => new ScriptMethod(protocol, METHOD_INDICES.Salute, [], (buf) => unpackUInt32(buf)).call(),
    WearItem: (layer, objId) => new ScriptMethod(protocol, METHOD_INDICES.WearItem, [packUInt8, packUInt32], null).call(layer, objId),
    ObjAtLayerEx: (layer, objId = 0) => new ScriptMethod(protocol, METHOD_INDICES.ObjAtLayerEx, [packUInt8, packUInt32], (buf) => unpackUInt32(buf)).call(layer, objId),
    
    // Movement
    Step: (direction, run = false) => new ScriptMethod(protocol, METHOD_INDICES.Step, [packUInt8, packBool], (buf) => unpackUInt8(buf)).call(direction, run),
    StepQ: (direction, run = false) => new ScriptMethod(protocol, METHOD_INDICES.StepQ, [packUInt8, packBool], (buf) => unpackInt32(buf)).call(direction, run),
    MoveXYZ: (x, y, z, accuracyXY, accuracyZ, running) => new ScriptMethod(protocol, METHOD_INDICES.MoveXYZ, [packUInt16, packUInt16, packInt8, packInt32, packInt32, packBool], (buf) => unpackBool(buf)).call(x, y, z, accuracyXY, accuracyZ, running),
    MoveXY: (x, y, accuracyXY, running, exact) => new ScriptMethod(protocol, METHOD_INDICES.MoveXY, [packUInt16, packUInt16, packInt32, packBool, packBool], (buf) => unpackBool(buf)).call(x, y, accuracyXY, running, exact),
    
    // Helper: CalcDir - calculate direction from one point to another
    CalcDir: (xFrom, yFrom, xTo, yTo) => {
      const dx = Math.abs(xTo - xFrom);
      const dy = Math.abs(yTo - yFrom);
      if (dx === 0 && dy === 0) return 100;
      if ((dx / (dy + 0.1)) >= 2) return xFrom > xTo ? 6 : 2;
      if ((dy / (dx + 0.1)) >= 2) return yFrom > yTo ? 0 : 4;
      if (xFrom > xTo) return yFrom > yTo ? 7 : 5;
      if (xFrom < xTo) return yFrom > yTo ? 1 : 3;
      return 100;
    },
    
    // IsWorldCellPassable - check if cell is passable
    IsWorldCellPassable: (currX, currY, currZ, destX, destY, worldNum) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.IsCellPassable, [packUInt16, packUInt16, packInt8, packUInt16, packUInt16, packUInt8], (buf) => {
        // Returns: bool (1 byte), int8 (1 byte) = 2 bytes total
        return unpackBool(buf);
      });
      return method.call(currX, currY, currZ, destX, destY, worldNum);
    },
    
    // newMoveXYZ and newMoveXY are added after the return object is created
    // (see end of createMethods function)
    
    SetBadLocation: (x, y) => new ScriptMethod(protocol, METHOD_INDICES.SetBadLocation, [packUInt16, packUInt16], null).call(x, y),
    SetGoodLocation: (x, y) => new ScriptMethod(protocol, METHOD_INDICES.SetGoodLocation, [packUInt16, packUInt16], null).call(x, y),
    ClearBadLocationList: () => new ScriptMethod(protocol, METHOD_INDICES.ClearBadLocationList, [], null).call(),
    SetBadObject: (objType, color, radius) => new ScriptMethod(protocol, METHOD_INDICES.SetBadObject, [packUInt16, packUInt16, packUInt8], null).call(objType, color, radius),
    ClearBadObjectList: () => new ScriptMethod(protocol, METHOD_INDICES.ClearBadObjectList, [], (buf) => unpackBool(buf)).call(),
    CheckLOS: (x1, y1, z1, x2, y2, z2, worldNum, flags, objId) => new ScriptMethod(protocol, METHOD_INDICES.CheckLOS, [packUInt16, packUInt16, packInt8, packUInt16, packUInt16, packInt8, packUInt8, packUInt8, packUInt32], (buf) => unpackBool(buf)).call(x1, y1, z1, x2, y2, z2, worldNum, flags, objId),
    
    // Gumps/Menus
    WaitMenu: (caption, prompt) => new ScriptMethod(protocol, METHOD_INDICES.WaitMenu, [packString, packString], (buf) => unpackBool(buf)).call(caption, prompt),
    AutoMenu: (caption, prompt) => new ScriptMethod(protocol, METHOD_INDICES.AutoMenu, [packString, packString], (buf) => unpackBool(buf)).call(caption, prompt),
    MenuPresent: (caption) => new ScriptMethod(protocol, METHOD_INDICES.MenuPresent, [packString], (buf) => unpackBool(buf)).call(caption),
    CancelMenu: () => new ScriptMethod(protocol, METHOD_INDICES.CancelMenu, [], null).call(),
    CloseMenu: () => new ScriptMethod(protocol, METHOD_INDICES.CloseMenu, [], null).call(),
    WaitGump: (gumpId) => new ScriptMethod(protocol, METHOD_INDICES.WaitGump, [packInt32], null).call(gumpId),
    WaitTextEntry: (text) => new ScriptMethod(protocol, METHOD_INDICES.WaitTextEntry, [packString], (buf) => unpackBool(buf)).call(text),
    GumpAutoTextEntry: (entryId, text) => new ScriptMethod(protocol, METHOD_INDICES.GumpAutoTextEntry, [packInt32, packString], (buf) => unpackBool(buf)).call(entryId, text),
    GumpAutoRadiobutton: (groupId, number) => new ScriptMethod(protocol, METHOD_INDICES.GumpAutoRadiobutton, [packInt32, packInt32], (buf) => unpackBool(buf)).call(groupId, number),
    GumpAutoCheckBox: (checkBoxId, state) => new ScriptMethod(protocol, METHOD_INDICES.GumpAutoCheckBox, [packInt32, packInt32], (buf) => unpackBool(buf)).call(checkBoxId, state),
    NumGumpButton: (gumpId, buttonId) => new ScriptMethod(protocol, METHOD_INDICES.NumGumpButton, [packUInt16, packInt32], (buf) => unpackBool(buf)).call(gumpId, buttonId),
    NumGumpTextEntry: (gumpId, entryId, text) => new ScriptMethod(protocol, METHOD_INDICES.NumGumpTextEntry, [packUInt16, packInt32, packString], (buf) => unpackBool(buf)).call(gumpId, entryId, text),
    NumGumpRadiobutton: (gumpId, groupId, number) => new ScriptMethod(protocol, METHOD_INDICES.NumGumpRadiobutton, [packUInt16, packInt32, packInt32], (buf) => unpackBool(buf)).call(gumpId, groupId, number),
    NumGumpCheckBox: (gumpId, checkBoxId, state) => new ScriptMethod(protocol, METHOD_INDICES.NumGumpCheckBox, [packUInt16, packInt32, packInt32], (buf) => unpackBool(buf)).call(gumpId, checkBoxId, state),
    GetGumpsCount: (gumpId) => new ScriptMethod(protocol, METHOD_INDICES.GetGumpsCount, [packUInt16], (buf) => unpackUInt16(buf)).call(gumpId),
    CloseSimpleGump: (gumpIndex) => new ScriptMethod(protocol, METHOD_INDICES.CloseSimpleGump, [packUInt16], (buf) => unpackUInt32(buf)).call(gumpIndex),
    GetGumpSerial: (gumpIndex) => new ScriptMethod(protocol, METHOD_INDICES.GetGumpSerial, [packUInt16], (buf) => unpackUInt32(buf)).call(gumpIndex),
    GetGumpID: (gumpIndex) => new ScriptMethod(protocol, METHOD_INDICES.GetGumpID, [packUInt16], (buf) => unpackUInt32(buf)).call(gumpIndex),
    IsGumpCanBeClosed: (gumpIndex) => new ScriptMethod(protocol, METHOD_INDICES.IsGumpCanBeClosed, [packUInt16], (buf) => unpackBool(buf)).call(gumpIndex),
    
    // Trade
    IsTrade: (tradeWindowNum, itemNum) => new ScriptMethod(protocol, METHOD_INDICES.IsTrade, [packUInt8, packUInt8], (buf) => unpackBool(buf)).call(tradeWindowNum, itemNum),
    GetTradeContainer: (tradeWindowNum, itemNum) => new ScriptMethod(protocol, METHOD_INDICES.GetTradeContainer, [packUInt8, packUInt8], (buf) => unpackUInt32(buf)).call(tradeWindowNum, itemNum),
    GetTradeOpponent: (tradeWindowNum) => new ScriptMethod(protocol, METHOD_INDICES.GetTradeOpponent, [packUInt8], (buf) => unpackUInt32(buf)).call(tradeWindowNum),
    TradeCount: (tradeWindowNum) => new ScriptMethod(protocol, METHOD_INDICES.TradeCount, [packUInt8], (buf) => unpackUInt8(buf)).call(tradeWindowNum),
    GetTradeOpponentName: (tradeWindowNum) => new ScriptMethod(protocol, METHOD_INDICES.GetTradeOpponentName, [packUInt8], (buf) => unpackString(buf)).call(tradeWindowNum),
    TradeCheck: (tradeWindowNum, itemNum) => new ScriptMethod(protocol, METHOD_INDICES.TradeCheck, [packUInt8, packUInt8], (buf) => unpackBool(buf)).call(tradeWindowNum, itemNum),
    ConfirmTrade: (tradeWindowNum) => new ScriptMethod(protocol, METHOD_INDICES.ConfirmTrade, [packUInt8], (buf) => unpackBool(buf)).call(tradeWindowNum),
    CancelTrade: (tradeWindowNum) => new ScriptMethod(protocol, METHOD_INDICES.CancelTrade, [packUInt8], (buf) => unpackBool(buf)).call(tradeWindowNum),
    
    // Communication
    UOSay: (text) => new ScriptMethod(protocol, METHOD_INDICES.UOSay, [packString], null).call(text),
    UOSayColor: (text, color) => new ScriptMethod(protocol, METHOD_INDICES.UOSayColor, [packString, packUInt16], null).call(text, color),
    
    // Party
    InviteToParty: (objId) => new ScriptMethod(protocol, METHOD_INDICES.InviteToParty, [packUInt32], null).call(objId),
    RemoveFromParty: (objId) => new ScriptMethod(protocol, METHOD_INDICES.RemoveFromParty, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    PartySay: (text) => new ScriptMethod(protocol, METHOD_INDICES.PartySay, [packString], (buf) => unpackBool(buf)).call(text),
    PartyCanLootMe: (value) => new ScriptMethod(protocol, METHOD_INDICES.PartyCanLootMe, [packBool], (buf) => unpackBool(buf)).call(value),
    PartyAcceptInvite: () => new ScriptMethod(protocol, METHOD_INDICES.PartyAcceptInvite, [], (buf) => unpackBool(buf)).call(),
    
    // Utilities
    GetConnectedTime: () => {
      const result = new ScriptMethod(protocol, METHOD_INDICES.GetConnectedTime, [], (buf) => unpackDouble(buf)).call();
      return result.then(time => new Date(time * 1000)); // Convert Delphi date to JS Date
    },
    GetDisconnectedTime: () => {
      const result = new ScriptMethod(protocol, METHOD_INDICES.GetDisconnectedTime, [], (buf) => unpackDouble(buf)).call();
      return result.then(time => new Date(time * 1000));
    },
    ChangeProfile: (profileName) => new ScriptMethod(protocol, METHOD_INDICES.ChangeProfile, [packString], (buf) => unpackInt32(buf)).call(profileName),
    ChangeProfileEx: (profileName, shardName, charName) => new ScriptMethod(protocol, METHOD_INDICES.ChangeProfileEx, [packString, packString, packString], (buf) => unpackInt32(buf)).call(profileName, shardName, charName),
    GetARStatus: () => new ScriptMethod(protocol, METHOD_INDICES.GetARStatus, [], (buf) => unpackBool(buf)).call(),
    SetARStatus: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetARStatus, [packBool], null).call(value),
    ProfileShardName: () => new ScriptMethod(protocol, METHOD_INDICES.ProfileShardName, [], (buf) => unpackString(buf)).call(),
    
    // Resistance
    FireResist: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfFireResist, [], (buf) => unpackUInt16(buf)).call(),
    ColdResist: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfColdResist, [], (buf) => unpackUInt16(buf)).call(),
    PoisonResist: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfPoisonResist, [], (buf) => unpackUInt16(buf)).call(),
    EnergyResist: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfEnergyResist, [], (buf) => unpackUInt16(buf)).call(),
    
    // Pets
    MaxPets: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfPetsMax, [], (buf) => unpackUInt8(buf)).call(),
    PetsCurrent: () => new ScriptMethod(protocol, METHOD_INDICES.GetSelfPetsCurrent, [], (buf) => unpackUInt8(buf)).call(),
    
    // Utilities
    GetCharTitle: () => new ScriptMethod(protocol, METHOD_INDICES.GetCharTitle, [], (buf) => unpackString(buf)).call(),
    GetClilocByID: (clilocId) => new ScriptMethod(protocol, METHOD_INDICES.GetClilocByID, [packUInt32], (buf) => unpackString(buf)).call(clilocId),
    GetFoundedParamID: () => new ScriptMethod(protocol, METHOD_INDICES.GetFoundedParamID, [], (buf) => unpackInt32(buf)).call(),
    FindQuantity: (objId) => new ScriptMethod(protocol, METHOD_INDICES.FindQuantity, [packUInt32], (buf) => unpackInt32(buf)).call(objId),
    PredictedDirection: () => new ScriptMethod(protocol, METHOD_INDICES.PredictedDirection, [], (buf) => unpackUInt8(buf)).call(),
    
    // Movement settings
    SetMoveOpenDoor: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveOpenDoor, [packBool], (buf) => unpackBool(buf)).call(value),
    GetMoveOpenDoor: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveOpenDoor, [], (buf) => unpackBool(buf)).call(),
    SetMoveThroughNPC: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveThroughNPC, [packUInt16], (buf) => unpackUInt16(buf)).call(value),
    GetMoveThroughNPC: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveThroughNPC, [], (buf) => unpackUInt16(buf)).call(),
    SetMoveCheckStamina: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveCheckStamina, [packUInt16], (buf) => unpackUInt16(buf)).call(value),
    GetMoveCheckStamina: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveCheckStamina, [], (buf) => unpackUInt16(buf)).call(),
    
    // Advanced targeting
    TargetToTile: (x, y, z, tileType) => new ScriptMethod(protocol, METHOD_INDICES.TargetToTile, [packUInt16, packUInt16, packUInt16, packUInt8], null).call(x, y, z, tileType),
    WaitTargetTile: (x, y, z, tileType) => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetTile, [packUInt16, packUInt16, packUInt16, packUInt8], null).call(x, y, z, tileType),
    WaitTargetXYZ: (x, y, z) => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetXYZ, [packUInt16, packUInt16, packInt8], null).call(x, y, z),
    WaitTargetType: (objType) => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetType, [packUInt16], null).call(objType),
    WaitTargetGround: () => new ScriptMethod(protocol, METHOD_INDICES.WaitTargetGround, [], null).call(),
    
    // Abilities
    UsePrimaryAbility: () => new ScriptMethod(protocol, METHOD_INDICES.UsePrimaryAbility, [], (buf) => unpackString(buf)).call(),
    UseSecondaryAbility: () => new ScriptMethod(protocol, METHOD_INDICES.UseSecondaryAbility, [], (buf) => unpackString(buf)).call(),
    GetAbility: (abilityName) => new ScriptMethod(protocol, METHOD_INDICES.GetAbility, [packString], (buf) => unpackString(buf)).call(abilityName),
    ToggleFly: () => new ScriptMethod(protocol, METHOD_INDICES.ToggleFly, [], (buf) => unpackInt32(buf)).call(),
    
    // Virtues
    ReqVirtuesGump: () => new ScriptMethod(protocol, METHOD_INDICES.ReqVirtuesGump, [], null).call(),
    UseVirtue: (virtueId) => new ScriptMethod(protocol, METHOD_INDICES.UseVirtue, [packUInt32], null).call(virtueId),
    
    // Paperdoll
    UseSelfPaperdollScroll: (objId) => new ScriptMethod(protocol, METHOD_INDICES.UseSelfPaperdollScroll, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    UseOtherPaperdollScroll: (objId) => new ScriptMethod(protocol, METHOD_INDICES.UseOtherPaperdollScroll, [packUInt32], (buf) => unpackUInt32(buf)).call(objId),
    
    // Skill locking
    ChangeSkillLockState: (skillId, lockState) => new ScriptMethod(protocol, METHOD_INDICES.ChangeSkillLockState, [packInt32, packUInt8], (buf) => unpackDouble(buf)).call(skillId, lockState),
    GetSkillLockState: (skillId) => new ScriptMethod(protocol, METHOD_INDICES.GetSkillLockState, [packInt32], (buf) => unpackUInt8(buf)).call(skillId),
    
    // Journal extended
    InJournalBetweenTimes: (text, timeBegin, timeEnd) => {
      // Convert JS Date to Delphi double (seconds since 1899-12-30)
      const ddtBegin = (timeBegin.getTime() / 1000) + 2209161600;
      const ddtEnd = (timeEnd.getTime() / 1000) + 2209161600;
      return new ScriptMethod(protocol, METHOD_INDICES.InJournalBetweenTimes, [packString, packDouble, packDouble], (buf) => unpackInt32(buf)).call(text, ddtBegin, ddtEnd);
    },
    SetJournalLine: (index, text) => new ScriptMethod(protocol, METHOD_INDICES.SetJournalLine, [packUInt32, packString], null).call(index, text),
    AddJournalIgnore: (text) => new ScriptMethod(protocol, METHOD_INDICES.AddJournalIgnore, [packString], null).call(text),
    ClearJournalIgnore: (text) => new ScriptMethod(protocol, METHOD_INDICES.ClearJournalIgnore, [packString], null).call(text),
    AddChatUserIgnore: (name) => new ScriptMethod(protocol, METHOD_INDICES.AddChatUserIgnore, [packString], null).call(name),
    ClearChatUserIgnore: (name) => new ScriptMethod(protocol, METHOD_INDICES.ClearChatUserIgnore, [packString], null).call(name),
    
    // Line methods (for journal lines)
    LineID: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineID, [], (buf) => unpackUInt32(buf)).call(),
    LineType: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineType, [], (buf) => unpackUInt16(buf)).call(),
    LineTime: () => {
      const result = new ScriptMethod(protocol, METHOD_INDICES.GetLineTime, [], (buf) => unpackDouble(buf)).call();
      return result.then(time => new Date(time * 1000));
    },
    LineMsgType: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineMsgType, [], (buf) => unpackUInt8(buf)).call(),
    LineTextColor: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineTextColor, [], (buf) => unpackUInt16(buf)).call(),
    LineTextFont: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineTextFont, [], (buf) => unpackUInt16(buf)).call(),
    LineIndex: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineIndex, [], (buf) => unpackInt32(buf)).call(),
    LineCount: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineCount, [], (buf) => unpackInt32(buf)).call(),
    LineName: () => new ScriptMethod(protocol, METHOD_INDICES.GetLineName, [], (buf) => unpackString(buf)).call(),
    
    // Find extended
    SetFindInNulPoint: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetFindInNulPoint, [packBool], (buf) => unpackBool(buf)).call(value),
    GetFindInNulPoint: () => new ScriptMethod(protocol, METHOD_INDICES.GetFindInNulPoint, [], (buf) => unpackBool(buf)).call(),
    
    // Connection/Profile
    Connect: () => new ScriptMethod(protocol, METHOD_INDICES.Connect, [], (buf) => unpackBool(buf)).call(),
    Disconnect: () => new ScriptMethod(protocol, METHOD_INDICES.Disconnect, [], (buf) => unpackBool(buf)).call(),
    GetPauseScriptOnDisconnectStatus: () => new ScriptMethod(protocol, METHOD_INDICES.GetPauseScriptOnDisconnectStatus, [], (buf) => unpackBool(buf)).call(),
    SetPauseScriptOnDisconnectStatus: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetPauseScriptOnDisconnectStatus, [packBool], null).call(value),
    
    // Proxy
    ProxyIP: () => new ScriptMethod(protocol, METHOD_INDICES.GetProxyIP, [], (buf) => unpackString(buf)).call(),
    ProxyPort: () => new ScriptMethod(protocol, METHOD_INDICES.GetProxyPort, [], (buf) => unpackUInt16(buf)).call(),
    UseProxy: () => new ScriptMethod(protocol, METHOD_INDICES.GetUseProxy, [], (buf) => unpackBool(buf)).call(),
    
    // Extended info
    GetExtInfo: () => {
      // Returns a buffer with extended info - would need parsing based on structure
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetExtInfo, [], (buf) => buf);
      return method.call();
    },
    LastStatus: () => new ScriptMethod(protocol, METHOD_INDICES.GetLastStatus, [], (buf) => unpackUInt32(buf)).call(),
    
    // Client methods
    ClientPrint: (text) => new ScriptMethod(protocol, METHOD_INDICES.ClientPrint, [packString], null).call(text),
    ClientPrintEx: (objId, color, font, text) => new ScriptMethod(protocol, METHOD_INDICES.ClientPrintEx, [packUInt32, packUInt16, packUInt16, packString], null).call(objId, color, font, text),
    
    // System journal extended
    AddToSystemJournalEx: (text, textColor, bgColor, fontSize, fontName) => {
      return new ScriptMethod(protocol, METHOD_INDICES.AddToSystemJournalEx, [packString, packInt32, packInt32, packInt32, packString], null).call(text, textColor, bgColor, fontSize, fontName);
    },
    ClearSystemJournal: () => new ScriptMethod(protocol, METHOD_INDICES.ClearSystemJournal, [], null).call(),
    
    // HTTP
    HTTP_Get: (url) => new ScriptMethod(protocol, METHOD_INDICES.HTTP_Get, [packString], (buf) => unpackString(buf)).call(url),
    HTTP_Post: (url, data) => new ScriptMethod(protocol, METHOD_INDICES.HTTP_Post, [packString, packString], (buf) => unpackString(buf)).call(url, data),
    HTTP_Body: (requestId) => new ScriptMethod(protocol, METHOD_INDICES.HTTP_Body, [packUInt32], (buf) => unpackString(buf)).call(requestId),
    HTTP_Header: (requestId) => new ScriptMethod(protocol, METHOD_INDICES.HTTP_Header, [packUInt32], (buf) => unpackString(buf)).call(requestId),
    
    // Party extended
    PartyMessageTo: (objId, text) => new ScriptMethod(protocol, METHOD_INDICES.PartyMessageTo, [packUInt32, packString], (buf) => unpackBool(buf)).call(objId, text),
    PartyDeclineInvite: (objId) => new ScriptMethod(protocol, METHOD_INDICES.PartyDeclineInvite, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    PartyLeave: () => new ScriptMethod(protocol, METHOD_INDICES.PartyLeave, [], (buf) => unpackBool(buf)).call(),
    InParty: (objId) => new ScriptMethod(protocol, METHOD_INDICES.InParty, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    
    // Game server
    GameServerIPString: () => new ScriptMethod(protocol, METHOD_INDICES.GameServerIPString, [], (buf) => unpackString(buf)).call(),
    
    // Client target
    ClientRequestObjectTarget: () => new ScriptMethod(protocol, METHOD_INDICES.ClientRequestObjectTarget, [], (buf) => unpackBool(buf)).call(),
    ClientRequestTileTarget: () => new ScriptMethod(protocol, METHOD_INDICES.ClientRequestTileTarget, [], (buf) => unpackBool(buf)).call(),
    ClientTargetResponsePresent: () => new ScriptMethod(protocol, METHOD_INDICES.ClientTargetResponsePresent, [], (buf) => unpackBool(buf)).call(),
    
    // Utility
    Alarm: (text) => new ScriptMethod(protocol, METHOD_INDICES.Alarm, [packString], null).call(text),
    SetSilentMode: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetSilentMode, [packBool], null).call(value),
    GetSilentMode: () => new ScriptMethod(protocol, METHOD_INDICES.GetSilentMode, [], (buf) => unpackBool(buf)).call(),
    CheckLag: (value) => new ScriptMethod(protocol, METHOD_INDICES.CheckLag, [packBool], (buf) => unpackBool(buf)).call(value),
    
    // Gump extended
    GetGumpTextLines: (gumpIndex) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetGumpTextLines, [packUInt16], (buf) => buf);
      return method.call(gumpIndex);
    },
    GetGumpFullLines: (gumpIndex) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetGumpFullLines, [packUInt16], (buf) => buf);
      return method.call(gumpIndex);
    },
    GetGumpShortLines: (gumpIndex) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetGumpShortLines, [packUInt16], (buf) => buf);
      return method.call(gumpIndex);
    },
    GetGumpButtonsDescription: (gumpIndex) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetGumpButtonsDescription, [packUInt16], (buf) => buf);
      return method.call(gumpIndex);
    },
    GetGumpInfo: (gumpIndex) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetGumpInfo, [packUInt16], (buf) => buf);
      return method.call(gumpIndex);
    },
    AddGumpIgnoreByID: (gumpId) => new ScriptMethod(protocol, METHOD_INDICES.AddGumpIgnoreByID, [packUInt32], null).call(gumpId),
    AddGumpIgnoreBySerial: (serial) => new ScriptMethod(protocol, METHOD_INDICES.AddGumpIgnoreBySerial, [packUInt32], null).call(serial),
    ClearGumpsIgnore: () => new ScriptMethod(protocol, METHOD_INDICES.ClearGumpsIgnore, [], null).call(),
    
    // Menu
    GetMenu: (caption) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetMenu, [packString], (buf) => buf);
      return method.call(caption);
    },
    GetLastMenu: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetLastMenu, [], (buf) => buf);
      return method.call();
    },
    MenuHookPresent: (caption) => new ScriptMethod(protocol, METHOD_INDICES.MenuHookPresent, [packString], (buf) => unpackBool(buf)).call(caption),
    
    // Trade extended (GetTradeOpponent already defined above in Trade section, removing duplicate)
    
    // Context menu
    RequestContextMenu: (objId) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.RequestContextMenu, [packUInt32], (buf) => buf);
      return method.call(objId);
    },
    GetContextMenu: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetContextMenu, [], (buf) => buf);
      return method.call();
    },
    GetContextMenuRec: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetContextMenuRec, [], (buf) => buf);
      return method.call();
    },
    SetContextMenuHook: (objId, entryId) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.SetContextMenuHook, [packUInt32, packUInt8], (buf) => buf);
      return method.call(objId, entryId);
    },
    ClearContextMenu: (menuId, entryId) => new ScriptMethod(protocol, METHOD_INDICES.ClearContextMenu, [packUInt8, packUInt8], (buf) => unpackBool(buf)).call(menuId, entryId),
    
    // Item pickup/drop
    GetPickupedItem: () => new ScriptMethod(protocol, METHOD_INDICES.GetPickupedItem, [], (buf) => unpackUInt32(buf)).call(),
    SetPickupedItem: (objId) => new ScriptMethod(protocol, METHOD_INDICES.SetPickupedItem, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    GetDropCheckCoord: () => new ScriptMethod(protocol, METHOD_INDICES.GetDropCheckCoord, [], (buf) => unpackBool(buf)).call(),
    SetDropCheckCoord: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetDropCheckCoord, [packBool], (buf) => unpackUInt32(buf)).call(value),
    GetDropDelay: () => new ScriptMethod(protocol, METHOD_INDICES.GetDropDelay, [], (buf) => unpackUInt32(buf)).call(),
    SetDropDelay: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetDropDelay, [packUInt32], (buf) => unpackBool(buf)).call(value),
    
    // Pathfinding
    GetPathArray: (x, y, running, accuracyXY) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetPathArray, [packUInt16, packUInt16, packBool, packInt32], (buf) => buf);
      return method.call(x, y, running, accuracyXY);
    },
    GetPathArray3D: async (x1, y1, z1, x2, y2, z2, worldNum, accuracyXY, accuracyZ, running) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetPathArray3D, [packUInt16, packUInt16, packInt8, packUInt16, packUInt16, packInt8, packUInt8, packInt32, packInt32, packBool], (buf) => buf);
      return await method.call(x1, y1, z1, x2, y2, z2, worldNum, accuracyXY, accuracyZ, running);
    },
    GetNextStepZ: (x1, y1, z1, x2, y2, worldNum, stepZ) => new ScriptMethod(protocol, METHOD_INDICES.GetNextStepZ, [packUInt16, packUInt16, packUInt16, packUInt16, packUInt16, packUInt8, packInt8], (buf) => unpackInt8(buf)).call(x1, y1, z1, x2, y2, worldNum, stepZ),
    
    // Tile/Map
    GetTileFlags: (worldNum, tileType) => new ScriptMethod(protocol, METHOD_INDICES.GetTileFlags, [packUInt8, packUInt16], (buf) => unpackUInt32(buf)).call(worldNum, tileType),
    GetLandTileData: (tileType) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetLandTileData, [packUInt16], (buf) => buf);
      return method.call(tileType);
    },
    GetStaticTileData: (tileType) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetStaticTileData, [packUInt16], (buf) => buf);
      return method.call(tileType);
    },
    GetLayerCount: (x, y, worldNum) => new ScriptMethod(protocol, METHOD_INDICES.GetLayerCount, [packUInt16, packUInt16, packUInt8], (buf) => unpackUInt8(buf)).call(x, y, worldNum),
    ReadStaticsXY: (x, y, worldNum) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.ReadStaticsXY, [packUInt16, packUInt16, packUInt8], (buf) => buf);
      return method.call(x, y, worldNum);
    },
    GetSurfaceZ: (x, y, worldNum) => new ScriptMethod(protocol, METHOD_INDICES.GetSurfaceZ, [packUInt16, packUInt16, packUInt8], (buf) => unpackInt8(buf)).call(x, y, worldNum),
    IsCellPassable: (x1, y1, z1, x2, y2, worldNum) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.IsCellPassable, [packUInt16, packUInt16, packInt8, packUInt16, packUInt16, packUInt8], (buf) => buf);
      return method.call(x1, y1, z1, x2, y2, worldNum);
    },
    GetCell: (x, y, worldNum) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetCell, [packUInt16, packUInt16, packUInt8], (buf) => buf);
      return method.call(x, y, worldNum);
    },
    
    // Movement timers
    SetRunUnmountTimer: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetRunUnmountTimer, [packUInt16], (buf) => unpackUInt16(buf)).call(value),
    SetWalkMountTimer: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetWalkMountTimer, [packUInt16], (buf) => unpackUInt16(buf)).call(value),
    SetRunMountTimer: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetRunMountTimer, [packUInt16], (buf) => unpackUInt16(buf)).call(value),
    SetWalkUnmountTimer: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetWalkUnmountTimer, [packUInt16], (buf) => unpackUInt16(buf)).call(value),
    GetRunMountTimer: () => new ScriptMethod(protocol, METHOD_INDICES.GetRunMountTimer, [], (buf) => unpackUInt16(buf)).call(),
    GetWalkMountTimer: () => new ScriptMethod(protocol, METHOD_INDICES.GetWalkMountTimer, [], (buf) => unpackUInt16(buf)).call(),
    GetRunUnmountTimer: () => new ScriptMethod(protocol, METHOD_INDICES.GetRunUnmountTimer, [], (buf) => unpackUInt16(buf)).call(),
    GetWalkUnmountTimer: () => new ScriptMethod(protocol, METHOD_INDICES.GetWalkUnmountTimer, [], (buf) => unpackUInt16(buf)).call(),
    GetLastStepQUsedDoor: () => new ScriptMethod(protocol, METHOD_INDICES.GetLastStepQUsedDoor, [], (buf) => unpackUInt32(buf)).call(),
    
    // Movement advanced
    SetMoveThroughCorner: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveThroughCorner, [packBool], (buf) => unpackBool(buf)).call(value),
    GetMoveThroughCorner: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveThroughCorner, [], (buf) => unpackBool(buf)).call(),
    SetMoveHeuristicMult: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveHeuristicMult, [packInt32], (buf) => unpackInt32(buf)).call(value),
    GetMoveHeuristicMult: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveHeuristicMult, [], (buf) => unpackInt32(buf)).call(),
    SetMoveTurnCost: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveTurnCost, [packInt32], (buf) => unpackInt32(buf)).call(value),
    GetMoveTurnCost: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveTurnCost, [], (buf) => unpackInt32(buf)).call(),
    SetMoveBetweenTwoCorners: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetMoveBetweenTwoCorners, [packBool], (buf) => unpackBool(buf)).call(value),
    GetMoveBetweenTwoCorners: () => new ScriptMethod(protocol, METHOD_INDICES.GetMoveBetweenTwoCorners, [], (buf) => unpackBool(buf)).call(),
    
    // Dress/Equipment
    GetDressSpeed: () => new ScriptMethod(protocol, METHOD_INDICES.GetDressSpeed, [], (buf) => unpackUInt16(buf)).call(),
    SetDressSpeed: (value) => new ScriptMethod(protocol, METHOD_INDICES.SetDressSpeed, [packUInt16], (buf) => unpackInt32(buf)).call(value),
    SetDress: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.SetDress, [], (buf) => buf);
      return method.call();
    },
    EquipDressSet: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.EquipDressSet, [], (buf) => buf);
      return method.call();
    },
    
    // Shop/AutoBuy
    AutoBuy: (shopNum, itemType, itemColor, quantity) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.AutoBuy, [packUInt16, packUInt16, packUInt16], (buf) => buf);
      return method.call(shopNum, itemType, itemColor);
    },
    AutoBuyEx: (shopNum, itemType, itemColor, quantity, name) => new ScriptMethod(protocol, METHOD_INDICES.AutoBuyEx, [packUInt16, packUInt16, packUInt16, packUInt32, packString], (buf) => unpackUInt16(buf)).call(shopNum, itemType, itemColor, quantity, name),
    GetAutoBuyDelay: (shopNum) => new ScriptMethod(protocol, METHOD_INDICES.GetAutoBuyDelay, [packUInt16], (buf) => unpackUInt16(buf)).call(shopNum),
    SetAutoBuyDelay: (shopNum, value) => new ScriptMethod(protocol, METHOD_INDICES.SetAutoBuyDelay, [packUInt16, packUInt16], (buf) => unpackUInt16(buf)).call(shopNum, value),
    AutoSell: (shopNum, itemType, itemColor, quantity) => new ScriptMethod(protocol, METHOD_INDICES.AutoSell, [packUInt16, packUInt16, packUInt16], (buf) => unpackBool(buf)).call(shopNum, itemType, itemColor),
    GetAutoSellDelay: (shopNum) => new ScriptMethod(protocol, METHOD_INDICES.GetAutoSellDelay, [packUInt16], (buf) => unpackUInt16(buf)).call(shopNum),
    SetAutoSellDelay: (shopNum, value) => new ScriptMethod(protocol, METHOD_INDICES.SetAutoSellDelay, [packUInt16, packUInt16], null).call(shopNum, value),
    
    // Client UI
    CloseClientUIWindow: (windowType, objId) => new ScriptMethod(protocol, METHOD_INDICES.CloseClientUIWindow, [packUInt8, packUInt32], (buf) => unpackBool(buf)).call(windowType, objId),
    CloseClientGump: (gumpId) => new ScriptMethod(protocol, METHOD_INDICES.CloseClientGump, [packUInt32], (buf) => unpackUInt8(buf)).call(gumpId),
    ClientHide: (objId) => new ScriptMethod(protocol, METHOD_INDICES.ClientHide, [packUInt32], (buf) => unpackUInt8(buf)).call(objId),
    ClientTargetResponse: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.ClientTargetResponse, [], (buf) => buf);
      return method.call();
    },
    
    // Quest/Help
    GetQuestArrow: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetQuestArrow, [], (buf) => buf);
      return method.call();
    },
    RequestStats: (objId) => new ScriptMethod(protocol, METHOD_INDICES.RequestStats, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    HelpRequest: (objId) => new ScriptMethod(protocol, METHOD_INDICES.HelpRequest, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    QuestRequest: (objId) => new ScriptMethod(protocol, METHOD_INDICES.QuestRequest, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    RenameMobile: (objId, newName) => new ScriptMethod(protocol, METHOD_INDICES.RenameMobile, [packUInt32, packString], (buf) => unpackBool(buf)).call(objId, newName),
    MobileCanBeRenamed: (objId) => new ScriptMethod(protocol, METHOD_INDICES.MobileCanBeRenamed, [packUInt32], (buf) => unpackBool(buf)).call(objId),
    
    // Stat locking
    SetStatState: (statType, lockState) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.SetStatState, [packUInt8, packUInt8], (buf) => buf);
      return method.call(statType, lockState);
    },
    GetStatLockState: (statType) => new ScriptMethod(protocol, METHOD_INDICES.GetStatLockState, [packUInt8], (buf) => unpackUInt8(buf)).call(statType),
    
    // Stealth info
    GetStealthInfo: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetStealthInfo, [], (buf) => buf);
      return method.call();
    },
    GetClientVersionInt: () => new ScriptMethod(protocol, METHOD_INDICES.GetClientVersionInt, [], (buf) => unpackInt32(buf)).call(),
    
    // Paths
    StealthPath: (pathType, createDir) => new ScriptMethod(protocol, METHOD_INDICES.StealthPath, [packUInt8, packBool], (buf) => unpackString(buf)).call(pathType, createDir),
    GetStealthProfilePath: (profileNum, createDir) => new ScriptMethod(protocol, METHOD_INDICES.GetStealthProfilePath, [packUInt8, packBool], (buf) => unpackString(buf)).call(profileNum, createDir),
    GetShardPath: (shardNum, createDir) => new ScriptMethod(protocol, METHOD_INDICES.GetShardPath, [packUInt8, packBool], (buf) => unpackString(buf)).call(shardNum, createDir),
    
    // Global variables
    SetGlobal: (varType, varName, varValue) => new ScriptMethod(protocol, METHOD_INDICES.SetGlobal, [packUInt8, packString, packString], null).call(varType, varName, varValue),
    
    // Multi
    GetMultis: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetMultis, [], (buf) => buf);
      return method.call();
    },
    ClearInfoWindow: () => new ScriptMethod(protocol, METHOD_INDICES.ClearInfoWindow, [], null).call(),
    
    // Buff bar
    GetBuffBarInfo: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetBuffBarInfo, [], (buf) => buf);
      return method.call();
    },
    
    // FindTypesArrayEx
    FindTypesArrayEx: (objTypes, colors, containers, inSub) => {
      // Need to pack arrays - simplified for now
      const method = new ScriptMethod(protocol, METHOD_INDICES.FindTypesArrayEx, [], (buf) => unpackUInt32(buf));
      return method.call();
    },
    
    // Bandage
    BandageSelf: () => new ScriptMethod(protocol, METHOD_INDICES.BandageSelf, [], null).call(),
    
    // Use item on mobile
    UseItemOnMobile: (itemId, targetId) => new ScriptMethod(protocol, METHOD_INDICES.UseItemOnMobile, [packUInt32, packUInt32], null).call(itemId, targetId),
    
    // Global chat
    GlobalChatJoinChannel: (channelName) => new ScriptMethod(protocol, METHOD_INDICES.GlobalChatJoinChannel, [packString], null).call(channelName),
    GlobalChatLeaveChannel: () => new ScriptMethod(protocol, METHOD_INDICES.GlobalChatLeaveChannel, [], null).call(),
    GlobalChatSendMsg: (text) => new ScriptMethod(protocol, METHOD_INDICES.GlobalChatSendMsg, [packString], null).call(text),
    GlobalChatActiveChannel: () => new ScriptMethod(protocol, METHOD_INDICES.GlobalChatActiveChannel, [], (buf) => unpackString(buf)).call(),
    GlobalChatChannelsList: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GlobalChatChannelsList, [], (buf) => buf);
      return method.call();
    },
    
    // Menu items extended
    GetMenuItemsEx: (caption) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetMenuItemsEx, [packString], (buf) => buf);
      return method.call(caption);
    },
    
    // Equipment macros
    UnequipItemsSetMacro: () => new ScriptMethod(protocol, METHOD_INDICES.UnequipItemsSetMacro, [], null).call(),
    EquipItemsSetMacro: () => new ScriptMethod(protocol, METHOD_INDICES.EquipItemsSetMacro, [], null).call(),
    
    // Stop mover
    StopMover: () => new ScriptMethod(protocol, METHOD_INDICES.StopMover, [], null).call(),
    
    // AR extended params
    SetARExtParams: (shardName, charName, useAtEveryConnect) => new ScriptMethod(protocol, METHOD_INDICES.SetARExtParams, [packString, packString, packBool], null).call(shardName, charName, useAtEveryConnect),
    
    // Convert integer to flags
    ConvertIntegerToFlags: (group, flags) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.ConvertIntegerToFlags, [packUInt8, packUInt32], (buf) => buf);
      return method.call(group, flags);
    },
    
    // Party extended
    PartyMembersList: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.PartyMembersList, [], (buf) => {
        const count = unpackUInt32(buf, 0);
        const items = [];
        let offset = 4;
        for (let i = 0; i < count; i++) {
          items.push(unpackUInt32(buf, offset));
          offset += 4;
        }
        return items;
      });
      return method.call();
    },
    
    // ICQ
    ICQConnected: () => new ScriptMethod(protocol, METHOD_INDICES.ICQConnected, [], (buf) => unpackBool(buf)).call(),
    ICQConnect: (uin, password) => new ScriptMethod(protocol, METHOD_INDICES.ICQConnect, [packUInt32, packString], null).call(uin, password),
    ICQDisconnect: () => new ScriptMethod(protocol, METHOD_INDICES.ICQDisconnect, [], (buf) => unpackBool(buf)).call(),
    ICQSetStatus: (statusNum) => new ScriptMethod(protocol, METHOD_INDICES.ICQSetStatus, [packUInt8], (buf) => unpackBool(buf)).call(statusNum),
    ICQSetXStatus: (statusNum) => new ScriptMethod(protocol, METHOD_INDICES.ICQSetXStatus, [packUInt8], (buf) => unpackBool(buf)).call(statusNum),
    ICQSendText: (uin, text) => new ScriptMethod(protocol, METHOD_INDICES.ICQSendText, [packUInt32, packString], (buf) => unpackBool(buf)).call(uin, text),
    
    // Messenger
    MessengerGetConnected: (messengerNum) => new ScriptMethod(protocol, METHOD_INDICES.MessengerGetConnected, [packUInt8], (buf) => unpackBool(buf)).call(messengerNum),
    MessengerSetConnected: (messengerNum, value) => new ScriptMethod(protocol, METHOD_INDICES.MessengerSetConnected, [packUInt8, packBool], null).call(messengerNum, value),
    MessengerGetToken: (messengerNum) => new ScriptMethod(protocol, METHOD_INDICES.MessengerGetToken, [packUInt8], (buf) => unpackString(buf)).call(messengerNum),
    MessengerSetToken: (messengerNum, token) => new ScriptMethod(protocol, METHOD_INDICES.MessengerSetToken, [packUInt8, packString], null).call(messengerNum, token),
    MessengerGetName: (messengerNum) => new ScriptMethod(protocol, METHOD_INDICES.MessengerGetName, [packUInt8], (buf) => unpackString(buf)).call(messengerNum),
    MessengerSendMessage: (messengerNum, recipient, message) => new ScriptMethod(protocol, METHOD_INDICES.MessengerSendMessage, [packUInt8, packString, packString], (buf) => unpackUInt32(buf)).call(messengerNum, recipient, message),
    
    // Missing methods
    SetEventProc: (eventIndex) => new ScriptMethod(protocol, METHOD_INDICES.SetEventProc, [packUInt8], null).call(eventIndex),
    ClearEventProc: (eventIndex) => new ScriptMethod(protocol, METHOD_INDICES.ClearEventProc, [packUInt8], null).call(eventIndex),
    GetStaticArtBitmap: (id, hue) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetStaticArtBitmap, [packUInt16, packUInt16], (buf) => buf);
      return method.call(id, hue);
    },
    PrintScriptMethodsList: (fileName, sortedList) => new ScriptMethod(protocol, METHOD_INDICES.PrintScriptMethodsList, [packString, packBool], null).call(fileName, sortedList),
    FillNewWindow: (text) => new ScriptMethod(protocol, METHOD_INDICES.FillNewWindow, [packString], null).call(text),
    AddToJournal: (msg) => new ScriptMethod(protocol, METHOD_INDICES.AddToJournal, [packString], null).call(msg),
    ConsoleEntryUnicodeReply: (text) => new ScriptMethod(protocol, METHOD_INDICES.ConsoleEntryUnicodeReply, [packString], null).call(text),
    GetStaticsArray: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetStaticsArray, [], (buf) => buf);
      return method.call();
    },
    GetLandsArray: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetLandsArray, [], (buf) => buf);
      return method.call();
    },
    GetShopList: () => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetShopList, [], (buf) => {
        const count = unpackUInt32(buf, 0);
        const items = [];
        let offset = 4;
        for (let i = 0; i < count; i++) {
          const strLen = unpackUInt32(buf, offset);
          offset += 4;
          items.push(buf.slice(offset, offset + strLen).toString('utf8').replace(/\0/g, ''));
          offset += strLen;
        }
        return items;
      });
      return method.call();
    },
    ClearShopList: () => new ScriptMethod(protocol, METHOD_INDICES.ClearShopList, [], null).call(),
    GetToolTipRec: (objId) => {
      const method = new ScriptMethod(protocol, METHOD_INDICES.GetToolTipRec, [packUInt32], (buf) => buf);
      return method.call(objId);
    },
    GetSkillCurrentValue: async (skillName) => {
      // GetSkillCurrentValue uses skill name, but internally needs skill ID
      const skillId = await new ScriptMethod(protocol, METHOD_INDICES.GetSkillID, [packString], (buf) => unpackInt32(buf)).call(skillName);
      return new ScriptMethod(protocol, METHOD_INDICES.GetSkillCurrentValue, [packInt32], (buf) => unpackDouble(buf)).call(skillId);
    },
    
    // Export instances for batch operations (access via getRawMethods())
    _instances: methodInstances,
  };
  
  // Fix circular references for newMoveXYZ and newMoveXY
  // They need to reference other methods in the returned object
  const methods = returnObj;
  methods.newMoveXYZ = async function(x, y, z, accuracyXY, accuracyZ, running, callback) {
    // Import unpackers
    const { unpackUInt32, unpackUInt16, unpackInt8 } = await import('./datatypes.js');
    const Wait = methods.Wait;
    const Connected = methods.Connected;
    const PredictedX = methods.PredictedX;
    const PredictedY = methods.PredictedY;
    const PredictedZ = methods.PredictedZ;
    const PredictedDirection = methods.PredictedDirection;
    const WorldNum = methods.WorldNum;
    const Dead = methods.Dead;
    const Stam = methods.Stam;
    const GetMoveCheckStamina = methods.GetMoveCheckStamina;
    const GetPathArray3D = methods.GetPathArray3D;
    const StepQ = methods.StepQ;
    const IsWorldCellPassable = methods.IsWorldCellPassable;
    const CalcDir = methods.CalcDir;
    
    const step = async (dir, run) => {
      while (true) {
        const stepResult = await StepQ(dir, run);
        if (stepResult === -2 || stepResult >= 0) {
          return stepResult >= 0;
        }
        await Wait(10);
      }
    };
    
    let findPath = true;
    let path = [];
    let maxIterations = 10000; // Safety limit to prevent infinite loops
    let iterations = 0;
    
    while (iterations < maxIterations) {
      iterations++;
      // Pause while not connected
      while (!(await Connected())) {
        await Wait(100);
      }
      
      // Try to find a path if required
      if (findPath) {
        findPath = false;
        const startX = await PredictedX();
        const startY = await PredictedY();
        const startZ = await PredictedZ();
        const worldNum = await WorldNum();
        
        try {
          const pathData = await GetPathArray3D(startX, startY, startZ, x, y, z, worldNum, accuracyXY, accuracyZ, running);
          
          // Parse path buffer: uint32 count, then array of [uint16, uint16, int8]
          if (!pathData || !Buffer.isBuffer(pathData) || pathData.length < 4) {
            return false;
          }
          
          const count = unpackUInt32(pathData, 0);
          path = [];
          let offset = 4;
          
          // Each point is 5 bytes (2 + 2 + 1), check we have enough data
          if (pathData.length < 4 + (count * 5)) {
            return false;
          }
          
          for (let i = 0; i < count; i++) {
            const px = unpackUInt16(pathData, offset);
            const py = unpackUInt16(pathData, offset + 2);
            const pz = unpackInt8(pathData, offset + 4);
            path.push([px, py, pz]);
            offset += 5; // 2 bytes + 2 bytes + 1 byte
          }
          
          if (path.length <= 0) {
            return false;
          }
        } catch (error) {
          // If GetPathArray3D fails, return false
          return false;
        }
      }
      
      // Check path passability for a few steps
      let cx = await PredictedX();
      let cy = await PredictedY();
      let cz = await PredictedZ();
      const worldNum = await WorldNum();
      
      for (let i = 0; i < 4 && i < path.length; i++) {
        const [px, py, pz] = path[i];
        const passable = await IsWorldCellPassable(cx, cy, cz, px, py, worldNum);
        if (passable) {
          cx = px;
          cy = py;
          cz = pz;
        } else {
          findPath = true;
          break;
        }
      }
      
      if (findPath) continue;
      
      // Stamina check
      if (!(await Dead()) && (await Stam()) < (await GetMoveCheckStamina())) {
        await Wait(100);
      }
      
      // Walk
      const mx = await PredictedX();
      const my = await PredictedY();
      const [px, py, pz] = path.shift();
      const dx = mx - px;
      const dy = my - py;
      const dir = CalcDir(mx, my, px, py);
      
      // Check if something is wrong
      if ((dx === 0 && dy === 0) || (Math.abs(dx) > 1 || Math.abs(dy) > 1) || dir === 100) {
        findPath = true;
        continue;
      }
      
      // Try to turn if required
      const currentDir = await PredictedDirection();
      if (currentDir !== dir) {
        if (!(await step(dir, running))) {
          findPath = true;
          continue;
        }
      }
      
      // Try to do a step
      if (!(await step(dir, running))) {
        findPath = true;
        continue;
      }
      
      // Call callback if provided
      if (callback && typeof callback === 'function') {
        const shouldContinue = await callback(px, py, pz);
        if (shouldContinue === false) {
          return false;
        }
      }
      
      // Check if path is complete
      if (path.length === 0) {
        const finalX = await PredictedX();
        const finalY = await PredictedY();
        if (Math.abs(finalX - x) <= accuracyXY && Math.abs(finalY - y) <= accuracyXY) {
          return true;
        }
        findPath = true;
      }
    }
    
    // If we exit the loop due to max iterations, return false
    return false;
  };
  
  methods.newMoveXY = async function(x, y, optimized, accuracy, running) {
    // newMoveXY calls MoveXYZ with Z=0, AccuracyZ=255 (NOT newMoveXYZ - that's the pathfinding version)
    return await methods.MoveXYZ(x, y, 0, accuracy, 255, running);
  };
  
  return returnObj;
}
