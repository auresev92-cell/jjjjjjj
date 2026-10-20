import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Volume2, VolumeX, ShieldAlert, Award, 
  Sparkles, Trophy, Loader2, CheckCircle2, Tv, AlertTriangle,
  Heart, Coins, Check, ArrowRight
} from 'lucide-react';
import { playSynthAudio, triggerHaptic } from '../../utils/audio';

// Real high-definition fallback video campaigns with verified working URLs
const BACKUP_AD_CAMPAIGNS = [
  {
    id: 'ad_bavel_orange',
    title: 'Orange Money Côte d\'Ivoire',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    duration: 10,
    tagline: 'Rechargez votre compte Bavel en toute simplicité.'
  },
  {
    id: 'ad_skincare',
    title: 'Nivea Pure & Natural',
    url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    duration: 15,
    tagline: 'Prenez soin de vous au quotidien.'
  },
  {
    id: 'ad_popcorn',
    title: 'Majestic Cinema Abidjan',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    duration: 12,
    tagline: 'Vivez vos plus beaux rendez-vous au grand écran.'
  },
  {
    id: 'ad_juice',
    title: 'Sunkist Fresh Tropical',
    url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    duration: 12,
    tagline: 'Le plein de fraîcheur et d\'énergie.'
  }
];

export type AdRewardType = 'credits' | 'coup_de_coeur' | 'free_like' | 'coup_de_coeur_credit';

export interface RewardedAdPlayerProps {
  rewardType?: AdRewardType;
  rewardAmount?: number;
  targetProfileName?: string;
  targetProfileImg?: string;
  onClose: () => void;
  onRewardEarned: (amount: number, rewardType: AdRewardType) => void;
  onError?: () => void;
}

/**
 * iOS-style Native Alert for Unexpected Ad / Server Errors
 * Exactly matches the design in screenshot IMG_4307.PNG
 */
export function UnexpectedErrorModal({
  isOpen,
  onContinue,
  onCancel,
}: {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[280] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div 
        className="bg-[#f2f2f2]/95 backdrop-blur-xl rounded-[14px] w-full max-w-[270px] overflow-hidden shadow-2xl flex flex-col text-center border border-gray-300/30 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Title and Message */}
        <div className="pt-5 px-4 pb-4">
          <h3 className="text-[17px] font-bold text-black tracking-tight mb-1 text-center">
            Erreur inattendue
          </h3>
          <p className="text-[13px] text-black font-normal leading-snug text-center">
            Le serveur prend plus de temps que prévu pour répondre, il y a peut-être un problème.
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-[#3c3c43]/20 w-full" />

        {/* Action 1: Continuer (Retries video) */}
        <button
          onClick={onContinue}
          className="w-full py-3 text-[17px] text-[#007AFF] font-normal active:bg-gray-200/50 transition-colors text-center cursor-pointer select-none"
        >
          Continuer
        </button>

        {/* Separator */}
        <div className="border-t border-[#3c3c43]/20 w-full" />

        {/* Action 2: Annuler l'achat */}
        <button
          onClick={onCancel}
          className="w-full py-3 text-[17px] text-[#007AFF] font-normal active:bg-gray-200/50 transition-colors text-center cursor-pointer select-none"
        >
          Annuler l'achat
        </button>
      </div>
    </div>
  );
}

export function RewardedAdPlayer({ 
  rewardType = 'credits',
  rewardAmount = 15,
  targetProfileName,
  targetProfileImg,
  onClose, 
  onRewardEarned,
  onError
}: RewardedAdPlayerProps) {
  // Campaign fallback selection
  const [campaignIndex, setCampaignIndex] = useState(0);
  const [isCanvasFallback, setIsCanvasFallback] = useState(false);
  const campaign = BACKUP_AD_CAMPAIGNS[campaignIndex % BACKUP_AD_CAMPAIGNS.length];

  const adContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adsManagerRef = useRef<any>(null);
  const adsLoaderRef = useRef<any>(null);
  const adDisplayContainerRef = useRef<any>(null);

  const [isImaActive, setIsImaActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(campaign.duration);
  const [isFocused, setIsFocused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [adTitle, setAdTitle] = useState(campaign.title);
  const [adDescription, setAdDescription] = useState(campaign.tagline);
  const [adNotice, setAdNotice] = useState<string | null>(null);

  // Complete reward callback wrapper
  const handleRewardCompletion = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    triggerHaptic();
    playSynthAudio('credit_purchase');

    // Notify caller with granted reward
    onRewardEarned(rewardAmount, rewardType);
  }, [isCompleted, onRewardEarned, rewardAmount, rewardType]);

  // Handle video error gracefully by trying next campaign or activating animated ad canvas
  const handleMediaError = useCallback(() => {
    console.warn('[Video Player] Video stream failed, recovering gracefully...');
    if (campaignIndex + 1 < BACKUP_AD_CAMPAIGNS.length) {
      setCampaignIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setIsCanvasFallback(true);
      setIsLoading(false);
      setIsPlaying(true);
    }
  }, [campaignIndex]);

  // Anti-cheat: Pause when tab is blurred or hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsFocused(false);
        if (adsManagerRef.current) {
          try { adsManagerRef.current.pause(); } catch (e) {}
        }
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        setIsFocused(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (adsManagerRef.current) {
        try { adsManagerRef.current.pause(); } catch (e) {}
      }
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Initialize Google IMA SDK HTML5 if available
  useEffect(() => {
    let isMounted = true;
    const windowWithIma = window as any;

    if (windowWithIma.google && windowWithIma.google.ima && videoRef.current && adContainerRef.current) {
      try {
        const ima = windowWithIma.google.ima;
        const adDisplayContainer = new ima.AdDisplayContainer(adContainerRef.current, videoRef.current);
        adDisplayContainerRef.current = adDisplayContainer;
        adDisplayContainer.initialize();

        const adsLoader = new ima.AdsLoader(adDisplayContainer);
        adsLoaderRef.current = adsLoader;

        adsLoader.addEventListener(
          ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (adsManagerLoadedEvent: any) => {
            if (!isMounted) return;
            const adsRenderingSettings = new ima.AdsRenderingSettings();
            adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

            const adsManager = adsManagerLoadedEvent.getAdsManager(videoRef.current, adsRenderingSettings);
            adsManagerRef.current = adsManager;

            adsManager.addEventListener(ima.AdEvent.Type.STARTED, (adEvent: any) => {
              if (!isMounted) return;
              setIsImaActive(true);
              setIsLoading(false);
              setIsPlaying(true);
              const currentAd = adEvent.getAd();
              if (currentAd) {
                setAdTitle(currentAd.getTitle() || 'Google AdMob Sponsor');
                setAdDescription(currentAd.getDescription() || 'Partenaire certifié Bavel');
                const dur = Math.round(currentAd.getDuration() || 15);
                if (dur > 0) setTimeLeft(dur);
              }
            });

            adsManager.addEventListener(ima.AdEvent.Type.AD_PROGRESS, (adEvent: any) => {
              if (!isMounted) return;
              const adData = adEvent.getAdData();
              if (adData && adData.duration > 0) {
                const pct = Math.min(100, (adData.currentTime / adData.duration) * 100);
                setProgress(pct);
                setTimeLeft(Math.max(0, Math.ceil(adData.duration - adData.currentTime)));
              }
            });

            adsManager.addEventListener(ima.AdEvent.Type.COMPLETE, () => {
              if (!isMounted) return;
              handleRewardCompletion();
            });

            adsManager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
              if (!isMounted) return;
              handleRewardCompletion();
            });

            adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, (adErrorEvent: any) => {
              const errorMsg = adErrorEvent.getError()?.getMessage() || 'Indisponibilité réseau publicitaire';
              console.warn('[AdMob IMA] Ad error, falling back to direct video stream:', errorMsg);
              if (isMounted) {
                setIsImaActive(false);
                setIsLoading(false);
                setAdNotice('Fluide : passage au flux sponsor Bavel.');
                setTimeout(() => setAdNotice(null), 4000);
              }
            });

            try {
              const width = adContainerRef.current?.clientWidth || 360;
              const height = adContainerRef.current?.clientHeight || 240;
              adsManager.init(width, height, ima.ViewMode.NORMAL);
              adsManager.start();
            } catch (adErr) {
              console.warn('[AdMob IMA] Start failed:', adErr);
              if (isMounted) {
                setIsImaActive(false);
                setIsLoading(false);
                setAdNotice('Fluide : passage au flux sponsor Bavel.');
                setTimeout(() => setAdNotice(null), 4000);
              }
            }
          },
          false
        );

        adsLoader.addEventListener(
          ima.AdErrorEvent.Type.AD_ERROR,
          (adErrorEvent: any) => {
            const errorMsg = adErrorEvent.getError()?.getMessage() || 'Publicité indisponible';
            console.warn('[AdMob IMA] Loader error:', errorMsg);
            if (isMounted) {
              setIsImaActive(false);
              setIsLoading(false);
              setAdNotice('Fluide : passage au flux sponsor Bavel.');
              setTimeout(() => setAdNotice(null), 4000);
            }
          },
          false
        );

        // Request linear rewarded video ad
        const customVastUrl = (import.meta.env as any).VITE_ADMOB_VAST_TAG_URL;
        const defaultVastUrl = "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s";
        const baseAdTagUrl = customVastUrl || defaultVastUrl;

        const adsRequest = new ima.AdsRequest();
        adsRequest.adTagUrl = `${baseAdTagUrl}${baseAdTagUrl.includes('?') ? '&' : '?'}correlator=${Date.now()}`;
        adsRequest.linearAdSlotWidth = 360;
        adsRequest.linearAdSlotHeight = 240;
        adsRequest.nonLinearAdSlotWidth = 360;
        adsRequest.nonLinearAdSlotHeight = 240;

        adsLoader.requestAds(adsRequest);
      } catch (e) {
        console.warn('[AdMob IMA] Initialization failed, using native stream:', e);
        setIsImaActive(false);
        setIsLoading(false);
      }
    } else {
      // IMA not ready or blocked, use native stream immediately
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      if (adsManagerRef.current) {
        try { adsManagerRef.current.destroy(); } catch (e) {}
      }
      if (adsLoaderRef.current) {
        try { adsLoaderRef.current.destroy(); } catch (e) {}
      }
    };
  }, [handleRewardCompletion]);

  // Interactive Canvas Ad Timer Fallback if video streams fail
  useEffect(() => {
    if (!isCanvasFallback || isCompleted || !isFocused) return;
    const duration = campaign.duration || 10;
    setTimeLeft(duration);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (duration * 10));
        if (next >= 100) {
          clearInterval(interval);
          handleRewardCompletion();
          return 100;
        }
        return next;
      });
      setTimeLeft(prev => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [isCanvasFallback, isCompleted, isFocused, campaign.duration, handleRewardCompletion]);

  // Handle native fallback video loading
  const handleCanPlay = () => {
    if (isImaActive) return;
    setIsLoading(false);
    if (videoRef.current && isFocused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (isImaActive || !videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || campaign.duration;
    const pct = Math.min(100, (current / duration) * 100);
    setProgress(pct);
    setTimeLeft(Math.max(0, Math.ceil(duration - current)));

    // Prevent seeking cheat
    if (videoRef.current.seeking) {
      videoRef.current.currentTime = (pct / 100) * duration;
    }
  };

  const handleVideoEnded = () => {
    if (isImaActive) return;
    handleRewardCompletion();
  };

  const togglePlay = () => {
    if (isImaActive) {
      if (!adsManagerRef.current) return;
      if (isPlaying) {
        try { adsManagerRef.current.pause(); } catch (e) {}
        setIsPlaying(false);
      } else {
        try { adsManagerRef.current.resume(); } catch (e) {}
        setIsPlaying(true);
      }
      return;
    }

    if (!videoRef.current || isLoading || isCompleted) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const toggleMute = () => {
    if (isImaActive && adsManagerRef.current) {
      try {
        adsManagerRef.current.setVolume(isMuted ? 1 : 0);
        setIsMuted(!isMuted);
      } catch (e) {}
      return;
    }

    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    triggerHaptic();
  };

  // Get dynamic reward label for mobile header
  const getRewardBadgeLabel = () => {
    if (rewardType === 'coup_de_coeur' || rewardType === 'coup_de_coeur_credit') return 'Coup de Cœur Offert';
    if (rewardType === 'free_like') return 'Like Gratuit';
    return '+15 Crédits Gratuits';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/98 z-[300] flex flex-col justify-between select-none touch-none transform-gpu max-w-[480px] mx-auto"
    >
      {/* Top Header Bar - Ultra clean and minimalist */}
      <div className="pt-10 sm:pt-12 px-4 pb-3 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-end z-20 shrink-0">
        <button 
          onClick={onClose}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 rounded-full text-xs font-medium transition-all border border-white/10 cursor-pointer shrink-0"
          aria-label="Fermer la vidéo"
        >
          Fermer
        </button>
      </div>

      {adNotice && (
        <div className="mx-4 mb-2 p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center space-x-2 text-amber-200 text-xs font-semibold animate-fadeIn z-30">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{adNotice}</span>
        </div>
      )}

      {/* Main Video Arena */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-2">
        {!isCompleted && (
          <div 
            ref={adContainerRef}
            className="w-full aspect-[16/10] sm:aspect-video relative overflow-hidden bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex items-center justify-center"
          >
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-30 space-y-2 p-4 text-center">
                <Loader2 className="w-7 h-7 text-rose-500 animate-spin" />
                <p className="text-white/70 text-xs font-medium">
                  Chargement...
                </p>
              </div>
            )}

            {/* Native / IMA Video Player or Canvas Fallback */}
            {isCanvasFallback ? (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-zinc-900 to-black flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 animate-pulse">
                  <Tv className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-500/30">
                    Sponsor Partenaire Bavel
                  </span>
                  <h3 className="text-white text-lg font-black mt-2">
                    {campaign.title}
                  </h3>
                  <p className="text-amber-100/70 text-xs mt-1 max-w-[260px]">
                    {campaign.tagline}
                  </p>
                </div>
                <div className="w-full max-w-[220px] bg-zinc-800/80 rounded-full h-2 overflow-hidden border border-amber-500/20">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs font-semibold">
                  Récompense dans {Math.ceil(timeLeft)}s...
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={campaign.url}
                playsInline
                webkit-playsinline="true"
                controls={false}
                muted={isMuted}
                onCanPlay={handleCanPlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleMediaError}
                className="w-full h-full object-cover"
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
              />
            )}

            {/* Play Overlay */}
            {!isPlaying && !isLoading && isFocused && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-20"
              >
                <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-xl transform active:scale-90 transition-transform">
                  <Play className="w-8 h-8 fill-black ml-1" />
                </div>
              </div>
            )}

            {/* Anti-Cheat Overlay: Pauses immediately when user exits app/tab */}
            {!isFocused && !isLoading && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-40">
                <ShieldAlert className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
                <h3 className="text-white font-black text-base sm:text-lg tracking-tight mb-1">
                  Publicité en pause automatique
                </h3>
                <p className="text-amber-100/80 text-xs sm:text-sm max-w-[280px] leading-relaxed mb-4">
                  Restez sur Bavel pendant toute la durée de la vidéo pour valider votre récompense.
                </p>
                <button 
                  onClick={() => {
                    setIsFocused(true);
                    if (videoRef.current) {
                      videoRef.current.play().then(() => setIsPlaying(true));
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-400 active:bg-amber-300 text-black font-black text-xs sm:text-sm rounded-full shadow-lg active:scale-95 transition-all uppercase tracking-wider"
                >
                  Reprendre la vidéo
                </button>
              </div>
            )}

            {/* Audio Toggle button */}
            <button 
              onClick={toggleMute}
              className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-white hover:bg-black/90 cursor-pointer z-20 active:scale-90 transition-all border border-white/20"
              aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>
        )}

        {/* Completion Success View - Reward granted */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-zinc-950/98 z-50 rounded-2xl"
            >
              {/* Dynamic Icon based on reward */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                
                {rewardType === 'coup_de_coeur' ? (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(244,63,94,0.4)] border border-rose-300">
                    <Heart className="w-10 h-10 fill-white animate-bounce" />
                  </div>
                ) : rewardType === 'free_like' ? (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(16,185,129,0.4)] border border-emerald-300">
                    <Sparkles className="w-10 h-10 animate-bounce" />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(245,158,11,0.4)] border border-amber-200">
                    <Trophy className="w-10 h-10 animate-bounce text-black" />
                  </div>
                )}
              </div>

              <h2 className="text-white text-[22px] sm:text-[26px] font-black tracking-tight mb-2">
                Félicitations ! 🎉
              </h2>

              {rewardType === 'coup_de_coeur' ? (
                <>
                  <p className="text-rose-400 font-black text-[16px] sm:text-[18px] tracking-wide mb-2">
                    COUP DE CŒUR ENVOYÉ ! ❤️
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm max-w-[280px] leading-relaxed mb-6 font-medium">
                    Votre Coup de Cœur gratuit a été validé et transmis à <span className="font-black text-white">{targetProfileName || 'ce profil'}</span> !
                  </p>
                </>
              ) : rewardType === 'coup_de_coeur_credit' ? (
                <>
                  <p className="text-rose-400 font-black text-[16px] sm:text-[18px] tracking-wide mb-2">
                    +1 COUP DE CŒUR OBTENU ! ❤️
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm max-w-[280px] leading-relaxed mb-6 font-medium">
                    Un crédit Coup de Cœur a été ajouté à votre profil.
                  </p>
                </>
              ) : rewardType === 'free_like' ? (
                <>
                  <p className="text-emerald-400 font-black text-[16px] sm:text-[18px] tracking-wide mb-2">
                    +1 LIKE GRATUIT OBTENU ! ✨
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm max-w-[280px] leading-relaxed mb-6 font-medium">
                    Vous pouvez maintenant liker <span className="font-black text-white">{targetProfileName || 'ce profil'}</span> et continuer vos rencontres.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-amber-400 font-black text-[16px] sm:text-[18px] tracking-wide mb-2">
                    +{rewardAmount} CRÉDITS OFFERTS ! 🪙
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm max-w-[280px] leading-relaxed mb-6 font-medium">
                    Vos crédits ont été enregistrés avec succès sur votre compte Bavel.
                  </p>
                </>
              )}

              <button 
                onClick={onClose}
                className="w-full max-w-xs py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-black rounded-full shadow-xl active:scale-98 transition-all text-sm uppercase tracking-wider cursor-pointer"
              >
                Continuer sur Bavel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Spacer / Clean Footer */}
      <div className="px-4 pb-6 sm:pb-8 bg-gradient-to-t from-black/90 to-transparent pt-3 flex flex-col items-center text-center shrink-0 min-h-[30px]" />
    </motion.div>
  );
}
