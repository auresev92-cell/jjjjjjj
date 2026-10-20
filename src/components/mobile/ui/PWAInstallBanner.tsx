import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../../hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('bavel_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Hide if already running in standalone native mode or user dismissed in this session
  if (isInstalled || isDismissed) {
    return null;
  }

  // Show banner only if installable via Chromium prompt or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bavel_pwa_banner_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      <div className="px-3 pt-1 pb-1">
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#240c44]/95 via-[#34125c]/95 to-[#1c0836]/95 border border-purple-500/30 rounded-2xl p-2.5 shadow-lg flex items-center justify-between gap-2.5 backdrop-blur-md"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f43f5e] to-[#ec4899] flex items-center justify-center shrink-0 shadow-sm shadow-pink-500/30">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-bold text-white truncate leading-tight">
                Installer Bavel sur mobile
              </span>
              <span className="text-[11px] text-purple-200/70 truncate leading-tight">
                Mode plein écran sans barre d'adresse
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {isInstallable && (
              <button
                onClick={install}
                className="bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] hover:opacity-90 text-white font-extrabold text-[12px] px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Installer
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] hover:opacity-90 text-white font-extrabold text-[12px] px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Installer
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1 text-purple-300/60 hover:text-white transition-colors cursor-pointer rounded-full"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* iOS Safari Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-[#1b0833] border border-purple-500/30 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white cursor-pointer rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f43f5e] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Share className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-[19px] font-extrabold text-white tracking-tight">
                  Installer Bavel sur iPhone / iPad
                </h3>

                <div className="text-left space-y-3 bg-purple-950/40 p-4 rounded-2xl border border-purple-500/20 text-[13px] text-purple-100">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-pink-400" /> dans la barre de Safari.</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Faites défiler vers le bas et touchez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-pink-400" />.</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Touchez <strong>Ajouter</strong> en haut à droite.</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] text-white font-extrabold rounded-full text-[15px] shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  J'ai compris
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
