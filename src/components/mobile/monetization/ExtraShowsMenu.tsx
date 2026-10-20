import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

export interface ExtraShowsMenuProps {
  onClose: () => void;
  onOpenRecharge?: () => void;
}

export function ExtraShowsMenu({ onClose, onOpenRecharge }: ExtraShowsMenuProps) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative bg-gradient-to-b from-[#1f093a] to-[#120324] border-t border-purple-500/30 rounded-t-[28px] flex flex-col items-center pt-6 pb-6 px-5 max-h-[90vh] z-10 shadow-2xl text-white"
      >
        <motion.div 
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 bg-purple-900/60 border border-purple-500/40 rounded-full flex items-center justify-center mb-4 shadow-md"
        >
          <Zap className="w-8 h-8 text-amber-400 fill-amber-400" strokeWidth={1} />
        </motion.div>
        
        <h2 className="text-[19px] font-black text-white mb-1.5 text-center">Extra Shows ⚡</h2>
        
        <p className="text-[13px] text-purple-200/80 leading-snug text-center mb-6 max-w-[280px]">
          Soyez vu(e) par plus de personnes pour augmenter vos chances de matcher.
        </p>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onClose();
            if (onOpenRecharge) onOpenRecharge();
          }}
          className="w-full bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white rounded-full py-3.5 text-[14px] font-extrabold mb-3 shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          Profitez d'Extra Shows pour 150 crédits
        </motion.button>

        <button onClick={onClose} className="w-full text-purple-300 py-1.5 text-[13.5px] font-medium mb-4 hover:text-white cursor-pointer">
          Peut-être plus tard
        </button>

        <p className="text-[10.5px] text-purple-400/60 text-center leading-tight">
          *Sur la base du top 10% d'un échantillon de 2,7 millions de personnes
        </p>
      </motion.div>
    </div>
  );
}
