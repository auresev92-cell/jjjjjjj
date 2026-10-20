import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Heart, MessageCircle, Search, X, Sparkles,
  Check, Trash2, Eye, EyeOff, RefreshCw, Lock, Sparkle, ArrowRight,
  Zap, Clock, Flame
} from 'lucide-react';
import { saveLikeToSupabase } from '../../../lib/supabase';
import { ProfileModal } from '../Modals';
import { OneDayPremiumModal } from '../../modals/OneDayPremiumModal';
import BavelPremiumModal from '../../modals/BavelPremiumModal';
import { WantMoreLikesModal, ExtraShowsMenu, RechargeCreditsMenu } from '../Monetization';
import { aiMonetizationEngine } from '../../../services/aiMonetizationEngine';
import { aiSystemEngine } from '../../../services/aiSystemEngine';
import { monetizationService } from '../../../services/monetizationService';
import { FEATURES_PER_TIER, getTierPrivileges } from '../../../config/featuresConfig';
import { pushNotificationService } from '../../../services/push/pushNotificationService';
import { CountdownBanner } from '../../../features/premium/components/CountdownBanner';
import { useUX } from '../../../context/UXContext';

interface LikesTabProps {
  onNavigateToTab?: (tab: string) => void;
  likedProfiles?: any[];
  discussions?: any[];
  userPhotos?: string[];
  unreadLikesCount?: number;
  receivedLikesTotal?: number;
  dbProfiles?: any[];
  receivedLikes?: string[];
  userProfile?: any;
  showToast?: (msg: string) => void;
  loadSupabaseData?: () => void;
  onLikeProfile?: (id: string | number) => Promise<boolean | undefined>;
  onRemoveLike?: (id: string | number) => Promise<void>;
  onDismissReceivedLike?: (id: string | number) => Promise<void>;
  onOpenChat?: (profile: any) => void;
  isPremium?: boolean;
  onActivatePremium?: () => void;
}

export function LikesTab({ 
  onNavigateToTab,
  likedProfiles = [],
  discussions = [],
  userPhotos = [],
  unreadLikesCount = 0,
  receivedLikesTotal = 0,
  dbProfiles = [],
  receivedLikes = [],
  userProfile,
  showToast,
  loadSupabaseData,
  onLikeProfile,
  onRemoveLike,
  onDismissReceivedLike,
  onOpenChat,
  isPremium = false,
  onActivatePremium
}: LikesTabProps) {
  const [showWantMoreLikes, setShowWantMoreLikes] = useState(false);
  const [showExtraShows, setShowExtraShows] = useState(false);
  const [showRechargeCredits, setShowRechargeCredits] = useState(false);
  const [showOneDayPremium, setShowOneDayPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Sub-tabs: 'all' = Tous les Likes, 'new' = Nouveaux Likes
  const [likesSubTab, setLikesSubTab] = useState<'all' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile modal inspection state
  const [inspectingProfile, setInspectingProfile] = useState<any | null>(null);

  // Match celebration modal state
  const [matchedProfile, setMatchedProfile] = useState<any | null>(null);

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  const { registerSubmenu, unregisterSubmenu } = useUX();

  const isAnySubmenuOpen = Boolean(
    showWantMoreLikes ||
    showExtraShows ||
    showRechargeCredits ||
    showOneDayPremium ||
    showPremiumModal ||
    inspectingProfile ||
    matchedProfile
  );

  useEffect(() => {
    if (isAnySubmenuOpen) {
      registerSubmenu('likes_tab_submenus');
    } else {
      unregisterSubmenu('likes_tab_submenus');
    }
    return () => {
      unregisterSubmenu('likes_tab_submenus');
    };
  }, [isAnySubmenuOpen, registerSubmenu, unregisterSubmenu]);

  const userTier = (userProfile?.tier || (isPremium ? 'premium' : monetizationService.getUserStatus())).toLowerCase();
  const privileges = getTierPrivileges(userTier);
  const canUnlockLikes = Boolean(isPremium || privileges.canSeeWhoLikedMe || monetizationService.hasPermission('canSeeWhoLikedYou'));
  const [showUnblurredPreview, setShowUnblurredPreview] = useState(canUnlockLikes);

  useEffect(() => {
    setShowUnblurredPreview(canUnlockLikes);
  }, [canUnlockLikes]);

  // AI Personalized Dynamic Offer state
  const [aiOffer, setAiOffer] = useState<{
    title: string;
    subtitle: string;
    price: string;
    actionText: string;
    badge?: string;
    reason?: string;
  }>({
    title: "Premium pendant 1 jour",
    subtitle: "Découvrez toutes les personnes à qui vous plaisez et profitez de swipes illimités ainsi que d'autres avantages Premium.",
    price: "5,99 €",
    actionText: "Profitez-en pour 5,99 €",
    badge: "OFFRE FLASH"
  });

  useEffect(() => {
    const likesCount = receivedLikes.length || 6;
    const rec = aiMonetizationEngine.getSecretLikeRecommendation(likesCount);
    const dynamicPrices = aiMonetizationEngine.getDynamicPrices();
    
    setAiOffer({
      title: rec.title,
      subtitle: rec.subtitle,
      price: `${dynamicPrices.extraEUR} €`,
      actionText: `Activer le Pass Premium • ${dynamicPrices.extraCFA.toLocaleString()} FCFA (${dynamicPrices.extraEUR} €)`,
      badge: "ALERTE COMPATIBILITÉ",
      reason: `Score de compatibilité de ${rec.compatibilityScore}%`
    });
  }, [receivedLikes.length, isPremium]);

  const allProfiles = useMemo(() => {
    return dbProfiles || [];
  }, [dbProfiles]);

  const matchedProfileIds = useMemo(() => {
    return new Set(
      discussions.map(d => String(d.id || d.user_id))
    );
  }, [discussions]);

  const receivedLikesProfiles = useMemo(() => {
    const uniqueIds = Array.from(new Set(receivedLikes.map(id => String(id))));
    let list = uniqueIds
      .map(id => allProfiles.find(p => String(p.user_id) === id || String(p.id) === id))
      .filter(Boolean)
      .map(p => ({
        id: p.id || p.user_id,
        name: p.name || 'Admirateur',
        age: p.age || 24,
        location: p.city || p.location || 'Abidjan',
        img: p.avatarUrl || p.img || (p.photos && p.photos[0]) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
        relation: p.relation,
        profile: p,
        isMatched: matchedProfileIds.has(String(p.id || p.user_id)),
        isNew: true
      }));

    if (list.length === 0) {
      list = allProfiles.slice(0, 6).map((p, idx) => ({
        id: p.id || `sample_${idx}`,
        name: p.name || 'Admirateur',
        age: p.age || 24,
        location: p.city || p.location || 'Abidjan',
        img: p.avatarUrl || p.img || (p.photos && p.photos[0]) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
        relation: p.relation,
        profile: p,
        isMatched: false,
        isNew: idx < 3
      }));
    }

    if (likesSubTab === 'new') {
      list = list.filter((p, idx) => p.isNew || idx % 2 === 0);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.location?.toLowerCase().includes(q)
    );
  }, [receivedLikes, allProfiles, matchedProfileIds, searchQuery, likesSubTab]);

  const handleLikeBack = async (profile: any) => {
    if (!profile) return;
    const targetId = profile.id || profile.user_id;
    setActionLoadingId(targetId);

    setMatchedProfile(profile);

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([40, 30, 80]); } catch {}
    }

    try {
      if (typeof window !== 'undefined') {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {}

    if (showToast) {
      showToast(`🎉 C'est un Match avec ${profile.name} !`);
    }

    try {
      const currentUserId = userProfile?.id || 'current_user_id';
      if (onLikeProfile) {
        await onLikeProfile(targetId);
      } else {
        await saveLikeToSupabase(currentUserId, String(targetId));
      }

      if (onDismissReceivedLike) {
        await onDismissReceivedLike(targetId);
      }

      if (loadSupabaseData) await loadSupabaseData();
    } catch (err) {
      console.warn("Failed to persist match in background:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDismiss = async (profile: any) => {
    if (!profile) return;
    const senderId = profile.id || profile.user_id;
    setActionLoadingId(senderId);

    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(30); } catch {}
      }

      if (onDismissReceivedLike) {
        await onDismissReceivedLike(senderId);
      }
      if (showToast) {
        showToast(`Demande de ${profile.name || 'profil'} refusée`);
      }
      if (loadSupabaseData) await loadSupabaseData();
    } catch (err) {
      console.warn("Failed to dismiss like:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-[#160829] via-[#0d041a] to-[#080211] text-white flex flex-col pb-32 relative select-none antialiased">
      {/* Ambient glowing backgrounds */}
      <div aria-hidden="true" className="absolute -top-32 -left-32 w-80 h-80 bg-[#7928ca]/20 rounded-full blur-[90px] pointer-events-none"></div>
      <div aria-hidden="true" className="absolute top-1/3 -right-28 w-72 h-72 bg-[#ff007a]/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 1-Day Premium Unlock Modal */}
      {showOneDayPremium && (
        <OneDayPremiumModal 
          onClose={() => setShowOneDayPremium(false)}
          onSuccess={() => {
            setShowOneDayPremium(false);
            if (onActivatePremium) onActivatePremium();
            setShowUnblurredPreview(true);
            if (showToast) showToast('🎉 Pass Premium 1 Jour activé avec succès !');
          }}
        />
      )}

      {/* Bavel Premium Modal */}
      {showPremiumModal && (
        <BavelPremiumModal 
          initialSlideId="likes"
          likesCount={receivedLikesProfiles.length || 1}
          onClose={() => setShowPremiumModal(false)}
          onSubscribe={() => {
            setShowPremiumModal(false);
            if (onActivatePremium) onActivatePremium();
            setShowUnblurredPreview(true);
            if (showToast) showToast('🎉 Bavel Premium activé avec succès !');
          }}
        />
      )}

      {/* Monetization & Feature Modals */}
      {showWantMoreLikes && (
        <WantMoreLikesModal 
          onClose={() => setShowWantMoreLikes(false)} 
          onOpenRecharge={() => {
            setShowWantMoreLikes(false);
            setShowRechargeCredits(true);
          }} 
          userPhotos={userPhotos}
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

      {/* Inspect Profile Modal */}
      {inspectingProfile && (
        <ProfileModal
          profile={inspectingProfile}
          onClose={() => setInspectingProfile(null)}
          isLiked={likedProfiles.some(id => String(id) === String(inspectingProfile.id || inspectingProfile.user_id))}
          onLike={() => {
            handleLikeBack(inspectingProfile);
            setInspectingProfile(null);
          }}
          onMessage={() => {
            if (onOpenChat) onOpenChat(inspectingProfile);
            setInspectingProfile(null);
            onNavigateToTab?.('discussions');
          }}
        />
      )}

      {/* Match Celebration Dialog */}
      <AnimatePresence>
        {matchedProfile && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.82, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.82, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-gradient-to-b from-[#25103d] via-[#160829] to-black text-white rounded-[32px] max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden border border-white/15"
            >
              <motion.div 
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#ff3366] via-rose-500 to-amber-500 text-white px-5 py-2 rounded-full font-black text-[15px] mb-5 shadow-lg tracking-wider uppercase border border-white/20"
              >
                <span>🔥 C'EST UN MATCH !</span>
              </motion.div>

              <h2 className="text-[20px] font-black text-white tracking-tight mb-1">
                Coup de foudre partagé !
              </h2>
              <p className="text-[#a39cb5] text-[13px] font-medium leading-snug mb-6 max-w-[270px] mx-auto">
                Vous et <span className="font-bold text-white underline decoration-[#ff3366] underline-offset-4">{matchedProfile.name}</span> vous vous plaisez mutuellement.
              </p>

              <div className="flex items-center justify-center -space-x-4 mb-7 relative">
                <motion.div 
                  initial={{ x: -30, rotate: -8, opacity: 0 }}
                  animate={{ x: 0, rotate: -4, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="w-22 h-22 rounded-full overflow-hidden border-3 border-white shadow-xl bg-gray-800 relative"
                >
                  <img 
                    src={userPhotos[0] || (userProfile?.avatarUrl) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"} 
                    alt="Vous" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div 
                  initial={{ x: 30, rotate: 8, opacity: 0 }}
                  animate={{ x: 0, rotate: 4, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  className="w-22 h-22 rounded-full overflow-hidden border-3 border-[#ff3366] shadow-xl bg-gray-800 relative z-10"
                >
                  <img 
                    src={matchedProfile.img || matchedProfile.avatarUrl || (matchedProfile.photos && matchedProfile.photos[0]) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"} 
                    alt={matchedProfile.name} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-gradient-to-tr from-[#ff3366] to-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col space-y-2.5">
                <button
                  onClick={() => {
                    const target = matchedProfile;
                    setMatchedProfile(null);
                    if (onOpenChat) onOpenChat(target);
                    onNavigateToTab?.('discussions');
                  }}
                  className="w-full bg-gradient-to-r from-[#ff3366] to-rose-600 hover:opacity-95 text-white font-black py-3.5 rounded-full text-[14.5px] shadow-glow-pink flex items-center justify-center space-x-2 active:scale-95 transition-transform cursor-pointer border border-white/20"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Envoyer un message</span>
                </button>
                <button
                  onClick={() => setMatchedProfile(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full text-[13.5px] backdrop-blur-md border border-white/10 transition-colors cursor-pointer active:scale-95"
                >
                  Continuer sur les Likes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header section with mobile-optimized typography */}
      <section className="px-5 pt-3 pb-2 space-y-1" data-purpose="header-section">
        <h1 className="text-[20px] sm:text-[22px] leading-tight font-extrabold tracking-tight text-white drop-shadow-sm">
          Voici vos Likes
        </h1>
        <p className="text-[12px] sm:text-[13px] leading-snug text-[#a39cb5] font-medium pr-1">
          Plus vite vous renvoyez un Like, plus grandes sont vos chances de discuter et de vous rencontrer !
        </p>
      </section>

      {/* Main Action Banner Button */}
      <div className="px-5 mb-4">
        <button
          type="button"
          onClick={() => setShowPremiumModal(true)}
          className="w-full bg-gradient-to-r from-[#ff3366] via-rose-500 to-[#9d4edd] hover:opacity-95 active:scale-[0.98] text-white font-extrabold py-2.5 sm:py-3 rounded-full text-[13.5px] sm:text-[14.5px] transition-all cursor-pointer shadow-glow-pink flex items-center justify-center space-x-2 border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Voir mes Likes ({receivedLikesProfiles.length})</span>
        </button>
      </div>

      {/* Sub-Tabs: Tous les Likes | Nouveaux Likes */}
      <div className="flex border-b border-white/10 px-5 mb-4 space-x-8">
        <button
          onClick={() => setLikesSubTab('all')}
          className={`pb-2.5 text-[13.5px] sm:text-[14.5px] font-bold relative cursor-pointer flex items-center space-x-1.5 transition-colors ${
            likesSubTab === 'all' ? 'text-white' : 'text-[#a39cb5] hover:text-white'
          }`}
        >
          <span>Tous les Likes</span>
          {!isPremium && <Lock className="w-3.5 h-3.5 text-[#ff3366]" />}
          {likesSubTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ff3366] to-[#9d4edd] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setLikesSubTab('new');
            if (!isPremium && !showUnblurredPreview) {
              setShowPremiumModal(true);
            }
          }}
          className={`pb-2.5 text-[13.5px] sm:text-[14.5px] font-bold relative cursor-pointer flex items-center space-x-1.5 transition-colors ${
            likesSubTab === 'new' ? 'text-white' : 'text-[#a39cb5] hover:text-white'
          }`}
        >
          <span>Nouveaux Likes</span>
          {!isPremium && <Lock className="w-3.5 h-3.5 text-[#ff3366]" />}
          {likesSubTab === 'new' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ff3366] to-[#9d4edd] rounded-full" />
          )}
        </button>
      </div>


      {/* Profiles Grid */}
      <div className="px-4 pb-28">
        {receivedLikesProfiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {receivedLikesProfiles.slice(0, 1).map((p) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[22px] overflow-hidden border border-white/10 shadow-subtle-card bg-[#1e1033]/80 flex flex-col backdrop-blur-md relative group"
              >
                <div 
                  onClick={() => {
                    if (isPremium || showUnblurredPreview) {
                      setInspectingProfile(p.profile);
                      pushNotificationService.triggerProfileViewPush(p.profile.name || p.name, String(p.profile.id || p.id));
                    } else {
                      setShowPremiumModal(true);
                    }
                  }}
                  className="relative flex-1 w-full bg-[#160829] min-h-[145px] sm:min-h-[165px] cursor-pointer overflow-hidden"
                >
                  <img 
                    src={p.img} 
                    alt={p.name || 'Admirateur'} 
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !isPremium && !showUnblurredPreview ? 'blurred-avatar filter blur-xl scale-110' : ''
                    }`} 
                  />
                  
                  {/* Overlay gradient & info badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    {isPremium || showUnblurredPreview ? (
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[14px] sm:text-[15px] font-bold text-white tracking-tight drop-shadow">{p.name}</span>
                          <span className="text-[13px] font-semibold text-rose-300">{p.age}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11.5px] text-[#a39cb5]">
                          <MapPin className="w-3 h-3 text-[#ff3366]" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center pb-2">
                        <span className="inline-flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/15 shadow">
                          <Lock className="w-3 h-3 text-[#ff3366]" />
                          <span>Inconnu</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex h-10 bg-[#140624] divide-x divide-white/10 shrink-0 border-t border-white/10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(p.profile);
                    }}
                    className="flex-1 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-[#a39cb5] transition-colors cursor-pointer"
                    title="Ignorer"
                  >
                    <X className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPremium && !showUnblurredPreview) {
                        setShowPremiumModal(true);
                      } else {
                        handleLikeBack(p.profile);
                      }
                    }}
                    className="flex-1 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-[#ff3366] transition-colors cursor-pointer"
                    title="Liker en retour"
                  >
                    <Heart className="w-5 h-5 fill-current" strokeWidth={2.2} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Promo Card: Plus de visibilité */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowExtraShows(true)}
              className="rounded-[22px] border border-[#ff3366]/30 bg-gradient-to-b from-[#25103d] via-[#160829] to-[#0f041d] flex flex-col items-center justify-between p-3.5 shadow-subtle-card relative min-h-[145px] sm:min-h-[165px] cursor-pointer hover:border-[#ff3366]/60 transition-all backdrop-blur-md group"
            >
              <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                <span className="text-[11px] font-extrabold text-pink-300">Boost</span>
                <div className="w-[14px] h-[14px] bg-gradient-to-r from-[#ff3366] to-[#9d4edd] rounded-full flex items-center justify-center shadow">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
              </div>

              <div className="w-[42px] h-[42px] bg-gradient-to-tr from-[#ff3366]/20 to-[#9d4edd]/20 border border-white/15 rounded-full flex items-center justify-center mt-3 mb-2 shadow-inner group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-[#ff3366] fill-[#ff3366]" strokeWidth={1} />
              </div>

              <div className="text-center px-1">
                <h4 className="text-[13px] font-extrabold text-white mb-0.5">Visibilité Max</h4>
                <p className="text-[11px] text-[#a39cb5] leading-snug font-medium">
                  Obtenez 4x plus de Likes et touchez plus d'utilisateurs.
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExtraShows(true);
                }}
                className="w-full bg-gradient-to-r from-[#ff3366] to-rose-600 text-white font-bold py-2 rounded-full text-[12px] transition-all cursor-pointer active:scale-95 shadow-glow-pink border border-white/20 mt-2"
              >
                Activer
              </button>
            </motion.div>

            {/* Rest of received profiles */}
            {receivedLikesProfiles.slice(1).map((p) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[22px] overflow-hidden border border-white/10 shadow-subtle-card bg-[#1e1033]/80 flex flex-col backdrop-blur-md relative group"
              >
                <div 
                  onClick={() => {
                    if (isPremium || showUnblurredPreview) {
                      setInspectingProfile(p.profile);
                      pushNotificationService.triggerProfileViewPush(p.profile.name || p.name, String(p.profile.id || p.id));
                    } else {
                      setShowPremiumModal(true);
                    }
                  }}
                  className="relative flex-1 w-full bg-[#160829] min-h-[145px] sm:min-h-[165px] cursor-pointer overflow-hidden"
                >
                  <img 
                    src={p.img} 
                    alt={p.name || 'Admirateur'} 
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !isPremium && !showUnblurredPreview ? 'blurred-avatar filter blur-xl scale-110' : ''
                    }`} 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    {isPremium || showUnblurredPreview ? (
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[14px] sm:text-[15px] font-bold text-white tracking-tight drop-shadow">{p.name}</span>
                          <span className="text-[13px] font-semibold text-rose-300">{p.age}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11.5px] text-[#a39cb5]">
                          <MapPin className="w-3 h-3 text-[#ff3366]" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center pb-2">
                        <span className="inline-flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/15 shadow">
                          <Lock className="w-3 h-3 text-[#ff3366]" />
                          <span>Inconnu</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex h-10 bg-[#140624] divide-x divide-white/10 shrink-0 border-t border-white/10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(p.profile);
                    }}
                    className="flex-1 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-[#a39cb5] transition-colors cursor-pointer"
                    title="Ignorer"
                  >
                    <X className="w-5 h-5" strokeWidth={2.2} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPremium && !showUnblurredPreview) {
                        setShowPremiumModal(true);
                      } else {
                        handleLikeBack(p.profile);
                      }
                    }}
                    className="flex-1 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-[#ff3366] transition-colors cursor-pointer"
                    title="Liker en retour"
                  >
                    <Heart className="w-5 h-5 fill-current" strokeWidth={2.2} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-[#1e1033]/60 rounded-[28px] p-6 border border-white/10 mt-6 shadow-xl backdrop-blur-md">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff3366]/20 to-[#9d4edd]/20 border border-white/15 flex items-center justify-center mb-3.5 shadow-md">
              <Heart className="w-6 h-6 text-[#ff3366] fill-[#ff3366]/30" strokeWidth={1.8} />
            </div>
            <h4 className="text-[16px] font-extrabold text-white mb-1">Aucun like reçu pour le moment</h4>
            <p className="text-[12.5px] text-[#a39cb5] mb-5 max-w-[240px] mx-auto leading-relaxed">
              Ajoutez de nouvelles photos ou explorez les profils dans l'onglet Rencontres pour déclencher des coups de cœur !
            </p>
            <button 
              onClick={() => onNavigateToTab?.('encounters')}
              className="bg-gradient-to-r from-[#ff3366] to-rose-600 text-white text-[13px] font-extrabold px-6 py-2.5 rounded-full shadow-glow-pink active:scale-95 transition-transform cursor-pointer border border-white/20"
            >
              Explorer les profils
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
