
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
  SPIN_WHEEL = 'SPIN_WHEEL', // New Screen
}

export interface Theme {
  id: string;
  name: string;
  background: string; // CSS background property
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
  colors: string[]; // Hex codes involved
  initialState: string[][]; // Array of tubes, each tube is array of color IDs
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
  perfectWins: number; // Won with 0 undos
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
  achievements: string[]; // IDs of unlocked achievements
  inventory: {
    undo: number;
    hint: number;
    extraTube: number;
  };
  highScores: Record<string, number>; // mode -> score
  settings: PlayerSettings;
  lastClaimedDate?: string; // ISO Date string YYYY-MM-DD
  
  // New Fields
  avatarId: string;
  stats: PlayerStats;
  activeMissions: DailyMission[];
  missionDate?: string; // To track when missions were generated
  winStreak: number; // Current consecutive wins
}

export interface Move {
  from: number;
  to: number;
  color: string;
  count: number;
}
