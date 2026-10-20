import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EyeOff, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface IncognitoModeToggleProps {
  isIncognitoActive: boolean;
  onToggle: (active: boolean) => void;
}

export function IncognitoModeToggle({ isIncognitoActive, onToggle }: IncognitoModeToggleProps) {
  const [active, setActive] = useState(isIncognitoActive);

  const handleToggle = () => {
    const nextState = !active;
    setActive(nextState);
    triggerHaptic('heavy');
    onToggle(nextState);
  };

  return (
    <div className="bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-pink-900/30 border border-violet-500/30 rounded-2xl p-4 text-white relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${active ? 'bg-gradient-to-tr from-violet-600 to-pink-600 shadow-violet-500/40' : 'bg-white/10'}`}>
            {active ? <EyeOff className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-gray-300" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm">Mode Incognito Pro</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/30 text-violet-300 border border-violet-500/40">VIP</span>
            </div>
            <p className="text-[11px] text-gray-300">Visible uniquement par les profils que vous likez</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`w-12 h-7 rounded-full transition-colors relative p-1 ${active ? 'bg-gradient-to-r from-violet-600 to-pink-600' : 'bg-white/20'}`}
        >
          <motion.div
            animate={{ x: active ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-white shadow-md"
          />
        </button>
      </div>
    </div>
  );
}
