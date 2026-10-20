import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EncountersProfiles } from './EncountersProfiles';
import { MapPin, Loader2, Zap, SlidersHorizontal } from 'lucide-react';
import { EncountersFiltersMenu } from './EncountersFilters';
import { ExtraShowsMenu } from '../Monetization';
import { LocationBlockedTutorialModal } from '../settings/LocationPermissionTutorialModal';
import { EngagementNudgeBanner } from '../../../features/nudging/components/EngagementNudgeBanner';
import { useUX } from '../../../context/UXContext';
import { PullToRefresh } from '../ui/PullToRefresh';

// ============================================
// 1. TYPES
// ============================================

export interface EncountersTabProps {
  onNavigateToTab?: (tab: string) => void;
  genderPreference?: 'homme' | 'femme' | 'les_deux';
  setGenderPreference?: (pref: 'homme' | 'femme' | 'les_deux') => void;
  likedProfiles?: number[];
  setLikedProfiles?: React.Dispatch<React.SetStateAction<number[]>>;
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
  onRefresh?: () => Promise<void>;
  onPermissionGranted?: () => void;
  userMood?: { emoji: string; label: string } | null;
  onOpenMoods?: () => void;
}

// ============================================
// 2. ÉTAT DE GÉOLOCALISATION
// ============================================

interface GeolocationState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'denied';
  error?: string;
  position?: GeolocationPosition;
}

// ============================================
// 3. COMPOSANT PRINCIPAL
// ============================================

export function EncountersTab(props: EncountersTabProps) {
  const [showProfiles, setShowProfiles] = useState(false);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  const [geolocationState, setGeolocationState] = useState<GeolocationState>({
    status: 'idle',
  });
  const [showBlockedTutorial, setShowBlockedTutorial] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showExtraShows, setShowExtraShows] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [distanceRange, setDistanceRange] = useState<[number, number]>([1, 50]);
  const [advancedFilters, setAdvancedFilters] = useState<any>({
    intent: 'Tous',
    verifiedOnly: false,
    onlineOnly: false,
    photosOnly: true,
  });

  const { registerSubmenu, unregisterSubmenu } = useUX();

  const isAnySubmenuOpen = Boolean(
    showFilters ||
    showExtraShows ||
    showBlockedTutorial
  );

  useEffect(() => {
    if (isAnySubmenuOpen) {
      registerSubmenu('encounters_tab_submenus');
    } else {
      unregisterSubmenu('encounters_tab_submenus');
    }
    return () => {
      unregisterSubmenu('encounters_tab_submenus');
    };
  }, [isAnySubmenuOpen, registerSubmenu, unregisterSubmenu]);

  // ============================================
  // 4. VÉRIFICATION DE LA PERMISSION AU CHARGEMENT
  // ============================================

  useEffect(() => {
    const checkExistingPermission = async () => {
      if (!navigator.permissions) {
        setHasCheckedPermission(true);
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 3000,
              maximumAge: 60000,
            });
          });
          setGeolocationState({ status: 'success', position });
          setShowProfiles(true);
        } catch {
          setShowProfiles(false);
        }
        return;
      }

      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        
        if (result.state === 'granted') {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 60000,
              });
            });
            setGeolocationState({ status: 'success', position });
            setShowProfiles(true);
          } catch {
            setGeolocationState({ status: 'error', error: 'Impossible d\'obtenir la position' });
            setShowProfiles(false);
          }
        } else if (result.state === 'denied') {
          setGeolocationState({ status: 'denied' });
          setShowProfiles(false);
        } else {
          setShowProfiles(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        setShowProfiles(false);
      } finally {
        setHasCheckedPermission(true);
      }
    };

    checkExistingPermission();

    const handlePermissionChange = async () => {
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') {
            setGeolocationState({ status: 'idle' });
            setShowProfiles(true);
          } else if (result.state === 'denied') {
            setGeolocationState({ status: 'denied' });
          }
        } catch {
          // Ignorer
        }
      }
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          result.addEventListener('change', handlePermissionChange);
          return () => result.removeEventListener('change', handlePermissionChange);
        })
        .catch(() => {});
    }
  }, []);

  // ============================================
  // 5. DEMANDE DE GÉOLOCALISATION
  // ============================================

  const requestGeolocation = useCallback(async () => {
    setGeolocationState({ status: 'loading' });

    try {
      if (!navigator.geolocation) {
        setGeolocationState({
          status: 'error',
          error: 'Votre navigateur ne supporte pas la géolocalisation',
        });
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Délai d\'attente dépassé (15s)'));
        }, 15000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });

      setGeolocationState({
        status: 'success',
        position,
      });

      props.onPermissionGranted?.();
      await new Promise((resolve) => setTimeout(resolve, 300));
      setShowProfiles(true);
      props.loadSupabaseData?.();

    } catch (error: any) {
      console.error('Erreur de géolocalisation:', error);
      let errorMessage = 'Impossible d\'obtenir votre position';
      
      if (error.code === 1 || error.code === (window as any).GeolocationPositionError?.PERMISSION_DENIED || error.message?.includes('denied')) {
        setGeolocationState({
          status: 'denied',
          error: 'Vous avez refusé l\'accès à votre position',
        });
        setShowBlockedTutorial(true);
        return;
      } else if (error.code === 2) {
        errorMessage = 'Position indisponible (signal GPS faible)';
      } else if (error.code === 3) {
        errorMessage = 'Délai d\'attente dépassé';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'La demande a pris trop de temps';
      }

      setGeolocationState({
        status: 'error',
        error: errorMessage,
      });

      setRetryCount((prev) => prev + 1);
    }
  }, [props.onPermissionGranted, props.loadSupabaseData]);

  const handleSkip = useCallback(() => {
    setShowProfiles(true);
  }, []);

  // ============================================
  // 8. RENDU - ÉCRAN DE PERMISSION (100% Conforme au Design)
  // ============================================

  const renderPermissionScreen = () => {
    const isLoading = geolocationState.status === 'loading';

    return (
      <div className="pt-1 sm:pt-2 px-3 sm:px-4 h-full flex flex-col relative pb-3 bg-slate-50 text-slate-900 select-none">
        {/* Modals pour filtres et extra shows */}
        {showFilters && (
          <EncountersFiltersMenu 
            onClose={() => setShowFilters(false)} 
            genderPreference={props.genderPreference}
            setGenderPreference={props.setGenderPreference}
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
            }} 
          />
        )}

        <EngagementNudgeBanner />

        {/* 1. Header Bar */}
        <div className="pt-1 pb-2 flex items-center justify-between shrink-0">
          <h1 className="text-[24px] sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Rencontres
          </h1>
          <div className="flex items-center space-x-3.5">
            <button 
              onClick={() => setShowExtraShows(true)} 
              className="p-1.5 relative transition-transform active:scale-90 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200"
              title="Extra Shows"
            >
              <Zap className="w-5 h-5 text-rose-500 fill-rose-500" strokeWidth={2.2} />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#f43f5e] rounded-full ring-2 ring-white"></div>
            </button>
            <button 
              onClick={() => setShowFilters(true)}
              className="p-1.5 text-slate-700 hover:text-slate-900 transition-transform active:scale-90 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200"
              title="Filtres"
            >
              <SlidersHorizontal className="w-5 h-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* 2. Main Rounded Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 rounded-[28px] sm:rounded-[32px] border border-slate-200 bg-white flex flex-col items-center justify-center p-6 shadow-md relative overflow-hidden"
        >
          {/* Centered Content */}
          <div className="flex flex-col items-center justify-center text-center max-w-xs mx-auto -mt-6">
            
            {/* Soft Coral/Pink Gradient Circle with Location Pin */}
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500/15 to-purple-500/15 border border-rose-200 flex items-center justify-center mb-6 shadow-sm"
            >
              <MapPin className="w-8 h-8 text-rose-500 fill-rose-500" strokeWidth={1.5} />
            </motion.div>

            {/* Title: Trouvez des personnes à proximité */}
            <h2 className="text-[20px] sm:text-[23px] font-extrabold text-slate-900 tracking-tight text-center mb-2 leading-snug px-2">
              Trouvez des personnes à proximité
            </h2>

            {/* Subtitle */}
            <p className="text-slate-500 text-[13px] sm:text-[14px] font-normal text-center mb-7 max-w-[280px] leading-relaxed px-2">
              Donnez-nous accès à votre géolocalisation pour voir qui est dans le coin.
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col items-center space-y-3.5">
              {/* Primary Button: Autoriser */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={isLoading}
                onClick={requestGeolocation}
                className="w-full max-w-[200px] sm:max-w-[220px] bg-gradient-to-r from-[#f43f5e] to-[#ec4899] hover:opacity-95 text-white font-extrabold py-3.5 rounded-full text-[15px] sm:text-[16px] shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                    <span>Localisation...</span>
                  </>
                ) : (
                  <span>Autoriser</span>
                )}
              </motion.button>

              {/* Secondary Link: Peut-être plus tard */}
              <button
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-700 text-[13.5px] sm:text-[14px] font-medium transition-colors py-1 cursor-pointer active:scale-95"
              >
                Peut-être plus tard
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    );
  };

  // ============================================
  // 9. RENDU PRINCIPAL
  // ============================================

  return (
    <>
      <AnimatePresence mode="wait">
        {showProfiles ? (
          <motion.div
            key="profiles"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <PullToRefresh onRefresh={props.onRefresh || (async () => {})}>
              <EncountersProfiles 
                {...props} 
                userPosition={geolocationState.position}
              />
            </PullToRefresh>
          </motion.div>
        ) : (
          <PullToRefresh onRefresh={props.onRefresh || (async () => {})}>
            {renderPermissionScreen()}
          </PullToRefresh>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBlockedTutorial && (
          <LocationBlockedTutorialModal
            onClose={() => setShowBlockedTutorial(false)}
            onRetry={async () => {
              setShowBlockedTutorial(false);
              await requestGeolocation();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// 10. EXPORT PAR DÉFAUT
// ============================================

export default EncountersTab;