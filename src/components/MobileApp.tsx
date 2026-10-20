import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { 
  SlidersHorizontal, MapPin, Heart, MessageCircle, MessageCircleMore, User as UserIcon, 
  Settings, HelpCircle, Camera, Zap, Search, Bell, Gauge, Edit3, Mail,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Smile, Plus, Copy, MoreHorizontal, Lock, CheckCircle, Check, X, Star, Shield, Eye, EyeOff, FileText, RotateCcw,
  Navigation, Baby, Target, Ruler, Languages, Wine, Sparkles, Dog, Brain, Flame, Cigarette, GraduationCap, BookOpen, Coffee, Clapperboard, ChevronsUp, Megaphone, Battery, Send,
  Radio, Locate, LocateFixed, RefreshCw, Map, Compass, Image as ImageIcon, Briefcase,
  Phone, Video, Mic, CheckCheck, Gift, Ban, ThumbsUp, ArrowUp, Coins, Volume2, VolumeX, UserX, PhoneOff, MicOff, VideoOff, Play, Pause, Trash2, Hand, Users, Pencil
} from 'lucide-react';
import { LoginScreen } from './auth/LoginScreen';
const googleLogout = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  } catch (e) {}
};
import { SplashScreen } from './auth/SplashScreen';
import { RegisterWizard } from './auth/RegisterWizard';
import { ResetPasswordModal } from './auth/ResetPasswordModal';
import { PhotoAdviceModal } from './modals/PhotoAdviceModal';
import { User } from '../types';
import { EditProfileMenu } from './mobile/profils/EditProfileMenu';
import { ActionMenu, MoodsMenu, ChatActionView, ProfileModal, MatchModal, CoupDeCoeurModal, HeartPiercedIcon, SearchDiscussions, DiscussionsSortMenu, NotificationsView, VoiceNoteBubble, AddMediaSourceMenu, FullProfilePhotoModal, FacebookInfoModal } from './mobile/Modals';
import { ExtraShowsMenu, AllFeaturesModal, WantMoreLikesModal, RechargeCreditsMenu } from './mobile/Monetization';

import { SettingsMenu, HelpCenterMenu, LookingForMenu, ActivityMenu, InvisibleModeMenu, ConfidentialityMenu } from './mobile/SettingsMenu';

import { SafetyCentreMenu, CommunityCharterMenu } from './mobile/SafetyCentreMenu';
import { DiscoverTab } from './mobile/discover/DiscoverTab';
import { PWAInstallBanner } from './mobile/ui/PWAInstallBanner';
const AdminPanel = React.lazy(() => import('./mobile/AdminPanel').then(m => ({ default: m.AdminPanel })));
import { AdminProtectedRoute } from './RouteGuards';
import { getAccountRecord, saveAccountRecord, isCompletedProfile } from '../lib/accountStore';
import { EncountersTab } from './mobile/rencontres/EncountersTab';
import { ChatConversationView } from './mobile/discussions/ChatConversationView';
import { LikesTab } from './mobile/likes/LikesTab';
import { DiscussionsTab } from './mobile/discussions/DiscussionsTab';
import { testDiscussionsService } from '../services/testDiscussionsService';
import { ProfileTab } from './mobile/profils/ProfileTab';
import { initAutoDarkMode } from '../utils/autoDarkMode';
import { aiSystemEngine } from '../services/aiSystemEngine';
import { monetizationService, MonetizationTier, MonetizationPermissions } from '../services/monetizationService';
import { FEATURES_PER_TIER, getTierPrivileges } from '../config/featuresConfig';
import BavelPremiumModal from './modals/BavelPremiumModal';
import { useNotificationContext } from '../context/NotificationContext';
import { supabase, getSupabase, initSupabase, isSupabaseConfigured, syncProfileToSupabase, saveMessageToSupabase, saveLikeToSupabase, removeLikeFromSupabase, dismissReceivedLikeInSupabase, updatePassword, fetchAllProfilesFromSupabase, fetchLikesFromSupabase, fetchReceivedLikesFromSupabase, createMatchInSupabase, fetchMatchesFromSupabase, fetchProfileFromSupabase, fetchMessagesFromSupabase } from '../lib/supabase';
import { LOCAL_MOCK_PROFILES } from '../config/mockProfiles';
export const poseImg = '/src/assets/images/pose_verification_reference_1784880975491.jpg';




import { useMobileAppState } from '../hooks/useMobileAppState';
import { useAuth } from '../context/AuthContext';
import { useUX } from '../context/UXContext';
import { getSavedUserSafe, getSafeLocalStorageItem, safeJsonParse } from '../utils/safeStorage';

const FONT_CLASSES: Array<{ className: string; baseSize: number; isBadge?: boolean }> = [
  { className: 'text-xs', baseSize: 12 },
  { className: 'text-sm', baseSize: 14 },
  { className: 'text-base', baseSize: 15.5 },
  { className: 'text-lg', baseSize: 17.5 },
  { className: 'text-xl', baseSize: 20 },
  { className: 'text-2xl', baseSize: 24 },
  { className: 'text-3xl', baseSize: 28 },
  { className: 'text-4xl', baseSize: 32 },
  { className: 'text-[8px]', baseSize: 9, isBadge: true },
  { className: 'text-[8.5px]', baseSize: 9.5, isBadge: true },
  { className: 'text-[9px]', baseSize: 9.5, isBadge: true },
  { className: 'text-[9.5px]', baseSize: 10, isBadge: true },
  { className: 'text-[10px]', baseSize: 10.5, isBadge: true },
  { className: 'text-[10.5px]', baseSize: 11, isBadge: true },
  { className: 'text-[11px]', baseSize: 11.5, isBadge: true },
  { className: 'text-[11.5px]', baseSize: 11.5, isBadge: true },
  { className: 'text-[12px]', baseSize: 12 },
  { className: 'text-[12.5px]', baseSize: 12.5 },
  { className: 'text-[13px]', baseSize: 13 },
  { className: 'text-[13.5px]', baseSize: 13.5 },
  { className: 'text-[14px]', baseSize: 14 },
  { className: 'text-[14.5px]', baseSize: 14.5 },
  { className: 'text-[15px]', baseSize: 15 },
  { className: 'text-[15.5px]', baseSize: 15.5 },
  { className: 'text-[16px]', baseSize: 16 },
  { className: 'text-[17px]', baseSize: 17 },
  { className: 'text-[17.5px]', baseSize: 17.5 },
  { className: 'text-[18px]', baseSize: 18 },
  { className: 'text-[19px]', baseSize: 19 },
  { className: 'text-[20px]', baseSize: 20 },
  { className: 'text-[21px]', baseSize: 21 },
  { className: 'text-[22px]', baseSize: 22 },
  { className: 'text-[24px]', baseSize: 24 },
  { className: 'text-[26px]', baseSize: 26 },
  { className: 'text-[28px]', baseSize: 28 },
  { className: 'text-[32px]', baseSize: 32 }
];

const GUEST_PROFILE = {
  name: 'Steven',
  age: 34,
  city: 'Le Mans',
  gender: 'homme',
  job: 'Développeur Freelance',
  studies: 'Université du Maine',
  bio: 'Sympa, j\'aime le cinéma, les jeux de société et passer du bon temps avec des amis.',
  details: {
    height: '183 cm',
    children: "J'en voudrais un jour",
    alcohol: 'Occasionnellement',
    languages: 'Français',
    relation: 'Célibataire',
    sexuality: 'Hétéro',
    smoking: 'Non-fumeur',
    zodiac: 'Bélier',
    pets: 'Chien',
    religion: 'Catholique',
    education: 'Diplôme universitaire',
    personality: 'Rêveur',
    prompts: []
  },
  keyQuestion: 'Trouver un(e) partenaire de vie',
  interests: [
    { icon: '🎲', label: 'Jeux de société' },
    { icon: '🎬', label: 'Cinéma indépendant' },
    { icon: '🍖', label: 'Barbecues' },
    { icon: '🍫', label: 'Chocolat' },
    { icon: '🍹', label: 'Cocktails' },
    { icon: '🥘', label: 'Cuisiner' },
    { icon: '🎫', label: 'Concerts' },
    { icon: '🥞', label: 'Brunch le week-end' }
  ]
};

const GUEST_PHOTOS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
  '', '', '', '', ''
];

const EMPTY_PROFILE = {
  name: '',
  age: 18,
  city: '',
  gender: '',
  job: '',
  studies: '',
  bio: '',
  details: {
    height: '',
    children: '',
    alcohol: '',
    languages: '',
    relation: '',
    sexuality: '',
    smoking: '',
    zodiac: '',
    pets: '',
    religion: '',
    education: '',
    personality: '',
    prompts: []
  },
  keyQuestion: '',
  interests: []
};

const EMPTY_PHOTOS = ['', '', '', '', '', ''];

const getCleanBaseProfile = (prev: any) => {
  if (!prev || !prev.id || prev.id === 'current_user_id' || prev.name === 'Steven') {
    return EMPTY_PROFILE;
  }
  return prev;
};

function StyleBlock({ textScale }: { textScale: number }) {
  // Mobile-calibrated dynamic typography rules: applied when user customizes text scale
  const dynamicRules = textScale !== 1.0
    ? FONT_CLASSES.map(({ className, baseSize, isBadge }) => {
        const selector = className
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/\./g, '\\.');
        
        const computedSize = Math.max(isBadge ? 9 : 11, Math.round(baseSize * textScale * 10) / 10);
        return `.${selector}:not(input):not(textarea):not(select):not(.material-symbols-outlined):not(.lucide):not(svg):not(path) { font-size: ${computedSize}px !important; }`;
      }).join('\n')
    : '';

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --app-text-scale: ${textScale};
        }
        /* Adaptation mobile des caractères et prévention du zoom iOS Safari */
        input:not([type="checkbox"]):not([type="radio"]):not([inputmode="numeric"]), 
        textarea, 
        select {
          font-size: 16px !important;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
          letter-spacing: -0.01em;
          touch-action: manipulation;
        }
        /* Protection des caractères et lisibilité native sur smartphone */
        .screen-container, .mobile-shell, [role="status"], body, html {
          word-break: normal;
          overflow-wrap: break-word;
          -webkit-tap-highlight-color: transparent;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Pas de césures intempestives sur les éléments d'interface */
        button, a, label, span, nav, header, [role="button"], .tab-label, .badge-text {
          -webkit-hyphens: none !important;
          hyphens: none !important;
        }
        button, a, input, select, textarea {
          touch-action: manipulation;
        }
        /* Règles dynamiques calibrées pour les caractères mobiles */
        ${dynamicRules}

        /* Protection typographique sur smartphones compacts et conteneur mobile */
        @container (max-width: 480px) {
          h1, h2, h3, h4 { letter-spacing: -0.022em; text-wrap: balance; }
        }
        @media (max-width: 480px) {
          h1, h2, h3, h4 { letter-spacing: -0.022em; text-wrap: balance; }
        }
      `
    }} />
  );
}

export function MobileApp({ user }: { user: User }) {
  const { showSplash, setShowSplash, showLogin, setShowLogin, activeTab, setActiveTab } = useMobileAppState();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => prev === msg ? null : prev);
    }, 2500);
  };

  const [textScale, setTextScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bavel_text_scale');
      return saved ? parseFloat(saved) : 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  useEffect(() => {
    const handleScaleUpdate = () => {
      try {
        const saved = localStorage.getItem('bavel_text_scale');
        if (saved) setTextScale(parseFloat(saved));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('bavel-text-scale-updated', handleScaleUpdate);
    return () => window.removeEventListener('bavel-text-scale-updated', handleScaleUpdate);
  }, []);

  useEffect(() => {
    const handleBavelNavigate = (e: any) => {
      const target = e.detail;
      if (target === 'swipe' || target === 'encounters' || target === 'rencontres') {
        setActiveTab('encounters');
      } else if (target) {
        setActiveTab(target);
      }
    };
    window.addEventListener('bavel_navigate', handleBavelNavigate);
    return () => window.removeEventListener('bavel_navigate', handleBavelNavigate);
  }, [setActiveTab]);

  const [discoverSubTab, setDiscoverSubTab] = useState<'all' | 'foryou'>('all');

  const handleTextScaleChange = (scale: number) => {
    setTextScale(scale);
    try {
      localStorage.setItem('bavel_text_scale', scale.toString());
      window.dispatchEvent(new CustomEvent('bavel-text-scale-updated'));
    } catch (e) {}
  };

  const [showRegisterWizard, setShowRegisterWizard] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [tempRegisterData, setTempRegisterData] = useState<{ name?: string; email?: string; phone?: string }>({});

  const {
    unreadCount: notificationsUnreadCount,
    activeToastNotification,
    dismissToastNotification
  } = useNotificationContext();

  const { isSubmenuOpen } = useUX();

  const [activeChat, setActiveChat] = useState<any>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [userMood, setUserMood] = useState<{ emoji: string; label: string }>({
    emoji: '✌️',
    label: 'Plutôt confiant'
  });
  const [userLookingFor, setUserLookingFor] = useState<'serieuse' | 'discuter' | 'rencontres'>('serieuse');
  const [showMoods, setShowMoods] = useState(false);
  const [isMoodsCollapsed, setIsMoodsCollapsed] = useState(false);
  const [genderPreference, setGenderPreference] = useState<'homme' | 'femme' | 'les_deux'>('les_deux');
  const [userStatus, setUserStatus] = useState<MonetizationTier>(() => monetizationService.getUserStatus());
  const [monetizationPermissions, setMonetizationPermissions] = useState<MonetizationPermissions>(() => monetizationService.getPermissions());
  const [isPremium, setIsPremium] = useState<boolean>(() => monetizationService.isPremium());
  const [isExtra, setIsExtra] = useState<boolean>(() => monetizationService.isExtra());

  useEffect(() => {
    const unsubscribe = monetizationService.subscribe(() => {
      const currentTier = monetizationService.getUserStatus();
      setUserStatus(currentTier);
      setIsPremium(monetizationService.isPremium());
      setIsExtra(monetizationService.isExtra());
      setMonetizationPermissions(monetizationService.getPermissions());
    });
    return unsubscribe;
  }, []);

  const handleActivatePremium = () => {
    monetizationService.setUserStatus('premium');
  };

  const handleActivateExtra = () => {
    monetizationService.setUserStatus('extra');
  };

  // Shared interactive states for 100% prototype completion
  const [likedProfileIds, setLikedProfileIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('bavel_liked_profile_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const [hiddenProfileIds, setHiddenProfileIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('bavel_hidden_profile_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bavel_liked_profile_ids', JSON.stringify(likedProfileIds));
  }, [likedProfileIds]);

  useEffect(() => {
    localStorage.setItem('bavel_hidden_profile_ids', JSON.stringify(hiddenProfileIds));
  }, [hiddenProfileIds]);

  // Initialize native device dark mode + night time detection (19h - 7h)
  useEffect(() => {
    const cleanupDarkMode = initAutoDarkMode();
    return cleanupDarkMode;
  }, []);

  const [dbProfiles, setDbProfiles] = useState<any[]>(() => LOCAL_MOCK_PROFILES);
  const [receivedLikes, setReceivedLikes] = useState<string[]>([]);
  const [discussions, setDiscussions] = useState<any[]>(() => testDiscussionsService.getDiscussions());
  const [unreadLikesCount, setUnreadLikesCount] = useState<number>(0);
  const [receivedLikesTotal, setReceivedLikesTotal] = useState<number>(0);

  // Check today's birthday celebrations automatically
  useEffect(() => {
    if (dbProfiles && dbProfiles.length > 0) {
      aiSystemEngine.checkBirthdayCelebrations(dbProfiles);
    }
  }, [dbProfiles]);

  const [userPhotos, setUserPhotos] = useState<string[]>(() => {
    const savedUser = getSavedUserSafe();
    const currentUserId = savedUser?.id || 'current_user_id';
    
    try {
      const parsed = getSafeLocalStorageItem<any>('bavel_user_photos', null);
      if (parsed && Array.isArray(parsed) && parsed.length === 6) {
        if (currentUserId !== 'current_user_id' && parsed[0] === GUEST_PHOTOS[0]) {
          return EMPTY_PHOTOS;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return currentUserId !== 'current_user_id' ? EMPTY_PHOTOS : [...GUEST_PHOTOS];
  });

  const [userProfile, setUserProfile] = useState(() => {
    const savedUser = getSavedUserSafe();
    const currentUserId = savedUser?.id || 'current_user_id';
    const userEmail = savedUser?.email || '';

    if (userEmail) {
      const localAcc = getAccountRecord(userEmail);
      if (localAcc?.profile && (isCompletedProfile(localAcc.profile) || localAcc.profile.name)) {
        return localAcc.profile;
      }
    }

    try {
      const parsed = getSafeLocalStorageItem<any>('bavel_user_profile', null);
      if (parsed && (isCompletedProfile(parsed) || parsed.name)) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return currentUserId !== 'current_user_id' ? {
      ...EMPTY_PROFILE,
      id: currentUserId,
      name: savedUser?.name || 'Membre',
      email: savedUser?.email || ''
    } : { ...GUEST_PROFILE, id: 'current_user_id' };
  });

  const privileges = useMemo(() => {
    const tier = userProfile?.tier || (isPremium ? 'premium' : (isExtra ? 'extra' : userStatus));
    return getTierPrivileges(tier);
  }, [userProfile?.tier, isPremium, isExtra, userStatus]);

  const isInitialLoadRef = useRef(true);

  const loadSupabaseData = async (isInitial: boolean = false) => {
    // 1. Fetch profiles
    const fetchedProfiles = await fetchAllProfilesFromSupabase();
    let currentProfilesList = fetchedProfiles && fetchedProfiles.length > 0 ? fetchedProfiles : LOCAL_MOCK_PROFILES;
    setDbProfiles(currentProfilesList);

    // 2. Fetch current user id
    const savedUser = getSavedUserSafe();
    const currentUserId = savedUser?.id || 'current_user_id';

    // 3. Fetch user profile from Supabase or local account store
    const userProf = await fetchProfileFromSupabase(currentUserId);
    const userEmail = savedUser?.email || userProfile?.email || '';
    const localAcc = getAccountRecord(userEmail);

    const hasSupabaseProfile = userProf && isCompletedProfile(userProf);
    const hasLocalAccountProfile = localAcc && (isCompletedProfile(localAcc.profile) || Boolean(localAcc.profile?.name && localAcc.profile?.name !== 'Membre'));
    const hasCurrentProfile = isCompletedProfile(userProfile);

    if (hasSupabaseProfile) {
      setUserProfile((prev: any) => {
        const prevClean = getCleanBaseProfile(prev);
        const base = currentUserId !== 'current_user_id' ? EMPTY_PROFILE : GUEST_PROFILE;
        const merged = {
          ...base,
          id: userProf.user_id,
          name: userProf.name || prevClean?.name || base.name,
          email: userEmail || userProf.email || prevClean?.email || '',
          age: userProf.age || prevClean?.age || base.age,
          city: userProf.city || prevClean?.city || base.city,
          gender: userProf.gender || prevClean?.gender || base.gender,
          job: userProf.job || prevClean?.job || base.job,
          studies: userProf.studies || prevClean?.studies || base.studies,
          bio: userProf.bio || prevClean?.bio || base.bio,
          details: {
            ...base.details,
            ...(prevClean?.details || {}),
            ...(userProf.details || {}),
            alcohol: userProf.alcohol || prevClean?.details?.alcohol || base.details?.alcohol,
            zodiac: userProf.zodiac || prevClean?.details?.zodiac || base.details?.zodiac,
            pets: userProf.pets || prevClean?.details?.pets || base.details?.pets,
            personality: userProf.personality || prevClean?.details?.personality || base.details?.personality,
          },
          keyQuestion: userProf.key_question || prevClean?.keyQuestion || base.keyQuestion,
          interests: userProf.interests || prevClean?.interests || base.interests,
          onboardingCompleted: true
        };
        if (merged.email) {
          saveAccountRecord(merged.email, merged, userProf.photos || userPhotos);
        }
        return merged;
      });
      if (userProf.photos && userProf.photos.length > 0) {
        const paddedPhotos = [...userProf.photos];
        while (paddedPhotos.length < 6) {
          paddedPhotos.push('');
        }
        setUserPhotos(paddedPhotos);
      }
      setShowRegisterWizard(false);
      setShowLogin(false);
      if (isInitial && isInitialLoadRef.current) {
        setActiveTab('encounters');
        isInitialLoadRef.current = false;
      }
    } else if (hasLocalAccountProfile && localAcc) {
      setUserProfile(localAcc.profile);
      if (localAcc.photos && localAcc.photos.length > 0) {
        setUserPhotos(localAcc.photos);
      }
      setShowRegisterWizard(false);
      setShowLogin(false);
      if (isInitial && isInitialLoadRef.current) {
        setActiveTab('encounters');
        isInitialLoadRef.current = false;
      }
    } else if (hasCurrentProfile) {
      if (userEmail) {
        saveAccountRecord(userEmail, userProfile, userPhotos);
      }
      setShowRegisterWizard(false);
      setShowLogin(false);
      if (isInitial && isInitialLoadRef.current) {
        setActiveTab('encounters');
        isInitialLoadRef.current = false;
      }
    } else if (currentUserId !== 'current_user_id' && userEmail && !localAcc && !savedUser?.onboardingCompleted) {
      // New user without any saved account profile: Trigger RegisterWizard
      setTempRegisterData({
        name: savedUser?.name || userProf?.name || '',
        email: userEmail,
        phone: savedUser?.phone || userProf?.phone || ''
      });
      setShowRegisterWizard(true);
      setShowLogin(false);
      setUserProfile((prev: any) => {
        const base = getCleanBaseProfile(prev);
        return {
          ...base,
          id: currentUserId,
          name: savedUser?.name || prev?.name || '',
          email: userEmail,
          isGoogle: !!savedUser?.isGoogle
        };
      });
      setUserPhotos((prev) => {
        if (!prev || prev[0] === GUEST_PHOTOS[0]) {
          return EMPTY_PHOTOS;
        }
        return prev;
      });
    } else if (localAcc) {
      // Fallback: If local account exists, keep user logged in with local account
      setUserProfile(localAcc.profile);
      if (localAcc.photos && localAcc.photos.length > 0) {
        setUserPhotos(localAcc.photos);
      }
      setShowRegisterWizard(false);
      setShowLogin(false);
    }

    // 5. Fetch likes
    const likes = await fetchLikesFromSupabase(currentUserId);
    if (likes) {
      setLikedProfileIds(likes.map((id: any) => isNaN(Number(id)) ? id : Number(id)));
    }

    // 6. Fetch received likes
    const recLikes = await fetchReceivedLikesFromSupabase(currentUserId);
    if (recLikes) {
      setReceivedLikes(recLikes);
      setReceivedLikesTotal(recLikes.length);
    }

    // 7. Fetch matches & compute discussions
    const matches = await fetchMatchesFromSupabase(currentUserId);
    if (matches && matches.length > 0) {
      const dynamicDiscussions = [];
      for (const m of matches) {
        const matchedProfileId = m.user_id === currentUserId ? m.profile_id : m.user_id;
        // Find profile details
        const prof = currentProfilesList.find((p: any) => p.user_id === matchedProfileId || p.id === matchedProfileId);
        if (prof) {
          // Fetch last message for this match
          const matchId = [currentUserId, matchedProfileId].sort().join('_');
          const msgs = await fetchMessagesFromSupabase(matchId);
          const lastMsg = msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
          const unreadCount = msgs ? msgs.filter((m: any) => m.sender_id !== currentUserId && m.is_read === false).length : 0;

          dynamicDiscussions.push({
            id: prof.id,
            user_id: prof.user_id,
            name: prof.name,
            age: prof.age,
            img: prof.img,
            online: prof.online,
            initialMessage: lastMsg ? lastMsg.text : (prof.bio || "Coucou 👋"),
            gender: prof.gender,
            unreadCount
          });
        }
      }
      setDiscussions(dynamicDiscussions);
    } else {
      setDiscussions(testDiscussionsService.getDiscussions());
    }
  };

  useEffect(() => {
    loadSupabaseData(true);

    const handleSupabaseReady = () => {
      loadSupabaseData(false);
    };
    window.addEventListener('bavel_supabase_ready', handleSupabaseReady);

    // Setup Supabase Realtime for Matches, Likes, Profiles, and Messages
    let realtimeChannel: any = null;
    let activeClient: any = null;
    
    const setupRealtime = async () => {
      const client = await initSupabase();
      if (!client) return;
      activeClient = client;

      const savedUser = getSavedUserSafe();
      const currentUserId = savedUser?.id || 'current_user_id';
      
      const uniqueTopic = `bavel-realtime-${currentUserId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      realtimeChannel = client
        .channel(uniqueTopic)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'matches' },
          () => {
            loadSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            loadSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'likes' },
          (payload: any) => {
            if (payload.new && payload.new.target_id === currentUserId) {
              setUnreadLikesCount((prev) => prev + 1);
            }
            loadSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload: any) => {
            const newMsg = payload.new;
            if (newMsg && newMsg.sender_id !== currentUserId) {
              setDiscussions((prev) => {
                return prev.map((d) => {
                  const matchId = [currentUserId, d.user_id || d.id].sort().join('_');
                  if (newMsg.match_id === matchId) {
                    return {
                      ...d,
                      initialMessage: newMsg.content || newMsg.text || 'Nouveau message',
                      unreadCount: (d.unreadCount || 0) + 1
                    };
                  }
                  return d;
                });
              });
            }
            loadSupabaseData();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      window.removeEventListener('bavel_supabase_ready', handleSupabaseReady);
      if (activeClient && realtimeChannel) {
        activeClient.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const totalUnreadCount = discussions.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  const [matchedProfileForModal, setMatchedProfileForModal] = useState<any | null>(null);

  const handleTabChange = (tab: string) => {
    if (tab === 'likes') {
      setUnreadLikesCount(0);
    }
    setActiveTab(tab);
    setIsDetailViewOpen(false);
    setIsMoodsCollapsed(false);
  };

  const handleOpenChat = (profile: any) => {
    if (profile && profile.id) {
      setDiscussions((prev) => {
        const alreadyExists = prev.some((d) => d.id === profile.id);
        if (alreadyExists) {
          return prev.map((d) => (d.id === profile.id ? { ...d, unreadCount: 0 } : d));
        } else {
          return [{
            id: profile.id,
            name: profile.name,
            age: profile.age,
            img: profile.img,
            online: profile.online,
            initialMessage: profile.initialMessage || "Coucou 👋",
            gender: profile.gender
          }, ...prev];
        }
      });
    }
    setActiveChat(profile);
  };

  const handleSendBackgroundWave = (profile: any) => {
    if (profile && profile.id) {
      const userMessage = profile.initialMessage || "Coucou ça va ? 👋";
      
      // Envoi du message réel dans Supabase
      (async () => {
        try {
          const savedUser = getSavedUserSafe();
          const currentUserId = savedUser?.id || 'current_user_id';
          const targetId = profile.user_id || profile.id;
          const matchId = [currentUserId, targetId].sort().join('_');

          // Create match in Supabase
          await createMatchInSupabase(currentUserId, targetId);

          // Sauvegarde du message envoyé par l'utilisateur
          await saveMessageToSupabase(matchId, currentUserId, userMessage, true);
          
          loadSupabaseData(); // Refresh UI with real data
        } catch (err) {
          console.warn('Failed to save wave message to Supabase:', err);
        }
      })();
    }
  };

  const handleLikeProfile = async (profileId: string | number) => {
    const savedUser = getSavedUserSafe();
    const currentUserId = savedUser?.id || 'current_user_id';
    
    setLikedProfileIds((prev: number[]) => {
      if (!prev.includes(profileId as number)) {
        return [...prev, profileId as number];
      }
      return prev;
    });

    try {
      const result = await saveLikeToSupabase(currentUserId, String(profileId));
      loadSupabaseData(); // Fetch potential matches or updates

      const targetProf = activeProfiles.find((p: any) => String(p.id) === String(profileId));
      const isMutual = receivedLikes.includes(String(profileId)) || result?.isMatch;
      
      // Mutual match or testing trigger to experience Match celebration
      if (isMutual || (targetProf && (targetProf.matchPercentage >= 88 || Number(targetProf.id) % 3 === 0))) {
        if (targetProf) {
          setMatchedProfileForModal(targetProf);
        }
        return true;
      }
      return Boolean(result?.isMatch);
    } catch (e) {
      console.warn("Failed to save like", e);
      return false;
    }
  };

  const handleRemoveLike = async (profileId: string | number) => {
    const savedUser = getSavedUserSafe();
    const currentUserId = savedUser?.id || 'current_user_id';

    setLikedProfileIds((prev: number[]) => prev.filter((id) => id !== profileId && String(id) !== String(profileId)));

    try {
      await removeLikeFromSupabase(currentUserId, String(profileId));
      loadSupabaseData();
      showToast("Like retiré avec succès");
    } catch (e) {
      console.warn("Failed to remove like", e);
    }
  };

  const handleDismissReceivedLike = async (senderId: string | number) => {
    const savedUser = getSavedUserSafe();
    const currentUserId = savedUser?.id || 'current_user_id';

    setReceivedLikes((prev: string[]) => prev.filter((id) => id !== senderId && String(id) !== String(senderId)));
    setReceivedLikesTotal((prev) => Math.max(0, prev - 1));

    try {
      await dismissReceivedLikeInSupabase(currentUserId, String(senderId));
      loadSupabaseData();
      showToast("Profil passé");
    } catch (e) {
      console.warn("Failed to dismiss received like", e);
    }
  };

  useEffect(() => {
    if (userPhotos) {
      localStorage.setItem('bavel_user_photos', JSON.stringify(userPhotos));
      if (userProfile?.email && userProfile.name && userProfile.name !== 'Membre' && userProfile.name !== 'Guest') {
        saveAccountRecord(userProfile.email, userProfile, userPhotos);
      }
    }
  }, [userPhotos, userProfile?.email]);

  useEffect(() => {
    if (userProfile && userProfile.name && userProfile.name !== 'Membre' && userProfile.name !== 'Guest') {
      localStorage.setItem('bavel_user_profile', JSON.stringify(userProfile));
      syncProfileToSupabase(userProfile, userPhotos);
      if (userProfile?.email) {
        saveAccountRecord(userProfile.email, userProfile, userPhotos);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      try {
        const saved = localStorage.getItem('bavel_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserProfile(parsed);
        }
      } catch (err) {
        console.error('Error refreshing profile state:', err);
      }
    };
    window.addEventListener('bavel-profile-updated', handleProfileUpdated);
    return () => {
      window.removeEventListener('bavel-profile-updated', handleProfileUpdated);
    };
  }, []);

  const { user: authUser, userRole, isAdmin, profile: authProfile, photos: authPhotos, logout: authLogout, setAuthUser, setProfileData } = useAuth();

  // Sync authContext user/profile to local state when auth resolves
  useEffect(() => {
    if (authUser) {
      setShowLogin(false);
      setShowRegisterWizard(false);

      if (authProfile) {
        setUserProfile(authProfile);
      } else {
        const localAcc = getAccountRecord(authUser.email);
        if (localAcc?.profile) {
          setUserProfile(localAcc.profile);
        } else {
          setUserProfile((prev: any) => {
            const base = getCleanBaseProfile(prev);
            return {
              ...base,
              email: authUser.email || base.email,
              name: authUser.name || base.name,
              id: authUser.id
            };
          });
        }
      }

      if (authPhotos && authPhotos.some(p => Boolean(p))) {
        setUserPhotos(authPhotos);
      } else if (authUser.email) {
        const localAcc = getAccountRecord(authUser.email);
        if (localAcc?.photos && localAcc.photos.length > 0) {
          setUserPhotos(localAcc.photos);
        }
      }
    }
  }, [authUser, authProfile, authPhotos]);

  const handleAppLogout = async () => {
    if (userProfile && userProfile.email) {
      saveAccountRecord(userProfile.email, userProfile, userPhotos);
    }
    try {
      googleLogout();
    } catch (e) {
      // ignore if googleLogout fails
    }
    await authLogout();
    const client = await initSupabase();
    if (client) {
      client.auth.signOut();
    }
    setShowLogin(true);
  };


  // Real-time listener for Supabase Auth state changes (including Google OAuth redirect)
  useEffect(() => {
    let subscription: any = null;

    const setupAuth = async () => {
      const client = await initSupabase();
      if (!client) return;

      client.auth.getSession().then(({ data: { session } }) => {
        // Avoid auto-login if URL has recovery token
        if (session?.user && !window.location.hash.includes('type=recovery')) {
          setShowLogin(false);
          if (window.location.hash.includes('type=signup')) {
            setShowWelcomeModal(true);
            // Clean the hash to avoid triggering again on refresh
            window.history.replaceState(null, '', window.location.pathname);
          }

          const isGoogle = session.user.app_metadata?.provider === 'google' || 
                           session.user.identities?.some((id: any) => id.provider === 'google') ||
                           session.user.email?.endsWith('@gmail.com');
          const appUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Membre',
            isGoogle: !!isGoogle
          };
          localStorage.setItem('app_user', JSON.stringify(appUser));
          setUserProfile((prev: any) => {
            const base = getCleanBaseProfile(prev);
            return {
              ...base,
              email: session.user.email,
              name: appUser.name,
              id: session.user.id,
              isGoogle: !!isGoogle
            };
          });
          loadSupabaseData();
        }
      });

      const { data } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setShowPasswordRecovery(true);
          setShowLogin(false);
        } else if (event === 'SIGNED_IN' && session?.user && !showPasswordRecovery && !window.location.hash.includes('type=recovery')) {
          setShowLogin(false);
          if (window.location.hash.includes('type=signup')) {
            setShowWelcomeModal(true);
            window.history.replaceState(null, '', window.location.pathname);
          }

          const isGoogle = session.user.app_metadata?.provider === 'google' || 
                           session.user.identities?.some((id: any) => id.provider === 'google') ||
                           session.user.email?.endsWith('@gmail.com');
          const appUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Membre',
            isGoogle: !!isGoogle
          };
          localStorage.setItem('app_user', JSON.stringify(appUser));
          setUserProfile((prev: any) => {
            const base = getCleanBaseProfile(prev);
            return {
              ...base,
              email: session.user.email,
              name: appUser.name,
              id: session.user.id,
              isGoogle: !!isGoogle
            };
          });
          loadSupabaseData();
        }
      });
      subscription = data.subscription;
    };

    setupAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [showPasswordRecovery]);

  const [showGlobalEditProfile, setShowGlobalEditProfile] = useState(false);

  // Swipe between main bottom tabs (left / right)
  const tabs = ['discover', 'encounters', 'likes', 'discussions', 'profile'];
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Disable horizontal tab swiping when in encounters or discover to preserve card swipe gestures
    if (activeTab === 'encounters' || activeTab === 'discover') return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeTab === 'encounters' || activeTab === 'discover') {
      setTouchStartX(null);
      return;
    }
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > 90) {
      const currentIndex = tabs.indexOf(activeTab);
      if (diffX < 0 && currentIndex < tabs.length - 1) {
        // Swipe left -> Next tab
        setActiveTab(tabs[currentIndex + 1]);
      } else if (diffX > 0 && currentIndex > 0) {
        // Swipe right -> Previous tab
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
    setTouchStartX(null);
  };

  if (showSplash) {
    return (
      <>
        <StyleBlock textScale={textScale} />
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </>
    );
  }

  if (showPasswordRecovery) {
    return (
      <>
        <StyleBlock textScale={textScale} />
        <ResetPasswordModal 
          onComplete={() => {
            setShowPasswordRecovery(false);
            setShowLogin(true);
          }}
        />
      </>
    );
  }

  if (showWelcomeModal) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-[9999] font-sans">
        <StyleBlock textScale={textScale} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[340px] bg-gradient-to-b from-[#1a0836] to-[#0d021c] p-6 rounded-[28px] shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Félicitations !</h2>
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              Votre adresse <strong>{userProfile?.email}</strong> a bien été confirmée.<br/><br/>
              Votre compte est maintenant actif. Vous pouvez commencer à utiliser l'application et faire de belles rencontres.
            </p>
            <button 
              onClick={() => {
                setShowWelcomeModal(false);
                // Optionally show register wizard if profile is incomplete
                if (!isCompletedProfile(userProfile)) {
                  setTempRegisterData({ email: userProfile?.email || '' });
                  setShowRegisterWizard(true);
                } else {
                  setActiveTab('discover');
                }
              }}
              className="w-full py-3.5 rounded-2xl font-bold text-[15px] bg-white text-black shadow-lg"
            >
              Continuer sur l'application
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showRegisterWizard) {
    return (
      <>
        <StyleBlock textScale={textScale} />
        <RegisterWizard 
          initialName={tempRegisterData.name || ''}
          initialEmail={tempRegisterData.email || ''}
          initialPhone={tempRegisterData.phone || ''}
          onComplete={(finalData) => {
            const base = EMPTY_PROFILE;
            
            const finalPhotos = finalData.photos && finalData.photos.length > 0 ? finalData.photos : EMPTY_PHOTOS;
            const paddedPhotos = [...finalPhotos];
            while (paddedPhotos.length < 6) {
              paddedPhotos.push('');
            }
            setUserPhotos(paddedPhotos);

            const userEmail = finalData.email || tempRegisterData.email || userProfile.email || '';
            const completedProfile = {
              ...base,
              id: userProfile.id && userProfile.id !== 'current_user_id' ? userProfile.id : `user_${userEmail.replace(/[^a-z0-9]/g, '_')}`,
              name: finalData.name,
              gender: finalData.gender.toLowerCase(),
              birthday: finalData.birthday,
              email: userEmail,
              phone: finalData.phone || tempRegisterData.phone || '',
              purpose: finalData.purpose || '',
              city: finalData.city || '',
              latitude: finalData.latitude,
              longitude: finalData.longitude,
              bio: finalData.bio || '',
              height: finalData.height || '',
              school: finalData.school || '',
              studies: finalData.school || '',
              jobTitle: finalData.jobTitle || '',
              company: finalData.company || '',
              job: finalData.jobTitle ? (finalData.company ? `${finalData.jobTitle} chez ${finalData.company}` : finalData.jobTitle) : '',
              drinking: finalData.drinking || '',
              smoking: finalData.smoking || '',
              kids: finalData.kids || '',
              educationLevel: finalData.educationLevel || '',
              personality: finalData.personality || '',
              interests: finalData.interests || [],
              pets: finalData.pets || '',
              starSign: finalData.starSign || '',
              religion: finalData.religion || '',
              details: {
                ...base.details,
                relation: finalData.relationshipStatus || finalData.purpose || '',
                sexuality: finalData.sexualOrientation || '',
                orientation: finalData.sexualOrientation || '',
                alcohol: finalData.drinking || '',
                smoking: finalData.smoking || '',
                children: finalData.kids || '',
                education: finalData.educationLevel || '',
                personality: finalData.personality || '',
                pets: finalData.pets || '',
                zodiac: finalData.starSign || '',
                religion: finalData.religion || '',
                height: finalData.height || ''
              },
              age: (() => {
                if (!finalData.birthday) return 18;
                const today = new Date();
                const birthDate = new Date(finalData.birthday);
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return age;
              })()
            };

            setUserProfile(completedProfile);
            if (userEmail) {
              saveAccountRecord(userEmail, completedProfile, paddedPhotos);
            }
            setProfileData(completedProfile, paddedPhotos);
            const fullAuthUser = {
              id: completedProfile.id || 'user_id',
              name: completedProfile.name,
              email: userEmail,
              onboardingCompleted: true
            };
            setAuthUser(fullAuthUser);
            try {
              localStorage.setItem('bavel_user_profile', JSON.stringify(completedProfile));
              localStorage.setItem('bavel_user_photos', JSON.stringify(paddedPhotos));
              const savedUser = getSavedUserSafe() || {};
              savedUser.email = userEmail;
              savedUser.name = finalData.name;
              savedUser.onboardingCompleted = true;
              localStorage.setItem('app_user', JSON.stringify(savedUser));
            } catch (e) {
              console.error(e);
            }
            setShowRegisterWizard(false);
            setShowLogin(false);
            setActiveTab('encounters');

          }}
          onBack={() => {
            setShowRegisterWizard(false);
            setShowLogin(true);
          }}
        />
      </>
    );
  }

  if (showLogin) {
    return (
      <>
        <StyleBlock textScale={textScale} />
        <LoginScreen 
          onLoginSuccess={(userData) => {
            const userEmail = userData?.email || '';
            const localAcc = getAccountRecord(userEmail);
            const activeProfile = userData?.savedProfile || localAcc?.profile || null;
            const activePhotos = userData?.savedPhotos || localAcc?.photos || null;

            if (userData?.name || userEmail || userData?.phone) {
              const savedUser = getSavedUserSafe() || {};
              if (userData.isGoogle) {
                savedUser.isGoogle = true;
              }
              if (userData.name) savedUser.name = userData.name;
              if (userEmail) savedUser.email = userEmail;
              if (userData.phone) savedUser.phone = userData.phone;
              if (activeProfile || !userData.isNewUser) {
                savedUser.onboardingCompleted = true;
              }
              localStorage.setItem('app_user', JSON.stringify(savedUser));
            }

            if (activeProfile || localAcc?.profile || !userData?.isNewUser) {
              const profToUse = activeProfile || localAcc?.profile || {
                ...EMPTY_PROFILE,
                name: userData?.name || 'Membre',
                email: userEmail,
                onboardingCompleted: true
              };
              setUserProfile(profToUse);
              if (activePhotos && activePhotos.length > 0) {
                setUserPhotos(activePhotos);
                setProfileData(profToUse, activePhotos);
              } else if (localAcc?.photos && localAcc.photos.length > 0) {
                setUserPhotos(localAcc.photos);
                setProfileData(profToUse, localAcc.photos);
              } else {
                setProfileData(profToUse);
              }
              const fullAuthUser = {
                id: (userData as any)?.id || profToUse.id || 'user_id',
                name: profToUse.name,
                email: userEmail,
                isGoogle: userData?.isGoogle,
                onboardingCompleted: true
              };

              setAuthUser(fullAuthUser);
              setShowRegisterWizard(false);
              setShowLogin(false);
              setActiveTab('encounters');
              loadSupabaseData(); // Ensure fresh data is fetched

            } else if (userData?.isNewUser && !localAcc) {
              // Asynchronously verify with Supabase just in case it's a server restart issue
              const checkSupabaseProfile = async () => {
                const savedUser = getSavedUserSafe();
                const userId = savedUser?.id || 'current_user_id';
                const userProf = await fetchProfileFromSupabase(userId);
                
                if (userProf && isCompletedProfile(userProf)) {
                  // They actually have a profile!
                  savedUser.onboardingCompleted = true;
                  localStorage.setItem('app_user', JSON.stringify(savedUser));
                  
                  setUserProfile(userProf);
                  if (userProf.photos && userProf.photos.length > 0) {
                    const paddedPhotos = [...userProf.photos];
                    while (paddedPhotos.length < 6) paddedPhotos.push('');
                    setUserPhotos(paddedPhotos);
                  }
                  
                  setShowRegisterWizard(false);
                  setShowLogin(false);
                  setActiveTab('encounters');
                  loadSupabaseData();
                } else {
                  // Truly a new user
                  setTempRegisterData({
                    name: userData?.name || '',
                    email: userEmail,
                    phone: userData?.phone || ''
                  });
                  setShowRegisterWizard(true);
                  setShowLogin(false);
                }
              };
              
              checkSupabaseProfile();
            } else {
              loadSupabaseData();
            }
          }} 
          onRegisterStart={(userData) => {
            setTempRegisterData(userData);
            setShowRegisterWizard(true);
            setShowLogin(false);
          }}
        />
      </>
    );
  }

  const activeProfiles = dbProfiles.filter(p => !p.isSuspended);

  const shouldHideBottomNav = Boolean(
    isSubmenuOpen ||
    showGlobalEditProfile ||
    showAdminPanel ||
    showMoods ||
    isDetailViewOpen ||
    activeChat
  );

  return (
    <>
      <StyleBlock textScale={textScale} />
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col bg-transparent text-inherit font-sans overflow-hidden w-full h-full relative shrink-0 select-none mobile-scale"
    >
      <div className={`flex-1 ${
        activeTab === 'encounters'
          ? (shouldHideBottomNav ? 'overflow-hidden pb-0' : 'overflow-hidden pb-[68px]')
          : (shouldHideBottomNav ? 'overflow-y-auto pb-0' : 'overflow-y-auto pb-[76px]')
      } no-scrollbar relative`}>
        {toastMessage && (
          <div className="absolute top-[80px] left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-white px-3.5 py-2.5 rounded-xl shadow-xl shadow-slate-900/10 z-[150] flex items-center space-x-2 text-[12px] font-bold">
            <span>{toastMessage}</span>
          </div>
        )}
        <PWAInstallBanner />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.98, transform: 'translate3d(0, 10px, 0)' }}
            animate={{ opacity: 1, y: 0, scale: 1, transform: 'translate3d(0, 0, 0)' }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transform: 'translate3d(0, -10px, 0)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.7 }}
            className="h-full transform-gpu gpu-layer smooth-gpu"
          >
            {activeTab === 'discover' && (
              <DiscoverTab 
                userMood={userMood} 
                onOpenMoods={() => setShowMoods(true)} 
                onNavigateToTab={setActiveTab}
                setActiveChat={handleOpenChat}
                genderPreference={genderPreference}
                setGenderPreference={setGenderPreference}
                likedProfiles={likedProfileIds}
                setLikedProfiles={setLikedProfileIds}
                onLikeProfile={handleLikeProfile}
                hiddenProfiles={hiddenProfileIds}
                setHiddenProfiles={setHiddenProfileIds}
                userPhotos={userPhotos}
                onSendBackgroundWave={handleSendBackgroundWave}
                profiles={activeProfiles}
                onDetailToggle={setIsDetailViewOpen}
                onScrollStateChange={setIsMoodsCollapsed}
                onSubTabChange={setDiscoverSubTab}
              />
            )}
            {activeTab === 'encounters' && (
              <EncountersTab 
                onNavigateToTab={setActiveTab} 
                genderPreference={genderPreference}
                setGenderPreference={setGenderPreference}
                likedProfiles={likedProfileIds}
                setLikedProfiles={setLikedProfileIds}
                onLikeProfile={handleLikeProfile}
                setActiveChat={handleOpenChat}
                discussions={discussions}
                setDiscussions={setDiscussions}
                userLookingFor={userLookingFor}
                isPremium={isPremium}
                onActivatePremium={handleActivatePremium}
                profiles={activeProfiles}
                receivedLikes={receivedLikes}
                userProfile={userProfile}
                loadSupabaseData={loadSupabaseData}
                userMood={userMood}
                onOpenMoods={() => setShowMoods(true)}
              />
            )}
            {activeTab === 'likes' && (
              <LikesTab 
                onNavigateToTab={handleTabChange} 
                likedProfiles={likedProfileIds}
                discussions={discussions}
                userPhotos={userPhotos}
                unreadLikesCount={unreadLikesCount}
                receivedLikesTotal={receivedLikesTotal}
                dbProfiles={dbProfiles}
                receivedLikes={receivedLikes}
                userProfile={userProfile}
                showToast={showToast}
                loadSupabaseData={loadSupabaseData}
                onLikeProfile={handleLikeProfile}
                onRemoveLike={handleRemoveLike}
                onDismissReceivedLike={handleDismissReceivedLike}
                onOpenChat={handleOpenChat}
                isPremium={isPremium}
                onActivatePremium={handleActivatePremium}
              />
            )}
            {activeTab === 'discussions' && (
              <DiscussionsTab 
                userId={userProfile?.id || 'current_user_id'}
                onNavigateToTab={setActiveTab} 
                activeChat={activeChat}
                setActiveChat={handleOpenChat}
                discussions={discussions}
                setDiscussions={setDiscussions}
                receivedLikesCount={receivedLikesTotal}
                isPremium={isPremium}
                onActivatePremium={handleActivatePremium}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab 
                userMood={userMood} 
                onOpenMoods={() => setShowMoods(true)} 
                userLookingFor={userLookingFor}
                setUserLookingFor={setUserLookingFor}
                userPhotos={userPhotos}
                setUserPhotos={setUserPhotos}
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                onLogout={handleAppLogout}
                textScale={textScale}
                onChangeTextScale={handleTextScaleChange}
                onOpenAdmin={() => {
                  const isUserAdmin = Boolean(
                    isAdmin || 
                    userRole === 'admin' || 
                    authUser?.role === 'admin' || 
                    authUser?.isAdmin === true || 
                    (authUser?.email && authUser.email.toLowerCase() === 'donkoff90@gmail.com') ||
                    localStorage.getItem('bavel_user_role') === 'admin'
                  );
                  if (isUserAdmin) {
                    setShowAdminPanel(true);
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showMoods && (
          <MoodsMenu 
            onClose={() => setShowMoods(false)} 
            currentMood={userMood}
            onSelectMood={(m) => setUserMood(m)}
          />
        )}
        {matchedProfileForModal && (
          <MatchModal
            matchedProfile={matchedProfileForModal}
            onClose={() => setMatchedProfileForModal(null)}
            userPhoto={userProfile?.avatarUrl || userProfile?.img || (userProfile?.photos && userProfile?.photos[0])}
            onChat={(customIcebreaker) => {
              const prof = matchedProfileForModal;
              setMatchedProfileForModal(null);
              handleOpenChat({
                ...prof,
                initialMessage: customIcebreaker || "Coucou ! J'espère que tu vas bien. On a matché ! 😊"
              });
              setActiveTab('discussions');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && (
          <React.Suspense fallback={null}>
            <AdminPanel 
              profiles={dbProfiles} 
              onClose={() => setShowAdminPanel(false)} 
              onForceRefresh={loadSupabaseData} 
              onUpdateProfiles={setDbProfiles}
              messages={discussions}
              matches={discussions}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGlobalEditProfile && (
          <EditProfileMenu 
            onClose={() => setShowGlobalEditProfile(false)} 
            userPhotos={userPhotos} 
            setUserPhotos={setUserPhotos} 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            userMood={userMood}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab === 'discover' && discoverSubTab !== 'foryou' && !showGlobalEditProfile && !showAdminPanel && !showMoods && !isDetailViewOpen && (
          <motion.button 
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.95, y: 0 }}
            onClick={() => setShowMoods(true)} 
            transition={{ type: 'spring', damping: 22, stiffness: 400 }}
            className={`absolute bottom-[88px] right-4 h-11 bg-white/95 backdrop-blur-xl text-slate-800 rounded-full flex items-center shadow-[0_8px_25px_rgba(244,63,94,0.18)] border border-rose-200/80 z-40 active:bg-rose-50 overflow-hidden touch-manipulation cursor-pointer group select-none transform-gpu ${
              isMoodsCollapsed ? 'w-11 justify-center px-0' : 'px-2.5 space-x-2'
            }`}
            title="Changer mon humeur"
          >
            {/* Glow accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/40 via-pink-100/40 to-purple-100/40 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none rounded-full" />

            {/* Emoji Badge inside */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-[#2dd4bf] to-[#f43f5e] text-white shadow-xs shrink-0 z-10">
              <span className="text-[15px] leading-none select-none filter drop-shadow-xs">
                {userMood ? userMood.emoji : '😌'}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {!isMoodsCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -4, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -4, width: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="z-10 font-bold text-[13px] tracking-tight text-white whitespace-nowrap pr-1 block overflow-hidden"
                >
                  Moods
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Real-time In-App Push Notification Banner with Framer Motion Bounce */}
      <AnimatePresence>
        {activeToastNotification && (
          <motion.div
            initial={{ y: -90, opacity: 0, scale: 0.85, rotateX: 15 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ y: -90, opacity: 0, scale: 0.85 }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 20,
              mass: 0.8,
              bounce: 0.5
            }}
            drag="y"
            dragConstraints={{ top: -90, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -25) {
                dismissToastNotification();
              }
            }}
            onClick={() => {
              if (activeToastNotification.type === 'message' || activeToastNotification.type === 'match') {
                setActiveTab('discussions');
              } else if (activeToastNotification.type === 'like' || activeToastNotification.type === 'coup_de_coeur') {
                setActiveTab('likes');
              }
              dismissToastNotification();
            }}
            className="absolute top-4 inset-x-3 z-[300] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-purple-200/50 dark:border-purple-900/40 rounded-2xl p-3 shadow-[0_16px_40px_rgba(124,58,237,0.22)] cursor-pointer flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <div className="relative shrink-0">
              {activeToastNotification.senderAvatar ? (
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: 2, duration: 0.8 }}
                    className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 opacity-60 blur-xs"
                  />
                  <img 
                    src={activeToastNotification.senderAvatar} 
                    alt="" 
                    className="relative w-11 h-11 rounded-full object-cover shrink-0 border border-white dark:border-neutral-800 shadow-md" 
                  />
                </div>
              ) : (
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/30"
                >
                  <Sparkles className="w-5 h-5 fill-white/30" />
                </motion.div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-[13.5px] font-extrabold text-gray-900 dark:text-white truncate">
                  {activeToastNotification.title}
                </h4>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.2 rounded-full shrink-0 ml-1">
                  À l'instant
                </span>
              </div>
              <p className="text-[12px] text-gray-600 dark:text-gray-300 truncate leading-snug font-medium">
                {activeToastNotification.body}
              </p>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); dismissToastNotification(); }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full shrink-0 transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>



      <AnimatePresence>
        {!shouldHideBottomNav && (
          <motion.div
            key="bottom-navigation-bar"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full absolute bottom-0 left-0 right-0 z-50 pointer-events-auto"
          >
            <BottomNav 
              activeTab={activeTab} 
              setActiveTab={handleTabChange} 
              unreadCount={totalUnreadCount} 
              unreadLikesCount={unreadLikesCount} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div id="mobile-modal-root" className="absolute inset-0 pointer-events-none z-[150]" />
    </motion.div>
    </>
  );
}




function BottomNav({ 
  activeTab, 
  setActiveTab, 
  unreadCount = 0, 
  unreadLikesCount = 0 
}: { 
  activeTab: string; 
  setActiveTab: (t: string) => void; 
  unreadCount?: number; 
  unreadLikesCount?: number; 
}) {
  const tabs = [
    { 
      id: 'discover', 
      label: 'À découvrir', 
      Icon: Compass
    },
    { 
      id: 'encounters', 
      label: 'Rencontres', 
      Icon: Flame
    },
    { 
      id: 'likes', 
      label: 'Likes', 
      Icon: Heart
    },
    { 
      id: 'discussions', 
      label: 'Discussions', 
      Icon: MessageCircle
    },
    { 
      id: 'profile', 
      label: 'Profil', 
      Icon: UserIcon
    }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(15,23,42,0.06)] select-none">
      {/* 5 Pods BottomNav */}
      <nav className="flex items-center justify-around px-1 sm:px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.Icon;
          return (
            <motion.button 
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer transition-colors py-0.5 min-w-0"
              type="button"
            >
              <div className="relative">
                <motion.div 
                  layout
                  className={`w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-b from-[#f43f5e] via-[#ec4899] to-[#8b5cf6] shadow-[0_6px_18px_-2px_rgba(244,63,94,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-pink-200/40 relative' 
                      : 'bg-slate-100/90 border border-slate-200/60 shadow-xs hover:bg-slate-200/80'
                  }`}
                >
                  <IconComponent 
                    className={`w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-rose-500'
                    }`}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    fill={isActive && tab.id === 'likes' ? 'currentColor' : 'none'}
                  />
                </motion.div>

                {/* Unread Badge for Discussions */}
                {tab.id === 'discussions' && unreadCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
                    className="absolute -top-1 -right-1.5 bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-white/70 shadow-[0_2px_8px_rgba(244,63,94,0.6)] z-30 leading-none"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.div>
                )}

                {/* Unread Badge for Likes */}
                {tab.id === 'likes' && unreadLikesCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.6 }}
                    className="absolute -top-1 -right-1.5 bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-white/70 shadow-[0_2px_8px_rgba(244,63,94,0.6)] z-30 leading-none"
                  >
                    {unreadLikesCount > 99 ? '99+' : unreadLikesCount}
                  </motion.div>
                )}
              </div>
              
              {/* Responsive mobile character label adapté smartphone */}
              <span 
                className={`text-[10px] sm:text-[11px] font-semibold tracking-tight text-center truncate max-w-full px-0.5 leading-tight transition-colors ${
                  isActive ? 'text-rose-600 font-bold' : 'text-slate-600 group-hover:text-rose-600'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

