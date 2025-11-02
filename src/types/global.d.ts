// Global type declarations for auto-imported functions
// This file is automatically included by TypeScript/IDEs
// It declares global functions available after: import './js_stealth';

declare global {
  // Spell and skill type aliases (inline for global scope)
  type SpellName =
    | 'clumsy' | 'create food' | 'feeblemind' | 'heal' | 'magic arrow' | 'night sight' | 'reactive armor' | 'weaken'
    | 'agility' | 'cunning' | 'cure' | 'harm' | 'magic trap' | 'magic untrap' | 'protection' | 'strength'
    | 'bless' | 'fireball' | 'magic lock' | 'poison' | 'telekinesis' | 'teleport' | 'unlock' | 'wall of stone'
    | 'arch cure' | 'arch protection' | 'curse' | 'fire field' | 'greater heal' | 'lightning' | 'mana drain' | 'recall'
    | 'blade spirit' | 'dispel field' | 'incognito' | 'magic reflection' | 'spell reflection' | 'mind blast' | 'paralyze' | 'poison field' | 'summon creature'
    | 'dispel' | 'energy bolt' | 'explosion' | 'invisibility' | 'mark' | 'mass curse' | 'paralyze field' | 'reveal'
    | 'chain lightning' | 'energy field' | 'flame strike' | 'gate travel' | 'mana vampire' | 'mass dispel' | 'meteor swarm' | 'polymorph'
    | 'earthquake' | 'energy vortex' | 'resurrection' | 'summon air elemental' | 'summon daemon' | 'summon earth elemental' | 'summon fire elemental' | 'summon water elemental'
    | 'animate dead' | 'blood oath' | 'corpse skin' | 'curse weapon' | 'evil omen' | 'horrific beast' | 'lich form' | 'mind rot' | 'pain spike' | 'poison strike' | 'strangle' | 'summon familiar' | 'vampiric embrace' | 'vengeful spirit' | 'wither' | 'wraith form' | 'exorcism'
    | 'cleanse by fire' | 'close wounds' | 'consecrate weapon' | 'dispel evil' | 'divine fury' | 'enemy of one' | 'holy light' | 'noble sacrifice' | 'remove curse' | 'sacred journey'
    | 'confidence' | 'counter attack' | 'evasion' | 'honorable execution' | 'lightning strike' | 'momentum strike'
    | 'animal form' | 'backstab' | 'death strike' | 'focus attack' | 'ki attack' | 'mirror image' | 'shadow jump' | 'surprise attack'
    | 'arcane circle' | 'arcane empowerment' | 'attune weapon' | 'dryad allure' | 'essence of wind' | 'ethereal voyage' | 'gift of life' | 'gift of renewal' | 'immolating weapon' | 'mana phantasm' | 'nature\'s fury' | 'reaper form' | 'rising colossus' | 'soul seeker' | 'summon fey' | 'summon fiend' | 'thunderstorm' | 'wildfire' | 'word of death'
    | 'animated weapon' | 'bombard' | 'cleansing winds' | 'eagle strike' | 'enchant' | 'healing stone' | 'hail storm' | 'mass sleep' | 'nether bolt' | 'purge magic' | 'sleep' | 'spell plague' | 'stone form' | 'spell trigger' | 'spellweaving';

  type SkillName =
    | 'alchemy' | 'anatomy' | 'archery' | 'arms lore' | 'fencing' | 'healing' | 'mace fighting' | 'parrying' | 'swordsmanship' | 'tactics' | 'wrestling'
    | 'magery' | 'necromancy' | 'chivalry' | 'bushido' | 'ninjitsu' | 'spellweaving' | 'mysticism' | 'evaluating intelligence' | 'meditation' | 'resisting spells' | 'spirit speak'
    | 'discordance' | 'musicianship' | 'peacemaking' | 'provocation'
    | 'blacksmithy' | 'bowcraft' | 'fletching' | 'carpentry' | 'cooking' | 'inscription' | 'tailoring' | 'tinkering' | 'imbuing' | 'glassblowing' | 'masonry'
    | 'animal lore' | 'animal taming' | 'camping' | 'fishing' | 'herding' | 'lumberjacking' | 'mining' | 'tracking' | 'veterinary'
    | 'detect hidden' | 'hiding' | 'lockpicking' | 'poisoning' | 'remove trap' | 'snooping' | 'stealing' | 'stealth'
    | 'begging' | 'cartography' | 'focus' | 'forensic evaluation' | 'item identification' | 'taste identification' | 'throwing';

  type Direction = 'North' | 'Northeast' | 'East' | 'Southeast' | 'South' | 'Southwest' | 'West' | 'Northwest';
  type DirectionValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  type Notoriety = 1 | 2 | 3 | 4 | 5 | 6 | 7;
  type Layer = 0x01 | 0x02 | 0x03 | 0x04 | 0x05 | 0x06 | 0x07 | 0x08 | 0x09 | 0x0A | 0x0B | 0x0C | 0x0D | 0x0E | 0x10;
  
  // Connection
  function connect(host?: string | null, port?: number | null): Promise<void>;
  function disconnect(): Promise<void>;
  function on(event: string, callback: (...args: any[]) => void): void;

  // Basic
  function Self(): Promise<number>;
  function GetX(ObjID: number): Promise<number>;
  function GetY(ObjID: number): Promise<number>;
  function GetZ(ObjID: number): Promise<number>;
  function GetType(ObjID: number): Promise<number>;
  function GetName(ObjID: number): Promise<string>;
  function GetHP(ObjID: number): Promise<number>;
  function GetMana(ObjID: number): Promise<number>;
  function GetStam(ObjID: number): Promise<number>;
  function GetQuantity(ObjID: number): Promise<number>;
  function GetDistance(ObjID: number): Promise<number>;
  function GetColor(ObjID: number): Promise<number>;
  function ClickOnObject(ObjectID: number): Promise<void>;
  function Wait(WaitTimeMS: number): Promise<void>;
  function Str(): Promise<number>;
  function Int(): Promise<number>;
  function Dex(): Promise<number>;
  function HP(): Promise<number>;
  function Mana(): Promise<number>;
  function Stam(): Promise<number>;
  function Connected(): Promise<boolean>;
  function Ground(): number;
  function SetFindDistance(Value: number): Promise<void>;
  // ObjType can be number or hex format (e.g., 401 or 0x0191)
  // Color can be number or hex format (e.g., 65535 or 0xFFFF)
  // Container can be number, hex, or result of Ground()/Backpack() (e.g., 0, 0x40000000, Ground())
  function FindType(ObjType: number, Container?: number | null): Promise<number[]>;
  function FindTypeEx(ObjType: number, Color: number, Container?: number, InSub?: boolean): Promise<number[]>;
  function GetFindedList(): Promise<number[]>;

  // Targeting
  function TargetID(): Promise<number>;
  function TargetPresent(): Promise<boolean>;
  function WaitForTarget(MaxWaitTimeMS: number): Promise<boolean>;
  function CancelTarget(): Promise<void>;
  function TargetToObject(ObjectID: number): Promise<void>;
  function TargetToXYZ(X: number, Y: number, Z: number): Promise<void>;
  function WaitTargetObject(ObjID: number): Promise<void>;
  function WaitTargetSelf(): Promise<void>;
  function WaitTargetLast(): Promise<string>;
  function CancelWaitTarget(): Promise<void>;
  function LastTarget(): Promise<number>;
  function LastAttack(): Promise<number>;
  function LastContainer(): Promise<number>;
  function LastObject(): Promise<number>;
  function PredictedX(): Promise<number>;
  function PredictedY(): Promise<number>;
  function PredictedZ(): Promise<number>;

  // Combat
  function SetWarMode(Value: boolean): Promise<void>;
  function WarTargetID(): Promise<number>;

  // Journal
  function InJournal(Str: string): Promise<number>;
  function LastJournalMessage(): Promise<string>;
  function Journal(StringIndex: number): Promise<string>;
  function LowJournal(): Promise<number>;
  function HighJournal(): Promise<number>;
  function ClearJournal(): Promise<void>;
  function AddToSystemJournal(Text: string): Promise<void>;

  // Object status
  function GetNotoriety(ObjID: number): Promise<Notoriety>;
  function GetParent(ObjID: number): Promise<number>;
  function IsNPC(ObjID: number): Promise<boolean>;
  function IsDead(ObjID: number): Promise<boolean>;
  function IsRunning(ObjID: number): Promise<boolean>;
  function IsContainer(ObjID: number): Promise<boolean>;
  function IsMovable(ObjID: number): Promise<boolean>;
  function IsYellowHits(ObjID: number): Promise<boolean>;
  function IsFemale(ObjID: number): Promise<boolean>;
  function GetLayer(ObjID: number): Promise<Layer>;
  function IsHouse(ObjID: number): Promise<boolean>;

  // Item manipulation
  function DragItem(ItemID: number, Count: number): Promise<boolean>;
  function DropItem(MoveIntoID: number, X: number, Y: number, Z: number): Promise<boolean>;
  function OpenDoor(ObjID: number): Promise<number>;
  function Bow(): Promise<number>;
  function Salute(): Promise<number>;
  function WearItem(Layer: Layer | number, Obj: number): Promise<void>;
  function ObjAtLayerEx(LayerType: Layer | number, PlayerID?: number): Promise<number>;

  // Parallel
  function parallel(commands: Array<[Function, ...any[]] | Function | Promise<any>>, numConnections?: number): Promise<any[]>;
  function parallel_items(items: number[], operations: Function[], numConnections?: number): Promise<Array<{ id: number; data: any[] }>>;
  function FindProps(items: (number | { id: number; [key: string]: any })[], operations: Function[], keys?: string[], numConnections?: number): Promise<Array<{ id: number; [key: string]: any }>>;
        // Find items and get their properties in one call
        // objTypes/objType: Can be number or hex format (e.g., 401, 0x0191, [401, 0x0191])
        // colors/color: Can be number or hex format (e.g., 65535, 0xFFFF, [0xFFFF, 0x0000])
        // containers/container: Can be number, hex, or result of Ground()/Backpack() (e.g., 0, 0x40000000, Ground())
        // filters: Optional function or array of functions to filter results (item => boolean)
        //   All filters must return true for an item to be included (AND logic)
        //   Example: filters: [(item) => item.hp > 0 && item.distance < 1000]
        function Find(options: {
          objTypes?: number[]; // e.g., [401, 0x0191] or [0x0191, 0x190] - numbers or hex format
          objType?: number; // e.g., 401 or 0x0191 - number or hex format
          colors?: number[]; // e.g., [65535, 0xFFFF] or [0xFFFF, 0x0000] - numbers or hex format
          color?: number; // e.g., 65535 or 0xFFFF - number or hex format
          containers?: number[]; // e.g., [0, Ground()] or [0x40000000] - numbers, hex, or function results
          container?: number; // e.g., 0, Ground(), or 0x40000000 - number, hex, or function result
          inSub?: boolean;
          operations: Function[];
          keys?: string[];
          numConnections?: number;
          filters?: ((item: { id: number; [key: string]: any }) => boolean) | Array<(item: { id: number; [key: string]: any }) => boolean>; // Filter functions applied after getting properties
        }): Promise<Array<{ id: number; [key: string]: any }>>;

  // Movement
  function Step(Direction: Direction | DirectionValue, Running?: boolean): Promise<number>;
  function StepQ(Direction: Direction | DirectionValue, Running?: boolean): Promise<number>;
  function MoveXY(Xdst: number, Ydst: number, AccuracyXY: number, Running: boolean, Exact?: boolean): Promise<boolean>;
  function MoveXYZ(Xdst: number, Ydst: number, Zdst: number, AccuracyXY: number, AccuracyZ: number, Running: boolean): Promise<boolean>;
  function newMoveXY(Xdst: number, Ydst: number, Optimized: number, Accuracy: number, Running: boolean): Promise<boolean>;
  function newMoveXYZ(Xdst: number, Ydst: number, Zdst: number, AccuracyXY: number, AccuracyZ: number, Running: boolean, Callback?: Function): Promise<boolean>;
  function CalcDir(Xfrom: number, Yfrom: number, Xto: number, Yto: number): DirectionValue;

  // Spells
  function Cast(SpellName: SpellName, ObjID?: number | null): Promise<boolean>;
  function CastToObj(SpellName: SpellName, ObjID: number): Promise<boolean>;
  function CastToSelf(SpellName: SpellName): Promise<boolean>;
  function CastSelf(SpellName: SpellName): Promise<boolean>;
  function IsActiveSpellAbility(SpellName: SpellName | number): Promise<boolean>;

  // Skills
  function UseSkill(SkillName: SkillName | number): Promise<boolean>;
  function UseSkillID(SkillID: number): Promise<boolean>;
  function GetSkillValue(SkillName: SkillName | number): Promise<number>;
  function GetSkillCap(SkillName: SkillName | number): Promise<number>;
  function GetSkillID(SkillName: SkillName): Promise<number>;
  function GetSkillCurrentValue(SkillName: SkillName | number): Promise<number>;
  function GetSkillLockState(SkillID: number): Promise<number>;
  function ChangeSkillLockState(SkillName: SkillName | number, SkillState: number): Promise<void>;

  // Shop/AutoBuy
  function AutoBuy(ItemType: number, ItemColor: number, Quantity: number): Promise<void>;
  function AutoBuyEx(ItemType: number, ItemColor: number, Quantity: number, Price: number, ItemName: string): Promise<number>;
  function GetAutoBuyDelay(ShopNum: number): Promise<number>;
  function SetAutoBuyDelay(ShopNum: number, Value: number): Promise<number>;
  function AutoSell(ShopNum: number, ItemType: number, ItemColor: number): Promise<boolean>;
  function GetAutoSellDelay(ShopNum: number): Promise<number>;
  function SetAutoSellDelay(ShopNum: number, Value: number): Promise<void>;
  function GetShopList(): Promise<string[]>;
  function ClearShopList(): Promise<void>;

  // Gumps/Menus
  function WaitMenu(MenuCaption: string, ElementCaption: string): Promise<string>;
  function AutoMenu(MenuCaption: string, ElementCaption: string): Promise<string>;
  function MenuPresent(MenuCaption?: string): Promise<boolean>;
  function CancelMenu(): Promise<void>;
  function CloseMenu(): Promise<void>;
  function WaitGump(Value: number): Promise<boolean>;
  function WaitTextEntry(Value: string): Promise<boolean>;
  function GumpAutoTextEntry(TextEntryID: number, Value: string): Promise<void>;
  function GumpAutoRadiobutton(RadiobuttonID: number, Value: number): Promise<void>;
  function GumpAutoCheckBox(CBID: number, Value: number): Promise<void>;
  function NumGumpButton(GumpIndex: number, Value: number): Promise<boolean>;
  function NumGumpTextEntry(GumpIndex: number, TextEntryID: number, Value: string): Promise<boolean>;
  function NumGumpRadiobutton(GumpIndex: number, RadiobuttonID: number, Value: number): Promise<boolean>;
  function NumGumpCheckBox(GumpIndex: number, CBID: number, Value: number): Promise<boolean>;
  function GetGumpsCount(GumpIndex?: number): Promise<number>;
  function CloseSimpleGump(GumpIndex: number): Promise<void>;
  function GetGumpSerial(GumpIndex: number): Promise<number>;
  function GetGumpID(GumpIndex: number): Promise<number>;
  function IsGumpCanBeClosed(GumpIndex: number): Promise<boolean>;
  function GetGumpTextLines(GumpIndex: number): Promise<string[]>;
  function GetGumpFullLines(GumpIndex: number): Promise<string[]>;
  function GetGumpShortLines(GumpIndex: number): Promise<string[]>;
  function GetGumpButtonsDescription(GumpIndex: number): Promise<any>;
  function GetGumpInfo(GumpIndex: number): Promise<any>;
  function AddGumpIgnoreByID(ID: number): Promise<void>;
  function AddGumpIgnoreBySerial(Serial: number): Promise<void>;
  function ClearGumpsIgnore(): Promise<void>;

  // Additional object methods
  function GetAltName(ObjectID: number): Promise<string>;
  function GetTitle(ObjID: number): Promise<string>;
  function GetTooltip(ObjID: number): Promise<string>;
  function GetStr(ObjID: number): Promise<number>;
  function GetInt(ObjID: number): Promise<number>;
  function GetDex(ObjID: number): Promise<number>;
  function GetMaxHP(ObjID: number): Promise<number>;
  function GetMaxMana(ObjID: number): Promise<number>;
  function GetMaxStam(ObjID: number): Promise<number>;
  function GetPrice(ObjID: number): Promise<number>;
  function GetDirection(ObjID: number): Promise<DirectionValue>;
  function IsObjectExists(ObjID: number): Promise<boolean>;

  // Actions
  function UseObject(ObjectID: number): Promise<void>;
  // ObjType can be number or hex format (e.g., 401 or 0x0191)
  // Color can be number or hex format (e.g., 65535 or 0xFFFF)
  function UseType(ObjType: number, Color?: number): Promise<boolean>;
  function UseFromGround(ObjType: number, Color?: number): Promise<boolean>;
  function Attack(AttackedID: number): Promise<void>;

  // Self stats
  function MaxHP(): Promise<number>;
  function MaxMana(): Promise<number>;
  function MaxStam(): Promise<number>;
  function Gold(): Promise<number>;
  function Weight(): Promise<number>;
  function MaxWeight(): Promise<number>;
  function Armor(): Promise<number>;
  function Luck(): Promise<number>;
  function Race(): Promise<number>;
  function Sex(): Promise<number>;
  function WorldNum(): Promise<number>;
  function CharName(): Promise<string>;
  function Backpack(): Promise<number>;
  function ShardName(): Promise<string>;
  function ProfileName(): Promise<string>;

  // Status
  function Hidden(): Promise<boolean>;
  function Poisoned(): Promise<boolean>;
  function Paralyzed(): Promise<boolean>;
  function Dead(): Promise<boolean>;
  function WarMode(): Promise<boolean>;

  // Targeting extended
  function TargetCursor(): Promise<boolean>;
  function TargetToTile(TileModel: number, X: number, Y: number, Z: number): Promise<void>;
  function WaitTargetTile(Tile: number, X: number, Y: number, Z: number): Promise<void>;
  function WaitTargetXYZ(X: number, Y: number, Z: number): Promise<void>;
  // ObjType can be number or hex format (e.g., 401 or 0x0191)
  function WaitTargetType(ObjType: number): Promise<void>;
  function WaitTargetGround(ObjType: number): Promise<void>;

  // Finding extended
  function GetFindVertical(): Promise<number>;
  function SetFindVertical(Value: number): Promise<void>;
  // ObjType can be number or hex format (e.g., 401 or 0x0191)
  function FindNotoriety(ObjType: number, Notoriety: Notoriety): Promise<number[]>;
  function FindAtCoord(X: number, Y: number): Promise<number[]>;
  function FindItem(): Promise<number>;
  function FindCount(): Promise<number>;
  function FindFullQuantity(ObjID: number): Promise<number>;
  function Ignore(ObjID: number): Promise<void>;
  function IgnoreOff(ObjID: number): Promise<void>;
  function IgnoreReset(): Promise<void>;
  function GetIgnoreList(): Promise<number[]>;
  function SetFindInNulPoint(Value: boolean): Promise<void>;
  function GetFindInNulPoint(): Promise<boolean>;
  function FindQuantity(ObjID: number): Promise<number>;
  // ObjTypes array can contain numbers or hex format (e.g., [401, 0x0191])
  // Colors array can contain numbers or hex format (e.g., [65535, 0xFFFF])
  // Containers array can contain numbers, hex, or function results (e.g., [0, Ground()])
  function FindTypesArrayEx(ObjTypes: number[], Colors: number[], Containers: number[], InSub: boolean): Promise<number[]>;

  // Container/Item
  function SetCatchBag(ObjectID: number): Promise<void>;
  function UnsetCatchBag(): Promise<void>;

  // Movement extended
  function SetBadLocation(X: number, Y: number): Promise<void>;
  function SetGoodLocation(X: number, Y: number): Promise<void>;
  function ClearBadLocationList(): Promise<void>;
  // Type can be number or hex format (e.g., 401 or 0x0191)
  // Color can be number or hex format (e.g., 65535 or 0xFFFF)
  function SetBadObject(Type: number, Color: number, Radius: number): Promise<void>;
  function ClearBadObjectList(): Promise<void>;
  function CheckLOS(xf: number, yf: number, zf: number, xt: number, yt: number, zt: number, WorldNum: number, LOSCheckType: number, LOSOptions: number): Promise<boolean>;
  function SetMoveOpenDoor(Value: boolean): Promise<void>;
  function GetMoveOpenDoor(): Promise<boolean>;
  function SetMoveThroughNPC(Value: boolean): Promise<void>;
  function GetMoveThroughNPC(): Promise<boolean>;
  function SetMoveCheckStamina(Value: boolean): Promise<void>;
  function GetMoveCheckStamina(): Promise<boolean>;
  function SetMoveThroughCorner(Value: boolean): Promise<void>;
  function GetMoveThroughCorner(): Promise<boolean>;
  function SetMoveHeuristicMult(Value: number): Promise<void>;
  function GetMoveHeuristicMult(): Promise<number>;
  function SetMoveTurnCost(Value: number): Promise<void>;
  function GetMoveTurnCost(): Promise<number>;
  function SetMoveBetweenTwoCorners(Value: boolean): Promise<void>;
  function GetMoveBetweenTwoCorners(): Promise<boolean>;
  function PredictedDirection(): Promise<DirectionValue>;
  function GetPathArray(DestX: number, DestY: number, Optimized: boolean, Accuracy: number): Promise<number[]>;
  function GetPathArray3D(StartX: number, StartY: number, StartZ: number, FinishX: number, FinishY: number, FinishZ: number, WorldNum: number, AccuracyXY: number, AccuracyZ: number, Run: boolean): Promise<number[]>;
  function GetNextStepZ(CurrX: number, CurrY: number, DestX: number, DestY: number, WorldNum: number, CurrZ: number): Promise<number>;
  function StopMover(): Promise<void>;

  // Communication
  function UOSay(Text: string): Promise<void>;
  function UOSayColor(Text: string, Color: number): Promise<void>;

  // Party
  function InviteToParty(ID: number): Promise<void>;
  function RemoveFromParty(ID: number): Promise<void>;
  function PartySay(Msg: string): Promise<void>;
  function PartyCanLootMe(Value: boolean): Promise<void>;
  function PartyAcceptInvite(): Promise<void>;
  function PartyMessageTo(ID: number, Msg: string): Promise<void>;
  function PartyDeclineInvite(ObjID: number): Promise<void>;
  function PartyLeave(): Promise<void>;
  function InParty(ObjID: number): Promise<boolean>;
  function PartyMembersList(): Promise<number[]>;

  // Resistance
  function FireResist(): Promise<number>;
  function ColdResist(): Promise<number>;
  function PoisonResist(): Promise<number>;
  function EnergyResist(): Promise<number>;

  // Pets
  function MaxPets(): Promise<number>;
  function PetsCurrent(): Promise<number>;

  // Trade
  function IsTrade(TradeNum: number, Num: number): Promise<boolean>;
  function GetTradeContainer(TradeNum: number, Num: number): Promise<number>;
  function GetTradeOpponent(TradeNum: number): Promise<number>;
  function TradeCount(TradeNum: number): Promise<number>;
  function GetTradeOpponentName(TradeNum: number): Promise<string>;
  function TradeCheck(TradeNum: number, Num: number): Promise<void>;
  function ConfirmTrade(TradeNum: number): Promise<void>;
  function CancelTrade(TradeNum: number): Promise<void>;

  // Journal extended
  function InJournalBetweenTimes(Str: string, TimeBegin: number, TimeEnd: number): Promise<number>;
  function SetJournalLine(StringIndex: number, Text: string): Promise<void>;
  function AddJournalIgnore(Str: string): Promise<void>;
  function ClearJournalIgnore(Str: string): Promise<void>;
  function AddChatUserIgnore(User: string): Promise<void>;
  function ClearChatUserIgnore(User: string): Promise<void>;
  function AddToSystemJournalEx(value: string, textcolor?: number, bgcolor?: number, fontsize?: number, fontname?: string): Promise<void>;
  function ClearSystemJournal(): Promise<void>;

  // Line methods
  function LineID(): Promise<number>;
  function LineType(): Promise<number>;
  function LineTime(): Promise<Date>;
  function LineMsgType(): Promise<number>;
  function LineTextColor(): Promise<number>;
  function LineTextFont(): Promise<number>;
  function LineIndex(): Promise<number>;
  function LineCount(): Promise<number>;
  function LineName(): Promise<string>;

  // Utilities
  function GetConnectedTime(): Promise<number>;
  function GetDisconnectedTime(): Promise<number>;
  function ChangeProfile(PName: string): Promise<void>;
  function ChangeProfileEx(PName: string, ShardName: string, CharName: string): Promise<void>;
  function GetARStatus(): Promise<boolean>;
  function SetARStatus(Value: boolean): Promise<void>;
  function ProfileShardName(): Promise<string>;
  function GetCharTitle(): Promise<string>;
  function GetClilocByID(ClilocID: number): Promise<string>;
  function GetFoundedParamID(): Promise<number>;
  function GetStealthInfo(): Promise<any>;
  function GetClientVersionInt(): Promise<number>;
  function StealthPath(pathType: number, createDir: boolean): Promise<string>;
  function GetStealthProfilePath(profileNum: number, createDir: boolean): Promise<string>;
  function GetShardPath(shardNum: number, createDir: boolean): Promise<string>;
  function SetGlobal(GlobalRegion: string, VarName: string, VarValue: any): Promise<void>;
  function GetGlobal(GlobalRegion: string, VarName: string): Promise<any>;
  function Alarm(Text?: string): Promise<void>;
  function SetSilentMode(Value: boolean): Promise<void>;
  function GetSilentMode(): Promise<boolean>;
  function CheckLag(timeoutMS?: number): Promise<boolean>;
  function ClientPrint(Text: string): Promise<void>;
  function ClientPrintEx(SenderID: number, Color: number, Font: number, Text: string): Promise<void>;
  function ProxyIP(): Promise<string>;
  function ProxyPort(): Promise<number>;
  function UseProxy(): Promise<boolean>;
  function GetExtInfo(): Promise<any>;
  function LastStatus(): Promise<any>;
  function GameServerIPString(): Promise<string>;
  function ClientRequestObjectTarget(): Promise<void>;
  function ClientRequestTileTarget(): Promise<void>;
  function ClientTargetResponsePresent(): Promise<boolean>;
  function ClientTargetResponse(): Promise<any>;

  // Abilities
  function UsePrimaryAbility(): Promise<boolean>;
  function UseSecondaryAbility(): Promise<boolean>;
  function GetAbility(AbilityName: string): Promise<number>;
  function ToggleFly(): Promise<void>;

  // Virtues
  function ReqVirtuesGump(): Promise<void>;
  function UseVirtue(VirtueName: string): Promise<void>;

  // Paperdoll
  function UseSelfPaperdollScroll(ObjID?: number): Promise<void>;
  function UseOtherPaperdollScroll(ID: number): Promise<void>;

  // Stat locking
  function SetStatState(statNum: number, statState: number): Promise<void>;
  function GetStatLockState(StatId: number): Promise<number>;

  // Quest/Help
  function GetQuestArrow(): Promise<boolean>;
  function RequestStats(ObjID: number): Promise<void>;
  function HelpRequest(ObjID?: number): Promise<void>;
  function QuestRequest(ObjID?: number): Promise<void>;
  function RenameMobile(Mob_ID: number, NewName: string): Promise<void>;
  function MobileCanBeRenamed(Mob_ID: number): Promise<boolean>;

  // Menu
  function GetMenu(MenuCaption: string): Promise<any>;
  function GetLastMenu(): Promise<any>;
  function MenuHookPresent(MenuCaption?: string): Promise<boolean>;
  function GetMenuItemsEx(MenuCaption: string): Promise<any>;

  // Context menu
  function RequestContextMenu(ID: number): Promise<void>;
  function GetContextMenu(): Promise<any>;
  function GetContextMenuRec(): Promise<any>;
  function SetContextMenuHook(MenuID: number, EntryNumber: number): Promise<void>;
  function ClearContextMenu(MenuID: number, EntryID: number): Promise<void>;

  // Item pickup/drop
  function GetPickupedItem(): Promise<number>;
  function SetPickupedItem(ID: number): Promise<void>;
  function GetDropCheckCoord(): Promise<boolean>;
  function SetDropCheckCoord(Value: boolean): Promise<void>;
  function GetDropDelay(): Promise<number>;
  function SetDropDelay(Value: number): Promise<void>;

  // Tile/Map
  function GetTileFlags(TileGroup: string | number, Tile: number): Promise<number>;
  function GetLandTileData(Tile: number): Promise<any>;
  function GetStaticTileData(Tile: number): Promise<any>;
  function GetLayerCount(X: number, Y: number, WorldNum: number): Promise<number>;
  function ReadStaticsXY(X: number, Y: number, WorldNum: number): Promise<any>;
  function GetSurfaceZ(X: number, Y: number, WorldNum: number): Promise<number>;
  function IsCellPassable(CurrX: number, CurrY: number, CurrZ: number, DestX: number, DestY: number, WorldNum: number): Promise<boolean>;
  function GetCell(X: number, Y: number, WorldNum: number): Promise<any>;
  function GetStaticsArray(Xmin: number, Ymin: number, Xmax: number, Ymax: number, WorldNum: number, TileTypes: number[]): Promise<any>;
  function GetLandsArray(Xmin: number, Ymin: number, Xmax: number, Ymax: number, WorldNum: number, TileTypes: number[]): Promise<any>;

  // Movement timers
  function SetRunUnmountTimer(Value: number): Promise<void>;
  function SetWalkMountTimer(Value: number): Promise<void>;
  function SetRunMountTimer(Value: number): Promise<void>;
  function SetWalkUnmountTimer(Value: number): Promise<void>;
  function GetRunMountTimer(): Promise<number>;
  function GetWalkMountTimer(): Promise<number>;
  function GetRunUnmountTimer(): Promise<number>;
  function GetWalkUnmountTimer(): Promise<number>;
  function GetLastStepQUsedDoor(): Promise<number>;

  // Dress/Equipment
  function GetDressSpeed(): Promise<number>;
  function SetDressSpeed(Value: number): Promise<void>;
  function SetDress(): Promise<void>;
  function EquipDressSet(): Promise<void>;
  function UnequipItemsSetMacro(): Promise<void>;
  function EquipItemsSetMacro(): Promise<void>;

  // Client UI
  function CloseClientUIWindow(UIWindowType: string | number, ID: number): Promise<boolean>;
  function CloseClientGump(ID: number): Promise<boolean>;
  function ClientHide(ID: number): Promise<void>;

  // Multi
  function GetMultis(): Promise<any>;
  function ClearInfoWindow(): Promise<void>;

  // Buff bar
  function GetBuffBarInfo(): Promise<any>;

  // Bandage
  function BandageSelf(): Promise<boolean>;

  // Use item on mobile
  function UseItemOnMobile(ItemSerial: number, TargetSerial: number): Promise<void>;

  // Global chat
  function GlobalChatJoinChannel(ChName: string): Promise<void>;
  function GlobalChatLeaveChannel(): Promise<void>;
  function GlobalChatSendMsg(MsgText: string): Promise<void>;
  function GlobalChatActiveChannel(): Promise<string>;
  function GlobalChatChannelsList(): Promise<string[]>;

  // HTTP
  function HTTP_Get(URL: string): Promise<number>;
  function HTTP_Post(URL: string, PostData: string): Promise<number>;
  function HTTP_Body(RequestId?: number): Promise<string>;
  function HTTP_Header(RequestId?: number): Promise<string>;

  // Connection/Profile
  function Connect(): Promise<void>;
  function Disconnect(): Promise<void>;
  function GetPauseScriptOnDisconnectStatus(): Promise<boolean>;
  function SetPauseScriptOnDisconnectStatus(Value: boolean): Promise<void>;

  // AR extended params
  function SetARExtParams(ShardName: string, CharName: string, UseAtEveryConnect: boolean): Promise<void>;

  // Convert integer to flags
  function ConvertIntegerToFlags(Group: string | number, Flags: number): Promise<any>;

  // ICQ
  function ICQConnected(): Promise<boolean>;
  function ICQConnect(UIN: number, Password: string): Promise<void>;
  function ICQDisconnect(): Promise<void>;
  function ICQSetStatus(Num: number): Promise<void>;
  function ICQSetXStatus(Num: number): Promise<void>;
  function ICQSendText(DestinationUIN: number, Text: string): Promise<void>;

  // Messenger
  function MessengerGetConnected(MesID: string | number): Promise<boolean>;
  function MessengerSetConnected(MesID: string | number, Value: boolean): Promise<void>;
  function MessengerGetToken(MesID: string | number): Promise<string>;
  function MessengerSetToken(MesID: string | number, Value: string): Promise<void>;
  function MessengerGetName(MesID: string | number): Promise<string>;
  function MessengerSendMessage(MesID: string | number, UserID: string, Msg: string): Promise<void>;

  // Tooltip
  function GetToolTipRec(ObjID: number): Promise<any>;

  // Constants
  const DIRECTIONS: {
    readonly North: 0;
    readonly Northeast: 1;
    readonly East: 2;
    readonly Southeast: 3;
    readonly South: 4;
    readonly Southwest: 5;
    readonly West: 6;
    readonly Northwest: 7;
  };

  // Config
  interface Config {
    HOST: string;
    PORT: number | null;
  }
  const config: Config;
}

export {};
