// components/SwipeActions.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Heart, RotateCcw } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface SwipeActionsProps {
  onPass: () => void;
  onCoupDeCoeur: () => void;
  onLike: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  isPageTurning?: boolean;
  size?: 'sm' | 'default' | 'lg';
  showTooltips?: boolean;
  keyboardShortcuts?: boolean;
}

/**
 * Icône pro "Cœur transpercé par une flèche" (Cupidon / Coup de Cœur)
 * Tracé vectoriel ultra-précis, courbe de Bézier continue, design épuré leader dev.
 */
export function CupidHeartArrowIcon({ className = "w-6 h-6 text-black" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cœur et découpe de flèche en courbes continues sans facettes */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
      {/* Pointe de flèche élégante */}
      <path
        d="M17.5 1.5L22.5 6.5M22.5 1.5L22.5 6.5L17.5 6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Empennage de flèche bas-gauche */}
      <path
        d="M2 22L6.5 17.5M1.5 19L5 15.5M5 22.5L8.5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Icône "X" (Passer) - SVG net, géométrie proportionnée
 */
export function SwipePassIcon({ className = "w-6 h-6 text-black" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Icône "Cœur" (Liker) - SVG vectoriel plein, galbe harmonieux
 */
export function SwipeHeartIcon({ className = "w-6 h-6 text-black" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      stroke="none"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// Bouton d'action circulaire blanc épuré conforme au format mobile
const ActionButton = ({
  icon,
  label,
  shortcut,
  onClick,
  disabled,
  size = 'large',
  haptic = true,
  showTooltip = true,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  size?: 'medium' | 'large';
  haptic?: boolean;
  showTooltip?: boolean;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (haptic && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
    onClick();
  };

  const isMedium = size === 'medium';
  // Tailles adaptées au format mobile pour une ergonomie tactile parfaite (>= 48px)
  const sizeClasses = isMedium
    ? 'w-[48px] h-[48px] min-w-[48px] min-h-[48px] sm:w-[52px] sm:h-[52px]'
    : 'w-[56px] h-[56px] min-w-[56px] min-h-[56px] sm:w-[62px] sm:h-[62px]';

  const button = (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative ${sizeClasses}
        bg-white 
        rounded-full 
        flex items-center justify-center 
        shadow-[0_6px_20px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)] 
        active:shadow-[0_2px_8px_rgba(0,0,0,0.12)]
        transition-all duration-150 
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-manipulation cursor-pointer 
        group overflow-hidden select-none
        border border-black/[0.04]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black
      `}
      aria-label={label}
      aria-disabled={disabled}
      aria-describedby={shortcut ? `shortcut-${label.replace(/\s/g, '-')}` : undefined}
    >
      {/* Icône en noir pur conforme à la photo */}
      <span className="text-black z-20 flex items-center justify-center transition-transform">
        {icon}
      </span>

      {/* Raccourci clavier (survol desktop) */}
      {shortcut && (
        <span 
          id={`shortcut-${label.replace(/\s/g, '-')}`}
          className="absolute -bottom-1 -right-1 text-[8px] font-mono bg-black/80 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none"
        >
          {shortcut}
        </span>
      )}
    </motion.button>
  );

  if (showTooltip) {
    return (
      <Tooltip.Root delayDuration={400}>
        <Tooltip.Trigger asChild>
          <div className="pointer-events-auto">
            {button}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/10 max-w-[200px] z-50"
            sideOffset={8}
            side="top"
          >
            {label}
            {shortcut && (
              <span className="ml-2 text-[10px] opacity-60 font-mono">
                {shortcut}
              </span>
            )}
            <Tooltip.Arrow className="fill-black/90" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return <div className="pointer-events-auto">{button}</div>;
};

export function SwipeActions({
  onPass,
  onCoupDeCoeur,
  onLike,
  onUndo,
  canUndo = false,
  isPageTurning = false,
  showTooltips = true,
  keyboardShortcuts = true,
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastActionRef = useRef<(() => void) | undefined>(undefined);

  // 📌 Gestion des raccourcis clavier
  useEffect(() => {
    if (!keyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (isPageTurning) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onPass();
          lastActionRef.current = onPass;
          break;
        case 'ArrowRight':
          e.preventDefault();
          onLike();
          lastActionRef.current = onLike;
          break;
        case 'ArrowUp':
          e.preventDefault();
          onCoupDeCoeur();
          lastActionRef.current = onCoupDeCoeur;
          break;
        case 'z':
        case 'Z':
          if ((e.ctrlKey || e.metaKey) && canUndo && onUndo) {
            e.preventDefault();
            onUndo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPass, onLike, onCoupDeCoeur, onUndo, canUndo, isPageTurning, keyboardShortcuts]);

  // 📢 Annonceur d'accessibilité (pour les lecteurs d'écran)
  const announceAction = (action: string) => {
    const announcer = document.getElementById('swipe-actions-announcer');
    if (announcer) {
      announcer.textContent = `Action: ${action}`;
    }
  };

  const wrapAction = (action: () => void, name: string) => {
    return () => {
      action();
      announceAction(name);
    };
  };

  return (
    <>
      {/* Annonceur accessible (caché visuellement) */}
      <div
        id="swipe-actions-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      <Tooltip.Provider>
        <div 
          ref={containerRef}
          className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center items-center gap-2.5 sm:gap-4 px-3 z-30 pointer-events-auto select-none"
          role="toolbar"
          aria-label="Actions de swipe"
        >
          {/* 0. Bouton Annuler / Rewind (Rotation jaune) */}
          {onUndo && (
            <ActionButton
              icon={
                <RotateCcw 
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${canUndo ? 'text-[#ff9500]' : 'text-neutral-300'}`} 
                  strokeWidth={2.5} 
                />
              }
              label="Annuler le swipe"
              shortcut="⌘Z"
              onClick={wrapAction(onUndo, 'Annuler le swipe')}
              disabled={!canUndo || isPageTurning}
              size="medium"
              showTooltip={showTooltips}
            />
          )}

          {/* 1. Bouton X (Passer) - Cercle blanc compact, X vectoriel net */}
          <ActionButton
            icon={
              <SwipePassIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            }
            label="Passer"
            shortcut="←"
            onClick={wrapAction(onPass, 'Passer')}
            disabled={isPageTurning}
            size="large"
            showTooltip={showTooltips}
          />

          {/* 2. Bouton Cœur Flèche (Coup de Cœur / Coup de foudre) - Cœur fléché fluide leader */}
          <ActionButton
            icon={
              <CupidHeartArrowIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            }
            label="Coup de Cœur"
            shortcut="↑"
            onClick={wrapAction(onCoupDeCoeur, 'Coup de cœur')}
            disabled={isPageTurning}
            size="medium"
            showTooltip={showTooltips}
          />

          {/* 3. Bouton Cœur (Liker) - Cœur vectoriel galbé leader */}
          <ActionButton
            icon={
              <SwipeHeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            }
            label="Liker"
            shortcut="→"
            onClick={wrapAction(onLike, 'Liker')}
            disabled={isPageTurning}
            size="large"
            showTooltip={showTooltips}
          />
        </div>
      </Tooltip.Provider>
    </>
  );
}