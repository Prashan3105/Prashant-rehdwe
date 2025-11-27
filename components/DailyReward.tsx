
import React, { useEffect, useState } from 'react';
import { Gift, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyRewardProps {
  onClaim: (amount: number) => void;
  onClose: () => void;
}

const DailyReward: React.FC<DailyRewardProps> = ({ onClaim, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClaim = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onClaim(100);
    setIsOpen(false);
    setTimeout(onClose, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-indigo-900 to-purple-900 border-2 border-yellow-400 w-full max-w-sm rounded-2xl p-8 text-center relative shadow-[0_0_50px_rgba(234,179,8,0.4)]">
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black py-2 px-6 rounded-full shadow-lg text-xl border-4 border-orange-500">
          DAILY BONUS
        </div>

        <div className="mt-8 mb-6 flex justify-center">
           <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center animate-bounce">
              <Gift size={64} className="text-yellow-400" />
           </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
        <p className="text-indigo-200 mb-6">Here is your reward for playing today.</p>

        <div className="text-4xl font-black text-yellow-400 mb-8 drop-shadow-md">
          +100 🪙
        </div>

        <button 
          onClick={handleClaim}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Check strokeWidth={4} /> CLAIM
        </button>
      </div>
    </div>
  );
};

export default DailyReward;
