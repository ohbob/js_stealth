import { LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId } from './constants.js';
export { LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId };
export type { Layer, Direction, DirectionValue, Notoriety, SpellName, SkillName, EventName } from './constants.js';
export declare function ensureConnected(): Promise<any>;
export declare function connect(host?: any, port?: any): Promise<void>;
export declare function on(event: any, callback: any): Promise<void>;
export declare function disconnect(): Promise<void>;
export declare const Self: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetX: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetY: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetType: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetHP: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMana: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStam: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetQuantity: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDistance: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetColor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClickOnObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Wait: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Str: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Int: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Dex: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HP: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Mana: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Stam: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Connected: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare function Ground(): number;
export declare const SetFindDistance: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindType: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindTypeEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetFindedList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetAltName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetTitle: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetTooltip: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStr: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetInt: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDex: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMaxHP: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMaxMana: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMaxStam: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetPrice: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDirection: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsObjectExists: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseType: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseFromGround: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Attack: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MaxHP: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MaxMana: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MaxStam: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Gold: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Weight: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MaxWeight: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Armor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Luck: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Race: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Sex: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WorldNum: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CharName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Backpack: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ShardName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ProfileName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Hidden: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Poisoned: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Paralyzed: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Dead: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WarMode: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetWarMode: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WarTargetID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TargetID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TargetPresent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TargetCursor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitForTarget: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CancelTarget: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TargetToObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TargetToXYZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetSelf: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetLast: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CancelWaitTarget: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LastTarget: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LastAttack: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LastContainer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LastObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PredictedX: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PredictedY: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PredictedZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetFindDistance: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetFindVertical: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetFindVertical: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindNotoriety: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindAtCoord: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindItem: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindCount: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindFullQuantity: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Ignore: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IgnoreOff: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IgnoreReset: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetIgnoreList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const InJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LastJournalMessage: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Journal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LowJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HighJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddToSystemJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseSkill: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseSkillID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSkillValue: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSkillCap: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSkillID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Cast: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CastToObj: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CastToObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CastToSelf: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CastSelf: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CastSpell: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsActiveSpellAbility: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetCatchBag: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UnsetCatchBag: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetNotoriety: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetParent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsNPC: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsDead: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsRunning: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsContainer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsMovable: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsYellowHits: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsFemale: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetLayer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsHouse: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const DragItem: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const DropItem: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const OpenDoor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Bow: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Salute: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WearItem: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ObjAtLayerEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Step: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const StepQ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MoveXYZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MoveXY: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const newMoveXY: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const newMoveXYZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetBadLocation: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetGoodLocation: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearBadLocationList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetBadObject: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearBadObjectList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CheckLOS: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AutoMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MenuPresent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CancelMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CloseMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitGump: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTextEntry: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GumpAutoTextEntry: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GumpAutoRadiobutton: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GumpAutoCheckBox: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const NumGumpButton: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const NumGumpTextEntry: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const NumGumpRadiobutton: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const NumGumpCheckBox: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpsCount: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CloseSimpleGump: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpSerial: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsGumpCanBeClosed: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsTrade: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetTradeContainer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetTradeOpponent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TradeCount: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetTradeOpponentName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TradeCheck: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ConfirmTrade: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CancelTrade: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UOSay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UOSayColor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const InviteToParty: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const RemoveFromParty: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartySay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartyCanLootMe: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartyAcceptInvite: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FireResist: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ColdResist: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PoisonResist: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const EnergyResist: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MaxPets: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PetsCurrent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetConnectedTime: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDisconnectedTime: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ChangeProfile: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ChangeProfileEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetARStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetARStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ProfileShardName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetCharTitle: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetClilocByID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetFoundedParamID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindQuantity: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PredictedDirection: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveOpenDoor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveOpenDoor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveThroughNPC: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveThroughNPC: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveCheckStamina: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveCheckStamina: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const TargetToTile: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetTile: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetXYZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetType: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const WaitTargetGround: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UsePrimaryAbility: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseSecondaryAbility: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetAbility: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ToggleFly: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ReqVirtuesGump: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseVirtue: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseSelfPaperdollScroll: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseOtherPaperdollScroll: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ChangeSkillLockState: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSkillLockState: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const InJournalBetweenTimes: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetJournalLine: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddJournalIgnore: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearJournalIgnore: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddChatUserIgnore: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearChatUserIgnore: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineType: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineTime: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineMsgType: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineTextColor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineTextFont: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineIndex: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineCount: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LineName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetFindInNulPoint: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetFindInNulPoint: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Connect: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Disconnect: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetPauseScriptOnDisconnectStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetPauseScriptOnDisconnectStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ProxyIP: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ProxyPort: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseProxy: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetExtInfo: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const LastStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientPrint: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientPrintEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddToSystemJournalEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearSystemJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HTTP_Get: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HTTP_Post: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HTTP_Body: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HTTP_Header: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartyMessageTo: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartyDeclineInvite: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartyLeave: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const InParty: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GameServerIPString: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientRequestObjectTarget: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientRequestTileTarget: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientTargetResponsePresent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const Alarm: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetSilentMode: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSilentMode: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CheckLag: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpTextLines: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpFullLines: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpShortLines: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpButtonsDescription: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetGumpInfo: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddGumpIgnoreByID: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddGumpIgnoreBySerial: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearGumpsIgnore: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetLastMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MenuHookPresent: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const RequestContextMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetContextMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetContextMenuRec: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetContextMenuHook: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearContextMenu: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetPickupedItem: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetPickupedItem: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDropCheckCoord: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetDropCheckCoord: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDropDelay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetDropDelay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetPathArray: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetPathArray3D: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetNextStepZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetTileFlags: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetLandTileData: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStaticTileData: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetLayerCount: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ReadStaticsXY: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSurfaceZ: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const IsCellPassable: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetCell: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetRunUnmountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetWalkMountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetRunMountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetWalkUnmountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetRunMountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetWalkMountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetRunUnmountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetWalkUnmountTimer: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetLastStepQUsedDoor: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveThroughCorner: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveThroughCorner: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveHeuristicMult: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveHeuristicMult: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveTurnCost: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveTurnCost: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetMoveBetweenTwoCorners: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMoveBetweenTwoCorners: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetDressSpeed: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetDressSpeed: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetDress: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const EquipDressSet: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AutoBuy: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AutoBuyEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetAutoBuyDelay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetAutoBuyDelay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AutoSell: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetAutoSellDelay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetAutoSellDelay: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CloseClientUIWindow: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const CloseClientGump: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientHide: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClientTargetResponse: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetQuestArrow: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const RequestStats: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const HelpRequest: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const QuestRequest: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const RenameMobile: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MobileCanBeRenamed: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetStatState: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStatLockState: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStealthInfo: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetClientVersionInt: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const StealthPath: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStealthProfilePath: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetShardPath: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetGlobal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMultis: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearInfoWindow: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetBuffBarInfo: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FindTypesArrayEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const BandageSelf: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UseItemOnMobile: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GlobalChatJoinChannel: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GlobalChatLeaveChannel: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GlobalChatSendMsg: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GlobalChatActiveChannel: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GlobalChatChannelsList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetMenuItemsEx: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const UnequipItemsSetMacro: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const EquipItemsSetMacro: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const StopMover: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetARExtParams: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ConvertIntegerToFlags: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PartyMembersList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ICQConnected: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ICQConnect: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ICQDisconnect: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ICQSetStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ICQSetXStatus: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ICQSendText: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MessengerGetConnected: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MessengerSetConnected: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MessengerGetToken: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MessengerSetToken: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MessengerGetName: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const MessengerSendMessage: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const SetEventProc: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearEventProc: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStaticArtBitmap: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const PrintScriptMethodsList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const FillNewWindow: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const AddToJournal: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ConsoleEntryUnicodeReply: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetStaticsArray: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetLandsArray: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetShopList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const ClearShopList: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetToolTipRec: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare const GetSkillCurrentValue: {
    (...args: any[]): Promise<any>;
    _methodName: any;
};
export declare function getRawMethods(): any;
export declare function getConnectionState(): {
    HOST: string;
    PORT: any;
    connectionPool: any[];
    protocol: any;
    methodsRaw: any;
};
export declare function closeConnectionPool(): Promise<void>;
export declare const config: {
    HOST: string;
    PORT: any;
};
export declare const parallel: typeof import("./methodscustom.js").parallel;
export declare const parallel_items: typeof import("./methodscustom.js").parallel_items;
export declare const FindProps: typeof import("./methodscustom.js").FindProps;
export declare const Find: typeof import("./methodscustom.js").Find;
