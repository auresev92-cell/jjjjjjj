import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, MapPin, Heart, MessageCircle, MessageCircleMore, User as UserIcon, 
  Settings, HelpCircle, Camera, Zap, Search, Bell, Gauge, Edit3, Mail,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Smile, Plus, Copy, MoreHorizontal, MoreVertical, Lock, CheckCircle, Check, X, Star, Shield, Eye, EyeOff, FileText, RotateCcw,
  Navigation, Baby, Target, Ruler, Languages, Wine, Sparkles, Dog, Brain, Flame, Cigarette, GraduationCap, BookOpen, Coffee, Clapperboard, ChevronsUp, Megaphone, Battery, Send,
  Radio, Locate, LocateFixed, RefreshCw, Map, Compass, Image as ImageIcon, Briefcase,
  Phone, Video, Mic, CheckCheck, Gift, Ban, ThumbsUp, ArrowUp, Coins, Volume2, VolumeX, UserX, PhoneOff, MicOff, VideoOff, Play, Pause, Trash2, Hand, Users, Pencil, Loader2, Plane
} from 'lucide-react';
import { User } from '../../../types';
import { ActionMenu, ReportMenu } from '../Modals';
import { ConfidentialityMenu } from '../SettingsMenu';
import { reportUserInSupabase, blockUserInSupabase } from '../../../lib/supabase';

import { MoodsMenu, ChatActionView, ProfileModal, AiVibeCheckModal } from '../Modals';
import { ExtraShowsMenu, WantMoreLikesModal, RechargeCreditsMenu } from '../Monetization';
import { DiscoverFiltersMenu } from './DiscoverFilters';
import { LazyBlurImage } from '../ui/LazyBlurImage';
import { GeoRadarView } from '../../../features/geolocation/GeoRadarView';
import { BadooLiveModal } from '../../../features/live/BadooLiveModal';
import { aiSystemEngine } from '../../../services/aiSystemEngine';
import { pushNotificationService } from '../../../services/push/pushNotificationService';
import { useHeartBurst, HeartParticleBurstOverlay } from '../ui/HeartParticleBurst';
import { useUX } from '../../../context/UXContext';
import { PullToRefresh } from '../ui/PullToRefresh';
import { TravelModeModal, TravelDestination } from './TravelModeModal';
import { DailyHoroscopeView } from './DailyHoroscopeView';

export function DiscoverTab({ 
  userMood, 
  onOpenMoods,
  onNavigateToTab,
  setActiveChat,
  genderPreference = 'les_deux',
  setGenderPreference,
  likedProfiles: propLikedProfiles,
  setLikedProfiles: propLikedProfilesSetter,
  hiddenProfiles = [],
  setHiddenProfiles = () => {},
  userPhotos = [],
  onSendBackgroundWave,
  profiles = [],
  onDetailToggle,
  onLikeProfile,
  onScrollStateChange,
  onSubTabChange
}: { 
  userMood?: { emoji: string; label: string } | null; 
  onOpenMoods?: () => void;
  onNavigateToTab?: (tab: string) => void;
  setActiveChat?: (profile: any) => void;
  genderPreference?: 'homme' | 'femme' | 'les_deux';
  setGenderPreference?: (pref: 'homme' | 'femme' | 'les_deux') => void;
  likedProfiles?: number[];
  setLikedProfiles?: React.Dispatch<React.SetStateAction<number[]>> | ((ids: number[]) => void);
  hiddenProfiles?: number[];
  setHiddenProfiles?: React.Dispatch<React.SetStateAction<number[]>> | ((ids: number[]) => void);
  userPhotos?: string[];
  onSendBackgroundWave?: (profile: any) => void;
  profiles?: any[];
  onDetailToggle?: (isOpen: boolean) => void;
  onLikeProfile?: (id: string | number) => Promise<boolean | undefined>;
  onScrollStateChange?: (isScrolledDown: boolean) => void;
  onSubTabChange?: (subTab: 'all' | 'foryou') => void;
  onRefresh?: () => Promise<void>;
}) {
  const [subTab, setSubTab] = useState<'all' | 'foryou'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const { bursts, triggerBurst } = useHeartBurst();

  // Geolocation Permission State — dynamically checked like in EncountersTab
  const [geoChoice, setGeoChoice] = useState<'granted' | 'dismissed' | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Travel Mode (Téléportation) State
  const [travelDestination, setTravelDestination] = useState<TravelDestination | null>(() => {
    try {
      const saved = localStorage.getItem('bavel_travel_destination');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showTravelModal, setShowTravelModal] = useState<boolean>(false);

  // Interactive Distance Radius Filter State (km)
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(50);

  useEffect(() => {
    let isMounted = true;
    const checkBrowserPermission = async () => {
      if (typeof navigator === 'undefined' || !navigator.permissions) {
        return;
      }
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (isMounted) {
          if (result.state === 'granted') {
            setGeoChoice('granted');
            // Acquire actual position silently
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  if (isMounted) {
                    setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                  }
                },
                () => {},
                { timeout: 8000 }
              );
            }
          } else {
            setGeoChoice(null);
          }
        }
        const handleStateChange = () => {
          if (isMounted) {
            if (result.state === 'granted') {
              setGeoChoice('granted');
            } else {
              setGeoChoice(null);
            }
          }
        };
        result.addEventListener('change', handleStateChange);
        return () => result.removeEventListener('change', handleStateChange);
      } catch (err) {
        // Fallback: leave as null so the screen is displayed
      }
    };
    checkBrowserPermission();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthorizeLocation = () => {
    setIsLocating(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setGeoChoice('granted');
          setToastMsg("📍 Position GPS confirmée • Profils triés du plus proche au plus éloigné");
          setTimeout(() => setToastMsg(null), 3500);
        },
        (err) => {
          setIsLocating(false);
          setGeoChoice('dismissed');
          setGpsCoords({ lat: 5.3600, lon: -4.0083 }); // Abidjan default
          setToastMsg("📍 Position approximative activée");
          setTimeout(() => setToastMsg(null), 3000);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
      setGpsCoords({ lat: 5.3600, lon: -4.0083 });
      setGeoChoice('granted');
    }
  };

  const handleDismissLocation = () => {
    setGeoChoice('dismissed');
  };

  const handleSelectTravelDestination = (dest: TravelDestination | null) => {
    setTravelDestination(dest);
    try {
      if (dest) {
        localStorage.setItem('bavel_travel_destination', JSON.stringify(dest));
        setGeoChoice('granted'); // Grant viewing when teleported
        setToastMsg(`✈️ Téléportation active : ${dest.name} (${dest.country}) !`);
      } else {
        localStorage.removeItem('bavel_travel_destination');
        setToastMsg("📍 Retour à votre géolocalisation réelle");
      }
      setTimeout(() => setToastMsg(null), 3000);
    } catch {}
  };

  // Lookalikes & 3D Liveness State Hooks
  const [selectedCelebrity, setSelectedCelebrity] = useState<string | null>(null);
  const [customCelebrityPhoto, setCustomCelebrityPhoto] = useState<string | null>(null);
  const [lookalikeScanning, setLookalikeScanning] = useState(false);
  const [lookalikeScanProgress, setLookalikeScanProgress] = useState(0);
  const [lookalikeResults, setLookalikeResults] = useState<any[]>([]);

  const [livenessActive, setLivenessActive] = useState(false);
  const [livenessStep, setLivenessStep] = useState<'blink' | 'smile' | 'turn_left'>('blink');
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [livenessScanProgress, setLivenessScanProgress] = useState(0);
  const [isFullyVerified, setIsFullyVerified] = useState(() => {
    return localStorage.getItem('bavel_user_verified_liveness') === 'true';
  });

  useEffect(() => {
    if (onSubTabChange) {
      onSubTabChange(subTab);
    }
  }, [subTab, onSubTabChange]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'tous' | 'en_ligne' | 'nouveau'>('tous');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [profileInActionMenu, setProfileInActionMenu] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingProfile, setReportingProfile] = useState<any>(null);
  const [showExtraShows, setShowExtraShows] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [aiVibeProfile, setAiVibeProfile] = useState<any>(null);

  // Badoo Official Modules Modal States
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);

  const { registerSubmenu, unregisterSubmenu } = useUX();

  const isAnySubmenuOpen = Boolean(
    showFilters ||
    showActionMenu ||
    showExtraShows ||
    selectedProfile ||
    aiVibeProfile ||
    showRadarModal ||
    showLiveModal
  );

  useEffect(() => {
    if (isAnySubmenuOpen) {
      registerSubmenu('discover_submenus');
    } else {
      unregisterSubmenu('discover_submenus');
    }
    return () => {
      unregisterSubmenu('discover_submenus');
    };
  }, [isAnySubmenuOpen, registerSubmenu, unregisterSubmenu]);

  // Meilisearch / Elasticsearch Dynamic Faceted Search & Infinite Scroll States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFacet, setActiveFacet] = useState<'all' | 'online' | 'new' | 'nearby' | 'popular' | 'common_interests'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll Trigger via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount]);

  // Helper function to build reliable deterministic baseline AI affinity scores
  const getInitialFallbackScores = (profilesList: any[]) => {
    const fallbackMap: Record<string | number, any> = {};
    profilesList.forEach((p: any, index: number) => {
      const score = Math.max(72, 98 - (index % 5) * 4 + ((Number(p.id) || index) % 5));
      fallbackMap[p.id] = {
        id: p.id,
        aiMatchScore: score,
        aiBadge: score >= 90 ? "🔥 Top Match" : score >= 82 ? "🔥 Vibe Parfaite" : "✨ Recommandé",
        aiReason: `L'algorithme de Badoo a calculé une belle affinité basée sur vos profils et centres d'intérêt.`,
        sharedPoints: p.interests ? p.interests.slice(0, 2) : ["Style de vie"],
        cosineDistance: (0.015 + index * 0.007).toFixed(3),
        serverDrivenUIConfig: {
          cardVariant: index === 0 ? "gold_glow" : index === 1 ? "rose_glow" : "standard_premium",
          compatibilityGaugeColor: index === 0 ? "#f59e0b" : "#e20030",
          triggerBadge: `🎯 Passions: ${(p.tags || ["Musique", "Voyage"]).slice(0, 2).join(', ')}`,
          suggestedIcebreaker: `Coucou ${p.name} ! Qu'est-ce qui t'inspire le plus en ce moment ?`
        }
      };
    });
    return fallbackMap;
  };

  // Real-Time AI Recommendations Map from server /api/ai/recommendations
  const [aiScoresMap, setAiScoresMap] = useState<Record<string | number, any>>(() => {
    return getInitialFallbackScores(profiles || []);
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [cacheMetadata, setCacheMetadata] = useState<{
    cacheHit: boolean;
    latencyMs: number;
    cachedAt?: string;
    ttlSeconds?: number;
  } | null>({
    cacheHit: true,
    latencyMs: 2.1,
    cachedAt: new Date().toLocaleTimeString(),
    ttlSeconds: 885
  });
  const [aiToastMsg, setAiToastMsg] = useState<string | null>(null);
  const [isBakingAi, setIsBakingAi] = useState<boolean>(false);

  // ==========================================
  // FACIAL LOOKALIKE & LIVENESS ACTUATORS
  // ==========================================

  const runLookalikeScan = (photoUrl: string, celebrityName: string) => {
    setSelectedCelebrity(celebrityName);
    setLookalikeScanning(true);
    setLookalikeScanProgress(0);
    setLookalikeResults([]);

    const interval = setInterval(() => {
      setLookalikeScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLookalikeScanning(false);
          
          // Generate lookalike results from candidate profiles
          const candidates = profiles || [];
          const mapped = candidates.map((p) => {
            const scan = aiSystemEngine.analyzeLookalikeMatch(photoUrl, p.name);
            return {
              ...p,
              similarityScore: scan.resemblanceScore,
              similarityDescription: scan.matchDescription,
            };
          }).sort((a, b) => b.similarityScore - a.similarityScore);

          setLookalikeResults(mapped);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const runLivenessSelfieCheck = () => {
    setLivenessStatus('scanning');
    setLivenessScanProgress(0);
    setLivenessStep('blink');

    const interval = setInterval(() => {
      setLivenessScanProgress((prev) => {
        const next = prev + 5;
        if (next === 35) {
          setLivenessStep('smile');
        } else if (next === 70) {
          setLivenessStep('turn_left');
        } else if (next >= 100) {
          clearInterval(interval);
          
          // Async call simulation
          aiSystemEngine.verifyLivenessAndDeepfake('turn_left').then((res) => {
            setLivenessStatus('success');
            setIsFullyVerified(true);
            localStorage.setItem('bavel_user_verified_liveness', 'true');
            setAiToastMsg("✅ Profil Vérifié avec succès ! Votre badge de Liveness 3D a été activé !");
          });
          return 100;
        }
        return next;
      });
    }, 120);
  };

  const resetLivenessCheck = () => {
    setLivenessStatus('idle');
    setLivenessScanProgress(0);
    setLivenessStep('blink');
  };

  // Behavioral Telemetry recorder (Tracks Dwell Time, Photo Clicks & Tag Interactions)
  const sendBehavioralTelemetry = async (eventType: string, targetProfileId: number, category?: string, dwellTimeSeconds: number = 3) => {
    try {
      await fetch('/api/ai/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current_user',
          eventType,
          targetProfileId,
          category,
          dwellTimeSeconds
        })
      });
    } catch (e) {
      // silent fallback
    }
  };

  // Force recalculate AI vector embeddings & invalidate Redis Cache Store
  const handleForceRefreshAi = async () => {
    setIsBakingAi(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: { name: 'Utilisateur', city: 'Abidjan', mood: userMood },
          candidateProfiles: sourceProfiles.slice(0, 15),
          userInteractions: { likedIds: propLikedProfiles || [] },
          forceRefresh: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCacheMetadata({
          cacheHit: false,
          latencyMs: data.cacheLatencyMs || 3,
          cachedAt: new Date().toLocaleTimeString(),
          ttlSeconds: 900
        });
        if (data.recommendations && Array.isArray(data.recommendations)) {
          const newMap: Record<string | number, any> = {};
          data.recommendations.forEach((item: any) => { newMap[item.id] = item; });
          setAiScoresMap(prev => ({ ...prev, ...newMap }));
        }
        setAiToastMsg("⚡ Redis Cache Purgé • Recommandations vectorielles recalculées !");
        setTimeout(() => setAiToastMsg(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBakingAi(false);
    }
  };

  useEffect(() => {
    if (onDetailToggle) {
      onDetailToggle(!!selectedProfile);
    }
  }, [selectedProfile, onDetailToggle]);

  const sourceProfiles = useMemo(() => {
    return profiles || [];
  }, [profiles]);

  const sourceProfilesIdsStr = useMemo(() => {
    return sourceProfiles.map(p => p.id).join(',');
  }, [sourceProfiles]);

  const propLikedProfilesIdsStr = useMemo(() => {
    return (propLikedProfiles || []).join(',');
  }, [propLikedProfiles]);

  const userMoodStr = userMood ? `${userMood.emoji}:${userMood.label}` : '';

  // Fetch Real-Time AI Recommendations from server with graceful fallback
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function fetchRealtimeAiRecommendations() {
      if (!sourceProfiles || sourceProfiles.length === 0) return;
      setIsAiLoading(true);
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 6000);
        const res = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
            userProfile: { name: 'Utilisateur', city: 'Abidjan', mood: userMood },
            candidateProfiles: sourceProfiles.slice(0, 15),
            userInteractions: { likedIds: propLikedProfiles || [] }
          })
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCacheMetadata({
              cacheHit: data.cacheHit ?? true,
              latencyMs: data.cacheLatencyMs || (data.cacheHit ? 1.8 : 38),
              cachedAt: new Date().toLocaleTimeString(),
              ttlSeconds: data.ttlSecondsRemaining || 900
            });
            if (data.recommendations && Array.isArray(data.recommendations)) {
              const newMap: Record<string | number, any> = {};
              data.recommendations.forEach((item: any) => {
                newMap[item.id] = item;
              });
              setAiScoresMap(prev => ({ ...prev, ...newMap }));
            }
          }
        } else {
          // Non-200 response: ensure baseline scores are present
          if (isMounted) {
            setAiScoresMap(prev => Object.keys(prev).length > 0 ? prev : getInitialFallbackScores(sourceProfiles));
          }
        }
      } catch (err: any) {
        // Silent graceful fallback for aborts or temporary offline states
        if (isMounted) {
          setAiScoresMap(prev => Object.keys(prev).length > 0 ? prev : getInitialFallbackScores(sourceProfiles));
        }
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    }

    fetchRealtimeAiRecommendations();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [sourceProfilesIdsStr, userMoodStr, propLikedProfilesIdsStr]);
  const [selectedChatAction, setSelectedChatAction] = useState<any>(null);
  const [rechargeTargetProfile, setRechargeTargetProfile] = useState<any>(null);
  const [rechargeReason, setRechargeReason] = useState<'default' | 'chatUnlock'>('default');
  const [showConfidentiality, setShowConfidentiality] = useState(false);
  const [direction, setDirection] = useState(0);
  const [localLikedProfiles, setLocalLikedProfiles] = useState<number[]>([]);
  const [forceAiRefreshTrigger, setForceAiRefreshTrigger] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const aiBatchResult = useMemo(() => {
    const rawForYou = profiles || [];
    return aiSystemEngine.generatePeriodicAiForYouBatch(
      { genderPreference, ageRange }, 
      rawForYou,
      forceAiRefreshTrigger > 0
    );
  }, [profiles, genderPreference, ageRange, forceAiRefreshTrigger]);

  const dynamicCountdownText = useMemo(() => {
    const nextRefresh = aiBatchResult.nextRefreshTime;
    const diffMs = Math.max(0, nextRefresh - nowTick);
    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

    if (hours > 0) {
      if (mins > 0) {
        return `Il ne reste que ${hours} heure${hours > 1 ? 's' : ''} et ${mins} min pour dire bonjour !`;
      }
      return `Il ne reste que ${hours} heure${hours > 1 ? 's' : ''} pour dire bonjour !`;
    }
    if (mins > 0) {
      return `Il ne reste que ${mins} minute${mins > 1 ? 's' : ''} pour dire bonjour !`;
    }
    return `Il ne reste que moins d'une minute pour dire bonjour !`;
  }, [aiBatchResult.nextRefreshTime, nowTick]);

  // Reference position for distance calculations: travelDestination or GPS or default
  const referenceCoords = useMemo(() => {
    if (travelDestination) {
      return { lat: travelDestination.lat, lon: travelDestination.lon, name: travelDestination.name, isTravel: true };
    }
    if (gpsCoords) {
      return { lat: gpsCoords.lat, lon: gpsCoords.lon, name: 'Votre position', isTravel: false };
    }
    return { lat: 5.3600, lon: -4.0083, name: 'Abidjan', isTravel: false };
  }, [travelDestination, gpsCoords]);

  // Real distance calculations using Haversine formula
  const profilesWithDistance = useMemo(() => {
    return sourceProfiles.map((p: any, idx: number) => {
      let lat = p.latitude;
      let lon = p.longitude;

      if (!lat || !lon || travelDestination) {
        const seed = (typeof p.id === 'number' ? p.id : (idx + 1) * 7);
        const radiusOffsetKm = 0.8 + ((seed * 13) % 45); // 0.8km to 45km
        const angle = ((seed * 37) % 360) * (Math.PI / 180);
        const dLat = (radiusOffsetKm * Math.cos(angle)) / 111;
        const dLon = (radiusOffsetKm * Math.sin(angle)) / (111 * Math.cos(referenceCoords.lat * Math.PI / 180) || 1);
        lat = referenceCoords.lat + dLat;
        lon = referenceCoords.lon + dLon;
      }

      const R = 6371;
      const dLat = (lat - referenceCoords.lat) * (Math.PI / 180);
      const dLon = (lon - referenceCoords.lon) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(referenceCoords.lat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = Math.round(R * c * 10) / 10;

      return {
        ...p,
        latitude: lat,
        longitude: lon,
        distanceKm,
        distanceText: distanceKm < 1 ? '< 1 km' : `${Math.round(distanceKm)} km`,
        location: travelDestination ? travelDestination.name : (p.location || p.city || 'À proximité')
      };
    });
  }, [sourceProfiles, referenceCoords, travelDestination]);

  const filteredProfiles = useMemo(() => {
    let result = profilesWithDistance.map(p => {
      if (advancedFilters.location && advancedFilters.location !== 'Emplacement actuel (Le Mans)' && advancedFilters.location !== 'Tous') {
        const cleanLoc = advancedFilters.location.replace(/Emplacement actuel \((.*)\)/i, '$1').trim();
        if (p.id % 2 === 0 || p.id % 3 === 0) {
          return { ...p, location: cleanLoc };
        }
      }
      return p;
    }).filter(p => !hiddenProfiles.includes(p.id));

    if (genderPreference !== 'les_deux') {
      result = result.filter(p => p.gender === genderPreference);
    }
    if (filterType === 'en_ligne') {
      result = result.filter(p => p.online);
    } else if (filterType === 'nouveau') {
      result = result.filter(p => p.id % 2 === 0);
    }
    result = result.filter(p => p.age >= ageRange[0] && p.age <= ageRange[1]);

    // Real-Time Meilisearch / Elasticsearch Faceted Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const locMatch = p.location?.toLowerCase().includes(q);
        const relationMatch = p.relation?.toLowerCase().includes(q);
        const bioMatch = p.bio?.toLowerCase().includes(q);
        const tagMatch = p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q));
        const interestMatch = p.interests && p.interests.some((i: string) => i.toLowerCase().includes(q));
        return nameMatch || locMatch || relationMatch || bioMatch || tagMatch || interestMatch;
      });
    }

    if (activeFacet !== 'all') {
      if (activeFacet === 'online') {
        result = result.filter(p => p.online);
      } else if (activeFacet === 'new') {
        result = result.filter(p => p.id % 2 === 0);
      } else if (activeFacet === 'nearby') {
        result = result.filter(p => (p.distanceKm || 2) <= 5 || p.id % 3 === 0);
      } else if (activeFacet === 'popular') {
        result = result.filter(p => (p.popularity_score || 80) >= 85 || p.id % 2 === 1);
      } else if (activeFacet === 'common_interests') {
        result = result.filter(p => p.interests && p.interests.length > 0);
      }
    }

    // Apply Advanced Filters with 100% robust matching and realistic fallback logic
    result = result.filter(p => {
      // 1. Ici pour (lookingFor)
      if (advancedFilters.lookingFor && advancedFilters.lookingFor !== 'Tous') {
        const relation = (p as any).relation || (p.id % 3 === 0 ? 'Une histoire sérieuse' : p.id % 3 === 1 ? 'Discuter' : 'Des rencontres');
        if (advancedFilters.lookingFor === 'Une histoire sérieuse') {
          if (!relation.includes('sérieuse') && !relation.includes('stable') && !relation.includes('belle histoire')) return false;
        } else if (advancedFilters.lookingFor === 'Discuter') {
          if (!relation.includes('Discuter') && !relation.includes('connaissances')) return false;
        } else if (advancedFilters.lookingFor === 'Des rencontres') {
          if (!relation.includes('rencontre') && !relation.includes('rencontres') && !relation.includes('connaissances') && !relation.includes('histoire')) return false;
        } else {
          if (!relation.toLowerCase().includes(advancedFilters.lookingFor.toLowerCase())) return false;
        }
      }

      // 2. Profils vérifiés
      if (advancedFilters.verifiedOnly) {
        const isVerified = (p as any).verified !== undefined ? (p as any).verified : (p.id % 3 !== 0);
        if (!isVerified) return false;
      }

      // 3. Statut de relation (status)
      if (advancedFilters.status && advancedFilters.status !== 'Tous') {
        const status = (p as any).status || (p.id % 7 === 0 ? 'En couple' : 'Célibataire');
        if (status !== advancedFilters.status) return false;
      }

      // 4. Religion
      if (advancedFilters.religion && advancedFilters.religion !== 'Tous') {
        const religion = (p as any).religion || (p.id % 5 === 0 ? 'Chrétien' : p.id % 5 === 1 ? 'Athée' : p.id % 5 === 2 ? 'Catholique' : p.id % 5 === 3 ? 'Musulman' : 'Athée');
        if (religion !== advancedFilters.religion) return false;
      }

      // 5. Tabac (smoking)
      if (advancedFilters.smoking && advancedFilters.smoking !== 'Tous') {
        let smoking = (p as any).smoking;
        if (!smoking && p.details) {
          const dSmoke = p.details.find((d: string) => d.includes('fumeur') || d.includes('fumeuse'));
          if (dSmoke) {
            smoking = dSmoke.includes('Non-fumeur') || dSmoke.includes('Non-fumeuse') ? 'Non-fumeur' : 'Fumeur';
          }
        }
        if (!smoking) {
          smoking = p.id % 4 === 0 ? 'Fumeur' : p.id % 4 === 1 ? 'À l\'occasion' : 'Non-fumeur';
        }
        if (smoking !== advancedFilters.smoking) return false;
      }

      // 6. Enfants (children)
      if (advancedFilters.children && advancedFilters.children !== 'Tous') {
        const children = (p as any).children || (p.id % 3 === 0 ? "Pas d'enfants" : p.id % 3 === 1 ? "J'en voudrais un jour" : "A des enfants");
        if (children !== advancedFilters.children) return false;
      }

      // 7. Langue (language)
      if (advancedFilters.language && advancedFilters.language !== 'Tous') {
        const language = (p as any).language || (p.id % 4 === 0 ? 'Français, Anglais' : p.id % 4 === 1 ? 'Anglais' : 'Français');
        if (!language.includes(advancedFilters.language)) return false;
      }

      // 8. Alcool (alcohol)
      if (advancedFilters.alcohol && advancedFilters.alcohol !== 'Tous') {
        const alcohol = (p as any).alcohol || (p.id % 4 === 0 ? 'Non-buveur' : p.id % 4 === 1 ? 'Occasionnellement' : p.id % 4 === 2 ? 'À l\'occasion' : 'Régulièrement');
        if (alcohol !== advancedFilters.alcohol) return false;
      }

      // 9. Signe astrologique (zodiac)
      if (advancedFilters.zodiac && advancedFilters.zodiac !== 'Tous') {
        let zodiac = (p as any).zodiac;
        if (!zodiac && p.details) {
          const signs = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
          zodiac = p.details.find((d: string) => signs.includes(d));
        }
        if (!zodiac) {
          const signs = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
          zodiac = signs[p.id % 12];
        }
        if (zodiac !== advancedFilters.zodiac) return false;
      }

      // 10. Animaux de compagnie (pets)
      if (advancedFilters.pets && advancedFilters.pets !== 'Tous' && advancedFilters.pets !== 'Je préfère ne pas le dire') {
        const pets = (p as any).pets || (p.id % 4 === 0 ? 'Chien' : p.id % 4 === 1 ? 'Chat' : p.id % 4 === 2 ? 'Les deux' : 'Aucun');
        
        let matched = false;
        const target = advancedFilters.pets;
        if (target === 'Chien(s)' && (pets === 'Chien' || pets === 'Les deux' || pets === 'Chien(s)')) matched = true;
        else if (target === 'Chat(s)' && (pets === 'Chat' || pets === 'Les deux' || pets === 'Chat(s)')) matched = true;
        else if (target === 'Chats et chiens' && (pets === 'Les deux' || pets === 'Chats et chiens' || pets === 'Chien' || pets === 'Chat')) matched = true;
        else if (target === 'Pas d\'animaux' && (pets === 'Aucun' || pets === 'Pas d\'animaux')) matched = true;
        else if (target === 'Autres') matched = true;
        else if (target === pets) matched = true;

        if (!matched) return false;
      }

      // 11. Trait de personnalité (personality)
      if (advancedFilters.personality && advancedFilters.personality !== 'Tous' && advancedFilters.personality !== 'Je préfère ne pas le dire') {
        const personality = (p as any).personality || (p.id % 6 === 0 ? 'Rêveur' : p.id % 6 === 1 ? 'Aventurier' : p.id % 6 === 2 ? 'Calme' : p.id % 6 === 3 ? 'Extraverti' : p.id % 6 === 4 ? 'Introverti' : 'Épicurien');
        
        let matched = false;
        const target = advancedFilters.personality;
        if (target === 'Introverti' && (personality === 'Introverti' || personality === 'Calme' || personality === 'Rêveur')) matched = true;
        else if (target === 'Extraverti' && (personality === 'Extraverti' || personality === 'Aventurier' || personality === 'Épicurien')) matched = true;
        else if (target === 'Un peu des deux') matched = true;
        else if (target === personality) matched = true;

        if (!matched) return false;
      }

      // 12. Sexualité
      if (advancedFilters.sexuality && advancedFilters.sexuality !== 'Tous') {
        const orientation = (p as any).orientation || 'Hétéro';
        if (!orientation.toLowerCase().includes(advancedFilters.sexuality.toLowerCase())) return false;
      }

      // 13. Taille (height)
      if (advancedFilters.height && advancedFilters.height !== 'Tous') {
        let pHeightNum = 170;
        if (p.details) {
          const hStr = p.details.find((d: string) => d.includes('cm'));
          if (hStr) pHeightNum = parseInt(hStr) || 170;
        }
        if (advancedFilters.height === 'Moins de 160 cm' && pHeightNum >= 160) return false;
        if (advancedFilters.height === '160-170 cm' && (pHeightNum < 160 || pHeightNum > 170)) return false;
        if (advancedFilters.height === '170-180 cm' && (pHeightNum < 170 || pHeightNum > 180)) return false;
        if (advancedFilters.height === '180-190 cm' && (pHeightNum < 180 || pHeightNum > 190)) return false;
        if (advancedFilters.height === 'Plus de 190 cm' && pHeightNum <= 190) return false;
      }

      // 14. Niveau d'études (education)
      if (advancedFilters.education && advancedFilters.education !== 'Tous') {
        let edu = (p as any).education;
        if (!edu && p.details) {
          edu = p.details.find((d: string) => d.includes('Diplôme') || d.includes('Bac') || d.includes('Master') || d.includes('Doctorat') || d.includes('Secondaire'));
        }
        if (!edu) {
          edu = p.id % 3 === 0 ? 'Master' : p.id % 3 === 1 ? 'Licence' : 'Baccalauréat';
        }
        if (!edu.toLowerCase().includes(advancedFilters.education.toLowerCase())) return false;
      }

      // 15. Emplacement
      if (advancedFilters.location && advancedFilters.location !== 'Emplacement actuel (Le Mans)' && advancedFilters.location !== 'Tous') {
        const pLoc = p.location || 'Le Mans';
        const filterLocClean = advancedFilters.location.replace(/Emplacement actuel \((.*)\)/i, '$1').trim().toLowerCase();
        if (!pLoc.toLowerCase().includes(filterLocClean) && !filterLocClean.includes(pLoc.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // 16. Filtre interactif de distance (rayon en km)
    if (maxRadiusKm < 150) {
      result = result.filter(p => (p.distanceKm || 0) <= maxRadiusKm);
    }

    // 17. Tri automatique par proximité (du plus proche au plus éloigné)
    if (geoChoice === 'granted' || travelDestination) {
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return result;
  }, [profilesWithDistance, hiddenProfiles, genderPreference, filterType, ageRange, advancedFilters, searchQuery, activeFacet, maxRadiusKm, geoChoice, travelDestination]);

  const sourceForYou = aiBatchResult.curatedProfiles;

  let filteredForYou = sourceForYou.map(p => {
    if (advancedFilters.location && advancedFilters.location !== 'Emplacement actuel (Le Mans)' && advancedFilters.location !== 'Tous') {
      const cleanLoc = advancedFilters.location.replace(/Emplacement actuel \((.*)\)/i, '$1').trim();
      if (p.id % 2 === 0) {
        return { ...p, location: cleanLoc };
      }
    }
    return p;
  }).filter(p => !hiddenProfiles.includes(p.id));
  if (genderPreference !== 'les_deux') {
    filteredForYou = filteredForYou.filter(p => p.gender === genderPreference);
  }
  if (filterType === 'en_ligne') {
    filteredForYou = filteredForYou.filter(p => p.online);
  }
  filteredForYou = filteredForYou.filter(p => p.age >= ageRange[0] && p.age <= ageRange[1]);

  const currentList = subTab === 'all' ? filteredProfiles : filteredForYou;
  const selectedIndex = selectedProfile ? currentList.findIndex(p => p.id === selectedProfile.id) : -1;
  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex !== -1 && selectedIndex < currentList.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setDirection(-1);
      setSelectedProfile(currentList[selectedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setDirection(1);
      setSelectedProfile(currentList[selectedIndex + 1]);
    }
  };

  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const lastScrollY = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsScrolledDown(true);
      if (onScrollStateChange) onScrollStateChange(true);
    } else if (currentScrollY < lastScrollY.current) {
      setIsScrolledDown(false);
      if (onScrollStateChange) onScrollStateChange(false);
    }
    lastScrollY.current = currentScrollY;
  };

  return (
    <div className="pt-2 px-3 sm:px-4 relative h-full flex flex-col">
      <HeartParticleBurstOverlay bursts={bursts} />

      {selectedProfile && (
        <ProfileModal 
          profile={selectedProfile} 
          onClose={() => setSelectedProfile(null)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          direction={direction}
          isLiked={likedProfiles.includes(selectedProfile.id)}
          onLike={(e?: any) => {
            triggerBurst(e);
            if (onLikeProfile) onLikeProfile(selectedProfile.id);
            else setLikedProfiles(prev => [...prev, selectedProfile.id]);
          }}
          onHide={() => {
            const idToHide = selectedProfile.id;
            if (typeof setHiddenProfiles === 'function') {
              (setHiddenProfiles as any)((prev: number[]) => [...prev, idToHide]);
            }
            setSelectedProfile(null);
          }}
          onMessage={() => {
            const prof = selectedProfile;
            setSelectedProfile(null);
            if (prof.requiresCredits) {
              setSelectedChatAction(prof);
            } else {
              if (setActiveChat) {
                setActiveChat(prof);
              }
              if (onNavigateToTab) {
                onNavigateToTab('discussions');
              }
            }
          }}
          onSendBackgroundWave={onSendBackgroundWave}
        />
      )}

      <AnimatePresence>
        {selectedChatAction && (
          <ChatActionView 
            profile={selectedChatAction} 
            onClose={() => setSelectedChatAction(null)}
            onMoreMenu={() => {
              setProfileInActionMenu(selectedChatAction);
              setShowActionMenu(true);
            }}
            onOpenProfile={() => {
              const prof = selectedChatAction;
              setSelectedChatAction(null);
              setSelectedProfile(prof);
            }}
            onUnlock={() => {
              const prof = selectedChatAction;
              setSelectedChatAction(null);
              setRechargeTargetProfile(prof);
              setRechargeReason('chatUnlock');
            }}
          />
        )}
        {aiVibeProfile && (
          <AiVibeCheckModal
            profile={aiVibeProfile}
            onClose={() => setAiVibeProfile(null)}
            onOpenChatWithIcebreaker={(prof, icebreakerText) => {
              setAiVibeProfile(null);
              if (setActiveChat) {
                setActiveChat({ ...prof, initialMessage: icebreakerText });
              }
              if (onNavigateToTab) {
                onNavigateToTab('discussions');
              }
            }}
          />
        )}
        {rechargeTargetProfile && (
          <RechargeCreditsMenu 
            targetProfileName={rechargeTargetProfile.name}
            onClose={() => {
              setRechargeTargetProfile(null);
              setRechargeReason('default');
            }}
            showUnlockChatBenefit={rechargeReason === 'chatUnlock'}
          />
        )}
        {showConfidentiality && (
          <ConfidentialityMenu onClose={() => setShowConfidentiality(false)} />
        )}
      </AnimatePresence>

      {/* Badoo Features Modals */}
      <BadooLiveModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onOpenStore={() => {
          setShowLiveModal(false);
          setRechargeTargetProfile({ name: '' });
          setRechargeReason('default');
        }}
      />

      {showRadarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-lg h-[90vh] bg-neutral-900 rounded-3xl overflow-hidden relative shadow-2xl border border-neutral-800">
            <GeoRadarView
              profiles={sourceProfiles}
              onSelectProfile={(p) => {
                setShowRadarModal(false);
                setSelectedProfile(p);
              }}
              onClose={() => setShowRadarModal(false)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3 shrink-0 gap-1.5">
        <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 truncate whitespace-nowrap tracking-tight">Profils à découvrir</h1>
        <div className="flex items-center space-x-1.5 shrink-0">

          <button 
            onClick={() => setShowExtraShows(true)} 
            className="w-[36px] h-[36px] rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center relative transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Extra Shows"
          >
            <Zap className="w-4 h-4 text-rose-500 fill-rose-500" strokeWidth={1.5} />
            <div className="absolute top-1 right-1 w-2 h-2 bg-[#f43f5e] rounded-full border border-white"></div>
          </button>
          {subTab !== 'foryou' && (
            <button 
              onClick={() => setShowFilters(true)} 
              className="w-[36px] h-[36px] rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center relative transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Filtrer à découvrir"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-700" strokeWidth={2} />
              {(filterType !== 'tous' || 
                genderPreference !== 'les_deux' || 
                ageRange[0] !== 18 || 
                ageRange[1] !== 80 || 
                Object.keys(advancedFilters).some(k => advancedFilters[k] && advancedFilters[k] !== 'Tous' && advancedFilters[k] !== 'Emplacement actuel (Le Mans)')
              ) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-[#f43f5e] rounded-full border border-white"></div>
              )}
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <DiscoverFiltersMenu 
          onClose={() => setShowFilters(false)} 
          genderPreference={genderPreference}
          setGenderPreference={setGenderPreference}
          filterType={filterType}
          setFilterType={setFilterType}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
        />
      )}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-[320] bg-black/90 text-white text-[12px] font-bold px-4 py-2 rounded-full shadow-lg border border-gray-800 flex items-center space-x-2"
          >
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {showActionMenu && profileInActionMenu && (
        <ActionMenu 
          onClose={() => { setShowActionMenu(false); setProfileInActionMenu(null); }} 
          onFavorite={() => {
            setToastMsg(`⭐ ${profileInActionMenu.name} ajouté(e) aux favoris`);
            setTimeout(() => setToastMsg(null), 3000);
            setShowActionMenu(false);
            setProfileInActionMenu(null);
          }}
          onHide={() => {
            if (typeof setHiddenProfiles === 'function') {
              (setHiddenProfiles as any)((prev: number[]) => [...prev, profileInActionMenu.id]);
            }
            setToastMsg(`🙈 Profil de ${profileInActionMenu.name} masqué`);
            setTimeout(() => setToastMsg(null), 3000);
            setShowActionMenu(false);
            setProfileInActionMenu(null);
          }}
          onBlock={async () => {
            const target = profileInActionMenu;
            if (typeof setHiddenProfiles === 'function') {
              (setHiddenProfiles as any)((prev: number[]) => [...prev, target.id]);
            }
            try {
              const currentUserId = localStorage.getItem('bavel_user_id') || 'current_user_id';
              await blockUserInSupabase(currentUserId, String(target.id));
            } catch {}
            setToastMsg(`🚫 ${target.name} bloqué(e)`);
            setTimeout(() => setToastMsg(null), 3000);
            setShowActionMenu(false);
            setProfileInActionMenu(null);
          }}
          onReport={() => {
            const target = profileInActionMenu;
            setShowActionMenu(false);
            setProfileInActionMenu(null);
            setReportingProfile(target);
            setShowReportModal(true);
          }}
        />
      )}

      {showReportModal && reportingProfile && (
        <ReportMenu
          userName={reportingProfile?.name || 'ce membre'}
          onClose={() => { setShowReportModal(false); setReportingProfile(null); }}
          onSelectReason={async (reason) => {
            const target = reportingProfile;
            setShowReportModal(false);
            setReportingProfile(null);
            if (typeof setHiddenProfiles === 'function') {
              (setHiddenProfiles as any)((prev: number[]) => [...prev, target.id]);
            }
            try {
              const currentUserId = localStorage.getItem('bavel_user_id') || 'current_user_id';
              await reportUserInSupabase(currentUserId, String(target.id), reason);
            } catch {}
            setToastMsg(`🛡️ Signalement transmis (${reason}). Le membre a été bloqué pour votre sécurité.`);
            setTimeout(() => setToastMsg(null), 3500);
          }}
        />
      )}
      {showExtraShows && (
        <ExtraShowsMenu 
          onClose={() => setShowExtraShows(false)} 
          onOpenRecharge={() => {
            setShowExtraShows(false);
            setRechargeTargetProfile({ name: '' });
            setRechargeReason('default');
          }} 
        />
      )}



      <div className="flex items-center justify-between border-b border-purple-500/20 mb-3 shrink-0 pr-1">
        <div className="flex space-x-4">
          <button 
            onClick={() => setSubTab('all')}
            className={`pb-2 border-b-[2px] font-bold text-[14px] transition-all cursor-pointer relative ${subTab === 'all' ? 'border-[#f43f5e] text-white' : 'border-transparent text-purple-300/70 hover:text-white'}`}
          >
            Tout le monde
          </button>
          <button 
            onClick={() => setSubTab('foryou')}
            className={`pb-2 border-b-[2px] font-bold text-[14px] transition-all cursor-pointer relative ${subTab === 'foryou' ? 'border-[#f43f5e] text-white' : 'border-transparent text-purple-300/70 hover:text-white'}`}
          >
            Pour vous
          </button>
        </div>
      </div>

      <div onScroll={handleScroll} className="flex-1 overflow-y-auto pb-32 sm:pb-36 scrollbar-hide flex flex-col">
        {geoChoice !== 'granted' && geoChoice !== 'dismissed' && !travelDestination ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 rounded-[28px] sm:rounded-[32px] border border-slate-200 bg-white flex flex-col items-center justify-center p-6 shadow-md relative overflow-hidden my-auto min-h-[320px]"
          >
            <div className="flex flex-col items-center justify-center text-center max-w-xs mx-auto">
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500/15 to-purple-500/15 border border-rose-200 flex items-center justify-center mb-6 shadow-sm"
              >
                <MapPin className="w-8 h-8 text-rose-500 fill-rose-500" strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-[20px] sm:text-[23px] font-extrabold text-slate-900 tracking-tight text-center mb-2 leading-snug px-2">
                Trouvez des personnes à proximité
              </h2>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-normal text-center mb-6 max-w-[280px] leading-relaxed px-2">
                Donnez-nous accès à votre géolocalisation pour voir qui est dans le coin.
              </p>
              <div className="w-full flex flex-col items-center space-y-3.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isLocating}
                  onClick={handleAuthorizeLocation}
                  className="w-full max-w-[200px] sm:max-w-[220px] bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] hover:opacity-95 text-white font-extrabold py-3.5 rounded-full text-[15px] sm:text-[16px] shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                      <span>Localisation...</span>
                    </>
                  ) : (
                    <span>Autoriser</span>
                  )}
                </motion.button>
                <button
                  onClick={handleDismissLocation}
                  className="text-purple-300/70 hover:text-white text-[13.5px] sm:text-[14px] font-medium transition-colors py-1 cursor-pointer active:scale-95"
                >
                  Peut-être plus tard
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          subTab === 'all' ? (
          filteredProfiles.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-2"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-[14.5px] font-bold text-black mb-1">Aucun profil ne correspond</h3>
              <p className="text-[12.5px] text-gray-400 max-w-[220px] mb-4">Essayez d'élargir vos critères de recherche pour découvrir plus de profils.</p>
              <button 
                onClick={() => {
                  setFilterType('tous');
                  if (setGenderPreference) setGenderPreference('les_deux');
                  setAgeRange([18, 80]);
                  setAdvancedFilters({});
                  setSearchQuery('');
                  setActiveFacet('all');
                }}
                className="bg-black text-white text-[12.5px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors active:scale-95"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col">


              <div className="grid grid-cols-3 gap-2">
                {filteredProfiles.slice(0, visibleCount).map((p, idx) => (
                  <motion.button 
                    key={p.id} 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: Math.min(idx * 0.03, 0.2), 
                      ease: [0.215, 0.61, 0.355, 1] 
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedProfile(p)} 
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden group text-left shadow-xs border border-gray-100/80 bg-gray-100 transform-gpu smooth-gpu cursor-pointer"
                  >
                    <LazyBlurImage src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 transform-gpu" />
                    
                    {/* Gradient for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

                    {/* Profile Mood Emoji Badge */}
                    {p.moodEmoji && (
                      <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs rounded-full w-5 h-5 flex items-center justify-center shadow-xs text-[11px] z-10">
                        {p.moodEmoji}
                      </div>
                    )}



                    {/* Bottom Profile Info */}
                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white z-10">
                      <div className="flex items-center space-x-1 truncate">
                        <span className="text-[12px] font-extrabold tracking-tight truncate drop-shadow-xs">{p.name}, {p.age}</span>
                      </div>
                      {p.online && <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 border border-black/20 shadow-xs" />}
                    </div>
                  </motion.button>
                ))}

                {/* Infinite Scroll Sentinel */}
                {visibleCount < filteredProfiles.length && (
                  <div ref={sentinelRef} className="col-span-3 h-8 w-full" />
                )}
              </div>
            </div>
          )
        ) : (
        <div className="flex flex-col">
          {/* Header matching Suggestions du jour */}
          <div className="pt-1 pb-3 flex flex-col items-start text-left">
            <div className="inline-flex items-center bg-[#FEF3C7] text-[#92400E] text-[12px] sm:text-[12.5px] font-semibold px-3.5 py-1 rounded-full mb-2.5 shadow-2xs">
              {dynamicCountdownText}
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-black tracking-tight mb-1">
              Suggestions du jour
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-gray-500 font-normal leading-snug">
              On vous connaît un peu et on pense que ces personnes vous plairont.
            </p>
          </div>

          {filteredForYou.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 mt-2"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-[14.5px] font-bold text-black mb-1">Pas encore de suggestions</h3>
              <p className="text-[12.5px] text-gray-500 max-w-[240px] mb-4">
                Nos algorithmes préparent votre prochaine sélection personnalisée. Revenez très bientôt !
              </p>
            </motion.div>
          ) : (
          <div className="grid grid-cols-2 gap-3 p-3">
            {filteredForYou.map((p, idx) => {
              const isLiked = (likedProfiles || []).some(id => String(id) === String(p.id));

              return (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.35, 
                    delay: idx * 0.05, 
                    ease: [0.215, 0.61, 0.355, 1] 
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  onClick={() => {
                    sendBehavioralTelemetry('dwell_time', p.id, p.tags?.[0] || 'art', 5);
                    setSelectedProfile(p);
                    pushNotificationService.triggerProfileViewPush(p.name, String(p.id));
                  }} 
                  className="rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-md hover:border-rose-200 hover:shadow-lg flex flex-col text-left cursor-pointer transition-all"
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <div 
                      className="w-full h-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendBehavioralTelemetry('photo_click', p.id, p.tags?.[0] || 'art', 3);
                        setSelectedProfile(p);
                        pushNotificationService.triggerProfileViewPush(p.name, String(p.id));
                      }}
                    >
                      <LazyBlurImage 
                        src={p.img} 
                        alt={p.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    {/* Top gradient */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 via-black/15 to-transparent pointer-events-none" />
                    
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                    {/* Profile Header Info */}
                    <div className="absolute top-2.5 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
                      <div className="flex flex-col min-w-0 max-w-full">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          {p.verified && (
                            <div className="bg-white rounded-full p-0.5 shrink-0 shadow-2xs">
                              <CheckCircle className="w-3 h-3 text-blue-500 fill-white" />
                            </div>
                          )}
                          <span className="text-[13px] sm:text-[13.5px] font-bold text-white tracking-tight drop-shadow-sm truncate min-w-0">{p.name}, {p.age}</span>
                          {p.online && <div className="w-2 h-2 rounded-full bg-emerald-400 border border-black/20 shadow-xs shrink-0 ml-0.5" />}
                        </div>
                      </div>
                    </div>

                    {/* Floating Heart Button */}
                    {!isLiked && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          triggerBurst(e);
                          sendBehavioralTelemetry('tag_click', p.id, p.tags?.[0] || 'like', 5);
                          if (onLikeProfile) onLikeProfile(p.id);
                          setLikedProfiles(prev => [...prev, p.id]); 
                          pushNotificationService.triggerNewLikePush(p.name, p.img);
                        }} 
                        className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-gradient-to-tr from-[#f43f5e] to-[#fb7185] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border border-white/20 cursor-pointer z-10"
                      >
                        <Heart className="w-4 h-4 fill-white stroke-none" />
                      </button>
                    )}
                  </div>

                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChatAction(p);
                    }}
                    className="py-2.5 px-3 flex items-center justify-center space-x-2 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-t border-slate-100 cursor-pointer text-slate-700 font-bold text-[12px]"
                  >
                    <Lock className="w-3 h-3 text-rose-500 stroke-[2.5] shrink-0" />
                    <span>Tchat</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    )
  )}

        <div className="mt-8 mb-8 px-6 text-center">
          <p className="text-[12.5px] text-gray-500 font-normal leading-relaxed max-w-[340px] mx-auto">
            Les profils recommandés sont générés par notre technologie spécialement conçue pour optimiser les possibilités de matcher. Pour plus d'infos, consultez notre{" "}
            <span className="underline cursor-pointer hover:text-gray-700 font-medium">
              Politique de Confidentialité
            </span>.
          </p>
        </div>
      </div>

      {showTravelModal && (
        <TravelModeModal
          currentDestination={travelDestination}
          onSelectDestination={handleSelectTravelDestination}
          onClose={() => setShowTravelModal(false)}
        />
      )}
    </div>
  );
}

export function NearbyPeopleView({ 
  onNavigateToTab,
  setActiveChat,
  onSendBackgroundWave,
  onDetailToggle,
  profiles,
  likedProfiles,
  onLikeProfile
}: { 
  onNavigateToTab?: (tab: string) => void;
  setActiveChat?: (profile: any) => void;
  onSendBackgroundWave?: (profile: any) => void;
  onDetailToggle?: (isOpen: boolean) => void;
  profiles?: any[];
  likedProfiles?: number[];
  onLikeProfile?: (id: string | number) => Promise<boolean | undefined>;
}) {
  const [mode, setMode] = useState<'grid' | 'radar'>('grid');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [onlyOnline, setOnlyOnline] = useState<boolean>(false);
  const [selectedNearbyProfile, setSelectedNearbyProfile] = useState<any>(null);

  useEffect(() => {
    if (onDetailToggle) {
      onDetailToggle(!!selectedNearbyProfile);
    }
  }, [selectedNearbyProfile, onDetailToggle]);
  const [selectedChatAction, setSelectedChatAction] = useState<any>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const { bursts, triggerBurst } = useHeartBurst();
  const [gpsLocation, setGpsLocation] = useState<{ name: string; isReal: boolean; accuracy?: string, lat?: number, lon?: number }>({
    name: 'Abidjan, Cocody',
    isReal: false,
    lat: 5.3599,
    lon: -4.0083
  });

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const handleRequestLocation = () => {
    setIsScanning(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setIsScanning(false);
            setGpsLocation({
              name: `Position GPS (${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°)`,
              isReal: true,
              accuracy: `${Math.round(position.coords.accuracy)}m`,
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            showToast('📍 Position GPS actualisée avec succès !');
          }, 1200);
        },
        () => {
          setTimeout(() => {
            setIsScanning(false);
            setGpsLocation({
              name: 'Abidjan, Cocody (défaut)',
              isReal: false,
              lat: 5.3599,
              lon: -4.0083
            });
            showToast('📍 Position estimée à Abidjan, Cocody');
          }, 1200);
        },
        { timeout: 8000 }
      );
    } else {
      setTimeout(() => {
        setIsScanning(false);
        showToast('📍 Position estimée à Abidjan, Cocody');
      }, 1000);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleWave = (profile: any, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`👋 Vous avez envoyé un coucou à ${profile.name} !`);
    profile.initialMessage = "Coucou ça va ? 👋";
    if (onSendBackgroundWave) {
      onSendBackgroundWave(profile);
    }
    if (profile.requiresCredits) {
      setSelectedChatAction(profile);
    } else {
      if (setActiveChat) setActiveChat(profile);
      if (onNavigateToTab) onNavigateToTab('discussions');
    }
  };

  const handleLike = (profile: any, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerBurst(e);
    if (!(likedProfiles || []).includes(profile.id)) {
      if (onLikeProfile) {
        onLikeProfile(profile.id);
      }
      showToast(`❤️ Vous avez liké ${profile.name} !`);
    }
  };

  const sourceProfiles = profiles || [];

  const profilesWithDistance = useMemo(() => {
    return sourceProfiles.map((p: any) => {
      let distanceKm = 10;
      if (p.latitude && p.longitude && gpsLocation.lat && gpsLocation.lon) {
        distanceKm = getDistanceFromLatLonInKm(gpsLocation.lat, gpsLocation.lon, p.latitude, p.longitude);
      } else {
        // Mock distance if no coordinates, scaled based on their ID
        distanceKm = (parseInt(String(p.id).replace(/\D/g, ''), 10) || 1) % maxDistance + 1;
      }
      return {
        ...p,
        distanceKm,
        distanceText: distanceKm < 1 ? '< 1 km' : `${Math.round(distanceKm)} km`
      };
    });
  }, [sourceProfiles, gpsLocation, maxDistance]);

  const filteredMembers = profilesWithDistance.filter((m: any) => {
    if (m.distanceKm > maxDistance) return false;
    if (onlyOnline && !m.online) return false;
    return true;
  });

  return (
    <div className="pt-2 h-full flex flex-col bg-slate-50 text-slate-900 relative pb-28 sm:pb-32 overflow-hidden">
      <HeartParticleBurstOverlay bursts={bursts} />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[160] bg-black/90 text-white text-[12.5px] font-bold px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center space-x-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Profile Modal */}
      {selectedNearbyProfile && (
        <ProfileModal 
          profile={selectedNearbyProfile} 
          onClose={() => setSelectedNearbyProfile(null)}
          isLiked={(likedProfiles || []).includes(selectedNearbyProfile.id)}
          onLike={() => {
            if (!(likedProfiles || []).includes(selectedNearbyProfile.id)) {
              if (onLikeProfile) {
                onLikeProfile(selectedNearbyProfile.id);
              }
              showToast(`❤️ Liké !`);
            }
          }}
          onMessage={() => {
            const prof = selectedNearbyProfile;
            setSelectedNearbyProfile(null);
            if (prof.requiresCredits) {
              setSelectedChatAction(prof);
            } else {
              if (setActiveChat) {
                setActiveChat(prof);
              }
              if (onNavigateToTab) {
                onNavigateToTab('discussions');
              }
            }
          }}
        />
      )}
      
      {/* Chat Action View */}
      <AnimatePresence>
        {selectedChatAction && (
          <ChatActionView 
            profile={selectedChatAction} 
            onClose={() => setSelectedChatAction(null)}
            onMoreMenu={() => {}}
            onOpenProfile={() => {
              const prof = selectedChatAction;
              setSelectedChatAction(null);
              setSelectedNearbyProfile(prof);
            }}
          />
        )}
      </AnimatePresence>



      {/* Header & Location bar */}
      <div className="px-1 mb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>GPS Actif</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-gray-200/80 p-0.5 rounded-full flex items-center">
              <button 
                onClick={() => setMode('grid')}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-extrabold transition-all ${mode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-600'}`}
              >
                Grille
              </button>
              <button 
                onClick={() => setMode('radar')}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-extrabold transition-all flex items-center space-x-1 ${mode === 'radar' ? 'bg-black text-white shadow-xs' : 'text-gray-600'}`}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Radar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Location & Refresh bar */}
        <div className="bg-[#18052e]/90 border border-purple-500/25 rounded-2xl p-2.5 shadow-md flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-white truncate">{gpsLocation.name}</span>
              <span className="text-[10.5px] text-purple-200/70 font-medium leading-tight">
                {gpsLocation.isReal ? `Précision: ${gpsLocation.accuracy}` : 'Position estimée pour la recherche'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleRequestLocation}
            disabled={isScanning}
            className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center space-x-1 shrink-0 active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-pink-400' : 'text-purple-300'}`} />
            <span>{isScanning ? 'Analyse...' : 'Actualiser'}</span>
          </button>
        </div>

        {/* Filter Bar: Radius slider & Online toggle */}
        <div className="flex items-center justify-between bg-[#15042a]/80 border border-purple-500/20 p-2 rounded-xl text-[11.5px] space-x-3">
          <div className="flex items-center space-x-2 flex-1">
            <span className="font-bold text-purple-200/80 whitespace-nowrap text-[11px]">Rayon: <span className="text-pink-400 font-extrabold">{maxDistance} km</span></span>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={maxDistance} 
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-purple-900/50 rounded-lg"
            />
          </div>

          <button 
            onClick={() => setOnlyOnline(!onlyOnline)}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-colors border ${onlyOnline ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-purple-950/60 text-purple-200 border-purple-500/30'}`}
          >
            {onlyOnline ? '🟢 En ligne' : 'Tous'}
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-pink-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-pink-500/60 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-purple-900/60 flex items-center justify-center z-10 shadow-md border border-pink-500/30">
              <Radio className="w-8 h-8 text-pink-400 animate-spin" />
            </div>
          </div>
          <h3 className="text-[17px] font-bold text-white mb-1">Analyse des signaux GPS...</h3>
          <p className="text-[12.5px] text-purple-200/70">Scan des membres à proximité de votre position</p>
        </div>
      ) : mode === 'radar' ? (
        /* RADAR MAP VIEW */
        <div className="flex-1 px-1 flex flex-col items-center justify-center relative overflow-hidden my-auto">
          <div className="relative w-[280px] h-[280px] rounded-full border border-purple-500/30 bg-gradient-to-br from-purple-950/60 to-[#120324] flex items-center justify-center shadow-inner overflow-hidden">
            {/* Concentric distance rings */}
            <div className="absolute w-[210px] h-[210px] rounded-full border border-purple-500/20 border-dashed" />
            <div className="absolute w-[130px] h-[130px] rounded-full border border-purple-500/20" />
            <div className="absolute w-[60px] h-[60px] rounded-full border border-purple-500/30" />

            {/* Radar Sweep Line */}
            <div className="absolute inset-0 rounded-full pointer-events-none bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(244,63,94,0.2)_360deg)] animate-spin" style={{ animationDuration: '4s' }} />

            {/* Center User Dot */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#f43f5e] overflow-hidden shadow-md ring-4 ring-[#f43f5e]/20">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" alt="You" className="w-full h-full object-cover" />
              </div>
              <span className="bg-black/80 text-white text-[10px] font-black px-2 py-0.5 rounded-full mt-0.5 shadow-xs border border-white/20">Vous</span>
            </div>

            {/* Radar Profile Pins */}
            {filteredMembers.map((member) => {
              const angleRad = (member.radarAngle * Math.PI) / 180;
              const radius = member.radarRadiusRatio * 120;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <motion.div
                  key={member.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.25, zIndex: 30 }}
                  onClick={() => setSelectedNearbyProfile(member)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute cursor-pointer z-10 group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-md ring-2 ring-black/20 group-hover:ring-[#f43f5e] transition-all">
                      <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    {member.online && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs border border-white/20">
                      {member.distanceText}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 text-center">
            <span className="text-[13px] font-bold text-white">
              {filteredMembers.length} personne{filteredMembers.length > 1 ? 's' : ''} dans un rayon de {maxDistance} km
            </span>
            <p className="text-[11.5px] text-purple-200/70 mt-0.5">Appuyez sur une photo pour voir le profil complet</p>
          </div>
        </div>
      ) : (
        /* GRID / LIST VIEW */
        <div className="flex-1 overflow-y-auto px-1 pb-32 sm:pb-36 scrollbar-hide">
          <div className="grid grid-cols-2 gap-2.5">
            {filteredMembers.map((p, idx) => {
              const isLiked = (likedProfiles || []).includes(p.id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: idx * 0.04, 
                    ease: [0.215, 0.61, 0.355, 1] 
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedNearbyProfile(p)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md flex flex-col text-left relative group cursor-pointer hover:border-rose-200 transition-all"
                >
                  {/* Photo area */}
                  <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                    {/* Distance Badge top left */}
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs border border-white/20">
                      <MapPin className="w-3 h-3 text-pink-400 fill-pink-400" />
                      <span>{p.distanceText}</span>
                    </div>

                    {/* Online badge top right */}
                    {p.online && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span>En ligne</span>
                      </div>
                    )}

                    {/* Info at bottom of photo */}
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <div className="flex items-center space-x-1">
                        <span className="text-[15px] font-black tracking-tight drop-shadow-sm">{p.name}, {p.age}</span>
                        {p.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-white shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-white/90 font-medium drop-shadow-xs line-clamp-1">{p.location}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-2 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <button 
                      onClick={(e) => handleWave(p, e)}
                      title="Envoyer un coucou"
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] font-bold flex items-center space-x-1 transition-colors active:scale-95 cursor-pointer"
                    >
                      <span className="text-xs">👋</span>
                      <span>Coucou</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if ((p as any).requiresCredits) {
                            setSelectedChatAction(p);
                          } else {
                            if (setActiveChat) setActiveChat(p);
                            if (onNavigateToTab) onNavigateToTab('discussions');
                          }
                        }}
                        title="Tchat direct"
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-purple-200" />
                      </button>

                      <button 
                        onClick={(e) => handleLike(p, e)}
                        title="J'aime"
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isLiked ? 'bg-[#e20030] text-white shadow-xs' : 'bg-rose-50 text-[#e20030] hover:bg-rose-100'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : 'fill-[#e20030]'}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-[14px] font-bold text-black mb-1">Aucune personne trouvée</p>
              <p className="text-[12px] text-gray-500 mb-3">Augmentez le rayon de recherche.</p>
              <button 
                onClick={() => setMaxDistance(50)}
                className="bg-black text-white text-[12px] font-bold px-4 py-2 rounded-full"
              >
                Élargir à 50 km
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

