import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { syncProfileToSupabase } from '../../../lib/supabase';
import { ExperienceControlModal } from '../../modals/ExperienceControlModal';
import { AboutModal, RestorePurchasesModal } from '../../modals/AboutModal';
import { useAuth } from '../../../context/AuthContext';
import { SystemNotificationSettingsModal, requestNativeNotificationPermissionWithFlow } from './SystemNotificationSettingsModal';

import { InfosMenu } from './InfosMenu';
import { BlockedUsersMenu } from './BlockedUsersMenu';
import { NotificationsSettingsMenu } from './NotificationsSettingsMenu';
import { AccountMenu } from './AccountMenu';
import { TextSizeSettingsMenu } from './TextSizeSettingsMenu';
import { HelpCenterMenu } from './HelpCenterMenu';
import { InvisibleModeMenu } from './InvisibleModeMenu';
import { TermsOfServiceMenu } from './TermsOfServiceMenu';
import { ConfidentialityMenu } from './ConfidentialityMenu';
import { PWAInstallButton } from '../ui/PWAInstallButton';

export interface SettingsMenuProps {
  onClose: () => void;
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
  onLogout?: () => void;
  textScale: number;
  onChangeTextScale: (scale: number) => void;
  onOpenAdmin?: () => void;
}

export function SettingsMenu({ 
  onClose, 
  userProfile, 
  setUserProfile, 
  onLogout,
  textScale,
  onChangeTextScale,
  onOpenAdmin
}: SettingsMenuProps) {
  const [showInfos, setShowInfos] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showNotificationsSettings, setShowNotificationsSettings] = useState(false);
  const [showSystemNotificationModal, setShowSystemNotificationModal] = useState(false);
  const [showConfidentiality, setShowConfidentiality] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showInvisibleMode, setShowInvisibleMode] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTextSizeSettings, setShowTextSizeSettings] = useState(false);
  const [showExperienceControl, setShowExperienceControl] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showRestorePurchases, setShowRestorePurchases] = useState(false);
  const { userRole, isAdmin, user } = useAuth();
  const isUserAdmin = Boolean(
    isAdmin || 
    userRole === 'admin' || 
    user?.role === 'admin' || 
    user?.isAdmin === true || 
    (user?.email && user.email.toLowerCase() === 'donkoff90@gmail.com') ||
    localStorage.getItem('bavel_user_role') === 'admin'
  );

  useEffect(() => {
    const handleBavelNavigate = (e: any) => {
      if (e.detail === 'swipe' || e.detail === 'encounters' || e.detail === 'rencontres') {
        onClose();
      }
    };
    window.addEventListener('bavel_navigate', handleBavelNavigate);
    return () => window.removeEventListener('bavel_navigate', handleBavelNavigate);
  }, [onClose]);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[100] flex flex-col h-full overflow-hidden">
      {showInfos && (
        <InfosMenu 
          onClose={() => setShowInfos(false)} 
          userProfile={userProfile} 
          setUserProfile={setUserProfile} 
        />
      )}
      {showTextSizeSettings && (
        <TextSizeSettingsMenu 
          onClose={() => setShowTextSizeSettings(false)} 
          textScale={textScale} 
          onChangeTextScale={onChangeTextScale} 
        />
      )}
      {showExperienceControl && (
        <ExperienceControlModal
          onClose={() => setShowExperienceControl(false)}
          userProfile={userProfile}
          onUpdateProfile={(updated) => {
            setUserProfile?.(updated);
            syncProfileToSupabase(updated);
          }}
        />
      )}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}
      {showRestorePurchases && (
        <RestorePurchasesModal onClose={() => setShowRestorePurchases(false)} />
      )}

      {showBlockedUsers && (
        <BlockedUsersMenu onClose={() => setShowBlockedUsers(false)} />
      )}

      {showNotificationsSettings && (
        <NotificationsSettingsMenu onClose={() => setShowNotificationsSettings(false)} />
      )}

      {showSystemNotificationModal && (
        <SystemNotificationSettingsModal onClose={() => setShowSystemNotificationModal(false)} />
      )}

      {showConfidentiality && (
        <ConfidentialityMenu 
          onClose={() => setShowConfidentiality(false)} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      )}

      {showTerms && (
        <TermsOfServiceMenu onClose={() => setShowTerms(false)} />
      )}

      {showInvisibleMode && (
        <InvisibleModeMenu 
          onClose={() => setShowInvisibleMode(false)} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      )}

      {showAccountMenu && (
        <AccountMenu 
          onClose={() => setShowAccountMenu(false)} 
          userProfile={userProfile}
          onLogout={() => {
            setShowAccountMenu(false);
            onLogout?.();
          }}
        />
      )}

      {showHelpCenter && (
        <HelpCenterMenu onClose={() => setShowHelpCenter(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-center relative pt-8 pb-3 px-4 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 shrink-0">
        <button onClick={onClose} className="absolute left-4 p-1.5 -ml-1 top-7.5 cursor-pointer text-white hover:text-purple-300 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
        <h2 className="text-[15px] font-extrabold text-white tracking-tight pt-1">Paramètres</h2>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 pb-2 scrollbar-hide">
        {/* Section 1: Notifications Promo */}
        <div 
          onClick={async () => {
            await requestNativeNotificationPermissionWithFlow();
            setShowSystemNotificationModal(true);
          }}
          className="bg-gradient-to-r from-purple-900/60 via-[#260c44]/80 to-pink-900/40 border border-purple-500/25 rounded-2xl mx-3 px-4 py-3.5 mb-3 flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition-all shadow-lg shadow-purple-950/40"
        >
          <div className="flex items-start space-x-3 pr-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#2dd4bf] to-[#ec4899] rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-pink-900/40">
              <Bell className="w-4.5 h-4.5 text-white fill-white" strokeWidth={1} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13.5px] text-white font-bold">Vous ne voulez rien manquer ?</span>
              <span className="text-[12px] text-purple-200/80 leading-snug">Recevez une notification en cas de Match ou message</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400/70 shrink-0" />
        </div>

        {/* Section 2: Modifier infos */}
        <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl mx-3 mb-3 overflow-hidden shadow-lg shadow-purple-950/30">
          <button 
            onClick={() => setShowInfos(true)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-purple-900/30 transition-colors text-left"
          >
            <span className="text-[13.5px] text-white font-medium">Modifier les infos de base</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
        </div>


        {/* Section 3: Facebook */}
        <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl mx-3 px-4 py-3 mb-3 flex flex-col items-start space-y-2 shadow-lg shadow-purple-950/30">
          <span className="text-[13.5px] text-white font-medium">Suivez Bavel sur Facebook !</span>
          <a 
            href="https://www.facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-[12.5px] px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.004 22H11v-9.5h-2.5v-3H11v-1.921C11 5.373 12.316 4 15.011 4H17v3h-1.558C14.73 7 14.545 7.42 14.545 8.163V9.5h2.812l-.464 3H14.545V22z"/>
            </svg>
            <span>J'aime</span>
          </a>
        </div>

        {/* Section 4: About & Legal */}
        <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl mx-3 mb-3 overflow-hidden shadow-lg shadow-purple-950/30 divide-y divide-purple-500/15">
          <button 
            onClick={() => setShowAboutModal(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">À propos</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
          <button 
            onClick={() => setShowTerms(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Conditions générales d'utilisation</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
          <button 
            onClick={() => setShowHelpCenter(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Obtenir de l'aide</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
        </div>

        {/* Section 5: Account Settings */}
        <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl mx-3 mb-3 overflow-hidden shadow-lg shadow-purple-950/30 divide-y divide-purple-500/15">
          <button 
            onClick={() => setShowExperienceControl(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Contrôlez votre expérience</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
          <button 
            onClick={() => setShowNotificationsSettings(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Notifications</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
          <button 
            onClick={() => setShowTextSizeSettings(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Taille du texte</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[12px] text-purple-300/70 font-medium">
                {textScale === 0.9 ? 'Petit (A-)' : textScale === 1.15 ? 'Grand (A+)' : textScale === 1.3 ? 'Très grand (A++)' : 'Normal (A)'}
              </span>
              <ChevronRight className="w-4 h-4 text-purple-400/60" />
            </div>
          </button>
          <PWAInstallButton />
          <button 
            onClick={() => setShowConfidentiality(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Confidentialité</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
          <button 
            onClick={() => setShowAccountMenu(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Compte</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[12px] text-purple-300/70 max-w-[140px] truncate font-medium">
                {userProfile?.email || userProfile?.phone || 'Compte actif'}
              </span>
              <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" />
            </div>
          </button>
          <button 
            onClick={() => setShowInvisibleMode(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Mode Invisible</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
          <button 
            onClick={() => setShowBlockedUsers(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Utilisateurs bloqués</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
        </div>

        {/* Section 6: Restore Purchases */}
        <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl mx-3 mb-3 overflow-hidden shadow-lg shadow-purple-950/30">
          <button 
            onClick={() => setShowRestorePurchases(true)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] text-white font-medium">Récupérer mes achats</span>
            <ChevronRight className="w-4 h-4 text-purple-400/60" />
          </button>
        </div>

        {/* Section 7: Admin Panel (Accessible et visible UNIQUEMENT pour les administrateurs) */}
        {isUserAdmin && (
          <div className="bg-[#200a38]/85 border border-purple-500/30 rounded-2xl mx-3 mb-4 overflow-hidden shadow-lg shadow-purple-950/40">
            <button 
              onClick={() => {
                onClose();
                onOpenAdmin?.();
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-purple-800/30 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                  ⚡
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] text-purple-300 font-bold group-hover:text-purple-200">
                    Panel Administrateur Back-Office
                  </span>
                  <span className="text-[11px] text-purple-300/60">
                    Gestion membres, signalements et sécurité
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Admin 👑
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
