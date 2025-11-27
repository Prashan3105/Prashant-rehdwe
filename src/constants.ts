import { Theme, PlayerProgress, Achievement, ShopItem, DailyMission } from './types';

export const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4', 
  '#84cc16', '#6366f1', '#14b8a6', '#d946ef', '#cbd5e1', '#854d0e', '#9f1239', '#1e40af',
];

export const THEMES: Theme[] = [
  { id: 'default_dark', name: 'Midnight', background: 'linear-gradient(to bottom, #0f172a, #1e293b)', tubeStyle: 'glass', ballStyle: 'gradient', containerShape: 'tube', price: 0 },
  { id: 'neon_city', name: 'Cyberpunk', background: 'linear-gradient(to bottom right, #2e022d, #0f172a)', tubeStyle: 'neon', ballStyle: 'solid', containerShape: 'flask', price: 500 },
  { id: 'nature', name: 'Forest', background: 'linear-gradient(to top, #14532d, #166534)', tubeStyle: 'minimal', ballStyle: 'pattern', containerShape: 'cup', price: 1000 },
  { id: 'candy', name: 'Sweet Tooth', background: 'radial-gradient(circle, #fbcfe8, #f472b6)', tubeStyle: 'glass', ballStyle: 'emoji', containerShape: 'potion', price: 1500 },
  { id: 'ocean', name: 'Ocean Deep', background: 'linear-gradient(to bottom, #000046, #1cb5e0)', tubeStyle: 'glass', ballStyle: 'gradient', containerShape: 'flask', price: 2000 },
  { id: 'sunset', name: 'Sunset Vibes', background: 'linear-gradient(to bottom, #ff4e50, #f9d423)', tubeStyle: 'minimal', ballStyle: 'solid', containerShape: 'tube', price: 2500 }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hint_x5', name: 'Hint Bundle', type: 'HINT', amount: 5, price: 200, icon: '💡', description: '5 AI Hints' },
  { id: 'undo_x10', name: 'Undo Pack', type: 'UNDO', amount: 10, price: 150, icon: '↩️', description: '10 Undos' },
  { id: 'tube_x3', name: 'Tube Pack', type: 'TUBE', amount: 3, price: 300, icon: '🧪', description: '3 Extra Tubes' },
  { id: 'mega_bundle', name: 'Mega Bundle', type: 'HINT', amount: 20, price: 500, icon: '🎁', description: '20 Hints + Bonus' }, 
];

export const ACHIEVEMENTS_DATA: Achievement[] = [
  { id: 'novice', title: 'Novice Sorter', description: 'Reach Level 10', icon: '🥉', target: 10, type: 'LEVEL' },
  { id: 'pro', title: 'Pro Sorter', description: 'Reach Level 50', icon: '🥈', target: 50, type: 'LEVEL' },
  { id: 'master', title: 'Grandmaster', description: 'Reach Level 100', icon: '🥇', target: 100, type: 'LEVEL' },
  { id: 'rich_1', title: 'Pocket Change', description: 'Earn 500 Coins', icon: '💰', target: 500, type: 'COIN' },
  { id: 'rich_2', title: 'Tycoon', description: 'Earn 2000 Coins', icon: '💎', target: 2000, type: 'COIN' },
  { id: 'speed_1', title: 'Quick Hands', description: 'Hit a 3x Combo', icon: '⚡', target: 3, type: 'COMBO' },
  { id: 'speed_2', title: 'Flow State', description: 'Hit a 6x Combo', icon: '🔥', target: 6, type: 'COMBO' },
];

export const AVATARS = ['🐶', '🐱', '🐼', '🦊', '🦁', '🐸', '🦄', '🐲', '💀', '👽', '🤖', '🎃', '🦸', '🥷', '🤴', '👸'];

export const MISSION_TEMPLATES: Partial<DailyMission>[] = [
  { type: 'WIN_LEVEL', description: 'Win 3 Levels', target: 3, reward: 50 },
  { type: 'USE_NO_UNDO', description: 'Perfect Win (No Undo)', target: 1, reward: 30 },
  { type: 'EARN_COINS', description: 'Earn 100 Coins', target: 100, reward: 40 },
  { type: 'PLAY_CHALLENGE', description: 'Play Challenge Mode', target: 1, reward: 25 },
];

export const WHEEL_REWARDS = [
  { id: 'coin_50', label: '50', type: 'COIN', amount: 50, prob: 0.3, color: '#eab308' },
  { id: 'coin_100', label: '100', type: 'COIN', amount: 100, prob: 0.2, color: '#f59e0b' },
  { id: 'hint_1', label: '1 Hint', type: 'HINT', amount: 1, prob: 0.2, color: '#8b5cf6' },
  { id: 'undo_3', label: '3 Undos', type: 'UNDO', amount: 3, prob: 0.2, color: '#3b82f6' },
  { id: 'tube_1', label: '1 Tube', type: 'TUBE', amount: 1, prob: 0.05, color: '#22c55e' },
  { id: 'jackpot', label: 'JACKPOT', type: 'COIN', amount: 500, prob: 0.05, color: '#ef4444' },
];

export const INITIAL_PROGRESS: PlayerProgress = {
  coins: 100, currentLevel: 1, unlockedThemes: ['default_dark'], achievements: [],
  inventory: { undo: 3, hint: 1, extraTube: 0 }, highScores: {},
  settings: { sound: true, music: true, haptics: true, colorBlindMode: false },
  lastClaimedDate: '', avatarId: '🐶', activeMissions: [],
  stats: { totalWins: 0, perfectWins: 0, totalMoves: 0, highestCombo: 0, gamesPlayed: 0 },
  winStreak: 0
};

export const TUBE_CAPACITY = 4;