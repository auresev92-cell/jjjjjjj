import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { playSynthAudio, triggerHaptic } from '../utils/audio';

export interface ActionSheetOption {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'primary';
  onClick: () => void;
}

export interface ActionSheetConfig {
  title?: string;
  description?: string;
  options: ActionSheetOption[];
  onCancel?: () => void;
}

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface UXContextType {
  // Network status
  isOnline: boolean;
  wasOffline: boolean;
  
  // Feedback settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  
  // Sensory Triggers
  triggerFeedback: (
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error',
    sound?: Parameters<typeof playSynthAudio>[0]
  ) => void;
  playSound: (sound: Parameters<typeof playSynthAudio>[0]) => void;
  
  // Global Modals / Sheets
  actionSheet: ActionSheetConfig | null;
  openActionSheet: (config: ActionSheetConfig) => void;
  closeActionSheet: () => void;
  
  confirmDialog: ConfirmDialogConfig | null;
  showConfirm: (config: ConfirmDialogConfig) => void;
  closeConfirm: () => void;

  // Submenu tracking to cleanly hide navigation bar
  isSubmenuOpen: boolean;
  registerSubmenu: (id: string) => void;
  unregisterSubmenu: (id: string) => void;
  setSubmenuOpen: (open: boolean) => void;
}

const UXContext = createContext<UXContextType | null>(null);

export const UXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [wasOffline, setWasOffline] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('bavel_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('bavel_haptics_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [actionSheet, setActionSheet] = useState<ActionSheetConfig | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);

  // Sync Preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bavel_sound_enabled', JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('bavel_haptics_enabled', JSON.stringify(hapticsEnabled));
    } catch {}
  }, [hapticsEnabled]);

  // Network State Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        triggerHaptic('success');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      triggerHaptic('warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const playSound = useCallback((sound: Parameters<typeof playSynthAudio>[0]) => {
    if (soundEnabled) {
      playSynthAudio(sound);
    }
  }, [soundEnabled]);

  const triggerFeedback = useCallback((
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light',
    sound?: Parameters<typeof playSynthAudio>[0]
  ) => {
    if (hapticsEnabled) {
      triggerHaptic(type);
    }
    if (sound && soundEnabled) {
      playSynthAudio(sound);
    }
  }, [hapticsEnabled, soundEnabled]);

  const openActionSheet = useCallback((config: ActionSheetConfig) => {
    triggerFeedback('light');
    setActionSheet(config);
  }, [triggerFeedback]);

  const closeActionSheet = useCallback(() => {
    setActionSheet(null);
  }, []);

  const showConfirm = useCallback((config: ConfirmDialogConfig) => {
    triggerFeedback('medium');
    setConfirmDialog(config);
  }, [triggerFeedback]);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const [activeSubmenus, setActiveSubmenus] = useState<Set<string>>(new Set());

  const registerSubmenu = useCallback((id: string) => {
    setActiveSubmenus((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregisterSubmenu = useCallback((id: string) => {
    setActiveSubmenus((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const setSubmenuOpen = useCallback((open: boolean) => {
    setActiveSubmenus(open ? new Set(['default_submenu']) : new Set());
  }, []);

  const isSubmenuOpen = activeSubmenus.size > 0;

  return (
    <UXContext.Provider
      value={{
        isOnline,
        wasOffline,
        soundEnabled,
        setSoundEnabled,
        hapticsEnabled,
        setHapticsEnabled,
        triggerFeedback,
        playSound,
        actionSheet,
        openActionSheet,
        closeActionSheet,
        confirmDialog,
        showConfirm,
        closeConfirm,
        isSubmenuOpen,
        registerSubmenu,
        unregisterSubmenu,
        setSubmenuOpen,
      }}
    >
      {children}
    </UXContext.Provider>
  );
};

export const useUX = () => {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useUX must be used within a UXProvider');
  }
  return context;
};
