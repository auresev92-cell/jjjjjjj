import React from 'react';
import { motion } from 'motion/react';
import { X, Zap } from 'lucide-react';

export interface WantMoreLikesModalProps {
  onClose: () => void;
  onOpenRecharge: () => void;
  userPhotos?: string[];
}

export function WantMoreLikesModal({ 
  onClose, 
  onOpenRecharge, 
  userPhotos = [] 
}: WantMoreLikesModalProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[220] flex flex-col justify-between items-center py-10 px-6 font-sans select-none overflow-hidden"
    >
      {/* Top Header Close button */}
      <div className="w-full flex items-center justify-start shrink-0">
        <button 
          onClick={onClose} 
          className="p-1.5 -ml-1.5 text-purple-200 hover:text-white transition-opacity cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-6.5 h-6.5 text-white" strokeWidth={2.2} />
        </button>
      </div>

      {/* Main Content Center */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto w-full max-w-[320px]">
        {/* 3 Overlapping Avatars */}
        <div className="relative flex justify-center items-center mb-8 h-[110px] w-full">
          {/* Left Avatar */}
          <div className="w-[82px] h-[82px] rounded-full overflow-hidden border-[2.5px] border-purple-400/40 shadow-sm shrink-0 z-0 translate-x-[20px]">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80" 
              alt="Profile left" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Middle Avatar (Main user photo with lightning badge) */}
          <div className="relative w-[112px] h-[112px] rounded-full overflow-hidden border-[3.5px] border-pink-500 shadow-lg shrink-0 z-10">
            <img 
              src={userPhotos[0] || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"} 
              alt="Profile center" 
              className="w-full h-full object-cover object-top" 
            />
            {/* Lightning Zap Badge */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[30px] h-[30px] rounded-full bg-purple-900 border-[2.5px] border-pink-500 flex items-center justify-center shadow-xs z-20">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={0} />
            </div>
          </div>

          {/* Right Avatar */}
          <div className="w-[82px] h-[82px] rounded-full overflow-hidden border-[2.5px] border-purple-400/40 shadow-sm shrink-0 z-0 -translate-x-[20px]">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" 
              alt="Profile right" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-black text-white mb-2.5 tracking-tight leading-snug">
          Vous voulez plus de Likes ?
        </h2>

        {/* Subtitle */}
        <p className="text-purple-200/80 text-[13.5px] font-medium leading-[1.38] mb-8 px-2">
          Découvrez plus de personnes dans Rencontres, ou augmentez vos chances grâce aux Extra Shows !
        </p>

        {/* Action Button */}
        <button 
          onClick={onOpenRecharge}
          className="w-full bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white font-extrabold py-3.5 rounded-full text-[15px] shadow-lg active:scale-[0.98] transition-transform cursor-pointer mb-3"
        >
          Encore plus de Likes
        </button>

        {/* Close Text Link */}
        <button 
          onClick={onClose}
          className="text-purple-300 font-semibold text-[13.5px] py-1 hover:text-white transition-colors cursor-pointer"
        >
          Fermer
        </button>
      </div>

      <div className="w-full shrink-0 h-4" />
    </motion.div>
  );
}
