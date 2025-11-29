import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProgress } from '../types';
import { WHEEL_REWARDS } from '../constants';
import { playSound } from '../services/audioService';
import { showRewarded, isNative } from '../services/admobService';
import confetti from 'canvas-confetti';
import AdModal from './AdModal';

interface SpinWheelProps {
  progress: PlayerProgress;
  updateProgress: (p: PlayerProgress) => void;
  onClose: () => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ progress, updateProgress, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<typeof WHEEL_REWARDS[0] | null>(null);
  const [showAd, setShowAd] = useState(false);

  const getRandomReward = () => {
    const rand = Math.random();
    let cumulative = 0;
    for (const item of WHEEL_REWARDS) { cumulative += item.prob; if (rand < cumulative) return item; }
    return WHEEL_REWARDS[0];
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setReward(null);
    playSound('select', progress.settings.sound);
    const target = getRandomReward();
    const targetIndex = WHEEL_REWARDS.findIndex(r => r.id === target.id);
    const segmentAngle = 360 / WHEEL_REWARDS.length;
    const spins = 5; 
    const randomOffset = Math.random() * (segmentAngle - 10) + 5; 
    const stopAngle = 360 * spins + (360 - (targetIndex * segmentAngle)) + randomOffset;
    setRotation(rotation + stopAngle);
    setTimeout(() => {
        setIsSpinning(false);
        setReward(target);
        playSound('win', progress.settings.sound);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        const newInv = { ...progress.inventory };
        if (target.type === 'HINT') newInv.hint += target.amount;
        if (target.type === 'UNDO') newInv.undo += target.amount;
        if (target.type === 'TUBE') newInv.extraTube += target.amount;
        updateProgress({ ...progress, coins: target.type === 'COIN' ? progress.coins + target.amount : progress.coins, inventory: newInv });
    }, 4000); 
  };

  const triggerSpin = async () => {
      const watched = await showRewarded();
      if (watched) {
          handleSpin();
      } else if (!isNative) {
          setShowAd(true);
      }
  };

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col text-white animate-fade-in">
      <div className="p-4 flex items-center justify-between bg-gray-800 shadow-lg shrink-0">
        <button onClick={onClose} disabled={isSpinning} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold uppercase tracking-wider text-yellow-400">Lucky Spin</h2>
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 px-3 py-1 rounded-full"><span className="text-yellow-400">🪙</span><span className="font-bold">{progress.coins}</span></div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[20%] z-20 text-white drop-shadow-xl text-4xl transform translate-y-2">⬇</div>
        <div className="relative w-80 h-80 rounded-full border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-gray-800 overflow-hidden" style={{ transition: 'transform 4s cubic-bezier(0.1, 0.05, 0.2, 1)', transform: `rotate(${rotation}deg)` }}>
            {WHEEL_REWARDS.map((item, index) => {
                const angle = 360 / WHEEL_REWARDS.length;
                return (
                    <div key={item.id} className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center" style={{ transform: `rotate(${index * angle}deg) skewY(-${90 - angle}deg)`, background: item.color, borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
                         <div className="absolute" style={{ transform: `skewY(${90 - angle}deg) rotate(${angle/2}deg) translate(60px, 0) rotate(90deg)`, textAlign: 'center' }}>
                             <div className="font-black text-white drop-shadow-md text-lg">{item.label}</div><div className="text-xs text-white/80">{item.type}</div>
                         </div>
                    </div>
                );
            })}
        </div>
        <div className="absolute top-[calc(50%-20px)] left-[calc(50%-20px)] w-10 h-10 bg-white rounded-full shadow-lg border-2 border-gray-300 z-10 flex items-center justify-center"><div className="w-2 h-2 bg-gray-400 rounded-full"></div></div>
        <div className="mt-12 flex flex-col items-center gap-4 z-20">
            {!reward ? (
                <button onClick={triggerSpin} disabled={isSpinning} className="bg-green-500 hover:bg-green-400 text-white text-xl font-black py-4 px-12 rounded-full shadow-[0_4px_0_#15803d] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"><PlayCircle size={24} /> SPIN FREE</button>
            ) : (
                <div className="flex flex-col items-center animate-bounce"><div className="text-2xl font-bold text-yellow-400 mb-2">You Won: {reward.label}!</div><button onClick={() => setReward(null)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-8 rounded-full">Spin Again</button></div>
            )}
            <p className="text-gray-500 text-xs">Watch an ad to spin</p>
        </div>
      </div>
      {showAd && <AdModal onComplete={() => { setShowAd(false); handleSpin(); }} onCancel={() => setShowAd(false)} rewardDescription="1 Lucky Spin" />}
    </div>
  );
};

export default SpinWheel;