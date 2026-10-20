import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { forwardRef, useImperativeHandle } from 'react';
import confetti from 'canvas-confetti';
import { 
  SlidersHorizontal, MapPin, Heart, MessageCircle, MessageCircleMore, User as UserIcon, 
  Settings, HelpCircle, Camera, Zap, Search, Bell, Gauge, Edit3, Mail,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Smile, Plus, Copy, MoreHorizontal, Lock, CheckCircle, Check, X, Star, Shield, Eye, EyeOff, FileText, RotateCcw,
  Navigation, Baby, Target, Ruler, Languages, Wine, Sparkles, Dog, Brain, Flame, Cigarette, GraduationCap, BookOpen, Coffee, Clapperboard, ChevronsUp, Megaphone, Battery, Send,
  Radio, Locate, LocateFixed, RefreshCw, Map, Compass, Image as ImageIcon, Briefcase,
  Phone, Video, Mic, CheckCheck, Gift, Ban, ThumbsUp, ArrowUp, Coins, Volume2, VolumeX, UserX, PhoneOff, MicOff, VideoOff, Play, Pause, Trash2, Hand, Users, Pencil, ShieldAlert
} from 'lucide-react';
import { User } from '../../../types';
import { saveLikeToSupabase, saveSwipeToSupabase, createMatchInSupabase, deleteLastSwipeFromSupabase } from '../../../lib/supabase';
import { CoupDeCoeurModal, ActionMenu, EncounterCardMenu, MatchModal, HeartPiercedIcon, ReportMenu } from '../Modals';
import { reportUserInSupabase, blockUserInSupabase } from '../../../lib/supabase';
import { ExtraShowsMenu, RechargeCreditsMenu } from '../Monetization';
import { RewardedAdPlayer } from '../RewardedAdsManager';
import { EncountersFiltersMenu } from './EncountersFilters';
import { SwipeActions } from '../swipes/SwipeActions';
import { SwipeThemeProvider } from '../contexts/SwipeThemeContext';
import { ChatConversationView } from '../discussions/ChatConversationView';
import BavelPremiumModal from '../../modals/BavelPremiumModal';

import { ProfileModal, FullScreenPhotoGalleryModal } from '../Modals';
import { SpeedDatingModal } from './SpeedDatingModal';
import { preloadNextProfiles } from '../../../utils/imageOptimizer';
import { smartMatchService } from '../../../services/smartMatchService';
import { pushNotificationService } from '../../../services/push/pushNotificationService';
import { presenceService } from '../../../services/presenceService';
import { aiMonetizationEngine } from '../../../services/aiMonetizationEngine';
import { aiSystemEngine } from '../../../services/aiSystemEngine';
import { securityService } from '../../../services/securityService';
import { monetizationService } from '../../../services/monetizationService';
import { FEATURES_PER_TIER, getTierPrivileges } from '../../../config/featuresConfig';
import { useNudgeStore } from '../../../features/nudging/store/nudgeStore';
import { EngagementNudgeBanner } from '../../../features/nudging/components/EngagementNudgeBanner';
import { useUX } from '../../../context/UXContext';
import { LazyBlurImage } from '../ui/LazyBlurImage';



/**
 * Nettoie le texte de localisation pour afficher uniquement la ville principale (ex: "Abidjan, Angré" -> "Abidjan").
 */
export const cleanCity = (location?: string, city?: string): string => {
  if (city && city.trim()) {
    return city.split(',')[0].trim();
  }
  if (!location) return 'Abidjan';
  return location.split(',')[0].trim() || 'Abidjan';
};

/**
 * Calcule la distance géodésique en km entre deux points GPS (formule Haversine).
 */
export const calculateHaversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Formate la distance sous le style standard Photo 1: "à ~80 km" ou "à ~80 m"
 */
export const formatDistanceBadge = (distKm: number): string => {
  if (distKm < 1) {
    const meters = Math.max(50, Math.round((distKm * 1000) / 10) * 10);
    return `à ~${meters} m`;
  }
  const km = Math.round(distKm);
  return `à ~${km} km`;
};

/**
 * Détermine la distance dynamique d'un profil par rapport à la position de l'utilisateur.
 */
export const getProfileDistanceInfo = (
  profile: any,
  userCoords?: { latitude: number; longitude: number } | null
): { distanceKm: number; text: string } => {
  if (
    userCoords?.latitude &&
    userCoords?.longitude &&
    profile?.latitude &&
    profile?.longitude
  ) {
    const d = calculateHaversineKm(
      userCoords.latitude,
      userCoords.longitude,
      profile.latitude,
      profile.longitude
    );
    return { distanceKm: d, text: formatDistanceBadge(d) };
  }

  if (typeof profile?.distanceKm === 'number' && !isNaN(profile.distanceKm)) {
    return {
      distanceKm: profile.distanceKm,
      text: formatDistanceBadge(profile.distanceKm),
    };
  }

  const idNum =
    typeof profile?.id === 'number'
      ? profile.id
      : String(profile?.id || '0')
          .split('')
          .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const mockDistances = [0.08, 0.5, 1.2, 2.5, 5.0, 12, 24, 80];
  const d = mockDistances[Math.abs(idNum) % mockDistances.length];
  return { distanceKm: d, text: formatDistanceBadge(d) };
};

interface SwipeProfileCardProps {
  profile: any;
  parentX: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onOpenActionMenu: () => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

export interface SwipeProfileCardRef {
  swipe: (direction: 'left' | 'right') => Promise<void>;
}

export const SwipeProfileCard = forwardRef<SwipeProfileCardRef, SwipeProfileCardProps>(({
  profile,
  parentX,
  onSwipeLeft,
  onSwipeRight,
  onOpenActionMenu,
  userCoords
}, ref) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [30, 100], [0, 1]);
  const passOpacity = useTransform(x, [-30, -100], [0, 1]);

  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [isDistanceToggled, setIsDistanceToggled] = useState(false);

  // Fullscreen Photo Gallery & Detailed Profile Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFullScreenGalleryOpen, setIsFullScreenGalleryOpen] = useState(false);
  const [galleryStartIdx, setGalleryStartIdx] = useState(0);

  const openFullScreenGallery = (idx: number = 0) => {
    setGalleryStartIdx(idx);
    setIsFullScreenGalleryOpen(true);
  };

  const resolvedProfile = useMemo(() => {
    if (!profile) return {};
    let liveUser = null;
    try {
      const saved = localStorage.getItem('bavel_user_profile') || localStorage.getItem('app_user');
      if (saved) {
        liveUser = JSON.parse(saved);
      }
    } catch (e) {}

    const isSelf = liveUser && (
      String(profile.id) === String(liveUser.id) || 
      profile.email === liveUser.email || 
      profile.isCurrentUser || 
      profile.id === 'current_user_id' || 
      profile.id === 'current_user' ||
      profile.name === liveUser.name
    );

    if (isSelf && liveUser) {
      return {
        ...profile,
        ...liveUser,
        details: {
          ...(profile.details || {}),
          ...(liveUser.details || {})
        }
      };
    }
    return profile;
  }, [profile]);

  const rawPhotos = resolvedProfile.photos && resolvedProfile.photos.length > 0 
    ? resolvedProfile.photos 
    : [resolvedProfile.img || resolvedProfile.avatarUrl];
  
  const photos = Array.from(new Set(rawPhotos)) as string[];
  const extraPhotos = photos.slice(1).filter(p => p !== photos[0]);

  const handleMediaSecurityNotice = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
    setShowSecurityAlert(true);
    setTimeout(() => setShowSecurityAlert(false), 2800);
  };

  useEffect(() => {
    const unsubscribe = x.on('change', (latest) => {
      if (parentX) {
        parentX.set(latest);
      }
    });
    return () => unsubscribe();
  }, [x, parentX]);

  useImperativeHandle(ref, () => ({
    swipe: async (direction: 'left' | 'right') => {
      const targetX = direction === 'left' ? -600 : 600;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
      // Déclencher immédiatement l'action pour une réactivité instantanée (zéro latence)
      if (direction === 'left') {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
      // Animation rapide à 120 FPS
      animate(x, targetX, {
        duration: 0.16,
        ease: [0.16, 1, 0.3, 1]
      });
    }
  }));

  const handleDragEnd = (_event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // PanGestureRecognizer logic: détection avancée combinant l'amplitude (distance > 90px) et l'inertie vélocitaire (vitesse > 350px/s)
    const isSwipingRight = offset > 90 || velocity > 380;
    const isSwipingLeft = offset < -90 || velocity < -380;

    if (isSwipingRight) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
      onSwipeRight();
      const targetX = Math.max(550, offset + velocity * 0.25);
      animate(x, targetX, { 
        duration: 0.16, 
        ease: [0.16, 1, 0.3, 1] 
      });
    } else if (isSwipingLeft) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      onSwipeLeft();
      const targetX = Math.min(-550, offset + velocity * 0.25);
      animate(x, targetX, { 
        duration: 0.16, 
        ease: [0.16, 1, 0.3, 1] 
      });
    } else {
      // Retour fluide au centre avec ressort amorti (Spring physics naturelle)
      animate(x, 0, { 
        type: "spring", 
        stiffness: 420, 
        damping: 26,
        mass: 0.8
      });
    }
  };

  return (
    <motion.div
      style={{ x, rotate, zIndex: 10, transformOrigin: '50% 100%' }}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      onDragEnd={handleDragEnd}
      onContextMenu={handleMediaSecurityNotice}
      initial={{ scale: 0.95, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 26 } }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      className="absolute inset-0 rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#16042c] shadow-[0_12px_36px_rgba(0,0,0,0.7)] border border-purple-500/30 flex flex-col cursor-grab active:cursor-grabbing select-none touch-pan-y transform-gpu smooth-gpu user-select-none"
    >
      {/* Screenshot & DRM Protection Floating Security Banner */}
      <AnimatePresence>
        {showSecurityAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-16 left-4 right-4 z-[100] bg-black/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-rose-500/50 shadow-2xl flex items-center space-x-2.5 pointer-events-none"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <p className="text-[11.5px] font-bold leading-tight">
              🔒 <span className="text-rose-300">Protection Médias Badoo</span> : Captures d'écran bloquées pour préserver la vie privée des membres.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Badge Overlays - Ultra-modern dynamic leader style */}
      <motion.div 
        style={{ opacity: likeOpacity, rotate: -12, scale: likeOpacity }}
        className="absolute top-8 left-5 z-40 border-2 border-emerald-400/90 text-emerald-400 bg-emerald-950/80 backdrop-blur-md font-black tracking-widest text-[17px] uppercase px-4 py-1.5 rounded-xl shadow-[0_0_25px_rgba(52,211,153,0.5)] flex items-center space-x-2 pointer-events-none origin-center"
      >
        <svg className="w-5 h-5 fill-emerald-400 text-emerald-400" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>LIKE</span>
      </motion.div>
      <motion.div 
        style={{ opacity: passOpacity, rotate: 12, scale: passOpacity }}
        className="absolute top-8 right-5 z-40 border-2 border-rose-500/90 text-rose-500 bg-rose-950/80 backdrop-blur-md font-black tracking-widest text-[17px] uppercase px-4 py-1.5 rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center space-x-2 pointer-events-none origin-center"
      >
        <svg className="w-5 h-5 stroke-rose-500" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        <span>PASS</span>
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-hide pointer-events-auto touch-pan-y select-none" onContextMenu={handleMediaSecurityNotice}>
        {/* Main Photo with gradient and info on top - fills entire card view */}
        <div 
          onClick={() => openFullScreenGallery(0)}
          className="relative w-full h-full min-h-[560px] sm:min-h-[640px] bg-slate-100 pointer-events-auto shrink-0 overflow-hidden select-none cursor-pointer group"
        >
          <img 
            src={photos[0]} 
            alt={profile.name} 
            className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-300 group-hover:scale-102" 
            draggable={false} 
            onDragStart={handleMediaSecurityNotice}
            loading="eager"
          />
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

          <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-auto z-20">
             <div 
               onClick={(e) => {
                 e.stopPropagation();
                 setIsProfileModalOpen(true);
               }}
               className="cursor-pointer max-w-[85%] min-w-0"
             >
               <h2 className="text-[19px] sm:text-[22px] font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] tracking-tight leading-tight mb-1.5 flex items-center gap-1.5 min-w-0 select-none">
                 {Boolean(profile?.verified === true || profile?.isVerified === true || profile?.is_verified === true || profile?.isPhotoVerified === true) && (
                   <span 
                     className="w-4.5 h-4.5 rounded-full bg-[#0084ff] text-white inline-flex items-center justify-center shrink-0 shadow-sm"
                     title="Profil vérifié par photo"
                   >
                     <Check className="w-3 h-3 stroke-[3]" />
                   </span>
                 )}
                 <span className="truncate min-w-0">{profile.name}, {profile.age}</span>
                 {(() => {
                   const isOnline = profile.online !== undefined 
                     ? Boolean(profile.online) 
                     : presenceService.getPresenceForProfile(profile).isOnline;
                   return isOnline ? (
                     <span 
                       className="w-2.5 h-2.5 rounded-full bg-[#30d158] inline-block shrink-0 shadow-xs ml-0.5" 
                       title="En ligne" 
                     />
                   ) : null;
                 })()}
               </h2>
               <div className="flex flex-col space-y-1.5">
                 {/* Badge "Vient de s'inscrire" conforme à 100% à la photo de référence */}
                 {(() => {
                   const isNewRegistrant = Boolean(
                     profile.tagline === "Vient de s'inscrire" ||
                     profile.isNewUser ||
                     profile.isNew ||
                     profile.is_new ||
                     profile.relation === "Vient de s'inscrire" ||
                     profile.joinedRecently
                   );

                   if (isNewRegistrant) {
                     return (
                       <div className="bg-white text-black text-[11.5px] font-bold px-2.5 py-1 rounded-full flex items-center w-max gap-1.5 shadow-sm tracking-tight">
                         {/* Icône feuille / pousse comme sur la photo */}
                         <svg className="w-3.5 h-3.5 text-black shrink-0" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
                         </svg>
                         <span>Vient de s&apos;inscrire</span>
                       </div>
                     );
                   }

                   return (
                     <div className="bg-white/95 backdrop-blur-xs text-black text-[11px] font-bold px-3 py-1 rounded-full flex items-center w-max gap-1.5 shadow-sm tracking-tight">
                       {profile.relation === 'Une histoire sérieuse' || profile.relation?.toLowerCase() === 'une histoire serieuse' ? (
                         <Heart className="w-3 h-3 text-black fill-black" strokeWidth={0} />
                       ) : profile.relation === 'Discuter' || profile.relation?.toLowerCase() === 'discuter' ? (
                         <MessageCircle className="w-3 h-3 text-black fill-black" strokeWidth={0} />
                       ) : (
                         <Coffee className="w-3 h-3 text-black fill-black" strokeWidth={0} />
                       )}
                       <span>{profile.relation || 'Une histoire sérieuse'}</span>
                     </div>
                   );
                 })()}

                 {/* Immediate Distance or Location Badge (Photo 1 & Photo 2 design) */}
                 {(() => {
                   const distInfo = getProfileDistanceInfo(profile, userCoords);
                   const city = cleanCity(profile.location, profile.city);
                   const isCityDefault = Boolean(profile.showCityOnly || profile.showDistance === false);
                   const showCity = isDistanceToggled ? !isCityDefault : isCityDefault;
                   const badgeText = showCity ? city : distInfo.text;

                   return (
                     <div 
                       onClick={(e) => {
                         e.stopPropagation();
                         setIsDistanceToggled(prev => !prev);
                       }}
                       className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center w-max gap-1.5 border border-white/15 shadow-sm tracking-tight pointer-events-auto cursor-pointer active:scale-95 transition-transform select-none"
                       title="Appuyer pour basculer entre distance et ville"
                     >
                       <MapPin className="w-3 h-3 text-white fill-white shrink-0" />
                       <span>{badgeText}</span>
                     </div>
                   );
                 })()}
               </div>
             </div>
             <button 
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 e.preventDefault();
                 onOpenActionMenu();
               }} 
               onPointerDown={(e) => e.stopPropagation()}
               className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 backdrop-blur-md transition-all z-30 pointer-events-auto cursor-pointer flex items-center justify-center shadow-lg border border-white/20"
               aria-label="Options du profil"
             >
               <MoreHorizontal className="w-5 h-5 text-white filter drop-shadow-md" strokeWidth={2.8} />
             </button>
          </div>
        </div>
        
        {/* Details Section - Ultra-luxurious Dark Glass Theme */}
        <div className="p-4 sm:p-5 pb-28 bg-[#16042c]/95 backdrop-blur-xl border-t border-purple-500/20 text-white">
          <div className="mb-4">
            <h3 className="text-purple-300/70 text-[11px] font-bold uppercase tracking-wider mb-1">Localisation</h3>
            <div className="text-[16px] font-black text-white mb-0.5">{cleanCity(resolvedProfile.location, resolvedProfile.city)}</div>
            <div className="flex items-center text-purple-200/70 text-[11.5px] font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-pink-400 fill-pink-400" />
              Emplacement actuel
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-purple-300/70 text-[11px] font-bold uppercase tracking-wider mb-2">Au niveau relations</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#240c44]/80 text-purple-100 border border-purple-500/25 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                <span>☕</span>
                <span>{resolvedProfile.relation || resolvedProfile.keyQuestion || (resolvedProfile.details && resolvedProfile.details.relation) || 'Discuter'}</span>
              </span>
              {((resolvedProfile.status || (resolvedProfile.details && resolvedProfile.details.status)) && (resolvedProfile.status || resolvedProfile.details?.status) !== "Je préfère ne pas le dire") && (
                <span className="bg-[#240c44]/80 text-purple-100 border border-purple-500/25 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" strokeWidth={0} />
                  <span>{resolvedProfile.status || resolvedProfile.details?.status}</span>
                </span>
              )}
              {((resolvedProfile.orientation || resolvedProfile.sexuality || (resolvedProfile.details && (resolvedProfile.details.orientation || resolvedProfile.details.sexuality))) && (resolvedProfile.orientation || resolvedProfile.sexuality || resolvedProfile.details?.orientation || resolvedProfile.details?.sexuality) !== "Je préfère ne pas le dire") && (
                <span className="bg-[#240c44]/80 text-purple-100 border border-purple-500/25 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                  <span className="text-[12px] font-normal text-pink-300">⚥</span>
                  <span>{resolvedProfile.orientation || resolvedProfile.sexuality || resolvedProfile.details?.orientation || resolvedProfile.details?.sexuality}</span>
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-purple-300/70 text-[11px] font-bold uppercase tracking-wider mb-2">Langues parlées</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#240c44]/80 text-purple-100 border border-purple-500/25 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                <span className="font-serif text-[12px] text-pink-300">文A</span>
                <span>{resolvedProfile.language || (resolvedProfile.details && (resolvedProfile.details.languages || resolvedProfile.details.language)) || 'Français'}</span>
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-purple-300/70 text-[11px] font-bold uppercase tracking-wider mb-2">Plus d'infos</h3>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const detailsObj = resolvedProfile.details;
                const items: { label: string }[] = [];
                if (detailsObj && typeof detailsObj === 'object' && !Array.isArray(detailsObj)) {
                  if (detailsObj.children && detailsObj.children !== "Je préfère ne pas le dire") items.push({ label: detailsObj.children });
                  if (detailsObj.smoking && detailsObj.smoking !== "Je préfère ne pas le dire") items.push({ label: detailsObj.smoking });
                  if (detailsObj.alcohol && detailsObj.alcohol !== "Je préfère ne pas le dire") items.push({ label: detailsObj.alcohol });
                  if (detailsObj.height && detailsObj.height !== "Je préfère ne pas le dire") items.push({ label: detailsObj.height });
                  if (detailsObj.education && detailsObj.education !== "Je préfère ne pas le dire") items.push({ label: detailsObj.education });
                  if (detailsObj.personality && detailsObj.personality !== "Je préfère ne pas le dire") items.push({ label: detailsObj.personality });
                  if (detailsObj.pets && detailsObj.pets !== "Je préfère ne pas le dire") items.push({ label: detailsObj.pets });
                } else if (Array.isArray(detailsObj)) {
                  detailsObj.forEach((d: any) => {
                    if (d && typeof d === 'string' && d !== "Je préfère ne pas le dire") {
                      items.push({ label: d });
                    } else if (d && typeof d === 'object' && d.label) {
                      items.push({ label: d.label });
                    }
                  });
                }
                if (resolvedProfile.height && !items.some(i => i.label.includes('cm'))) {
                  items.push({ label: resolvedProfile.height });
                }
                if (items.length === 0) {
                  return ['J\'en voudrais un jour', 'Non-fumeur', 'Occasionnellement', '180 cm'].map((lbl, idx) => (
                    <span key={idx} className="bg-[#240c44]/80 text-purple-100 border border-purple-500/25 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm">
                      <span>{lbl}</span>
                    </span>
                  ));
                }
                return items.map((item, idx) => (
                  <span key={idx} className="bg-[#240c44]/80 text-purple-100 border border-purple-500/25 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <span>{item.label}</span>
                  </span>
                ));
              })()}
            </div>
          </div>
          
          {/* Extra photos if available */}
          {extraPhotos.length > 0 && (
            <div className="space-y-3 mt-5">
              {extraPhotos.map((photoUrl: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullScreenGallery(idx + 1);
                  }}
                  className="w-full rounded-[18px] overflow-hidden shadow-sm bg-slate-100 cursor-pointer relative group pointer-events-auto"
                >
                  <LazyBlurImage 
                    src={photoUrl} 
                    alt={`${profile.name} extra ${idx + 1}`} 
                    className="w-full rounded-[18px] object-cover aspect-[4/5] pointer-events-none bg-slate-100" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/75 text-white text-[11.5px] font-extrabold px-3 py-1.5 rounded-full backdrop-blur-md transition-opacity border border-white/20 flex items-center space-x-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Plein écran ({idx + 2}/{photos.length})</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-[20px]"></div>

      {/* Detailed Profile Modal when clicking profile */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onLike={() => {
          setIsProfileModalOpen(false);
          onSwipeRight();
        }}
      />

      {/* Fullscreen Interactive Photo Gallery Modal */}
      <FullScreenPhotoGalleryModal
        isOpen={isFullScreenGalleryOpen}
        onClose={() => setIsFullScreenGalleryOpen(false)}
        photos={photos}
        initialIndex={galleryStartIdx}
        profileName={profile.name}
      />
    </motion.div>
  );
});

export function EncountersProfiles({ 
  onNavigateToTab,
  genderPreference = 'les_deux',
  setGenderPreference,
  likedProfiles: propLikedProfiles,
  setLikedProfiles: propLikedProfilesSetter,
  onLikeProfile,
  setActiveChat: propSetActiveChat,
  discussions: propDiscussions,
  setDiscussions: propSetDiscussions,
  userLookingFor,
  isPremium,
  onActivatePremium,
  profiles = [],
  receivedLikes = [],
  userProfile,
  loadSupabaseData,
  userPosition
}: { 
  onNavigateToTab?: (tab: string) => void;
  genderPreference?: 'homme' | 'femme' | 'les_deux';
  setGenderPreference?: (pref: 'homme' | 'femme' | 'les_deux') => void;
  likedProfiles?: number[];
  setLikedProfiles?: React.Dispatch<React.SetStateAction<number[]>> | ((ids: number[]) => void);
  onLikeProfile?: (id: string | number) => Promise<boolean | undefined>;
  setActiveChat?: (profile: any) => void;
  discussions?: any[];
  setDiscussions?: (discs: any[]) => void;
  userLookingFor?: 'serieuse' | 'discuter' | 'rencontres';
  isPremium?: boolean;
  onActivatePremium?: () => void;
  profiles?: any[];
  receivedLikes?: string[];
  userProfile?: any;
  loadSupabaseData?: () => void;
  userPosition?: GeolocationPosition;
}) {
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(() => {
    if (userPosition?.coords) {
      return {
        latitude: userPosition.coords.latitude,
        longitude: userPosition.coords.longitude
      };
    }
    return null;
  });

  useEffect(() => {
    if (userPosition?.coords) {
      setUserCoords({
        latitude: userPosition.coords.latitude,
        longitude: userPosition.coords.longitude
      });
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {},
        { timeout: 4000, maximumAge: 60000 }
      );
    }
  }, [userPosition]);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [distanceRange, setDistanceRange] = useState<[number, number]>([1, 100]);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [showExtraShows, setShowExtraShows] = useState(false);
  const [showSpeedDating, setShowSpeedDating] = useState(false);
  const [showRechargeCredits, setShowRechargeCredits] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumSlideId, setPremiumSlideId] = useState<string | undefined>(undefined);
  // Pile d'historique (Stack LIFO) des profils vus pour restauration instantanée en React
  const [profileHistory, setProfileHistory] = useState<{
    profile: any;
    index: number;
    wasPass: boolean;
    timestamp: number;
  }[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-18, 18]);
  // Carte N+1 (directement en dessous) : passe progressivement de 0.94 à 1 et remonte de y=16px à 0px
  const nextScale = useTransform(x, [-240, 0, 240], [1, 0.95, 1]);
  const nextY = useTransform(x, [-240, 0, 240], [0, 14, 0]);
  const nextOpacity = useTransform(x, [-240, 0, 240], [1, 0.92, 1]);
  // Carte N+2 (troisième carte dans le deck superposé)
  const next2Scale = useTransform(x, [-240, 0, 240], [0.95, 0.90, 0.95]);
  const next2Y = useTransform(x, [-240, 0, 240], [14, 28, 14]);
  const next2Opacity = useTransform(x, [-240, 0, 240], [0.9, 0.65, 0.9]);

  const [isPageTurning, setIsPageTurning] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showCoupDeCoeurModal, setShowCoupDeCoeurModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    x.set(0); // Reset x when index changes to allow next card to center
  }, [currentIndex, x]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const [selectedIntent, setSelectedIntent] = useState<string>('Tous');
  const [showSuperLikeFlash, setShowSuperLikeFlash] = useState<boolean>(false);

  // Real-time Bavel AI™ Swipe Network Sync
  const sendBavelAiSwipe = async (targetId: string | number, targetName: string, direction: 'like' | 'pass' | 'superlike', note?: string) => {
    try {
      const res = await fetch('/api/encounters/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile?.id || 'current_user',
          targetProfileId: String(targetId),
          targetProfileName: targetName,
          direction,
          note
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error("Erreur enregistrement swipe Bavel AI:", err);
    }
    return { isMatch: false };
  };

  const handleSendCoupDeCoeur = async (noteMessage?: string) => {
    setShowCoupDeCoeurModal(false);
    
    if (currentProfile) {
      // 1. Add to liked list
      if (!likedProfiles.includes(currentProfile.id)) {
        setLikedProfiles([...likedProfiles, currentProfile.id]);
      }

      // 2. Trigger Haptic Vibration & Visual Flash
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 150, 50, 200]);
      }
      setShowSuperLikeFlash(true);
      setTimeout(() => setShowSuperLikeFlash(false), 2200);

      // 3. Elo Score boost & swipe event recording
      smartMatchService.recordSwipeEvent(String(currentProfile.id), true);

      // 4. Real-time Bavel AI API & Supabase sync
      const swipeRes = await sendBavelAiSwipe(currentProfile.id, currentProfile.name, 'superlike', noteMessage);
      await saveLikeToSupabase(userProfile?.id || 'current_user_id', String(currentProfile.id));
      
      if (noteMessage) {
        // Automatically save initial icebreaker note into discussions
        try {
          const newDisc = {
            id: `disc_${currentProfile.id}`,
            userId: String(currentProfile.id),
            name: currentProfile.name,
            avatar: currentProfile.img || currentProfile.photos?.[0],
            age: currentProfile.age,
            online: true,
            unreadCount: 0,
            lastMessage: `⚡ Coup de Cœur : "${noteMessage}"`,
            lastMessageTime: new Date(),
            messages: [
              {
                id: `msg_cc_${Date.now()}`,
                text: noteMessage,
                sender: 'user',
                timestamp: new Date(),
                read: true,
                type: 'text'
              }
            ]
          };
          if (propSetDiscussions) {
            propSetDiscussions([newDisc, ...(propDiscussions || []).filter((d: any) => d.id !== newDisc.id)]);
          }
        } catch {}
      }

      // 5. Send WebSocket real-time alert / FCM Push Notification
      pushNotificationService.triggerSecretMatchPush(currentProfile.name);

      showToast(noteMessage ? `⚡ Coup de Cœur avec mot doux envoyé à ${currentProfile.name} !` : `⚡ Coup de Cœur envoyé à ${currentProfile.name} !`);
      
      if (swipeRes?.isMatch) {
        triggerMatchExplosion();
        setShowMatchModal(true);
      } else {
        // Advance to next profile after animation
        setTimeout(() => {
          handleNext();
        }, 600);
      }
    }
  };

  // Local state fallbacks if props are not provided
  const [localLikedProfiles, setLocalLikedProfiles] = useState<number[]>([]);
  const likedProfiles = propLikedProfiles !== undefined ? propLikedProfiles : localLikedProfiles;
  const setLikedProfiles = (val: number[] | ((prev: number[]) => number[])) => {
    if (propLikedProfilesSetter !== undefined) {
      if (typeof val === 'function') {
        const updater = val as (prev: number[]) => number[];
        propLikedProfilesSetter(updater(likedProfiles));
      } else {
        propLikedProfilesSetter(val);
      }
    } else {
      if (typeof val === 'function') {
        setLocalLikedProfiles(val);
      } else {
        setLocalLikedProfiles(val);
      }
    }
  };

  const [localActiveChat, setLocalActiveChat] = useState<any>(null);
  // Prevent duplicate rendering: if parent handles setActiveChat, don't show local active chat
  const activeChat = propSetActiveChat !== undefined ? null : localActiveChat;
  const setActiveChat = propSetActiveChat !== undefined ? propSetActiveChat : setLocalActiveChat;

  const [localDiscussions, setLocalDiscussions] = useState<any[]>([]);
  const discussions = propDiscussions !== undefined ? propDiscussions : localDiscussions;
  const setDiscussions = propSetDiscussions !== undefined ? propSetDiscussions : setLocalDiscussions;
  const cardRef = useRef<any>(null);

  const { registerSubmenu, unregisterSubmenu } = useUX();

  const isAnySubmenuOpen = Boolean(
    showActionMenu ||
    showFilters ||
    showExtraShows ||
    showSpeedDating ||
    showRechargeCredits ||
    showPremiumModal ||
    showMatchModal ||
    showCoupDeCoeurModal ||
    activeChat
  );

  useEffect(() => {
    if (isAnySubmenuOpen) {
      registerSubmenu('encounters_profiles_submenus');
    } else {
      unregisterSubmenu('encounters_profiles_submenus');
    }
    return () => {
      unregisterSubmenu('encounters_profiles_submenus');
    };
  }, [isAnySubmenuOpen, registerSubmenu, unregisterSubmenu]);

  const defaultEncounterProfiles = [
    {
      id: 99,
      name: 'Coralie',
      age: 31,
      location: 'Angers',
      distance: 80,
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
      tagline: 'Vient de s\'inscrire',
      isNewUser: true,
      relation: 'Vient de s\'inscrire',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français',
      details: ['Non-fumeuse', '168 cm', 'Voyages', 'Musique', 'Balance'],
      gender: 'femme',
      online: true
    },
    {
      id: 1,
      name: 'Audrey',
      age: 36,
      location: 'Le Mans',
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
      tagline: 'Vient de s\'inscrire',
      isNewUser: true,
      relation: 'Des rencontres',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français',
      details: ['Non-fumeuse', 'À l\'occasion', '165 cm', 'Chat(s)', 'Athée', 'Lion'],
      gender: 'femme'
    },
    {
      id: 2,
      name: 'Jessica',
      age: 28,
      location: 'Le Mans',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
      tagline: 'Profil vérifié',
      relation: 'Une histoire sérieuse',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français, Anglais',
      details: ['Sportive', 'Non-fumeuse', '170 cm', 'Diplôme universitaire', 'Taureau'],
      gender: 'femme'
    },
    {
      id: 3,
      name: 'Elodie',
      age: 32,
      location: 'Sarthe',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
      tagline: 'En ligne',
      relation: 'Discuter',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français',
      details: ['Gourmande', 'Passionnée de voyage', '168 cm', 'Balance'],
      gender: 'femme'
    },
    {
      id: 4,
      name: 'Mathieu',
      age: 30,
      location: 'Le Mans',
      img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
      tagline: 'Cherche sa complice de vie pour de belles aventures 🌟',
      relation: 'Une histoire sérieuse',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français',
      details: ['Non-fumeur', '180 cm', 'Epicurien', 'Bélier'],
      gender: 'homme'
    },
    {
      id: 5,
      name: 'Romain',
      age: 35,
      location: 'Le Mans',
      img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80',
      tagline: 'Homme sérieux qui cherche une femme sincère',
      relation: 'Une histoire sérieuse',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français',
      details: ['Non-fumeur', '178 cm', 'Sportif', 'Lion'],
      gender: 'homme'
    },
    {
      id: 6,
      name: 'Damien',
      age: 29,
      location: 'Le Mans',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      tagline: 'Ici pour du sérieux et partager de bons moments ☕',
      relation: 'Une histoire sérieuse',
      status: 'Célibataire',
      orientation: 'Hétéro',
      language: 'Français',
      details: ['Non-fumeur', '183 cm', 'Ingénieur', 'Capricorne'],
      gender: 'homme'
    }
  ];

  // Real-time Bavel AI™ Engine state
  const [bavelAiProfiles, setBavelAiProfiles] = useState<any[]>([]);
  const [isBavelAiLoading, setIsBavelAiLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBavelAiEncounters = async () => {
      setIsBavelAiLoading(true);
      try {
        const res = await fetch('/api/encounters/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userProfile?.id || 'current_user',
            genderPreference,
            minAge: ageRange[0],
            maxAge: ageRange[1],
            latitude: userCoords?.latitude,
            longitude: userCoords?.longitude,
            intent: selectedIntent,
            userProfile
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.profiles && Array.isArray(data.profiles) && data.profiles.length > 0) {
            setBavelAiProfiles(data.profiles);
          }
        }
      } catch (err) {
        console.error("Erreur chargement rencontres Bavel AI:", err);
      } finally {
        if (isMounted) setIsBavelAiLoading(false);
      }
    };

    fetchBavelAiEncounters();
    return () => { isMounted = false; };
  }, [genderPreference, ageRange, selectedIntent, userCoords?.latitude, userCoords?.longitude, userProfile?.id]);

  const encounterProfiles = useMemo(() => {
    if (bavelAiProfiles.length > 0) return bavelAiProfiles;
    return profiles || [];
  }, [bavelAiProfiles, profiles]);

  const filteredCandidates = useMemo(() => {
    const filtered = encounterProfiles.filter(p => {
      // Gender filter
      const genderMatch = genderPreference === 'les_deux' || p.gender === genderPreference;
      if (!genderMatch) return false;

      // Age filter
      if (p.age < ageRange[0] || p.age > ageRange[1]) return false;

      // Intent filter ("Je suis ici pour...")
      if (selectedIntent !== 'Tous') {
        const pRelation = (p as any).relation?.toLowerCase() || '';
        const targetIntent = selectedIntent.toLowerCase();
        if (targetIntent === 'une histoire sérieuse' && !pRelation.includes('sérieuse') && !pRelation.includes('serieuse')) {
          return false;
        }
        if (targetIntent === 'discuter' && !pRelation.includes('discuter') && !pRelation.includes('amitié')) {
          return false;
        }
        if (targetIntent === 'des rencontres' && !pRelation.includes('rencontres') && !pRelation.includes('spontané')) {
          return false;
        }
      }

      // Advanced filters
      if (advancedFilters.lookingFor && advancedFilters.lookingFor !== 'Tous' && (p as any).relation !== advancedFilters.lookingFor) return false;
      if (advancedFilters.verifiedOnly && !(p as any).verified) return false;
      if (advancedFilters.status && advancedFilters.status !== 'Tous' && (p as any).status !== advancedFilters.status) return false;
      if (advancedFilters.religion && advancedFilters.religion !== 'Tous' && !(p as any).details?.some((d: string) => d.includes(advancedFilters.religion))) return false;
      
      return true;
    });

    return filtered;
  }, [encounterProfiles, genderPreference, ageRange, selectedIntent, advancedFilters]);

  // Lock deck order to prevent current active profile from shifting during background data refreshes
  const [deckProfiles, setDeckProfiles] = useState<any[]>([]);
  const prevFilterKeyRef = useRef<string>('');

  useEffect(() => {
    const filterKey = `${genderPreference}_${ageRange.join('-')}_${selectedIntent}_${JSON.stringify(advancedFilters)}`;
    
    // If user changed explicit filters, reset index and rebuild deck
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      const rankedBySmartMatch = smartMatchService.rankProfilesForUser(userProfile?.id || 'current_user_id', filteredCandidates, receivedLikes);
      const rankedByAffinity = aiSystemEngine.rankProfilesByAffinityAndProximity(userProfile || {}, rankedBySmartMatch);
      const isBoosted = monetizationService.getBoostState().isActive;
      const optimized = aiMonetizationEngine.optimizeCandidatesForBoostedUser(rankedByAffinity, isBoosted);
      setDeckProfiles(optimized);
      setCurrentIndex(0);
      return;
    }

    // Otherwise (data refresh), append newly added profiles at tail without shifting existing order
    setDeckProfiles(prev => {
      if (prev.length === 0) {
        const ranked = smartMatchService.rankProfilesForUser(userProfile?.id || 'current_user_id', filteredCandidates, receivedLikes);
        return ranked;
      }
      const existingIds = new Set(prev.map(p => String(p.id)));
      const newAdditions = filteredCandidates.filter(p => !existingIds.has(String(p.id)));
      return newAdditions.length > 0 ? [...prev, ...newAdditions] : prev;
    });
  }, [filteredCandidates, genderPreference, ageRange, selectedIntent, advancedFilters, userProfile?.id]);

  const filteredEncounterProfiles = deckProfiles.length > 0 ? deckProfiles : filteredCandidates;

  const isEndOfStack = currentIndex >= filteredEncounterProfiles.length;

  const currentProfile = !isEndOfStack
    ? filteredEncounterProfiles[currentIndex]
    : null;

  const nextProfile = filteredEncounterProfiles.length > 0 && currentIndex + 1 < filteredEncounterProfiles.length
    ? filteredEncounterProfiles[currentIndex + 1]
    : null;

  const next2Profile = filteredEncounterProfiles.length > 0 && currentIndex + 2 < filteredEncounterProfiles.length
    ? filteredEncounterProfiles[currentIndex + 2]
    : null;

  // Preload next 3 profiles for instant, 60 FPS transitions
  useEffect(() => {
    if (filteredEncounterProfiles.length > 0) {
      const upcoming = filteredEncounterProfiles.slice(currentIndex + 1, currentIndex + 4);
      preloadNextProfiles(upcoming.map(p => ({ photo: (p as any).img || (p as any).photos?.[0] })));
    }
  }, [filteredEncounterProfiles, currentIndex]);

  const handleNext = (wasPass: boolean = false) => {
    // Contrôle de la limite de Swipes (Condition 5)
    const userTier = (userProfile?.tier || (isPremium ? 'premium' : monetizationService.getUserStatus())).toLowerCase();
    const privileges = getTierPrivileges(userTier);

    if (!privileges.unlimitedSwipes && (userProfile?.daily_likes_count || 0) >= 50) {
      showToast("⚠️ Limite atteinte ! Passez à l'offre EXTRA ou PREMIUM pour swiper en illimité.");
      setPremiumSlideId('unlimited_likes');
      setShowPremiumModal(true);
      return;
    }

    // Increment engagement challenge progress
    useNudgeStore.getState().incrementSwipe();

    // Badoo AI Bot Sentinel Surveillance
    const velocityCheck = securityService.recordSwipeAndCheckVelocity();
    if (velocityCheck.isVelocityAbnormal && velocityCheck.message) {
      showToast(velocityCheck.message);
    }

    if (currentProfile) {
      // 1. Sauvegarde dans la pile d'historique (Stack LIFO) pour réaffichage instantané
      setProfileHistory(prev => [...prev, {
        profile: currentProfile,
        index: currentIndex,
        wasPass,
        timestamp: Date.now()
      }]);
      setSwipeHistory(prev => [...prev, currentIndex]);

      // Send real-time pass action to Bavel AI Engine
      if (wasPass) {
        sendBavelAiSwipe(currentProfile.id, currentProfile.name, 'pass');
      }

      smartMatchService.recordSwipeEvent(String(currentProfile.id), !wasPass);
      if (currentProfile.img) {
        smartMatchService.recordPhotoImpression(String(currentProfile.id), currentProfile.img);
        if (!wasPass) {
          smartMatchService.recordPhotoLike(String(currentProfile.id), currentProfile.img);
        }
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = async () => {
    const userTier = (userProfile?.tier || (isPremium ? 'premium' : monetizationService.getUserStatus())).toLowerCase();
    const privileges = getTierPrivileges(userTier);

    // 1. Contrôle des droits de l'offre (Extra et Premium autorisés)
    if (!privileges.rewindSwipe && !monetizationService.hasPermission('canRewindSwipes') && !isPremium) {
      setPremiumSlideId('undo');
      setShowPremiumModal(true);
      showToast("⚠️ L'annulation du swipe est réservée aux membres EXTRA et PREMIUM !");
      return;
    }

    if (profileHistory.length === 0 && swipeHistory.length === 0) {
      showToast("Aucun profil précédent à réafficher.");
      return;
    }

    // 2. Récupérer le dernier profil de la pile d'historique (Stack LIFO)
    const lastItem = profileHistory[profileHistory.length - 1];
    const prevIndex = lastItem ? lastItem.index : (swipeHistory[swipeHistory.length - 1] ?? Math.max(0, currentIndex - 1));

    // 3. Mise à jour instantanée du state React (sans appel réseau bloquant)
    setProfileHistory(prev => prev.slice(0, -1));
    setSwipeHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prevIndex);

    // Si le swipe annulé était un like, retirer ce profil des likes locaux
    if (lastItem && !lastItem.wasPass && lastItem.profile?.id) {
      setLikedProfiles(prev => prev.filter(id => id !== lastItem.profile.id));
    }

    // Décrémenter le compteur de likes consommés aujourd'hui si > 0
    if (userProfile && typeof userProfile.daily_likes_count === 'number' && userProfile.daily_likes_count > 0) {
      userProfile.daily_likes_count = Math.max(0, userProfile.daily_likes_count - 1);
    }

    showToast("⏪ Profil précédent réaffiché instantanément !");

    // 4. Action asynchrone en tâche de fond dans Supabase
    try {
      const currentUserId = userProfile?.id || 'current_user_id';
      deleteLastSwipeFromSupabase(currentUserId).catch(err => {
        console.warn('Notice suppression swipe Supabase en arrière-plan:', err);
      });
    } catch (error: any) {
      console.warn("Erreur annulation swipe en base:", error);
    }
  };

  const handleLike = async () => {
    if (currentProfile) {
      if (!likedProfiles.includes(currentProfile.id)) {
        setLikedProfiles([...likedProfiles, currentProfile.id]);
      }
      sendBavelAiSwipe(currentProfile.id, currentProfile.name, 'like');
      const currentUserId = userProfile?.id || 'current_user_id';
      const targetUserId = String(currentProfile.user_id || currentProfile.id);
      
      const swipeRes = await saveSwipeToSupabase(currentUserId, targetUserId, true);
      pushNotificationService.triggerNewLikePush(currentProfile.name, currentProfile.img);
      
      if (swipeRes?.isMatch) {
        showToast(`🎉 Match avec ${currentProfile.name} !`);
        triggerMatchExplosion();
      } else {
        showToast(`❤️ Like envoyé à ${currentProfile.name} !`);
      }

      // Refresh Supabase data to check for instant matches
      if (typeof loadSupabaseData === 'function') {
        loadSupabaseData();
      }
    }
    handleNext(false);
  };

  const triggerMatchExplosion = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
    try {
      const duration = 2.2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 999 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 60 * (timeLeft / duration);

        confetti({ ...defaults, particleCount, origin: { x: 0.25, y: 0.6 }, colors: ['#e20030', '#ff2d55', '#ffd700', '#7c3aed'] });
        confetti({ ...defaults, particleCount, origin: { x: 0.75, y: 0.6 }, colors: ['#e20030', '#ff2d55', '#ffd700', '#7c3aed'] });
      }, 200);
    } catch {
      // Production silent handle
    }
  };

  const handleLikeDirect = async () => {
    if (!currentProfile) return;
    const profileToLike = currentProfile;

    // 1. Mise à jour optimiste instantanée pour supprimer toute sensation de latence
    if (!likedProfiles.includes(profileToLike.id)) {
      setLikedProfiles(prev => [...prev, profileToLike.id]);
    }
    useNudgeStore.getState().incrementLike();

    // 2. Faire avancer immédiatement la pile visuelle (aucun blocage d'interface)
    handleNext(false);

    // 3. Exécution asynchrone non-bloquante de la vérification temps réel Supabase
    (async () => {
      try {
        const currentUserId = userProfile?.id || 'current_user_id';
        const targetUserId = String(profileToLike.user_id || profileToLike.id);

        // Appel swipe réel sans simulation
        const swipeRes = await saveSwipeToSupabase(currentUserId, targetUserId, true);
        sendBavelAiSwipe(profileToLike.id, profileToLike.name, 'like');

        let isMatch = Boolean(swipeRes?.isMatch);

        // Si le parent fournit une fonction onLikeProfile personnalisée
        if (onLikeProfile) {
          const propMatch = await onLikeProfile(profileToLike.id);
          if (propMatch) isMatch = true;
        }

        // Si et seulement si un VRAI match réciproque est trouvé en base
        if (isMatch) {
          triggerMatchExplosion();
          setShowMatchModal(true);
        }

        if (loadSupabaseData) {
          loadSupabaseData();
        }
      } catch (err) {
        console.warn("Erreur like en temps réel:", err);
      }
    })();
  };

  const handleLikeClick = () => {
    if (cardRef.current) {
      cardRef.current.swipe('right');
    } else {
      handleLikeDirect();
    }
  };

  const handlePassClick = () => {
    if (cardRef.current) {
      cardRef.current.swipe('left');
    } else {
      handleNext(true);
    }
  };

  const handleCloseMatch = () => {
    setShowMatchModal(false);
    handleNext();
  };

  const handleOpenChat = () => {
    setShowMatchModal(false);
    if (currentProfile) {
      // Check if this matched profile is already in active discussions
      const alreadyExists = discussions.some((d: any) => d.id === currentProfile.id || d.name === currentProfile.name);
      if (!alreadyExists) {
        const newMatchChat = {
          id: currentProfile.id,
          name: currentProfile.name,
          age: currentProfile.age,
          img: currentProfile.img,
          online: true,
          initialMessage: "Coucou ! J'espère que tu vas bien. On a matché ! 😊",
          gender: currentProfile.gender
        };
        setDiscussions([newMatchChat, ...discussions]);
      }
      setActiveChat(currentProfile);
      if (onNavigateToTab) {
        onNavigateToTab('discussions');
      }
    }
  };

  return (
    <SwipeThemeProvider>
      <div className="pt-1 sm:pt-2 px-2 sm:px-3 h-full flex flex-col relative pb-0">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[260] bg-black/95 text-white text-[12.5px] font-bold px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center space-x-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {showCoupDeCoeurModal && currentProfile && (
        <CoupDeCoeurModal 
          profile={currentProfile}
          onClose={() => setShowCoupDeCoeurModal(false)}
          onSend={handleSendCoupDeCoeur}
          onOpenRecharge={() => {
            setShowCoupDeCoeurModal(false);
            setShowRechargeCredits(true);
          }}
        />
      )}

      {showFilters && (
        <EncountersFiltersMenu 
          onClose={() => setShowFilters(false)} 
          genderPreference={genderPreference}
          setGenderPreference={setGenderPreference}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
          distanceRange={distanceRange}
          setDistanceRange={setDistanceRange}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
        />
      )}
      {showExtraShows && (
        <ExtraShowsMenu 
          onClose={() => setShowExtraShows(false)} 
          onOpenRecharge={() => {
            setShowExtraShows(false);
            setShowRechargeCredits(true);
          }} 
        />
      )}
      {showRechargeCredits && (
        <RechargeCreditsMenu onClose={() => setShowRechargeCredits(false)} />
      )}
      {showActionMenu && (
        <EncounterCardMenu 
          profileName={currentProfile?.name}
          onClose={() => setShowActionMenu(false)}
          onBlock={async () => {
            setShowActionMenu(false);
            if (currentProfile?.id) {
              const currentUserId = userProfile?.id || 'current_user_id';
              await blockUserInSupabase(currentUserId, String(currentProfile.id));
            }
            handlePassClick();
            setToastMessage(`🚫 ${currentProfile?.name || 'Membre'} bloqué(e)`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onReport={() => {
            setShowActionMenu(false);
            setShowReportModal(true);
          }}
        />
      )}
      {showReportModal && (
        <ReportMenu
          userName={currentProfile?.name || "ce membre"}
          onClose={() => setShowReportModal(false)}
          onSelectReason={async (reason) => {
            setShowReportModal(false);
            if (currentProfile?.id) {
              const currentUserId = userProfile?.id || 'current_user_id';
              await reportUserInSupabase(currentUserId, String(currentProfile.id), reason);
            }
            handlePassClick();
            setToastMessage(`🛡️ Signalement transmis (${reason}). Le membre a été bloqué pour votre sécurité.`);
            setTimeout(() => setToastMessage(null), 3500);
          }}
        />
      )}
      {showMatchModal && (
        <MatchModal 
          matchedProfile={currentProfile} 
          onClose={handleCloseMatch} 
          onChat={handleOpenChat} 
          userPhoto={userProfile?.avatarUrl || userProfile?.img || (userProfile?.photos && userProfile?.photos[0])}
        />
      )}
      <AnimatePresence>
        {activeChat && (
          <ChatConversationView 
            profile={activeChat} 
            isPremium={isPremium}
            onActivatePremium={onActivatePremium}
            onClose={() => { setActiveChat(null); handleNext(); }} 
            onOpenPremium={(slideId) => {
              setPremiumSlideId(slideId);
              setShowPremiumModal(true);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPremiumModal && (
          <BavelPremiumModal 
            onClose={() => {
              setShowPremiumModal(false);
              setPremiumSlideId(undefined);
            }} 
            initialSlideId={premiumSlideId}
            profileName={currentProfile?.name}
            onSubscribe={() => {
              onActivatePremium?.();
              showToast("✨ Bavel Premium activé !");
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Speed Dating / Blind Date 3 min */}
      {showSpeedDating && (
        <SpeedDatingModal
          isOpen={showSpeedDating}
          onClose={() => setShowSpeedDating(false)}
          userProfile={userProfile}
          onMutualMatch={(partner) => {
            setShowSpeedDating(false);
            showToast(`💘 Match Speed Dating avec ${partner.name} !`);
            triggerMatchExplosion();
            if (propSetDiscussions) {
              const newDisc = {
                id: `disc_${partner.id}`,
                userId: partner.id,
                name: partner.name,
                avatar: partner.photoUrl,
                age: partner.age,
                online: true,
                unreadCount: 0,
                lastMessage: "💘 Coup de Cœur Speed Dating 3 min validé !",
                lastMessageTime: new Date(),
                messages: [
                  {
                    id: `msg_${Date.now()}`,
                    text: "Coucou ! On a matché au Speed Dating 3 minutes ! 😊",
                    sender: 'user',
                    timestamp: new Date(),
                    read: true,
                    type: 'text'
                  }
                ]
              };
              propSetDiscussions([newDisc, ...(propDiscussions || []).filter((d: any) => d.id !== newDisc.id)]);
            }
          }}
        />
      )}


      {/* Super Like Fullscreen Flash Impact */}
      <AnimatePresence>
        {showSuperLikeFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-[300] flex flex-col items-center justify-center bg-rose-600/90 backdrop-blur-md text-white pointer-events-none"
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="text-7xl mb-3"
            >
              ⚡
            </motion.div>
            <h2 className="text-2xl font-black tracking-tight text-center uppercase drop-shadow-md">
              Coup de Cœur Envoyé !
            </h2>
            <p className="text-xs font-bold text-rose-200 mt-1">Notification push instantanée transmise via FCM</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-1 pb-1 flex items-center justify-between shrink-0 gap-1">
        <h1 className="text-[17px] xs:text-[19px] sm:text-[23px] font-extrabold text-white tracking-tight truncate leading-tight">Rencontres</h1>
        
        <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 shrink-0">

          <button 
            onClick={() => setShowExtraShows(true)} 
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center relative transition-transform active:scale-90 cursor-pointer rounded-full bg-[#240c44]/80 border border-purple-500/25 hover:border-purple-400"
            title="Extra Shows"
            type="button"
          >
            <Zap className="w-4.5 h-4.5 text-pink-400 fill-pink-400" strokeWidth={2} />
            <div className="absolute top-1 right-1 w-2 h-2 bg-[#f43f5e] rounded-full ring-2 ring-[#16042c]"></div>
          </button>
          {(profileHistory.length > 0 || swipeHistory.length > 0) && (
            <button 
              onClick={handleUndo}
              className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center bg-[#240c44]/80 border border-purple-500/25 rounded-full transition-transform active:scale-90 cursor-pointer text-[#ff9500] hover:border-amber-400"
              title="Annuler le dernier swipe"
              type="button"
            >
              <RotateCcw className="w-4.5 h-4.5" strokeWidth={2.5} />
            </button>
          )}
          <button 
            onClick={() => setShowFilters(true)} 
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center bg-[#240c44]/80 border border-purple-500/25 rounded-full transition-transform active:scale-90 cursor-pointer text-white hover:border-purple-400"
            type="button"
            title="Filtres"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <EngagementNudgeBanner />

      <div className="flex-1 relative min-h-0 mb-1">
        {isEndOfStack ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-4"
          >
            {/* Illustration */}
            <div className="relative w-52 h-52 mb-6 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                {/* Purple Sleeve */}
                <path 
                  d="M 54,118 L 70,168 L 96,168 L 80,118 Z" 
                  fill="#8b5cf6" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  strokeLinejoin="round" 
                />

                {/* Hand Main Body */}
                <path 
                  d="M 80,118 C 80,102 88,82 96,64 C 100,52 106,38 116,38 C 124,38 128,44 126,54 C 122,68 114,80 108,88 C 120,88 136,88 148,88 C 156,88 156,102 148,102 C 154,102 154,116 146,116 C 152,116 152,130 144,130 C 148,130 148,144 138,144 C 120,144 95,148 80,160 Z" 
                  fill="#ffffff" 
                  stroke="#16042c" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Finger separation inner lines */}
                <path d="M 108,102 L 148,102" stroke="#16042c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 104,116 L 146,116" stroke="#16042c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 100,130 L 144,130" stroke="#16042c" strokeWidth="2" strokeLinecap="round" />

                {/* 5 Radiating lines above thumb */}
                <path d="M 88,28 L 98,36" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 102,18 L 108,28" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 118,12 L 118,24" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 134,18 L 128,28" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 148,28 L 138,36" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Text Title */}
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white mb-2 tracking-tight">C'est tout... pour le moment</h2>

            {/* Paragraph */}
            <p className="text-purple-200/80 text-[13.5px] sm:text-[14px] font-normal leading-relaxed max-w-[310px] mb-6">
              Consultez votre liste de Likes pour trouver un Match, ou bien modifiez vos filtres pour voir d'autres profils.
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col items-center space-y-2.5">
              {(profileHistory.length > 0 || swipeHistory.length > 0) && (
                <button 
                  onClick={handleUndo}
                  className="w-full max-w-[260px] bg-[#ff9500] hover:bg-[#e08500] text-white font-extrabold py-3 rounded-full text-[13.5px] sm:text-[14.5px] shadow-sm active:scale-95 transition-transform flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                  <span>Annuler le dernier swipe</span>
                </button>
              )}
              <button 
                onClick={() => setCurrentIndex(0)}
                className="w-full max-w-[260px] bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] text-white font-extrabold py-3.5 rounded-full text-[14px] sm:text-[15px] shadow-lg shadow-pink-500/25 active:scale-95 transition-transform flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Recommencer le défilé</span>
              </button>
              <button 
                onClick={() => onNavigateToTab?.('likes')}
                className="w-full max-w-[260px] bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold py-3 rounded-full text-[13.5px] sm:text-[14px] active:scale-95 transition-transform cursor-pointer"
              >
                Voir mes Likes
              </button>
              <button 
                onClick={() => setShowFilters(true)} 
                className="text-purple-300 hover:text-white text-[13.5px] sm:text-[14px] font-medium py-1 active:scale-95 transition-transform cursor-pointer"
              >
                Modifier les filtres
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full relative select-none" style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}>
            {/* Third Card in Stack (N+2) - Depth layer */}
            {next2Profile && (
              <motion.div 
                className="absolute inset-0 rounded-[24px] sm:rounded-[28px] overflow-hidden bg-slate-900 shadow-md border border-white/10 flex flex-col pointer-events-none"
                style={{
                  scale: isPageTurning ? 0.94 : next2Scale,
                  y: isPageTurning ? 24 : next2Y,
                  opacity: next2Opacity,
                  zIndex: 0
                }}
              >
                <div className="relative w-full h-full min-h-[560px] sm:min-h-[640px] bg-slate-900 pointer-events-none shrink-0 overflow-hidden">
                  <img 
                    src={next2Profile.img} 
                    alt={next2Profile.name} 
                    className="w-full h-full object-cover pointer-events-none opacity-80 filter brightness-75" 
                    draggable={false} 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                </div>
              </motion.div>
            )}

            {/* Second Card in Stack (N+1) - Transition layer */}
            {nextProfile && (
              <motion.div 
                className="absolute inset-0 rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white shadow-xl border border-slate-200/80 flex flex-col pointer-events-none"
                style={{
                  scale: isPageTurning ? 1 : nextScale,
                  y: isPageTurning ? 0 : nextY,
                  opacity: isPageTurning ? 1 : nextOpacity,
                  zIndex: 1
                }}
              >
                {/* Scrollable content */}
                <div className="flex-1 w-full h-full overflow-y-auto scrollbar-hide">
                  {/* Main Photo with gradient and info on top */}
                  <div className="relative w-full h-full min-h-[560px] sm:min-h-[640px] bg-slate-100 pointer-events-none shrink-0 overflow-hidden">
                    <img 
                      src={nextProfile.img} 
                      alt={nextProfile.name} 
                      className="w-full h-full object-cover pointer-events-none" 
                      draggable={false} 
                      loading="eager"
                    />
                    <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 to-transparent"></div>
                    
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                       <div>
                         <h2 className="text-[19px] sm:text-[21px] font-bold text-white drop-shadow-md tracking-tight leading-tight mb-1.5 flex items-center gap-1.5 flex-wrap">
                           {nextProfile.verified && (
                             <span 
                               className="w-4 h-4 rounded-full bg-[#0084ff] text-white inline-flex items-center justify-center shrink-0 shadow-xs"
                               title="Profil vérifié par photo"
                             >
                               <Check className="w-2.5 h-2.5 stroke-[3]" />
                             </span>
                           )}
                           <span>{nextProfile.name}, {nextProfile.age}</span>
                           {(nextProfile.online ?? true) && (
                             <span 
                               className="w-2.5 h-2.5 rounded-full bg-[#30d158] inline-block shrink-0 shadow-xs" 
                               title="En ligne" 
                             />
                           )}
                         </h2>
                         <div className="flex flex-col space-y-1.5">
                           <div className="bg-white/95 backdrop-blur-xs text-black text-[11px] font-bold px-3 py-1 rounded-full flex items-center w-max gap-1.5 shadow-sm tracking-tight">
                             <Heart className="w-3 h-3 text-black fill-black" strokeWidth={0} />
                             <span>{nextProfile.relation || 'Une histoire sérieuse'}</span>
                           </div>
                           <div className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center w-max gap-1.5 border border-white/15 shadow-sm tracking-tight">
                             <MapPin className="w-3 h-3 text-white fill-white shrink-0" />
                             <span>{getProfileDistanceInfo(nextProfile, userCoords).text}</span>
                           </div>
                         </div>
                       </div>
                       <div className="text-white p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center">
                         <MoreHorizontal className="w-5 h-5 text-white filter drop-shadow-md" strokeWidth={2.8} />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {currentProfile && (
                <SwipeProfileCard
                  key={currentProfile.id}
                  ref={cardRef}
                  profile={currentProfile}
                  parentX={x}
                  onSwipeLeft={() => handleNext(true)}
                  onSwipeRight={() => {
                    handleLikeDirect();
                  }}
                  onOpenActionMenu={() => setShowActionMenu(true)}
                  userCoords={userCoords}
                />
              )}
            </AnimatePresence>

            {/* Floating Action Buttons */}
            {currentProfile && (
              <SwipeActions
                onPass={() => handlePassClick()}
                onCoupDeCoeur={() => {
                  if (!isPageTurning) setShowCoupDeCoeurModal(true);
                }}
                onLike={() => handleLikeClick()}
                isPageTurning={isPageTurning}
              />
            )}
          </div>
        )}
      </div>
    </div>
    </SwipeThemeProvider>
  );
}

