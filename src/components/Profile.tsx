
import React from 'react';
import { ArrowLeft, Trophy, Zap, CheckCircle, Clock, Edit2 } from 'lucide-react';
import { PlayerProgress, DailyMission } from '../types';
import { AVATARS } from '../constants';
import { playSound } from '../services/audioService';

interface ProfileProps {
  progress: PlayerProgress;
  updateProgress: (p: PlayerProgress) => void;
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ progress, updateProgress, onClose }) => {
  
  const handleClaimMission = (missionId: string) => {
    const missionIndex = progress.activeMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) return;

    const mission = progress.activeMissions[missionIndex];
    if (mission.completed && !mission.claimed) {
        const newMissions = [...progress.activeMissions];
        newMissions[missionIndex].claimed = true;
        
        updateProgress({
            ...progress,
            coins: progress.coins + mission.reward,
            activeMissions: newMissions
        });
        playSound('win', progress.settings.sound);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
      updateProgress({
          ...progress,
          avatarId: avatar
      });
      playSound('select', progress.settings.sound);
  };

  // Calculate Win Rate
  const winRate = progress.stats.gamesPlayed > 0 
    ? Math.round((progress.stats.totalWins / progress.stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col text-white animate-fade-in">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-gray-800 shadow-lg shrink-0">
        <button onClick={onClose} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold uppercase tracking-wider">Player Profile</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-gray-800 relative">
                {progress.avatarId}
                <div className="absolute bottom-0 right-0 bg-gray-700 p-1.5 rounded-full border border-gray-600">
                    <Edit2 size={12} />
                </div>
            </div>
            <h3 className="mt-2 text-xl font-bold text-gray-200">You</h3>
            <div className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/50 mt-1">Level {progress.currentLevel}</div>

            {/* Avatar Selector */}
            <div className="mt-4 flex gap-2 overflow-x-auto w-full p-2 no-scrollbar justify-center">
                {AVATARS.map((av) => (
                    <button 
                        key={av} 
                        onClick={() => handleAvatarSelect(av)}
                        className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                            progress.avatarId === av ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-gray-700 opacity-50 hover:opacity-100'
                        }`}
                    >
                        {av}
                    </button>
                ))}
            </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
                <Trophy className="text-yellow-400 mb-2" size={24} />
                <span className="text-2xl font-black">{progress.stats.totalWins}</span>
                <span className="text-xs text-gray-400 uppercase">Total Wins</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
                <CheckCircle className="text-green-400 mb-2" size={24} />
                <span className="text-2xl font-black">{progress.stats.perfectWins}</span>
                <span className="text-xs text-gray-400 uppercase">Perfect Wins</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
                <Zap className="text-orange-400 mb-2" size={24} />
                <span className="text-2xl font-black">{progress.stats.highestCombo}x</span>
                <span className="text-xs text-gray-400 uppercase">Best Combo</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
                <div className={`text-2xl font-black ${winRate > 80 ? 'text-green-400' : 'text-white'}`}>{winRate}%</div>
                <span className="text-xs text-gray-400 uppercase">Win Rate</span>
            </div>
        </div>

        {/* Daily Missions */}
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-400" /> Daily Missions
            </h3>
            
            <div className="space-y-3">
                {progress.activeMissions.length === 0 && (
                    <div className="text-center text-gray-500 py-4 italic">No missions available. Check back tomorrow!</div>
                )}

                {progress.activeMissions.map((mission) => (
                    <div key={mission.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700 flex items-center justify-between">
                        <div className="flex-1">
                            <div className="font-bold text-sm mb-1">{mission.description}</div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{mission.progress} / {mission.target}</div>
                        </div>

                        <div className="ml-4">
                            {mission.claimed ? (
                                <div className="text-green-500 font-bold text-xs flex items-center gap-1">
                                    <CheckCircle size={14}/> DONE
                                </div>
                            ) : mission.completed ? (
                                <button 
                                    onClick={() => handleClaimMission(mission.id)}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs px-3 py-2 rounded-lg animate-pulse shadow-lg"
                                >
                                    CLAIM
                                </button>
                            ) : (
                                <div className="bg-gray-700 text-gray-400 text-xs px-3 py-2 rounded-lg font-bold">
                                    {mission.reward} 🪙
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
    