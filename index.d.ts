/// <reference path="./dist/types/global.d.ts" />
// Export types and constants only - functions come from global declarations  
export type { Layer, Direction, DirectionValue, Notoriety, SpellName, SkillName, EventName } from './dist/index.js';
export { LAYERS, DIRECTIONS, NOTORIETY, SPELLS, SKILL_NAMES, EVENTS, METHOD_INDICES, getSpellId } from './dist/index.js';

