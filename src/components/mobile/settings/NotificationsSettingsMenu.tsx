import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { SystemNotificationSettingsModal, requestNativeNotificationPermissionWithFlow } from './SystemNotificationSettingsModal';

export interface NotificationsSettingsMenuProps {
  onClose: () => void;
}

export function NotificationsSettingsMenu({ onClose }: NotificationsSettingsMenuProps) {
  const NOTIFICATION_CATEGORIES = [
    {
      id: 'messages',
      title: 'Messages',
      subtitle: 'Recevez une notification quand vous avez reçu un message',
    },
    {
      id: 'matchs',
      title: 'Matchs',
      subtitle: 'Recevez une notification quand vous avez un nouveau Match',
    },
    {
      id: 'likes',
      title: 'Likes',
      subtitle: 'Recevez une notification quand vous avez un nouveau Like',
    },
    {
      id: 'visites',
      title: 'Visites sur votre profil',
      subtitle: "Recevez une notification quand quelqu'un consulte votre profil",
    },
    {
      id: 'favoris',
      title: 'Favoris',
      subtitle: "Recevez une notification quand quelqu'un met votre profil dans ses favoris",
    },
    {
      id: 'cadeaux',
      title: 'Cadeaux',
      subtitle: "Recevez une notification quand quelqu'un vous envoie un cadeau",
    },
    {
      id: 'promos',
      title: 'Conseils, promos et cadeaux',
      subtitle: 'Profitez de conseils et découvrez nos dernières promos',
    },
    {
      id: 'sondages',
      title: 'Enquêtes et sondages',
      subtitle: 'Recevez toutes les infos sur nos programmes de recherche rémunérés et non rémunérés, et aidez-nous à améliorer nos services',
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<{ id: string; title: string; subtitle: string } | null>(null);
  const [showNativeSystemSettingsModal, setShowNativeSystemSettingsModal] = useState(false);
  const [isSystemNotificationsEnabled, setIsSystemNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
    }
    return localStorage.getItem('bavel_native_notifications_enabled') !== 'false';
  });

  const [categorySettings, setCategorySettings] = useState<Record<string, { inApp: boolean; push: boolean; email: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bavel_category_notifications');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    const initial: Record<string, { inApp: boolean; push: boolean; email: boolean }> = {};
    NOTIFICATION_CATEGORIES.forEach(cat => {
      initial[cat.id] = { inApp: true, push: true, email: true };
    });
    return initial;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenNativeSystemNotificationSettings = async () => {
    // Request browser level notification permission if supported
    await requestNativeNotificationPermissionWithFlow();
    // Open the native system settings view
    setShowNativeSystemSettingsModal(true);
  };

  const handleToggleSystemNotifications = () => {
    const nextState = !isSystemNotificationsEnabled;
    setIsSystemNotificationsEnabled(nextState);
    localStorage.setItem('bavel_native_notifications_enabled', nextState ? 'true' : 'false');
    if (nextState && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    showToast(nextState ? "Notifications système activées pour Bavel" : "Notifications système désactivées pour Bavel");
  };

  const toggleCategorySetting = (catId: string, channel: 'inApp' | 'push' | 'email') => {
    setCategorySettings(prev => {
      const currentCat = prev[catId] || { inApp: true, push: true, email: true };
      const updated = {
        ...prev,
        [catId]: {
          ...currentCat,
          [channel]: !currentCat[channel]
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('bavel_category_notifications', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[120] flex flex-col h-full overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pt-10 pb-3 px-4 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 shrink-0 relative">
        <button 
          onClick={() => {
            if (selectedCategory) {
              setSelectedCategory(null);
            } else {
              onClose();
            }
          }} 
          className="p-1 -ml-1 text-white hover:text-purple-300 transition-colors cursor-pointer z-10"
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.2} />
        </button>
        <h2 className="text-[17px] font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2 truncate max-w-[65%] text-center">
          {selectedCategory ? selectedCategory.title : 'Notifications'}
        </h2>
        <div className="w-6" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-2">
        {!selectedCategory ? (
          /* Main Notifications List View */
          <div className="space-y-4">
            {/* Top Promo Banner */}
            <div 
              onClick={handleOpenNativeSystemNotificationSettings}
              className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-purple-900/30 transition-colors shadow-lg shadow-purple-950/40"
            >
              <div className="flex items-center space-x-3.5 pr-2">
                <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-purple-300 fill-purple-300" strokeWidth={1} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight">
                    Vous ne voulez rien manquer ?
                  </h3>
                  <p className="text-[13px] text-purple-200/70 font-normal leading-snug mt-0.5">
                    Recevez une notification en cas de Match ou message
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" strokeWidth={2} />
            </div>

            {/* List of Notification Categories */}
            <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl overflow-hidden shadow-lg shadow-purple-950/40 divide-y divide-purple-500/15">
              {NOTIFICATION_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-3.5 flex items-center justify-between hover:bg-purple-900/30 transition-colors cursor-pointer"
                >
                  <div className="flex-1 pr-4">
                    <h4 className="text-[15px] font-bold text-white tracking-tight leading-tight">
                      {cat.title}
                    </h4>
                    <p className="text-[13px] text-purple-200/70 font-normal leading-snug mt-1">
                      {cat.subtitle}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" strokeWidth={2} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Sub-category Detail Toggle View */
          <div className="space-y-4">
            {/* Description Subtitle Bar */}
            <div className="px-2 pt-1 pb-2">
              <p className="text-[13px] text-purple-200/80 font-normal leading-relaxed">
                {selectedCategory.subtitle}
              </p>
            </div>

            {/* 3 Channels Toggles */}
            <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl overflow-hidden shadow-lg shadow-purple-950/40 divide-y divide-purple-500/15">
              {/* Option 1: Notifications dans l'app */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <span className="text-[15px] font-medium text-white tracking-tight">
                  Notifications dans l'app
                </span>
                <button
                  type="button"
                  onClick={() => toggleCategorySetting(selectedCategory.id, 'inApp')}
                  className={`w-[51px] h-[31px] rounded-full transition-colors relative duration-200 focus:outline-none shrink-0 cursor-pointer ${
                    (categorySettings[selectedCategory.id]?.inApp ?? true) ? 'bg-[#ec4899]' : 'bg-white/10 border border-purple-500/30'
                  }`}
                >
                  <div 
                    className={`w-[27px] h-[27px] rounded-full bg-white absolute top-[2px] transition-transform duration-200 shadow-sm ${
                      (categorySettings[selectedCategory.id]?.inApp ?? true) ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>

              {/* Option 2: Notifications push */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <span className="text-[15px] font-medium text-white tracking-tight">
                  Notifications push
                </span>
                <button
                  type="button"
                  onClick={() => toggleCategorySetting(selectedCategory.id, 'push')}
                  className={`w-[51px] h-[31px] rounded-full transition-colors relative duration-200 focus:outline-none shrink-0 cursor-pointer ${
                    (categorySettings[selectedCategory.id]?.push ?? true) ? 'bg-[#ec4899]' : 'bg-white/10 border border-purple-500/30'
                  }`}
                >
                  <div 
                    className={`w-[27px] h-[27px] rounded-full bg-white absolute top-[2px] transition-transform duration-200 shadow-sm ${
                      (categorySettings[selectedCategory.id]?.push ?? true) ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>

              {/* Option 3: E-mails */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <span className="text-[15px] font-medium text-white tracking-tight">
                  E-mails
                </span>
                <button
                  type="button"
                  onClick={() => toggleCategorySetting(selectedCategory.id, 'email')}
                  className={`w-[51px] h-[31px] rounded-full transition-colors relative duration-200 focus:outline-none shrink-0 cursor-pointer ${
                    (categorySettings[selectedCategory.id]?.email ?? true) ? 'bg-[#ec4899]' : 'bg-white/10 border border-purple-500/30'
                  }`}
                >
                  <div 
                    className={`w-[27px] h-[27px] rounded-full bg-white absolute top-[2px] transition-transform duration-200 shadow-sm ${
                      (categorySettings[selectedCategory.id]?.email ?? true) ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Native System Settings Notification Modal (Simulating Native OS Settings) */}
      <AnimatePresence>
        {showNativeSystemSettingsModal && (
          <SystemNotificationSettingsModal onClose={() => setShowNativeSystemSettingsModal(false)} />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg z-[200]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
