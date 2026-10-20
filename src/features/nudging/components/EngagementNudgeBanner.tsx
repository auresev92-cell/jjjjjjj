import React, { useEffect, useState } from 'react';
import { Heart, X, Sparkles, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EngagementNudgeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si la bannière a déjà été affichée aujourd'hui (une fois toutes les 24h / premier lancement de la journée)
    const todayStr = new Date().toDateString();
    const lastShownDate = localStorage.getItem('bavel_last_swipe_nudge_date');

    if (lastShownDate === todayStr) {
      // Déjà affichée aujourd'hui, ne pas l'afficher à nouveau
      return;
    }

    // Enregistrer la date du jour et afficher la bannière
    localStorage.setItem('bavel_last_swipe_nudge_date', todayStr);

    const timerShow = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    const handleShowNudge = () => {
      setIsVisible(true);
    };
    window.addEventListener('bavel_show_swipe_nudge', handleShowNudge);

    return () => {
      clearTimeout(timerShow);
      window.removeEventListener('bavel_show_swipe_nudge', handleShowNudge);
    };
  }, []);

  // Guaranteed auto-dismiss timer whenever banner is visible (6 seconds for mobile reading comfort)
  useEffect(() => {
    if (!isVisible) return;

    const timerDismiss = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(timerDismiss);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          onClick={() => setIsVisible(false)}
          className="absolute top-1 sm:top-1.5 left-2 right-2 sm:left-3 sm:right-3 z-[250] flex justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: -26, scale: 0.94, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -28, scale: 0.92, filter: "blur(6px)" }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 26,
              mass: 0.75
            }}
            drag="y"
            dragConstraints={{ top: -80, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y < -15 || info.velocity.y < -150) {
                setIsVisible(false);
              }
            }}
            className="w-full max-w-[384px] bg-[#140827]/95 backdrop-blur-2xl rounded-[20px] sm:rounded-[22px] border border-white/15 shadow-[0_16px_38px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden relative active:scale-[0.99] transition-transform select-none cursor-pointer"
          >
            {/* Banner Main Content */}
            <div className="flex items-center p-2.5 sm:p-3 pr-8 relative">
              {/* iOS Native Glowing App Icon Pill */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-tr from-[#e11d48] via-[#f43f5e] to-[#fb7185] flex items-center justify-center shrink-0 shadow-md shadow-rose-500/35 border border-white/20 relative overflow-hidden mr-2.5 sm:mr-3">
                <motion.div
                  animate={{ scale: [1, 1.22, 1, 1.18, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 text-white fill-white drop-shadow-sm" />
                </motion.div>
                <div className="absolute top-0.5 right-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300 animate-pulse" />
                </div>
              </div>

              {/* Mobile-Optimized Typography */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Micro-eyebrow for native iOS notification feel */}
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center">
                    <Flame className="w-2.5 h-2.5 mr-0.5 inline fill-rose-400" />
                    Conseil Rencontres
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-[10.5px] font-medium text-white/60">
                    Bavel Match
                  </span>
                </div>

                {/* Primary message: perfectly proportioned for mobile screens */}
                <p className="text-[12.5px] min-[380px]:text-[13px] font-semibold text-white/95 leading-[1.32] tracking-tight">
                  Swipez à droite <span className="font-extrabold text-rose-300 bg-rose-500/30 px-1.5 py-0.5 rounded-md border border-rose-500/50 shadow-xs inline-block">50 fois</span> pour mettre toutes les chances de votre côté !
                </p>
              </div>

              {/* Native iOS Dismiss Icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                aria-label="Fermer la notification"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Glowing progress countdown indicator line */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 6, ease: "linear" }}
              className="h-[2px] bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 origin-left shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
