
export type Language = 'en' | 'zh';

export enum GameState {
  START = 'START',
  INTRO = 'INTRO',
  EXPLORE = 'EXPLORE',
  COMBAT = 'COMBAT',
  DIALOGUE = 'DIALOGUE',
  ENDING = 'ENDING',
  GAME_OVER = 'GAME_OVER',
}

export enum StatType {
  HP = 'HP',
  ATK = 'ATK',
  DEF = 'DEF',
  DODGE = 'DODGE',
  CRIT_RATE = 'CRIT_RATE',
  CRIT_DMG = 'CRIT_DMG',
}

export type NodeType = 'COMBAT' | 'EVENT' | 'BOSS';

export interface MapNode {
  id: string;
  layer: number; // 0 (Start) to 4 (Boss)
  type: NodeType;
  status: 'LOCKED' | 'AVAILABLE' | 'CLEARED' | 'SKIPPED';
  nextNodes: string[]; // IDs of connected nodes in next layer
  x: number; // For visual rendering (0-100%)
  y: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  stats: Partial<Record<StatType, number>>;
  isEquipped: boolean;
}

export interface Player {
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  dodge: number;
  critRate: number;
  critDmg: number;
  luck: number; // New Luck Attribute
  exp: number;
  level: number;
  inventory: Item[];
  runesCollected: number; // 0 to 6
  currentZone: number; // 1 to 6
  explorationsInCurrentZone: number; // Track searches in current zone
  bossLocated: boolean; // Has the boss been found?
  truthScore: number; // Hidden stat for true ending
}

export interface Enemy {
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  atk: number;
  isBoss: boolean;
  isFinalBoss?: boolean; // New flag for True Ending boss
  dropRate: number; // 0-1
}

export interface GameLog {
  id: string;
  text: string;
  type: 'info' | 'combat' | 'gain' | 'danger' | 'narrative';
}

export interface Choice {
  text: string;
  actionId: string;
}

export interface Scenario {
  description: string;
  choices: Choice[];
  enemy?: Enemy;
  isBossEncounter?: boolean;
}

export const INITIAL_PLAYER: Player = {
  maxHp: 100,
  currentHp: 100,
  atk: 10,
  def: 5,
  dodge: 0.05,
  critRate: 0.1,
  critDmg: 1.5,
  luck: 0,
  exp: 0,
  level: 1,
  inventory: [],
  runesCollected: 0,
  currentZone: 1,
  explorationsInCurrentZone: 0,
  bossLocated: false,
  truthScore: 0,
};
