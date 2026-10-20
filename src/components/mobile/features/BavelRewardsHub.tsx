import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Sparkles, Trophy, Flame, Coffee, Utensils, Ticket, ChevronRight, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface BavelRewardsHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BavelRewardsHub({ isOpen, onClose }: BavelRewardsHubProps) {
  const [tokens, setTokens] = useState(350);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);

  const rewards = [
    { id: 1, title: "1 Café Offert", partner: "Café de Flore - Paris", cost: 150, icon: Coffee, category: "Boissons" },
    { id: 2, title: "-20% sur un dîner à deux", partner: "Le Grand Bistrot", cost: 300, icon: Utensils, category: "Restaurants" },
    { id: 3, title: "1 Cocktail offert", partner: "Skybar Rooftop", cost: 250, icon: Ticket, category: "Bars & Clubs" },
  ];

  const handleClaim = (id: number, cost: number) => {
    if (tokens >= cost && !claimedRewards.includes(id)) {
      triggerHaptic('heavy');
      setTokens(t => t - cost);
      setClaimedRewards(prev => [...prev, id]);
    } else {
      triggerHaptic('light');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-[#0d021a]/95 backdrop-blur-xl z-[200] flex flex-col text-white select-none">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Bavel Rewards</h2>
            <p className="text-[11px] text-gray-400">Gagnez des cadeaux en swipant avec bienveillance</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
          <ChevronRight className="w-5 h-5 text-gray-300 rotate-90" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {/* Token Balance Card */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300 font-medium mb-1">Vos Jetons Bavel</p>
            <h3 className="text-3xl font-black text-white flex items-center gap-2">
              {tokens} <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40">Jetons VIP</span>
            </h3>
            <p className="text-[11px] text-gray-300 mt-2">Plus vous swipez et discutez, plus vous gagnez !</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/40">
            <Flame className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Rewards List */}
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Partenaires Locaux & Avantages</h3>
        <div className="space-y-3">
          {rewards.map(r => {
            const Icon = r.icon;
            const isClaimed = claimedRewards.includes(r.id);
            const canAfford = tokens >= r.cost;

            return (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{r.title}</h4>
                    <p className="text-[11px] text-gray-400">{r.partner}</p>
                    <p className="text-xs font-bold text-amber-400 mt-1">{r.cost} Jetons</p>
                  </div>
                </div>
                <button
                  onClick={() => handleClaim(r.id, r.cost)}
                  disabled={isClaimed || !canAfford}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${isClaimed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30' : 'bg-white/10 text-gray-400 cursor-not-allowed'}`}
                >
                  {isClaimed ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Obtenu</span> : 'Échanger'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
