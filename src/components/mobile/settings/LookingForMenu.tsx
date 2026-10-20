import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Coffee } from 'lucide-react';

export interface LookingForMenuProps {
  onClose: () => void;
  selected?: 'serieuse' | 'discuter' | 'rencontres';
  onSelect?: (val: 'serieuse' | 'discuter' | 'rencontres') => void;
}

export function LookingForMenu({ 
  onClose,
  selected: propSelected = 'serieuse',
  onSelect
}: LookingForMenuProps) {
  const [selected, setSelected] = useState<'serieuse' | 'discuter' | 'rencontres'>(propSelected);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-[#1e0735] border-t border-purple-500/30 text-white rounded-t-[28px] flex flex-col max-h-[90vh] shadow-2xl"
      >
        <div className="flex flex-col px-4 pt-5 pb-6">
          <div className="w-12 h-1.5 bg-purple-400/30 rounded-full mx-auto mb-3" />
          <div className="text-center mb-4">
            <h2 className="text-[18px] font-extrabold text-white mb-1">Que recherchez-vous ?</h2>
            <p className="text-[13px] text-purple-200/70 leading-snug px-3">
              Les belles rencontres riment avec honnêteté. Vous pourrez modifier votre envie à tout moment.
            </p>
          </div>

          <div className="flex flex-col space-y-2.5 mb-5">
            <button 
              onClick={() => setSelected('rencontres')}
              className={`flex items-center justify-between p-3.5 rounded-[18px] transition-all cursor-pointer ${selected === 'rencontres' ? 'bg-[#35105a] border border-[#ec4899]/70 shadow-[0_0_15px_rgba(236,72,153,0.25)]' : 'bg-[#250b44]/90 border border-purple-500/20 hover:bg-[#2c0e50]'}`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center shrink-0 text-amber-300">
                  <Coffee className="w-5 h-5 text-amber-300 fill-amber-300" strokeWidth={1} />
                </div>
                <div className="flex flex-col text-left pr-2 min-w-0">
                  <span className="text-[14px] font-bold text-white mb-0.5">Des rencontres</span>
                  <span className="text-[12px] text-purple-200/70 leading-tight">J'ai envie d'avoir des dates et de passer de bons moments.</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-[2px] shrink-0 flex items-center justify-center ${selected === 'rencontres' ? 'border-[#ec4899] bg-[#ec4899]' : 'border-purple-400/40'}`}>
                {selected === 'rencontres' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            <button 
              onClick={() => setSelected('discuter')}
              className={`flex items-center justify-between p-3.5 rounded-[18px] transition-all cursor-pointer ${selected === 'discuter' ? 'bg-[#35105a] border border-[#2dd4bf]/70 shadow-[0_0_15px_rgba(45,212,191,0.25)]' : 'bg-[#250b44]/90 border border-purple-500/20 hover:bg-[#2c0e50]'}`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center shrink-0 text-[#2dd4bf]">
                  <MessageCircle className="w-5 h-5 text-[#2dd4bf] fill-[#2dd4bf]" strokeWidth={1} />
                </div>
                <div className="flex flex-col text-left pr-2 min-w-0">
                  <span className="text-[14px] font-bold text-white mb-0.5">Discuter</span>
                  <span className="text-[12px] text-purple-200/70 leading-tight">J'ai envie de faire de nouvelles connaissances, on verra bien.</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-[2px] shrink-0 flex items-center justify-center ${selected === 'discuter' ? 'border-[#2dd4bf] bg-[#2dd4bf]' : 'border-purple-400/40'}`}>
                {selected === 'discuter' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            <button 
              onClick={() => setSelected('serieuse')}
              className={`flex items-center justify-between p-3.5 rounded-[18px] transition-all cursor-pointer ${selected === 'serieuse' ? 'bg-[#35105a] border border-[#f43f5e]/70 shadow-[0_0_15px_rgba(244,63,94,0.25)]' : 'bg-[#250b44]/90 border border-purple-500/20 hover:bg-[#2c0e50]'}`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center shrink-0 text-[#f43f5e]">
                  <Heart className="w-5 h-5 text-[#f43f5e] fill-[#f43f5e]" strokeWidth={1} />
                </div>
                <div className="flex flex-col text-left pr-2 min-w-0">
                  <span className="text-[14px] font-bold text-white mb-0.5">Une histoire sérieuse</span>
                  <span className="text-[12px] text-purple-200/70 leading-tight">J'ai envie d'une relation à long terme.</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-[2px] shrink-0 flex items-center justify-center ${selected === 'serieuse' ? 'border-[#f43f5e] bg-[#f43f5e]' : 'border-purple-400/40'}`}>
                {selected === 'serieuse' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          <button 
            onClick={() => {
              if (onSelect) onSelect(selected);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-[#2dd4bf] via-[#ec4899] to-[#8b5cf6] text-white rounded-full py-3.5 text-[14.5px] font-bold transition-transform active:scale-[0.98] shadow-lg shadow-purple-950/40 cursor-pointer"
          >
            Ajouter à mon profil
          </button>
        </div>
      </motion.div>
    </div>
  );
}
