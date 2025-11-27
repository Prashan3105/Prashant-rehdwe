
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameMode, Screen, PlayerProgress, Theme, DailyMission } from './types';
import { INITIAL_PROGRESS, THEMES, MISSION_TEMPLATES } from './constants';
import { loadProgress, saveProgress } from './services/storageService';
import { playBackgroundMusic, stopBackgroundMusic, initAudio } from './services/audioService';
import Game from './components/Game';
import Shop from './components/Shop';
import Leaderboard from './components/Leaderboard';
import MiniGames from './components/MiniGames';
import SettingsModal from './components/SettingsModal';
import DailyReward from './components/DailyReward';
import Profile from './components/Profile';
import SpinWheel from './components/SpinWheel'; // New Import
import { Play, Grid, Monitor, Award, Volume2, Gamepad2, Flame, UserCircle, Gift } from 'lucide-react';

// Background Effect Component
const BackgroundEffect: React.FC<{ themeId: string, mouseX: number, mouseY: number }> = ({ themeId, mouseX, mouseY }) => {
  const parallaxStyle = {
      transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)`,
      transition: 'transform 0.1s ease-out'
  };

  if (themeId === 'neon_city') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(13,13,13,0)_0px,rgba(34,211,238,0.2)_1px),linear-gradient(90deg,rgba(13,13,13,0)_0px,rgba(34,211,238,0.2)_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)_scale(2)] origin-top" />
      </div>
    );
  }
  
  if (themeId === 'nature') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>
        {[...Array(20)].map((_, i) => (
           <div 
             key={i} 
             className="particle bg-yellow-200 shadow-[0_0_10px_yellow]" 
             style={{
               left: `${Math.random() * 100}%`,
               width: `${Math.random() * 4 + 2}px`,
               height: `${Math.random() * 4 + 2}px`,
               animationDuration: `${Math.random() * 10 + 10}s`,
               animationDelay: `${Math.random() * 5}s`
             }} 
           />
        ))}
      </div>
    );
  }

  if (themeId === 'candy') {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>
        {[...Array(15)].map((_, i) => (
           <div 
             key={i} 
             className="particle border-2 border-white/30 bg-transparent" 
             style={{
               left: `${Math.random() * 100}%`,
               width: `${Math.random() * 20 + 10}px`,
               height: `${Math.random() * 20 + 10}px`,
               animationDuration: `${Math.random() * 8 + 5}s`,
               animationDelay: `${Math.random() * 5}s`
             }} 
           />
        ))}
      </div>
    );
  }

  if (themeId === 'ocean') {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>
        {[...Array(25)].map((_, i) => (
           <div 
             key={i} 
             className="absolute rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
             style={{
               left: `${Math.random() * 100}%`,
               bottom: '-50px',
               width: `${Math.random() * 30 + 10}px`,
               height: `${Math.random() * 30 + 10}px`,
               animation: `floatUp ${Math.random() * 5 + 5}s linear infinite`,
               animationDelay: `${Math.random() * 5}s`
             }} 
           />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>
        {[...Array(30)].map((_, i) => (
           <div 
             key={i} 
             className="star" 
             style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               width: `${Math.random() * 3 + 1}px`,
               height: `${Math.random() * 3 + 1}px`,
               animationDuration: `${Math.random() * 3 + 2}s`,
               animationDelay: `${Math.random() * 2}s`
             }} 
           />
        ))}
    </div>
  );
};

const AnimatedTitle = () => {
  const title1 = "CHROMA";
  const title2 = "FLOW";

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const letter = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    }
  };

  return (
    <div className="mb-10 relative flex flex-col items-center cursor-default">
        <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-30 animate-pulse"></div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex gap-2"
        >
          {title1.split("").map((char, index) => (
            <motion.span 
              key={index} 
              variants={letter}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-lg"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: 0.5 }}
          className="flex gap-2 mt-[-10px]"
        >
          {title2.split("").map((char, index) => (
            <motion.span 
              key={index} 
              variants={letter}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-pink-600 drop-shadow-lg"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
    </div>
  );
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.MENU);
  
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    const saved = loadProgress();
    if (saved) {
        return {
            ...INITIAL_PROGRESS,
            ...saved,
            settings: { ...INITIAL_PROGRESS.settings, ...saved.settings },
            stats: { ...INITIAL_PROGRESS.stats, ...(saved.stats || {}) },
            avatarId: saved.avatarId || INITIAL_PROGRESS.avatarId,
            activeMissions: saved.activeMissions || [],
            winStreak: saved.winStreak || 0
        };
    }
    return INITIAL_PROGRESS;
  });

  const [gameMode, setGameMode] = useState<GameMode>(GameMode.WATER);
  const [currentThemeId, setCurrentThemeId] = useState<string>('default_dark');
  const [showSettings, setShowSettings] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (progress.missionDate !== today || progress.activeMissions.length === 0) {
        const newMissions: DailyMission[] = [];
        const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
        
        for(let i=0; i<3; i++) {
            const template = shuffled[i];
            newMissions.push({
                id: `mission-${today}-${i}`,
                description: template.description || 'Unknown Mission',
                target: template.target || 1,
                progress: 0,
                completed: false,
                claimed: false,
                reward: template.reward || 10,
                type: template.type as any
            });
        }
        
        const updatedProgress = {
            ...progress,
            activeMissions: newMissions,
            missionDate: today
        };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);
    }

    if (progress.lastClaimedDate !== today) {
        setShowDailyReward(true);
    }
  }, []);

  useEffect(() => {
    if (progress.settings.music) {
        playBackgroundMusic(true);
    } else {
        playBackgroundMusic(false);
    }
  }, [progress.settings.music]);

  const updateProgress = (newProgress: PlayerProgress) => {
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const handleDailyClaim = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateProgress({
      ...progress,
      coins: progress.coins + amount,
      lastClaimedDate: today
    });
  };

  const handlePurchase = (theme: Theme) => {
    if (progress.coins >= theme.price) {
      const newProgress = {
        ...progress,
        coins: progress.coins - theme.price,
        unlockedThemes: [...progress.unlockedThemes, theme.id]
      };
      updateProgress(newProgress);
    }
  };

  const handleEquip = (themeId: string) => {
    setCurrentThemeId(themeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    setMousePos({ x, y });
    spawnParticle(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const x = (touch.clientX / window.innerWidth - 0.5);
      const y = (touch.clientY / window.innerHeight - 0.5);
      setMousePos({ x, y });
      spawnParticle(touch.clientX, touch.clientY);
  }

  const spawnParticle = (x: number, y: number) => {
      // Throttle
      if (Math.random() > 0.3) return;
      
      const id = Date.now() + Math.random();
      setParticles(prev => [...prev.slice(-10), { id, x, y }]);
      setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== id));
      }, 800);
  };
  
  const handleInteraction = () => {
      initAudio();
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.2 } },
  };

  const renderScreen = () => {
    switch (screen) {
      case Screen.GAME:
        return (
          <motion.div key="game" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full">
              <Game
                mode={gameMode}
                isTimed={isTimedMode}
                progress={progress}
                themeId={currentThemeId}
                updateProgress={updateProgress}
                onExit={() => {
                    setScreen(Screen.MENU);
                    setIsTimedMode(false);
                }}
                onOpenShop={() => setScreen(Screen.SHOP)}
              />
          </motion.div>
        );
      case Screen.SHOP:
        return (
          <motion.div key="shop" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20">
              <Shop
                coins={progress.coins}
                unlockedThemes={progress.unlockedThemes}
                currentThemeId={currentThemeId}
                onPurchase={handlePurchase}
                onEquip={handleEquip}
                onClose={() => setScreen(Screen.MENU)}
                progress={progress}
                updateProgress={updateProgress}
              />
          </motion.div>
        );
      case Screen.LEADERBOARD:
        return (
          <motion.div key="leaderboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20">
              <Leaderboard 
                  currentLevel={progress.currentLevel}
                  onClose={() => setScreen(Screen.MENU)}
              />
          </motion.div>
        );
      case Screen.MINI_GAMES:
          return (
            <motion.div key="minigames" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20">
                <MiniGames 
                    progress={progress}
                    updateProgress={updateProgress}
                    onClose={() => setScreen(Screen.MENU)}
                />
            </motion.div>
          );
      case Screen.PROFILE:
          return (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20">
                <Profile 
                    progress={progress}
                    updateProgress={updateProgress}
                    onClose={() => setScreen(Screen.MENU)}
                />
            </motion.div>
          );
      case Screen.SPIN_WHEEL:
          return (
            <motion.div key="spinwheel" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20">
                <SpinWheel 
                    progress={progress}
                    updateProgress={updateProgress}
                    onClose={() => setScreen(Screen.MENU)}
                />
            </motion.div>
          );
      case Screen.MENU:
      default:
        return (
          <motion.div key="menu" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full flex flex-col items-center justify-center p-6 relative overflow-hidden z-10">
             
             {/* Profile Button Top Left */}
             <div className="absolute top-4 left-4 z-50">
                 <button onClick={() => setScreen(Screen.PROFILE)} className="glass-panel flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition">
                     <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-lg shadow-inner">
                         {progress.avatarId}
                     </div>
                     <span className="font-bold pr-2 hidden sm:block">Profile</span>
                 </button>
             </div>

             <div className="z-10 flex flex-col items-center w-full max-w-md mt-10">
                
                <AnimatedTitle />

                {/* Main Play */}
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6,182,212,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsTimedMode(false);
                        setScreen(Screen.GAME);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold py-5 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-3 mb-4 group relative overflow-hidden btn-shimmer"
                >
                    <Play fill="currentColor" className="group-hover:scale-110 transition-transform"/> PLAY LEVEL {progress.currentLevel}
                </motion.button>

                 {/* Challenge Mode */}
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(239,68,68,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsTimedMode(true);
                        setScreen(Screen.GAME);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-lg font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-3 mb-6 group btn-shimmer"
                >
                    <Flame fill="currentColor" className="group-hover:scale-110 transition-transform" /> TIMED CHALLENGE
                </motion.button>

                {/* Mode Select */}
                <div className="flex w-full gap-4 mb-6">
                    <button 
                        onClick={() => setGameMode(GameMode.WATER)}
                        className={`flex-1 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 backdrop-blur-md ${
                            gameMode === GameMode.WATER 
                            ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105' 
                            : 'glass-panel border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <div className="w-8 h-8 rounded bg-blue-400 opacity-80 shadow-inner" />
                        <span className="font-bold text-sm">Liquid</span>
                    </button>
                    <button 
                        onClick={() => setGameMode(GameMode.BALL)}
                        className={`flex-1 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 backdrop-blur-md ${
                            gameMode === GameMode.BALL 
                            ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105' 
                            : 'glass-panel border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-purple-400 opacity-80 shadow-inner" />
                        <span className="font-bold text-sm">Ball</span>
                    </button>
                </div>

                {/* Secondary Menu - Spin Wheel Added */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.SHOP)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all">
                        <Grid size={20} className="text-yellow-400"/> Shop
                    </motion.button>
                    
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.SPIN_WHEEL)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all">
                        <Gift size={20} className="text-pink-400 animate-pulse"/> Lucky Spin
                    </motion.button>
                    
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.LEADERBOARD)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all">
                        <Award size={20} className="text-orange-400"/> Ranking
                    </motion.button>
                    
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.MINI_GAMES)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all">
                        <Gamepad2 size={20} className="text-green-400"/> Mini Games
                    </motion.button>
                    
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(true)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all col-span-2">
                        <Volume2 size={20} className="text-gray-400"/> Settings
                    </motion.button>
                </div>
             </div>

             <div className="absolute bottom-4 text-xs text-gray-500">v2.0.0 | SAVED PROGRESS</div>
          </motion.div>
        );
    }
  };

  const bgStyle = THEMES.find(t => t.id === currentThemeId)?.background || THEMES[0].background;

  return (
    <div 
        className="w-full h-screen text-white font-fredoka overflow-hidden relative transition-colors duration-700 ease-in-out"
        style={{ background: bgStyle }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
    >
        {/* Magic Touch Particles */}
        {particles.map(p => (
            <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="fixed w-3 h-3 rounded-full pointer-events-none z-[100]"
                style={{ 
                    left: p.x, 
                    top: p.y,
                    background: `hsl(${Math.random() * 360}, 100%, 70%)`,
                    boxShadow: '0 0 10px white'
                }}
            />
        ))}

        {/* Global Background Effects */}
        <BackgroundEffect themeId={currentThemeId} mouseX={mousePos.x} mouseY={mousePos.y} />

        <AnimatePresence mode="wait">
            {renderScreen()}
        </AnimatePresence>
        
        {/* Settings Overlay */}
        {showSettings && (
            <SettingsModal 
                progress={progress}
                updateProgress={updateProgress}
                onClose={() => setShowSettings(false)}
            />
        )}

        {/* Daily Reward Overlay */}
        {showDailyReward && (
            <DailyReward 
                onClaim={handleDailyClaim}
                onClose={() => setShowDailyReward(false)}
            />
        )}
    </div>
  );
};

export default App;
