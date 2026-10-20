import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer text-[13.5px] text-white font-medium"
      >
        <span>Installer l'application</span>
        <svg className="w-4 h-4 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer text-[13.5px] text-white font-medium"
        >
          <span>Installer sur iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#1a0832] border border-purple-500/30 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Installer sur iPhone</h3>
              <p className="mt-3 text-sm text-purple-200 leading-relaxed">
                1. Appuyez sur le bouton <strong>Partager</strong> dans Safari.<br />
                2. Faites défiler et appuyez sur <strong>Sur l'écran d'accueil</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
