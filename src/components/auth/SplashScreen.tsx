import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================
// 1. TYPES
// ============================================

interface SplashScreenProps {
  /** Contrôle la visibilité du splash screen */
  isVisible?: boolean;
  /** Callback appelé après le délai minimum */
  onComplete?: () => void;
  /** Durée minimum d'affichage en ms */
  minDisplayTime?: number;
}

// ============================================
// 2. CONSTANTES
// ============================================

const FALLBACK_LOGO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcRSNTmm66bfuZai3394S3ADJsCz8Ot5-TFf7WY4B61MOmSo2JolbGfyclWiPFzPO19MqNyE0DSktcUkEuM_VdNRkyEcDl42SliwZjt8goGgOcVldT-Q3UOl4TYgSMfhrI-76-4EZLP3kvdbYo4A4qp-KdPpC6OU4MBdyWPoRrg1cy6oDVptK2gbYd04RA29EFUPaWb2CMRpyIVtUZ2tHFu5lB5cbM_xyHVqKZK00pN0AUfxq9uJeEUQ';

const EXIT_DURATION_MS = 400;

const DOT_ANIMATIONS = [0, 1, 2, 3, 4];

// ============================================
// 3. COMPOSANT PRINCIPAL
// ============================================

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isVisible = true,
  onComplete,
  minDisplayTime = 2000
}) => {
  // État interne : contrôle l'affichage réel (reste true pendant l'exit)
  const [isRendered, setIsRendered] = useState(isVisible);

  // Ref pour éviter les re-déclenchements de useEffect si le parent
  // recrée `onComplete` à chaque render
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Refs pour nettoyer les 2 timeouts
  const mainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronise isRendered avec isVisible
  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
    } else {
      // Le parent masque → on joue l'exit puis on démonte
      setIsRendered(false);
    }
  }, [isVisible]);

  // Timer d'auto-complétion
  useEffect(() => {
    if (!isVisible) return;

    mainTimerRef.current = setTimeout(() => {
      setIsRendered(false);
      exitTimerRef.current = setTimeout(() => {
        onCompleteRef.current?.();
      }, EXIT_DURATION_MS);
    }, minDisplayTime);

    return () => {
      if (mainTimerRef.current) clearTimeout(mainTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [isVisible, minDisplayTime]);

  // Handler pour le fallback logo (anti-boucle)
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = FALLBACK_LOGO;
  };

  return (
    <AnimatePresence>
      {isRendered && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-40 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] flex flex-col justify-between items-center overflow-hidden w-full h-full font-sans select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Chargement de l'application Bavel"
        >
          <div className="relative w-full h-full flex flex-col justify-between items-center overflow-hidden">

            {/* AMBIENT GLOWING ORBS */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-600/30 rounded-full blur-[100px] pointer-events-none"
            />

            {/* CONTENU CENTRAL */}
            <div className="splash-screen-content flex w-full max-w-full flex-col items-center justify-center z-10 my-auto px-6 py-8">
              {/* Logo et Titre */}
              <div className="relative flex items-center justify-center mb-5">
                <div
                  className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#2dd4bf]/40 via-[#ec4899]/35 to-[#8b5cf6]/40 pointer-events-none animate-pulse"
                  style={{ filter: 'blur(22px)', animationDuration: '3s' }}
                />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#2dd4bf]/60 to-[#f43f5e]/60 blur-md pointer-events-none opacity-80" />
                <img
                  src="/logo-bavel.png"
                  onError={handleLogoError}
                  alt="Logo Bavel"
                  className="relative object-contain rounded-full shadow-2xl shadow-purple-950/80 ring-1 ring-white/20"
                  style={{
                    width: 'clamp(80px, 22cqi, 104px)',
                    height: 'clamp(80px, 22cqi, 104px)'
                  }}
                />
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="splash-screen-title block w-full max-w-full font-sans font-extrabold mb-4 py-1 leading-none text-center tracking-tight px-2 break-words antialiased electric-text"
                style={{
                  fontSize: 'clamp(2.25rem, 8cqi, 3rem)',
                  letterSpacing: '-0.03em',
                  filter: 'drop-shadow(rgba(255, 255, 255, 0.6) 0px 0px 24px)'
                }}
              >
                Bavel
              </motion.h1>

              {/* Points d'onde animés */}
              <div
                className="flex items-center space-x-2.5 my-3 py-1.5 px-4 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-lg"
                style={{
                  boxShadow:
                    'rgba(45, 212, 191, 0.15) 0px 0px 20px, rgba(244, 63, 94, 0.12) 0px 0px 35px'
                }}
              >
                {DOT_ANIMATIONS.map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      y: ['0px', '-10px', '0px'],
                      scale: [1, 1.35, 1],
                      opacity: [0.35, 1, 0.35]
                    }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.15
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#2dd4bf] to-[#f43f5e]"
                    style={{
                      boxShadow:
                        index === 2
                          ? '0 0 16px rgba(244, 63, 94, 1)'
                          : '0 0 12px rgba(45, 212, 191, 0.7)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;