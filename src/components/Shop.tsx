import React, { useState } from 'react';
import { THEMES, SHOP_ITEMS } from '../constants';
import { Theme, PlayerProgress, ShopItem } from '../types';
import { Lock, Check, ShoppingBag, Palette, Zap, Coins, PlayCircle, ArrowLeft } from 'lucide-react';
import { playSound } from '../services/audioService';
import { showRewarded, isNative } from '../services/admobService';
import AdModal from './AdModal';

interface ShopProps {
  coins: number;
  unlockedThemes: string[];
  currentThemeId: string;
  onPurchase: (theme: Theme) => void;
  onEquip: (themeId: string) => void;
  onClose: () => void;
  progress: PlayerProgress;
  updateProgress: (p: PlayerProgress) => void;
}

type ShopTab = 'THEMES' | 'ITEMS' | 'BANK';

const Shop: React.FC<ShopProps> = ({ coins, unlockedThemes, currentThemeId, onPurchase, onEquip, onClose, progress, updateProgress }) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('THEMES');
  const [showAd, setShowAd] = useState(false);

  const handleBuyItem = (item: ShopItem) => {
      if (coins >= item.price) {
          const newInventory = { ...progress.inventory };
          if (item.type === 'HINT') newInventory.hint += item.amount;
          if (item.type === 'UNDO') newInventory.undo += item.amount;
          if (item.type === 'TUBE') newInventory.extraTube += item.amount;
          if (item.id === 'mega_bundle') { newInventory.undo += 10; newInventory.extraTube += 2; }
          updateProgress({ ...progress, coins: coins - item.price, inventory: newInventory });
          playSound('win', progress.settings.sound);
      } else { playSound('error', progress.settings.sound); }
  };

  // Rewarded Logic
  const triggerReward = async () => {
      const watched = await showRewarded();
      if (watched) {
          handleAdReward();
      } else if (!isNative) {
          setShowAd(true);
      }
  };

  const handleAdReward = () => {
      updateProgress({ ...progress, coins: coins + 100 });
      setShowAd(false);
      playSound('win', progress.settings.sound);
  };

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in text-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-gray-800 shadow-lg shrink-0">
        <button onClick={onClose} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"><ArrowLeft size={24} /></button>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-wider">Store</h2>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-4 py-1 rounded-full shadow-inner"><span className="text-yellow-400 text-xl">🪙</span><span className="font-black text-lg">{coins}</span></div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-gray-900 shrink-0">
          <button onClick={() => { setActiveTab('THEMES'); playSound('select', progress.settings.sound); }} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'THEMES' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'}`}><Palette size={18} /> Themes</button>
          <button onClick={() => { setActiveTab('ITEMS'); playSound('select', progress.settings.sound); }} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ITEMS' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'}`}><Zap size={18} /> Items</button>
          <button onClick={() => { setActiveTab('BANK'); playSound('select', progress.settings.sound); }} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'BANK' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'}`}><Coins size={18} /> Bank</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* THEMES TAB */}
        {activeTab === 'THEMES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((theme) => {
                const isUnlocked = unlockedThemes.includes(theme.id);
                const isEquipped = currentThemeId === theme.id;
                return (
                    <div key={theme.id} className={`relative p-4 rounded-2xl border-2 transition-all transform ${isEquipped ? 'border-green-500 bg-green-900/10' : 'border-gray-700 bg-gray-800'}`}>
                    <div className="flex justify-between items-start mb-3"><h3 className="font-bold text-lg text-white">{theme.name}</h3>{isEquipped && <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><Check size={12}/> ACTIVE</div>}</div>
                    <div className="h-28 w-full rounded-xl mb-4 flex items-center justify-center gap-3 shadow-inner border border-white/10" style={{ background: theme.background }}><div className={`w-8 h-16 border-2 border-white/70 rounded-b-xl bg-white/10 backdrop-blur-sm shadow-lg`} /><div className={`w-8 h-16 border-2 border-white/70 rounded-b-xl bg-white/10 backdrop-blur-sm shadow-lg`} /></div>
                    <button disabled={!isUnlocked && coins < theme.price} onClick={() => { if(isUnlocked) { onEquip(theme.id); playSound('select', progress.settings.sound); } else { onPurchase(theme); playSound('win', progress.settings.sound); } }} className={`w-full py-3 rounded-xl font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-95 ${isUnlocked ? (isEquipped ? 'bg-gray-700 text-gray-400 cursor-default' : 'bg-green-500 hover:bg-green-400 text-white shadow-[0_4px_0_#15803d]') : (coins >= theme.price ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_0_#a16207]' : 'bg-gray-700 text-gray-500 cursor-not-allowed')}`}>{isUnlocked ? (isEquipped ? 'Equipped' : 'Equip') : (<>Buy {theme.price} 🪙</>)}</button>
                    {!isUnlocked && (<div className="absolute top-4 right-4 text-gray-500 bg-black/50 p-1 rounded-full"><Lock size={16} /></div>)}
                    </div>
                );
                })}
            </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'ITEMS' && (
            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-800 p-2 rounded-lg text-center border border-gray-700"><div className="text-2xl">💡</div><div className="text-xs text-gray-400">Hints</div><div className="font-bold text-white">{progress.inventory.hint}</div></div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center border border-gray-700"><div className="text-2xl">↩️</div><div className="text-xs text-gray-400">Undos</div><div className="font-bold text-white">{progress.inventory.undo}</div></div>
                    <div className="bg-gray-800 p-2 rounded-lg text-center border border-gray-700"><div className="text-2xl">🧪</div><div className="text-xs text-gray-400">Tubes</div><div className="font-bold text-white">{progress.inventory.extraTube}</div></div>
                </div>
                {SHOP_ITEMS.map((item) => (
                    <div key={item.id} className="bg-gray-800 p-4 rounded-2xl flex items-center gap-4 border border-gray-700 relative overflow-hidden">
                        <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center text-4xl shrink-0 shadow-inner">{item.icon}</div>
                        <div className="flex-1"><h3 className="font-bold text-lg text-white">{item.name}</h3><p className="text-sm text-gray-400">{item.description}</p></div>
                        <button onClick={() => handleBuyItem(item)} disabled={coins < item.price} className={`px-5 py-3 rounded-xl font-bold flex flex-col items-center min-w-[90px] active:scale-95 transition-transform ${coins >= item.price ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_0_#1e40af]' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}><span className="text-sm">BUY</span><span className="text-xs flex items-center gap-1">{item.price} 🪙</span></button>
                    </div>
                ))}
            </div>
        )}

        {/* BANK TAB */}
        {activeTab === 'BANK' && (
            <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-purple-500 p-6 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 blur-[50px] opacity-30 rounded-full"></div>
                    <h3 className="text-2xl font-black text-white mb-2">Need Coins?</h3>
                    <p className="text-purple-200 mb-6">Watch a short video to earn free coins instantly!</p>
                    <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse"><PlayCircle size={48} className="text-yellow-400" /></div>
                    <button onClick={triggerReward} className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl shadow-[0_4px_0_#15803d] active:scale-95 transition-transform uppercase tracking-wide flex items-center justify-center gap-2">Watch Ad <span className="bg-black/20 px-2 py-0.5 rounded text-sm">+100 🪙</span></button>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl text-center border border-gray-700 opacity-70"><ShoppingBag size={40} className="mx-auto text-gray-500 mb-2" /><h3 className="font-bold text-gray-400">In-App Purchases</h3><p className="text-xs text-gray-600">Coming soon...</p></div>
            </div>
        )}
      </div>
      {showAd && <AdModal onComplete={handleAdReward} onCancel={() => setShowAd(false)} rewardDescription="100 Free Coins" />}
    </div>
  );
};

export default Shop;