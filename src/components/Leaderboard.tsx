
import React, { useState, useEffect } from 'react';
import { Trophy, User, ArrowLeft, Crown, Medal } from 'lucide-react';
import { ACHIEVEMENTS_DATA } from '../constants';
import { loadProgress } from '../services/storageService';

interface LeaderboardProps {
  currentLevel: number;
  onClose: () => void;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  isPlayer: boolean;
  avatarColor: string;
  avatarIcon?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentLevel, onClose }) => {
  const [view, setView] = useState<'RANK' | 'ACHIEVEMENTS'>('RANK');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    const progress = loadProgress();
    if (progress) setUnlockedAchievements(progress.achievements || []);

    const generateFakeEntries = () => {
      const names = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Jamie", "Morgan", "Quinn"];
      const fakeData: LeaderboardEntry[] = names.map((name, i) => ({
        id: `fake-${i}`,
        name: name,
        level: Math.max(1, currentLevel + Math.floor(Math.random() * 20) - 10),
        isPlayer: false,
        avatarColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }));

      const playerEntry: LeaderboardEntry = {
        id: 'player',
        name: 'YOU',
        level: currentLevel,
        isPlayer: true,
        avatarColor: '#3b82f6',
        avatarIcon: progress?.avatarId || '🐶'
      };

      const allEntries = [...fakeData, playerEntry].sort((a, b) => b.level - a.level);
      setEntries(allEntries.slice(0, 10)); 
    };

    generateFakeEntries();
  }, [currentLevel]);

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in text-white">
      <div className="p-4 flex items-center justify-between bg-gray-800 shadow-lg shrink-0">
        <button onClick={onClose} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
          <Trophy size={24} /> HALL OF FAME
        </h2>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-2 shrink-0">
          <button 
            onClick={() => setView('RANK')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${view === 'RANK' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
              Rankings
          </button>
          <button 
            onClick={() => setView('ACHIEVEMENTS')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${view === 'ACHIEVEMENTS' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
              Medals
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {view === 'RANK' ? (
            <div className="flex flex-col gap-3 max-w-md mx-auto">
            {entries.map((entry, index) => (
                <div 
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    entry.isPlayer 
                    ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] transform scale-105' 
                    : 'bg-gray-800 border-gray-700'
                }`}
                >
                <div className="flex-shrink-0 w-8 text-center font-bold text-xl text-gray-400">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                
                <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 overflow-hidden text-lg"
                    style={{ backgroundColor: entry.avatarColor }}
                >
                    {entry.isPlayer ? entry.avatarIcon : <User size={20} className="text-white" />}
                </div>

                <div className="flex-1">
                    <div className="font-bold text-lg flex items-center gap-2">
                    {entry.name}
                    {entry.isPlayer && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full text-white">Me</span>}
                    {index === 0 && <Crown size={16} className="text-yellow-400" />}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm text-gray-400">Level</div>
                    <div className="font-black text-xl text-white">{entry.level}</div>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {ACHIEVEMENTS_DATA.map((ach) => {
                    const isUnlocked = unlockedAchievements.includes(ach.id);
                    return (
                        <div 
                            key={ach.id}
                            className={`p-4 rounded-xl border-2 flex items-center gap-4 ${
                                isUnlocked 
                                    ? 'bg-purple-900/30 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                                    : 'bg-gray-800/50 border-gray-700 opacity-60'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isUnlocked ? 'bg-purple-600' : 'bg-gray-700 grayscale'}`}>
                                {ach.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{ach.title}</h3>
                                <p className="text-sm text-gray-400">{ach.description}</p>
                            </div>
                            {isUnlocked && <Medal className="text-yellow-400" size={24} />}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
    