import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, EyeOff } from 'lucide-react';
import { syncProfileToSupabase } from '../../../lib/supabase';
import { getSavedUserSafe } from '../../../utils/safeStorage';

export interface InvisibleModeMenuProps {
  onClose: () => void;
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
}

export function InvisibleModeMenu({ 
  onClose,
  userProfile,
  setUserProfile
}: InvisibleModeMenuProps) {
  const [onlineStatusInvisible, setOnlineStatusInvisible] = useState(() => {
    return userProfile?.onlineStatusInvisible || 
           userProfile?.showOnline === false || 
           localStorage.getItem('bavel_setting_online_invisible') === 'true' || 
           localStorage.getItem('bavel_privacy_show_online') === 'false';
  });

  const handleToggleOnline = () => {
    const nextVal = !onlineStatusInvisible;
    setOnlineStatusInvisible(nextVal);
    
    // Save to localStorage across keys
    localStorage.setItem('bavel_setting_online_invisible', nextVal ? 'true' : 'false');
    localStorage.setItem('bavel_privacy_show_online', JSON.stringify(!nextVal));
    
    // Save to userProfile and sync
    if (setUserProfile) {
      setUserProfile((prev: any) => {
        const updated = {
          ...prev,
          onlineStatusInvisible: nextVal,
          showOnline: !nextVal
        };
        syncProfileToSupabase(updated);
        
        const savedUser = getSavedUserSafe() || {};
        localStorage.setItem('app_user', JSON.stringify({ ...savedUser, onlineStatusInvisible: nextVal, showOnline: !nextVal }));
        return updated;
      });
    }

    setTimeout(() => onClose(), 300);
  };

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
          {/* Avatar with icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-400/40 shadow-lg shadow-purple-950/60">
              <img 
                src={userProfile?.photos?.[0] || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-tr from-[#2dd4bf] to-[#ec4899] rounded-full flex items-center justify-center shadow-md border-2 border-[#1f093a]">
              <EyeOff className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-[21px] font-extrabold text-white tracking-tight mb-2.5">
            Activer le mode Invisible
          </h2>
          
          <p className="text-[14px] text-purple-200/70 leading-relaxed max-w-[280px] mb-7">
            Passez en mode invisible pour consulter les profils sans que personne ne le sache.
          </p>

          <button 
            onClick={handleToggleOnline}
            className="w-full bg-gradient-to-r from-[#2dd4bf] via-[#ec4899] to-[#8b5cf6] text-white font-bold py-4 rounded-full text-[15px] transition-all mb-3 active:scale-[0.98] shadow-lg shadow-purple-950/40 cursor-pointer"
          >
            Mode invisible
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/15 text-white border border-purple-500/30 font-bold py-3.5 rounded-full text-[15px] transition-all active:scale-[0.98] cursor-pointer"
          >
            Plus tard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
