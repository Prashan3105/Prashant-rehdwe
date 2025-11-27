export enum GameMode {
  WATER = 'WATER',
  BALL = 'BALL',
}

export enum GameDifficulty {
  KIDS = 'KIDS',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXTREME = 'EXTREME',
}

export enum Screen {
  MENU = 'MENU',
  GAME = 'GAME',
  SHOP = 'SHOP',
  LEVEL_SELECT = 'LEVEL_SELECT',
  MINI_GAMES = 'MINI_GAMES',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE',
  SPIN_WHEEL = 'SPIN_WHEEL',
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  tubeStyle: 'glass' | 'minimal' | 'neon';
  ballStyle: 'solid' | 'gradient' | 'pattern' | 'emoji';
  containerShape: 'tube' | 'flask' | 'cup' | 'potion';
  price: number;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'HINT' | 'UNDO' | 'TUBE';
  amount: number;
  price: number;
  icon: string;
  description: string;
}

export interface LevelData {
  id: number;
  tubeCount: number;
  colors: string[];
  initialState: string[][];
}

export interface PlayerSettings {
  sound: boolean;
  music: boolean;
  haptics: boolean;
  colorBlindMode: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number; 
  type: 'LEVEL' | 'COIN' | 'COMBO';
}

export interface PlayerStats {
  totalWins: number;
  perfectWins: number;
  totalMoves: number;
  highestCombo: number;
  gamesPlayed: number;
}

export interface DailyMission {
  id: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: number;
  type: 'WIN_LEVEL' | 'USE_NO_UNDO' | 'EARN_COINS' | 'PLAY_CHALLENGE';
}

export interface PlayerProgress {
  coins: number;
  currentLevel: number;
  unlockedThemes: string[];
  achievements: string[];
  inventory: {
    undo: number;
    hint: number;
    extraTube: number;
  };
  highScores: Record<string, number>;
  settings: PlayerSettings;
  lastClaimedDate?: string;
  avatarId: string;
  stats: PlayerStats;
  activeMissions: DailyMission[];
  missionDate?: string;
  winStreak: number;
}

export interface Move {
  from: number;
  to: number;
  color: string;
  count: number;
}