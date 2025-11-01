// Global type declarations for auto-imported functions
// This file is automatically included by TypeScript/IDEs
// It declares global functions available after: import './js_stealth';

/// <reference path="./types.d.ts" />

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
  // Connection
  function connect(host?: string | null, port?: number | null): Promise<void>;
  function disconnect(): Promise<void>;
  function on(event: string, callback: (...args: any[]) => void): void;

  // Basic
  function Self(): Promise<number>;
  function GetX(objId: number): Promise<number>;
  function GetY(objId: number): Promise<number>;
  function GetZ(objId: number): Promise<number>;
  function GetType(objId: number): Promise<number>;
  function GetName(objId: number): Promise<string>;
  function GetHP(objId: number): Promise<number>;
  function GetMana(objId: number): Promise<number>;
  function GetStam(objId: number): Promise<number>;
  function GetQuantity(objId: number): Promise<number>;
  function GetDistance(objId: number): Promise<number>;
  function GetColor(objId: number): Promise<number>;
  function ClickOnObject(objId: number): Promise<void>;
  function Wait(ms: number): Promise<void>;
  function Str(): Promise<number>;
  function Int(): Promise<number>;
  function Dex(): Promise<number>;
  function HP(): Promise<number>;
  function Mana(): Promise<number>;
  function Stam(): Promise<number>;
  function Connected(): Promise<boolean>;
  function Ground(): number;
  function SetFindDistance(value: number): Promise<void>;
  function FindType(objType: number, container?: number | null): Promise<number[]>;
  function FindTypeEx(objType: number, color: number, container?: number, inSub?: boolean): Promise<number[]>;
  function GetFindedList(): Promise<number[]>;

  // Parallel
  function parallel(commands: Array<[Function, ...any[]] | Function | Promise<any>>, numConnections?: number): Promise<any[]>;
  function parallel_items(items: number[], operations: Function[], numConnections?: number): Promise<Array<{ id: number; data: any[] }>>;

  // Movement
  function MoveXY(x: number, y: number, accuracyXY: number, running: boolean, exact?: boolean): Promise<boolean>;
  function MoveXYZ(x: number, y: number, z: number, accuracyXY: number, accuracyZ: number, running: boolean): Promise<boolean>;
  function newMoveXY(x: number, y: number, optimized: number, accuracy: number, running: boolean): Promise<boolean>;
  function newMoveXYZ(x: number, y: number, z: number, accuracyXY: number, accuracyZ: number, running: boolean, callback?: Function): Promise<boolean>;

  // Spells
  function Cast(spellName: SpellName, objId?: number | null): Promise<boolean>;
  function CastToObj(spellName: SpellName, objId: number): Promise<boolean>;
  function CastToSelf(spellName: SpellName): Promise<boolean>;
  function CastSelf(spellName: SpellName): Promise<boolean>;
  function IsActiveSpellAbility(spellNameOrId: SpellName | number): Promise<boolean>;

  // Skills
  function UseSkill(skillNameOrId: SkillName | number): Promise<boolean>;
  function GetSkillValue(skillNameOrId: SkillName | number): Promise<number>;
  function GetSkillCap(skillNameOrId: SkillName | number): Promise<number>;
  function GetSkillID(skillName: SkillName): Promise<number>;

  // Config
  interface Config {
    HOST: string;
    PORT: number | null;
  }
  const config: Config;
}

// This export is required for declare global to work in a module
export {};

