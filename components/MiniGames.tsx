
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Grid3X3, Star, Brain, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerProgress } from '../types';
import { playSound } from '../services/audioService';

interface MiniGamesProps {
  progress: PlayerProgress;
  updateProgress: (p: PlayerProgress) => void;
  onClose: () => void;
}

// --- MEMORY GAME ASSETS ---
const ICONS = ['🍎', '🚗', '🐶', '🍕', '🚀', '⚽', '🎸', '💍'];

// --- 2048 HELPER FUNCTIONS ---
const getEmptyBoard = () => Array(4).fill(null).map(() => Array(4).fill(0));

const getTileColor = (value: number) => {
  switch (value) {
    case 2: return 'bg-gray-200 text-gray-800';
    case 4: return 'bg-orange-100 text-gray-800';
    case 8: return 'bg-orange-300 text-white';
    case 16: return 'bg-orange-500 text-white';
    case 32: return 'bg-orange-600 text-white';
    case 64: return 'bg-red-500 text-white';
    case 128: return 'bg-yellow-400 text-white text-2xl';
    case 256: return 'bg-yellow-500 text-white text-2xl shadow-[0_0_10px_yellow]';
    case 512: return 'bg-yellow-600 text-white text-2xl shadow-[0_0_15px_yellow]';
    case 1024: return 'bg-green-500 text-white text-xl shadow-[0_0_20px_green]';
    case 2048: return 'bg-blue-500 text-white text-xl shadow-[0_0_25px_blue]';
    default: return 'bg-black text-white';
  }
};

const MiniGames: React.FC<MiniGamesProps> = ({ progress, updateProgress, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  
  // --- MEMORY GAME STATE ---
  const [cards, setCards] = useState<{id: number, icon: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [memoryWon, setMemoryWon] = useState(false);

  // --- 2048 STATE ---
  const [board, setBoard] = useState<number[][]>(getEmptyBoard());
  const [score, setScore] = useState(0);
  const [game2048Over, setGame2048Over] = useState(false);

  // --- MEMORY GAME LOGIC ---
  const startMemoryGame = () => {
    const shuffled = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffled);
    setFlippedIds([]);
    setMemoryWon(false);
    setSelectedGame('memory');
    playSound('select', progress.settings.sound);
  };

  const handleCardClick = (id: number) => {
    if (flippedIds.length >= 2 || cards[id].isFlipped || cards[id].isMatched) return;

    playSound('flip', progress.settings.sound);
    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setTimeout(() => {
          playSound('match', progress.settings.sound);
          const matchedCards = [...cards];
          matchedCards[first].isFlipped = true;
          matchedCards[second].isFlipped = true;
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIds([]);

          if (matchedCards.every(c => c.isMatched)) {
            setMemoryWon(true);
            playSound('win', progress.settings.sound);
            updateProgress({ ...progress, coins: progress.coins + 20 });
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false; 
          setCards(prev => prev.map((c, i) => (i === first || i === second) ? { ...c, isFlipped: false } : c));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  // --- 2048 LOGIC ---
  const spawnTile = (currentBoard: number[][]) => {
    const emptyTiles = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyTiles.push({ r, c });
      }
    }
    if (emptyTiles.length === 0) return currentBoard;
    
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return currentBoard;
  };

  const start2048 = () => {
    let newBoard = getEmptyBoard();
    newBoard = spawnTile(newBoard);
    newBoard = spawnTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGame2048Over(false);
    setSelectedGame('2048');
    playSound('select', progress.settings.sound);
  };

  const move2048 = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (game2048Over) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let addedScore = 0;

    const compress = (row: number[]) => {
      const newRow = row.filter(val => val !== 0);
      while (newRow.length < 4) newRow.push(0);
      return newRow;
    };

    const merge = (row: number[]) => {
      for (let i = 0; i < 3; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
          row[i] *= 2;
          row[i + 1] = 0;
          addedScore += row[i];
          moved = true; // A merge counts as a move
        }
      }
      return row;
    };

    const processRow = (row: number[]) => {
      const original = [...row];
      let processed = compress(row);
      processed = merge(processed);
      processed = compress(processed);
      if (JSON.stringify(original) !== JSON.stringify(processed)) moved = true;
      return processed;
    };

    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) newBoard[r] = processRow(newBoard[r]);
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) newBoard[r] = processRow(newBoard[r].reverse()).reverse();
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        col = processRow(col);
        for (let r = 0; r < 4; r++) newBoard[r][c] = col[r];
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        col = processRow(col.reverse()).reverse();
        for (let r = 0; r < 4; r++) newBoard[r][c] = col[r];
      }
    }

    if (moved) {
      spawnTile(newBoard);
      setBoard(newBoard);
      setScore(prev => prev + addedScore);
      playSound('pour', progress.settings.sound); // Reuse sound for slide

      // Check Game Over
      // Simple check: if no zeros, and no merges possible
      // (Simplified for brevity)
      let full = true;
      for(let r=0; r<4; r++) for(let c=0; c<4; c++) if(newBoard[r][c] === 0) full = false;
      
      if (full) {
          // Check if any merges possible
          let canMerge = false;
          for(let r=0; r<4; r++) {
              for(let c=0; c<4; c++) {
                  if (c<3 && newBoard[r][c] === newBoard[r][c+1]) canMerge = true;
                  if (r<3 && newBoard[r][c] === newBoard[r+1][c]) canMerge = true;
              }
          }
          if (!canMerge) {
              setGame2048Over(true);
              // Add coins based on score
              const coinsEarned = Math.floor(score / 100);
              if (coinsEarned > 0) {
                  updateProgress({...progress, coins: progress.coins + coinsEarned});
              }
          }
      }
    }
  }, [board, game2048Over, progress, score, updateProgress]);


  // --- RENDER MEMORY GAME ---
  if (selectedGame === 'memory') {
    return (
      <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col text-white animate-fade-in">
        <div className="p-4 flex justify-between items-center bg-gray-800 shadow-lg shrink-0">
            <button onClick={() => setSelectedGame(null)} className="p-2 bg-gray-700 rounded-full">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold">Memory Match</h2>
            <div className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded-full">
                 <span className="text-yellow-400">🪙</span> {progress.coins}
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="grid grid-cols-4 gap-3 w-full max-w-sm aspect-square">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`relative rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
                            card.isFlipped || card.isMatched 
                                ? 'bg-white text-black rotate-0 shadow-lg' 
                                : 'bg-indigo-600 rotate-y-180 border-2 border-indigo-400'
                        }`}
                        disabled={card.isMatched}
                    >
                        <span className={card.isFlipped || card.isMatched ? 'scale-100' : 'scale-0'}>
                            {card.icon}
                        </span>
                    </button>
                ))}
            </div>
            
            {memoryWon && (
                <div className="mt-8 flex flex-col items-center animate-bounce p-4 bg-gray-800 rounded-xl border border-green-500">
                    <h3 className="text-2xl font-bold text-green-400 mb-2">Victory! +20 Coins</h3>
                    <button 
                        onClick={startMemoryGame}
                        className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-500"
                    >
                        <RefreshCw size={20} /> Play Again
                    </button>
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- RENDER 2048 GAME ---
  if (selectedGame === '2048') {
      return (
        <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col text-white animate-fade-in">
             <div className="p-4 flex justify-between items-center bg-gray-800 shadow-lg shrink-0">
                <button onClick={() => setSelectedGame(null)} className="p-2 bg-gray-700 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">2048</h2>
                    <span className="text-xs text-gray-400">Score: {score}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded-full">
                    <span className="text-yellow-400">🪙</span> {progress.coins}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-gray-700 p-4 rounded-xl">
                    <div className="grid grid-cols-4 gap-3 w-72 h-72 sm:w-96 sm:h-96">
                        {board.map((row, r) => (
                            row.map((val, c) => (
                                <div 
                                    key={`${r}-${c}`} 
                                    className={`rounded-lg flex items-center justify-center font-bold text-2xl transition-all duration-100 ${getTileColor(val)}`}
                                >
                                    {val > 0 ? val : ''}
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                {/* D-PAD Controls for Mobile */}
                <div className="mt-8 grid grid-cols-3 gap-2">
                    <div />
                    <button onClick={() => move2048('UP')} className="p-4 bg-gray-700 rounded-full active:bg-gray-600"><ChevronUp size={24}/></button>
                    <div />
                    <button onClick={() => move2048('LEFT')} className="p-4 bg-gray-700 rounded-full active:bg-gray-600"><ChevronLeft size={24}/></button>
                    <button onClick={start2048} className="p-4 bg-red-900/50 rounded-full active:bg-red-900 border border-red-800"><RefreshCw size={24}/></button>
                    <button onClick={() => move2048('RIGHT')} className="p-4 bg-gray-700 rounded-full active:bg-gray-600"><ChevronRight size={24}/></button>
                    <div />
                    <button onClick={() => move2048('DOWN')} className="p-4 bg-gray-700 rounded-full active:bg-gray-600"><ChevronDown size={24}/></button>
                    <div />
                </div>

                {game2048Over && (
                    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
                        <h2 className="text-4xl font-black text-red-500 mb-4">GAME OVER</h2>
                        <p className="text-xl mb-6">Final Score: {score}</p>
                        <p className="text-yellow-400 mb-8 font-bold">Earned +{Math.floor(score/100)} Coins</p>
                        <button onClick={start2048} className="bg-white text-black px-8 py-4 rounded-full font-bold text-xl hover:scale-105 transition">Play Again</button>
                        <button onClick={() => setSelectedGame(null)} className="mt-4 text-gray-400 hover:text-white">Exit</button>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- MENU ---
  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col text-white animate-fade-in">
        <div className="p-4 flex items-center gap-4 bg-gray-800 shadow-lg shrink-0">
            <button onClick={onClose} className="p-2 bg-gray-700 rounded-full">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Mini Games</h1>
        </div>

        <div className="p-6 grid grid-cols-1 gap-4 overflow-y-auto">
            <button 
                onClick={startMemoryGame}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl flex items-center gap-4 shadow-lg transform hover:scale-105 transition-all text-left"
            >
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Brain size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Memory Match</h3>
                    <p className="text-white/70 text-sm">Find pairs & earn coins!</p>
                </div>
            </button>

            <button 
                onClick={start2048}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-2xl flex items-center gap-4 shadow-lg transform hover:scale-105 transition-all text-left"
            >
                 <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Star size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">2048 Merge</h3>
                    <p className="text-white/70 text-sm">Merge numbers to 2048!</p>
                </div>
            </button>

            <button className="bg-gray-800 p-6 rounded-2xl flex items-center gap-4 border border-gray-700 opacity-60 cursor-not-allowed text-left">
                 <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Grid3X3 size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Tile Master</h3>
                    <p className="text-gray-400 text-sm">Coming Soon...</p>
                </div>
            </button>
        </div>
    </div>
  );
};

export default MiniGames;
