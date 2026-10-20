import React from 'react';
import { motion } from 'motion/react';
import { X, Lock } from 'lucide-react';

export interface ConfidentialityMenuProps {
  onClose: () => void;
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
}

export function ConfidentialityMenu({ 
  onClose,
  userProfile,
  setUserProfile
}: ConfidentialityMenuProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center bg-black/75 backdrop-blur-md p-0 sm:p-4 font-sans">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#1f093a] border-t sm:border border-purple-500/30 text-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X className="w-6 h-6" strokeWidth={2.2} />
        </button>

        <div className="p-6 flex flex-col items-center text-center mt-2">
          {/* Lock Icon */}
          <div className="w-[54px] h-[54px] bg-gradient-to-tr from-[#2dd4bf] to-[#ec4899] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-pink-900/40">
            <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>

          <h2 className="text-[21px] font-extrabold text-white tracking-tight mb-2.5">
            Gérer votre confidentialité
          </h2>
          
          <p className="text-[14px] text-purple-200/70 leading-relaxed max-w-[280px] mb-7">
            Partagez ou cachez vos infos, comme votre emplacement ou votre profil. Vous pouvez modifier ces paramètres à tout moment.
          </p>

          <button 
            onClick={() => {
              onClose();
            }}
            className="w-full bg-gradient-to-r from-[#2dd4bf] via-[#ec4899] to-[#8b5cf6] text-white font-bold py-4 rounded-full text-[15px] transition-all mb-3 active:scale-[0.98] shadow-lg shadow-purple-950/40 cursor-pointer"
          >
            Confirmer les paramètres
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/15 text-white border border-purple-500/30 font-bold py-3.5 rounded-full text-[15px] transition-all active:scale-[0.98] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
