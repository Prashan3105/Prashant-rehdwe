import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameMode, Screen, PlayerProgress, Theme, DailyMission } from './types';
import { INITIAL_PROGRESS, THEMES, MISSION_TEMPLATES } from './constants';
import { loadProgress, saveProgress } from './services/storageService';
import { playBackgroundMusic, stopBackgroundMusic, initAudio } from './services/audioService';
import { initAdMob, hideBanner } from './services/admobService'; // Import AdMob
import Game from './components/Game';
import Shop from './components/Shop';
import Leaderboard from './components/Leaderboard';
import MiniGames from './components/MiniGames';
import SettingsModal from './components/SettingsModal';
import DailyReward from './components/DailyReward';
import Profile from './components/Profile';
import SpinWheel from './components/SpinWheel';
import { Play, Grid, Award, Volume2, Gamepad2, Flame, Gift } from 'lucide-react';

const BackgroundEffect: React.FC<{ themeId: string, mouseX: number, mouseY: number }> = ({ themeId, mouseX, mouseY }) => {
  const parallaxStyle = { transform: `translate(${mouseX * 20}px, ${mouseY * 20}px)`, transition: 'transform 0.1s ease-out' };
  if (themeId === 'neon_city') return <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30"><div className="absolute inset-0 bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)_scale(2)] origin-top bg-[linear-gradient(rgba(13,13,13,0)_0px,rgba(34,211,238,0.2)_1px),linear-gradient(90deg,rgba(13,13,13,0)_0px,rgba(34,211,238,0.2)_1px)]" /></div>;
  if (themeId === 'nature') return <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>{[...Array(20)].map((_, i) => <div key={i} className="particle bg-yellow-200 shadow-[0_0_10px_yellow]" style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, animationDuration: `${Math.random() * 10 + 10}s` }} />)}</div>;
  if (themeId === 'candy') return <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>{[...Array(15)].map((_, i) => <div key={i} className="particle border-2 border-white/30 bg-transparent" style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 20 + 10}px`, height: `${Math.random() * 20 + 10}px`, animationDuration: `${Math.random() * 8 + 5}s` }} />)}</div>;
  if (themeId === 'ocean') return <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>{[...Array(25)].map((_, i) => <div key={i} className="absolute rounded-full bg-white/10 backdrop-blur-sm border border-white/20" style={{ left: `${Math.random() * 100}%`, bottom: '-50px', width: `${Math.random() * 30 + 10}px`, height: `${Math.random() * 30 + 10}px`, animation: `floatUp ${Math.random() * 5 + 5}s linear infinite` }} />)}</div>;
  return <div className="absolute inset-0 overflow-hidden pointer-events-none" style={parallaxStyle}>{[...Array(30)].map((_, i) => <div key={i} className="star" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, animationDuration: `${Math.random() * 3 + 2}s` }} />)}</div>;
};

const AnimatedTitle = () => {
  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const letter = { hidden: { y: 50, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 12, stiffness: 200 } } };
  return (
    <div className="mb-10 relative flex flex-col items-center cursor-default">
        <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-30 animate-pulse"></div>
        <motion.div variants={container} initial="hidden" animate="visible" className="flex gap-2">{"CHROMA".split("").map((c, i) => <motion.span key={i} variants={letter} className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-lg">{c}</motion.span>)}</motion.div>
        <motion.div variants={container} initial="hidden" animate="visible" transition={{ delayChildren: 0.5 }} className="flex gap-2 mt-[-10px]">{"FLOW".split("").map((c, i) => <motion.span key={i} variants={letter} className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-pink-600 drop-shadow-lg">{c}</motion.span>)}</motion.div>
    </div>
  );
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.MENU);
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    const saved = loadProgress();
    return saved ? { ...INITIAL_PROGRESS, ...saved, settings: { ...INITIAL_PROGRESS.settings, ...saved.settings }, stats: { ...INITIAL_PROGRESS.stats, ...(saved.stats || {}) }, avatarId: saved.avatarId || INITIAL_PROGRESS.avatarId, activeMissions: saved.activeMissions || [], winStreak: saved.winStreak || 0 } : INITIAL_PROGRESS;
  });
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.WATER);
  const [currentThemeId, setCurrentThemeId] = useState<string>('default_dark');
  const [showSettings, setShowSettings] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    // Init AdMob
    initAdMob();

    const today = new Date().toISOString().split('T')[0];
    if (progress.missionDate !== today || progress.activeMissions.length === 0) {
        const newMissions: DailyMission[] = [];
        const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
        for(let i=0; i<3; i++) {
            const t = shuffled[i];
            newMissions.push({ id: `mission-${today}-${i}`, description: t.description || 'Unknown', target: t.target || 1, progress: 0, completed: false, claimed: false, reward: t.reward || 10, type: t.type as any });
        }
        const updated = { ...progress, activeMissions: newMissions, missionDate: today };
        setProgress(updated); saveProgress(updated);
    }
    if (progress.lastClaimedDate !== today) setShowDailyReward(true);
  }, []);

  // Handle banner visibility
  useEffect(() => {
      if (screen !== Screen.GAME) {
          hideBanner();
      }
  }, [screen]);

  useEffect(() => { progress.settings.music ? playBackgroundMusic(true) : playBackgroundMusic(false); }, [progress.settings.music]);

  const updateProgress = (p: PlayerProgress) => { setProgress(p); saveProgress(p); };
  const handleDailyClaim = (amt: number) => updateProgress({ ...progress, coins: progress.coins + amt, lastClaimedDate: new Date().toISOString().split('T')[0] });
  const handlePurchase = (t: Theme) => { if (progress.coins >= t.price) updateProgress({ ...progress, coins: progress.coins - t.price, unlockedThemes: [...progress.unlockedThemes, t.id] }); };
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const cx = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setMousePos({ x: (cx / window.innerWidth - 0.5), y: (cy / window.innerHeight - 0.5) });
    if (Math.random() < 0.3) { const id = Date.now() + Math.random(); setParticles(p => [...p.slice(-10), { id, x: cx, y: cy }]); setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 800); }
  };
  
  const pageVariants = { initial: { opacity: 0, scale: 0.95, filter: "blur(10px)" }, animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.3 } }, exit: { opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.2 } } };
  const bgStyle = THEMES.find(t => t.id === currentThemeId)?.background || THEMES[0].background;

  return (
    <div className="w-full h-screen text-white font-fredoka overflow-hidden relative transition-colors duration-700 ease-in-out" style={{ background: bgStyle }} onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onClick={initAudio} onTouchStart={initAudio}>
        {particles.map(p => <motion.div key={p.id} initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0, y: -20 }} transition={{ duration: 0.8 }} className="fixed w-3 h-3 rounded-full pointer-events-none z-[100]" style={{ left: p.x, top: p.y, background: `hsl(${Math.random() * 360}, 100%, 70%)`, boxShadow: '0 0 10px white' }} />)}
        <BackgroundEffect themeId={currentThemeId} mouseX={mousePos.x} mouseY={mousePos.y} />
        <AnimatePresence mode="wait">
            {screen === Screen.GAME && <motion.div key="game" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full"><Game mode={gameMode} isTimed={isTimedMode} progress={progress} themeId={currentThemeId} updateProgress={updateProgress} onExit={() => { setScreen(Screen.MENU); setIsTimedMode(false); }} onOpenShop={() => setScreen(Screen.SHOP)} /></motion.div>}
            {screen === Screen.SHOP && <motion.div key="shop" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20"><Shop coins={progress.coins} unlockedThemes={progress.unlockedThemes} currentThemeId={currentThemeId} onPurchase={handlePurchase} onEquip={setCurrentThemeId} onClose={() => setScreen(Screen.MENU)} progress={progress} updateProgress={updateProgress} /></motion.div>}
            {screen === Screen.LEADERBOARD && <motion.div key="lb" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20"><Leaderboard currentLevel={progress.currentLevel} onClose={() => setScreen(Screen.MENU)} /></motion.div>}
            {screen === Screen.MINI_GAMES && <motion.div key="mg" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20"><MiniGames progress={progress} updateProgress={updateProgress} onClose={() => setScreen(Screen.MENU)} /></motion.div>}
            {screen === Screen.PROFILE && <motion.div key="pf" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20"><Profile progress={progress} updateProgress={updateProgress} onClose={() => setScreen(Screen.MENU)} /></motion.div>}
            {screen === Screen.SPIN_WHEEL && <motion.div key="sw" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full relative z-20"><SpinWheel progress={progress} updateProgress={updateProgress} onClose={() => setScreen(Screen.MENU)} /></motion.div>}
            {screen === Screen.MENU && (
                <motion.div key="menu" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full flex flex-col items-center justify-center p-6 relative overflow-hidden z-10">
                    <div className="absolute top-4 left-4 z-50"><button onClick={() => setScreen(Screen.PROFILE)} className="glass-panel flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition"><div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-lg shadow-inner">{progress.avatarId}</div><span className="font-bold pr-2 hidden sm:block">Profile</span></button></div>
                    <div className="z-10 flex flex-col items-center w-full max-w-md mt-10">
                        <AnimatedTitle />
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsTimedMode(false); setScreen(Screen.GAME); }} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 mb-4 btn-shimmer"><Play fill="currentColor" /> PLAY LEVEL {progress.currentLevel}</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsTimedMode(true); setScreen(Screen.GAME); }} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-lg font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 mb-6 btn-shimmer"><Flame fill="currentColor" /> TIMED CHALLENGE</motion.button>
                        <div className="flex w-full gap-4 mb-6"><button onClick={() => setGameMode(GameMode.WATER)} className={`flex-1 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${gameMode === GameMode.WATER ? 'border-blue-500 bg-blue-500/20 scale-105' : 'glass-panel border-white/10'}`}><div className="w-8 h-8 rounded bg-blue-400 opacity-80" /><span className="font-bold text-sm">Liquid</span></button><button onClick={() => setGameMode(GameMode.BALL)} className={`flex-1 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${gameMode === GameMode.BALL ? 'border-purple-500 bg-purple-500/20 scale-105' : 'glass-panel border-white/10'}`}><div className="w-8 h-8 rounded-full bg-purple-400 opacity-80" /><span className="font-bold text-sm">Ball</span></button></div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.SHOP)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"><Grid size={20} className="text-yellow-400"/> Shop</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.SPIN_WHEEL)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"><Gift size={20} className="text-pink-400 animate-pulse"/> Lucky Spin</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.LEADERBOARD)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"><Award size={20} className="text-orange-400"/> Ranking</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen(Screen.MINI_GAMES)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"><Gamepad2 size={20} className="text-green-400"/> Mini Games</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(true)} className="glass-panel hover:bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all col-span-2"><Volume2 size={20} className="text-gray-400"/> Settings</motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        {showSettings && <SettingsModal progress={progress} updateProgress={updateProgress} onClose={() => setShowSettings(false)} />}
        {showDailyReward && <DailyReward onClaim={handleDailyClaim} onClose={() => setShowDailyReward(false)} />}
    </div>
  );
};

export default App;