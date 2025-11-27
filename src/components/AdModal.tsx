
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdModalProps {
  onComplete: () => void;
  onCancel: () => void;
  rewardDescription: string;
}

const AdModal: React.FC<AdModalProps> = ({ onComplete, onCancel, rewardDescription }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg p-6 text-center relative overflow-hidden">
        
        {/* Ad Content Placeholder */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-40 w-full rounded-md mb-4 flex items-center justify-center flex-col">
          <span className="text-2xl font-black italic tracking-widest text-white drop-shadow-lg">SUPER GAME</span>
          <p className="text-white/80 text-sm mt-2">Download Now!</p>
        </div>

        <h3 className="text-white text-lg mb-2">Watching Ad...</h3>
        <p className="text-gray-400 text-sm mb-6">Reward: {rewardDescription}</p>

        {canClose ? (
          <button 
            onClick={onComplete}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full animate-bounce"
          >
            Claim Reward
          </button>
        ) : (
          <div className="text-2xl font-mono text-yellow-400">
            {timeLeft}s remaining
          </div>
        )}

        <button 
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-white p-2"
        >
           <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default AdModal;
    