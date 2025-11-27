
import React from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Trash2, Eye, Camera, Unlock, ChevronRight, Award } from 'lucide-react';
import { PlayerProgress } from '../types';
import { INITIAL_PROGRESS, THEMES } from '../constants';

interface SettingsModalProps {
  progress: PlayerProgress;
  updateProgress: (p: PlayerProgress) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ progress, updateProgress, onClose }) => {
  
  const toggleSetting = (key: keyof PlayerProgress['settings']) => {
    updateProgress({
      ...progress,
      settings: {
        ...progress.settings,
        [key]: !progress.settings[key]
      }
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? You will lose all progress and coins.")) {
        updateProgress(INITIAL_PROGRESS);
        onClose();
    }
  };

  // --- DEV TOOLS FOR SCREENSHOTS ---
  const unlockEverything = () => {
      updateProgress({
          ...progress,
          coins: 9999,
          unlockedThemes: THEMES.map(t => t.id),
          currentLevel: 45 // Good looking complexity
      });
      alert("Marketing Mode: Level 45, All Themes Unlocked, 9999 Coins!");
  };

  const toggleUI = () => {
      document.body.classList.toggle('hide-ui');
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3 text-white">
              {progress.settings.sound ? <Volume2 size={24} className="text-green-400"/> : <VolumeX size={24} className="text-gray-500"/>}
              <span className="font-medium">Sound Effects</span>
            </div>
            <button 
              onClick={() => toggleSetting('sound')}
              className={`w-12 h-6 rounded-full relative transition-colors ${progress.settings.sound ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${progress.settings.sound ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3 text-white">
              <Music size={24} className={progress.settings.music ? "text-blue-400" : "text-gray-500"}/>
              <span className="font-medium">Music</span>
            </div>
            <button 
              onClick={() => toggleSetting('music')}
              className={`w-12 h-6 rounded-full relative transition-colors ${progress.settings.music ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${progress.settings.music ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3 text-white">
              <Smartphone size={24} className={progress.settings.haptics ? "text-purple-400" : "text-gray-500"}/>
              <span className="font-medium">Vibration</span>
            </div>
            <button 
              onClick={() => toggleSetting('haptics')}
              className={`w-12 h-6 rounded-full relative transition-colors ${progress.settings.haptics ? 'bg-purple-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${progress.settings.haptics ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Color Blind Mode Toggle */}
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3 text-white">
              <Eye size={24} className={progress.settings.colorBlindMode ? "text-yellow-400" : "text-gray-500"}/>
              <div className="flex flex-col">
                <span className="font-medium">Color Blind Mode</span>
                <span className="text-xs text-gray-400">Add patterns to colors</span>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('colorBlindMode')}
              className={`w-12 h-6 rounded-full relative transition-colors ${progress.settings.colorBlindMode ? 'bg-yellow-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${progress.settings.colorBlindMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

           <div className="h-px bg-gray-700 my-4" />

           {/* --- DEVELOPER TOOLS FOR SCREENSHOTS --- */}
           <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 border-dashed">
               <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                   <Camera size={14}/> Marketing Tools (Dev Only)
               </h3>
               <div className="grid grid-cols-2 gap-2">
                   <button onClick={unlockEverything} className="bg-blue-900/50 text-blue-200 text-xs p-2 rounded hover:bg-blue-900 flex items-center gap-1">
                       <Unlock size={12}/> Unlock All Themes
                   </button>
                   <button onClick={toggleUI} className="bg-purple-900/50 text-purple-200 text-xs p-2 rounded hover:bg-purple-900 flex items-center gap-1">
                       <Eye size={12}/> Hide UI (Toggle)
                   </button>
               </div>
           </div>

           {/* Reset Data */}
           <button 
             onClick={handleReset}
             className="w-full p-4 bg-red-900/30 hover:bg-red-900/50 border border-red-900 text-red-400 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors mt-2"
           >
             <Trash2 size={20} /> Reset All Progress
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
    