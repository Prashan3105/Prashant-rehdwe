import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion'; 
import { GameMode, PlayerProgress } from '../types';
import { generateLevel, isValidMove, checkWin, getMoveCount } from '../services/gameLogic';
import { getAIHint } from '../services/geminiService';
import { playSound, vibrate } from '../services/audioService';
import { showBanner, hideBanner, showInterstitial, showRewarded, isNative } from '../services/admobService';
import { THEMES, ACHIEVEMENTS_DATA, TUBE_CAPACITY } from '../constants';
import Tube from './Tube';
import AdModal from './AdModal';
import SettingsModal from './SettingsModal';
import { ArrowLeft, RotateCcw, Lightbulb, Plus, Settings, Play, Timer, AlertTriangle, Trophy, EyeOff, Pause, X, Star, Hand, Flame } from 'lucide-react';

interface GameProps {
  mode: GameMode;
  isTimed: boolean;
  progress: PlayerProgress;
  themeId: string;
  updateProgress: (p: PlayerProgress) => void;
  onExit: () => void;
  onOpenShop: () => void;
}

const Game: React.FC<GameProps> = ({ mode, isTimed, progress, themeId, updateProgress, onExit, onOpenShop }) => {
  const [level, setLevel] = useState(progress.currentLevel);
  const [tubes, setTubes] = useState<string[][]>([]);
  const [history, setHistory] = useState<string[][][]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [showAd, setShowAd] = useState<{ type: 'hint' | 'extra_tube' | 'coins', active: boolean }>({ type: 'hint', active: false });
  const [hint, setHint] = useState<{from: number, to: number} | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboPopup, setComboPopup] = useState<number | null>(null);
  const [tutorialStep, setTutorialStep] = useState<{from: number, to: number} | null>(null);

  const isMysteryLevel = level % 5 === 0 && level > 0;
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    startLevel(level);
    // Show AdMob Banner when entering game
    showBanner();
    return () => {
        // Hide Banner when leaving game
        hideBanner();
    }
  }, [level]);

  // Tutorial Logic (same as before)
  useEffect(() => {
    if (level === 1 && !isWon && history.length === 0 && !selectedTube) {
        let fromIdx = -1; let toIdx = -1;
        for(let i=0; i<tubes.length; i++) {
            if(tubes[i].length > 0) {
                for(let j=0; j<tubes.length; j++) {
                    if (tubes[j].length === 0) { fromIdx = i; toIdx = j; break; }
                }
            }
            if (fromIdx !== -1) break;
        }
        if (fromIdx !== -1 && toIdx !== -1) setTutorialStep({ from: fromIdx, to: toIdx });
    } else {
        setTutorialStep(null);
    }
  }, [level, isWon, history, selectedTube, tubes]);

  useEffect(() => {
    if (!isTimed || isWon || isGameOver || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 10 && prev > 0) playSound('tick', progress.settings.sound);
        if (prev <= 1) { clearInterval(timer); handleGameOver(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimed, isWon, isGameOver, isPaused, level]);

  const startLevel = (lvl: number) => {
    const data = generateLevel(lvl, isTimed ? 1.5 : 1);
    setTubes(data.initialState);
    setHistory([]);
    setIsWon(false);
    setIsGameOver(false);
    setIsPaused(false);
    setSelectedTube(null);
    setHint(null);
    setAiMessage("");
    setTimeLeft(60 + (Math.min(lvl, 50) * 3));
    setCombo(0);
    setLastMoveTime(0);
    setUndoCount(0);
  };

  const handleGameOver = async () => {
    setIsGameOver(true);
    playSound('error', progress.settings.sound);
    vibrate(500, progress.settings.haptics);
    updateProgress({ ...progress, winStreak: 0, stats: { ...progress.stats, gamesPlayed: progress.stats.gamesPlayed + 1 } });
    
    // Show Interstitial on Loss
    await showInterstitial();
  };

  const handleRestart = () => {
      updateProgress({ ...progress, winStreak: 0 });
      startLevel(level);
  };

  const handleTubeClick = (index: number) => {
    if (isWon || isGameOver || isPaused) return;
    const isSolved = tubes[index].length === TUBE_CAPACITY && tubes[index].every(c => c === tubes[index][0]);
    if (isSolved && selectedTube !== index) return; 

    if (selectedTube === null) {
      if (tubes[index].length > 0) {
        setSelectedTube(index);
        playSound('select', progress.settings.sound);
        vibrate(10, progress.settings.haptics);
        setHint(null);
      }
    } else {
      if (selectedTube === index) {
        setSelectedTube(null); 
        playSound('select', progress.settings.sound);
      } else {
        if (isValidMove(tubes, selectedTube, index)) {
          executeMove(selectedTube, index);
        } else {
          if (tubes[index].length > 0) {
             setSelectedTube(index);
             playSound('select', progress.settings.sound);
             vibrate(10, progress.settings.haptics);
          } else {
             setSelectedTube(null);
             playSound('error', progress.settings.sound);
             vibrate(50, progress.settings.haptics);
          }
        }
      }
    }
  };

  const executeMove = (from: number, to: number) => {
    const newTubes = JSON.parse(JSON.stringify(tubes));
    const moveCount = getMoveCount(tubes, from, to);
    playSound('pour', progress.settings.sound);
    vibrate(20, progress.settings.haptics);
    const color = newTubes[from][newTubes[from].length - 1];
    for(let k=0; k<moveCount; k++) { newTubes[from].pop(); newTubes[to].push(color); }
    setHistory([...history, tubes]);
    setTubes(newTubes);
    setSelectedTube(null);
    const currentMoves = progress.stats.totalMoves + 1;
    const now = Date.now();
    let currentCombo = 1;
    if (now - lastMoveTime < 2500) { 
        currentCombo = combo + 1;
        setCombo(currentCombo);
        if (currentCombo > 1) {
            setComboPopup(currentCombo);
            setTimeout(() => setComboPopup(null), 1000);
            checkAchievements(progress.currentLevel, progress.coins, currentCombo);
        }
    } else { setCombo(1); }
    setLastMoveTime(now);
    if (checkWin(newTubes)) handleWin(currentCombo, currentMoves); 
  };

  const checkAchievements = (currLevel: number, currCoins: number, currentCombo: number) => {
      const newAchievements = [...progress.achievements];
      let changed = false;
      ACHIEVEMENTS_DATA.forEach(ach => {
          if (newAchievements.includes(ach.id)) return;
          let unlocked = false;
          if (ach.type === 'LEVEL' && currLevel >= ach.target) unlocked = true;
          if (ach.type === 'COIN' && currCoins >= ach.target) unlocked = true;
          if (ach.type === 'COMBO' && currentCombo >= ach.target) unlocked = true;
          if (unlocked) { newAchievements.push(ach.id); changed = true; playSound('win', progress.settings.sound); }
      });
      if (changed) updateProgress({ ...progress, achievements: newAchievements });
  };

  const handleWin = (finalCombo: number, totalMovesSoFar: number) => {
    setIsWon(true);
    playSound('win', progress.settings.sound);
    vibrate(200, progress.settings.haptics);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'] });
    const streakBonus = progress.winStreak > 0 ? Math.min(progress.winStreak * 10, 50) : 0;
    const newCoins = progress.coins + (isTimed ? 100 : 50) + streakBonus; 
    const newLevel = level + 1;
    const newStreak = progress.winStreak + 1;
    const updatedMissions = progress.activeMissions.map(m => {
        if (m.completed) return m;
        let newProgress = m.progress;
        if (m.type === 'WIN_LEVEL') newProgress += 1;
        if (m.type === 'USE_NO_UNDO' && undoCount === 0) newProgress += 1;
        if (m.type === 'PLAY_CHALLENGE' && isTimed) newProgress += 1;
        return { ...m, progress: newProgress, completed: newProgress >= m.target };
    });
    const newStats = { ...progress.stats, totalWins: progress.stats.totalWins + 1, perfectWins: undoCount === 0 ? progress.stats.perfectWins + 1 : progress.stats.perfectWins, gamesPlayed: progress.stats.gamesPlayed + 1, highestCombo: Math.max(progress.stats.highestCombo, finalCombo), totalMoves: totalMovesSoFar };
    updateProgress({ ...progress, coins: newCoins, currentLevel: newLevel, activeMissions: updatedMissions, stats: newStats, winStreak: newStreak });
    checkAchievements(newLevel, newCoins, finalCombo);
  };

  const handleNextLevel = async () => {
    // Show Interstitial on Level Complete occasionally (e.g. every 2 levels)
    if (level % 2 === 0) {
        await showInterstitial();
    }
    setLevel(level + 1);
    setIsWon(false);
  };

  const handleUndo = () => {
    if (history.length === 0 || isGameOver || isPaused) return;
    if (progress.inventory.undo > 0) {
        playSound('select', progress.settings.sound);
        const prev = history[history.length - 1];
        setTubes(prev);
        setHistory(history.slice(0, -1));
        setCombo(0); 
        setUndoCount(prev => prev + 1);
        updateProgress({ ...progress, inventory: { ...progress.inventory, undo: Math.max(0, progress.inventory.undo - 1) } });
    } else { onOpenShop(); }
  };

  // --- REWARD LOGIC WITH ADMOB FALLBACK ---
  const triggerReward = async (type: 'hint' | 'extra_tube') => {
      // 1. Try AdMob Native
      const watched = await showRewarded();
      if (watched) {
          // Success
          handleAdComplete(type);
      } else if (!isNative) {
          // 2. If Web, show Fake Modal
          setShowAd({ type, active: true });
      } else {
          // Native failed (No fill?)
          alert("Ad not available right now.");
      }
  };

  const handleHint = async () => {
    if (isGameOver || isPaused) return;
    if (progress.inventory.hint > 0) {
        fetchHint();
    } else {
        triggerReward('hint');
    }
  };

  const handleExtraTube = async () => {
      if (isGameOver || isPaused) return;
      if (progress.inventory.extraTube > 0) {
          setTubes([...tubes, []]);
          playSound('win', progress.settings.sound);
          vibrate(50, progress.settings.haptics);
          updateProgress({ ...progress, inventory: { ...progress.inventory, extraTube: Math.max(0, progress.inventory.extraTube - 1) } });
      } else {
          triggerReward('extra_tube');
      }
  }

  const fetchHint = async () => {
    setLoadingAI(true);
    setAiMessage("Calculating...");
    const move = await getAIHint(tubes);
    setLoadingAI(false);
    if (move) {
        setHint(move);
        playSound('win', progress.settings.sound); 
        vibrate(50, progress.settings.haptics);
        setAiMessage("Best Move Found!");
        setTimeout(() => setAiMessage(""), 2000);
        updateProgress({ ...progress, inventory: { ...progress.inventory, hint: Math.max(0, progress.inventory.hint - 1) } });
    } else {
        playSound('error', progress.settings.sound);
        setAiMessage("No good moves. Try Undo?");
        setTimeout(() => setAiMessage(""), 2000);
    }
  };

  const handleAdComplete = (type?: string) => {
      const rewardType = type || showAd.type;
      setShowAd({ ...showAd, active: false });
      
      if (rewardType === 'hint') {
          updateProgress({...progress, inventory: {...progress.inventory, hint: progress.inventory.hint + 1}});
      } else if (rewardType === 'extra_tube') {
           updateProgress({...progress, inventory: {...progress.inventory, extraTube: progress.inventory.extraTube + 1}});
           setTubes([...tubes, []]);
           playSound('win', progress.settings.sound);
      }
  };

  const isTubeSolved = (tube: string[]) => tube.length === TUBE_CAPACITY && tube.every(c => c === tube[0]);
  const stars = undoCount === 0 ? 3 : undoCount < 3 ? 2 : 1;

  // Grid/Animation Vars
  const gridContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const tubeItem = { hidden: { opacity: 0, y: 50, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } };

  return (
    <div className="flex flex-col h-full w-full relative pb-16"> {/* Added padding bottom for AdBanner */}
      <AnimatePresence>
        {comboPopup && (
            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1.5, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(255,165,0,1)] pointer-events-none italic">
                COMBO x{comboPopup}!
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center p-4 z-10 shrink-0 glass-panel m-4 rounded-2xl">
        <button onClick={() => setIsPaused(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition"><Pause size={24} /></button>
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold drop-shadow-md flex items-center gap-2">
                LEVEL {level}
                {isTimed && <span className="text-red-400 text-xs bg-red-900/50 px-2 rounded border border-red-500">HARD</span>}
                {isMysteryLevel && <span className="text-purple-400 text-xs bg-purple-900/50 px-2 rounded border border-purple-500 flex items-center gap-1"><EyeOff size={10}/> BLIND</span>}
            </h1>
            {progress.winStreak > 1 && <div className="flex items-center gap-1 text-orange-400 text-xs font-black bg-black/40 px-2 py-0.5 rounded-full animate-pulse border border-orange-500/50"><Flame size={12} fill="currentColor" /> STREAK x{progress.winStreak}</div>}
            {isTimed && <div className={`flex items-center gap-1 font-mono text-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse font-black' : 'text-white'}`}><Timer size={16} /> {timeLeft}s</div>}
            {aiMessage && <span className="text-xs text-yellow-300 animate-pulse font-bold">{aiMessage}</span>}
        </div>
        <div onClick={onOpenShop} className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full cursor-pointer hover:bg-black/40 border border-white/10"><span className="text-yellow-400">🪙</span><span className="font-bold">{progress.coins}</span></div>
      </div>

      {/* Game Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex justify-center">
        <div className="w-full max-w-6xl mx-auto pb-20 pt-4 min-h-full flex flex-col justify-center relative">
            <AnimatePresence>
                {tutorialStep && !selectedTube && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 pointer-events-none">
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white font-bold animate-bounce backdrop-blur-md border border-white/10">Tap a tube to move liquid!</div>
                        <motion.div animate={{ y: [0, 20, 0], x: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-1/2 left-1/2 text-white drop-shadow-[0_0_10px_black]"><Hand size={48} className="rotate-[-45deg]" /></motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={gridContainer} initial="hidden" animate="show" key={`level-${level}`} className="grid gap-x-4 gap-y-16 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 justify-items-center items-end">
                {tubes.map((colors, idx) => (
                    <motion.div key={idx} variants={tubeItem} className="relative">
                        {hint?.from === idx && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce font-bold text-xl z-40">⬇</div>}
                        {hint?.to === idx && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-green-400 animate-bounce font-bold text-xl z-40">Target</div>}
                        <Tube index={idx} colors={colors} isSelected={selectedTube === idx} isSolved={isTubeSolved(colors)} gameMode={mode} theme={theme} isMystery={isMysteryLevel} colorBlindMode={progress.settings.colorBlindMode} onClick={handleTubeClick} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 pb-8 z-10 shrink-0">
        <div className="flex justify-between max-w-md mx-auto gap-4 glass-panel p-4 rounded-2xl">
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleUndo} disabled={history.length === 0 || isGameOver || isPaused} className="flex flex-col items-center gap-1 text-white disabled:opacity-50 transition btn-shimmer">
                <div className="w-12 h-12 bg-blue-600/80 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/50 relative"><RotateCcw size={24} />{progress.inventory.undo > 0 && <span className="absolute -top-2 -right-2 bg-blue-800 text-xs w-5 h-5 flex items-center justify-center rounded-full border border-white">{progress.inventory.undo}</span>}</div>
                <span className="text-xs font-bold">Undo</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleHint} disabled={loadingAI || isGameOver || isPaused} className="flex flex-col items-center gap-1 text-white transition btn-shimmer">
                <div className="w-12 h-12 bg-purple-600/80 rounded-xl flex items-center justify-center shadow-lg border border-purple-400/50 relative">{loadingAI ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Lightbulb size={24} className={progress.inventory.hint === 0 ? "animate-pulse text-yellow-300" : ""} />}{progress.inventory.hint > 0 && <span className="absolute -top-2 -right-2 bg-purple-800 text-xs w-5 h-5 flex items-center justify-center rounded-full border border-white">{progress.inventory.hint}</span>}</div>
                <span className="text-xs font-bold">Hint</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleExtraTube} disabled={isGameOver || isPaused} className="flex flex-col items-center gap-1 text-white transition disabled:opacity-50 btn-shimmer">
                <div className="w-12 h-12 bg-green-600/80 rounded-xl flex items-center justify-center shadow-lg border border-green-400/50 relative"><Plus size={24} />{progress.inventory.extraTube > 0 && <span className="absolute -top-2 -right-2 bg-green-800 text-xs w-5 h-5 flex items-center justify-center rounded-full border border-white">{progress.inventory.extraTube}</span>}</div>
                <span className="text-xs font-bold">+ Tube</span>
            </motion.button>
             <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenShop} className="flex flex-col items-center gap-1 text-white transition btn-shimmer">
                <div className="w-12 h-12 bg-gray-700/80 rounded-xl flex items-center justify-center shadow-lg border border-gray-500/50"><Settings size={24} /></div>
                <span className="text-xs font-bold">Shop</span>
            </motion.button>
        </div>
      </div>

      {/* Win Modal */}
      {isWon && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in overflow-hidden">
             <div className="sunburst"></div>
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="bg-black/80 border border-white/20 text-white p-8 rounded-2xl flex flex-col items-center shadow-2xl relative z-10 backdrop-blur-xl">
                 <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2 text-center">LEVEL COMPLETE!</h2>
                 <div className="flex gap-2 mb-6">{[1, 2, 3].map((s) => (<motion.div key={s} initial={{ scale: 0 }} animate={{ scale: s <= stars ? 1 : 0.8, opacity: s <= stars ? 1 : 0.3 }} transition={{ delay: s * 0.2, type: 'spring' }}><Star size={48} fill={s <= stars ? "#eab308" : "gray"} className={s <= stars ? "text-yellow-500 drop-shadow-lg" : "text-gray-500"}/></motion.div>))}</div>
                 <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-6 text-yellow-500 drop-shadow-md"><Trophy size={80} fill="currentColor" /></motion.div>
                 <div className="flex flex-col items-center mb-6"><p className="font-bold text-gray-300 text-xl">+{isTimed ? 100 : 50} Coins</p>{progress.winStreak > 0 && (<p className="text-orange-400 font-bold text-sm flex items-center gap-1 animate-pulse"><Flame size={14} fill="currentColor" /> Streak Bonus: +{Math.min(progress.winStreak * 10, 50)}</p>)}</div>
                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNextLevel} className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg flex items-center gap-2 btn-shimmer">Next Level <Play fill="currentColor" size={20}/></motion.button>
             </motion.div>
        </div>
      )}

      {/* Game Over / Pause / Settings Modals - same as before */}
      {isGameOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
             <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel border-red-500/50 text-white p-8 rounded-2xl flex flex-col items-center shadow-2xl max-w-xs text-center">
                 <AlertTriangle size={64} className="text-red-500 mb-4 animate-pulse" /><h2 className="text-3xl font-black text-red-500 mb-2">TIME'S UP!</h2><p className="mb-6 text-gray-400">Streak Lost.</p>
                 <motion.button whileTap={{ scale: 0.95 }} onClick={handleRestart} className="bg-white hover:bg-gray-200 text-black text-xl font-bold py-3 px-10 rounded-full shadow-lg flex items-center gap-2"><RotateCcw size={20}/> Try Again</motion.button>
             </motion.div>
        </div>
      )}
      {isPaused && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
              <div className="glass-panel w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center">
                  <h2 className="text-3xl font-bold text-white mb-6">PAUSED</h2>
                  <div className="flex flex-col gap-3"><button onClick={() => setIsPaused(false)} className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 btn-shimmer"><Play size={20} fill="currentColor"/> RESUME</button><button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><RotateCcw size={20} /> RESTART</button><button onClick={() => setShowSettings(true)} className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Settings size={20} /> SETTINGS</button><button onClick={onExit} className="bg-red-900/50 hover:bg-red-900 text-red-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-900"><X size={20} /> EXIT</button></div>
              </div>
          </div>
      )}
      {showSettings && <SettingsModal progress={progress} updateProgress={updateProgress} onClose={() => setShowSettings(false)} />}
      {showAd.active && <AdModal onComplete={() => handleAdComplete()} onCancel={() => setShowAd({ ...showAd, active: false })} rewardDescription={showAd.type === 'hint' ? "1 AI Hint" : showAd.type === 'extra_tube' ? "Extra Tube" : "100 Free Coins"} />}
    </div>
  );
};

export default Game;