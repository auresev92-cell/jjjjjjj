import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { 
  SlidersHorizontal, MapPin, Heart, MessageCircle, MessageCircleMore, User as UserIcon, 
  Settings, HelpCircle, Camera, CameraOff, Zap, Search, Bell, Gauge, Edit3, Mail,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Smile, Plus, Copy, MoreHorizontal, Lock, CheckCircle, Check, X, Star, Shield, Eye, EyeOff, FileText, RotateCcw,
  Navigation, Baby, Target, Ruler, Languages, Wine, Sparkles, Dog, Brain, Flame, Cigarette, GraduationCap, BookOpen, Coffee, Clapperboard, ChevronsUp, Megaphone, Battery, Send,
  Radio, Locate, LocateFixed, RefreshCw, Map, Compass, Image as ImageIcon, Briefcase,
  Phone, Video, Mic, CheckCheck, Gift, Ban, ThumbsUp, ArrowUp, Coins, Crown, Volume2, VolumeX, UserX, PhoneOff, MicOff, VideoOff, Play, Pause, Trash2, Hand, Users, Pencil
} from 'lucide-react';
import { User } from '../../../types';
import BavelPremiumModal from '../../modals/BavelPremiumModal';
import { PhotoAdviceModal } from '../../modals/PhotoAdviceModal';
import { EditProfileMenu } from './EditProfileMenu';
import { SafetyCentreMenu, CommunityCharterMenu } from '../SafetyCentreMenu';
import { FullProfilePhotoModal, AddMediaSourceMenu, FacebookInfoModal } from '../Modals';
import { AllFeaturesModal, BavelComparisonModal, RechargeCreditsMenu, BavelExtraModal } from '../Monetization';
import { SettingsMenu, HelpCenterMenu, LookingForMenu, ActivityMenu, InvisibleModeMenu, ConfidentialityMenu, TextSizeSettingsMenu } from '../SettingsMenu';
import { syncProfileToSupabase } from '../../../lib/supabase';
import { SelfieVerificationModal } from '../../../features/security';
import { CreditsStoreModal, ProfileBoostModal, PremiumPassModal } from '../../../features/monetization';
import { PopularityDashboard, QuestsAndRewardsModal } from '../../../features/gamification';
import { monetizationService } from '../../../services/monetizationService';
import { aiSystemEngine } from '../../../services/aiSystemEngine';
import { securityService } from '../../../services/securityService';
import { gamificationService } from '../../../services/gamificationService';
import { ImageCompressionService } from '../../../services/media/imageCompression';
import { useUX } from '../../../context/UXContext';

export function ProfileTab({ 
  userMood, 
  onOpenMoods,
  userLookingFor = 'serieuse',
  setUserLookingFor,
  userPhotos = [],
  setUserPhotos,
  userProfile,
  setUserProfile,
  onLogout,
  textScale,
  onChangeTextScale,
  onOpenAdmin
}: { 
  userMood?: { emoji: string; label: string } | null; 
  onOpenMoods?: () => void;
  userLookingFor?: 'serieuse' | 'discuter' | 'rencontres';
  setUserLookingFor?: (val: 'serieuse' | 'discuter' | 'rencontres') => void;
  userPhotos?: string[];
  setUserPhotos?: React.Dispatch<React.SetStateAction<string[]>>;
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
  onLogout?: () => void;
  textScale: number;
  onChangeTextScale: (scale: number) => void;
  onOpenAdmin?: () => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'abonnements' | 'securite'>('abonnements');
  const [expandedDossier, setExpandedDossier] = useState<'activite' | 'credits' | 'premium' | 'extra' | null>('premium');
  const [subCardIndex, setSubCardIndex] = useState<number>(0);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const clientWidth = carouselRef.current.clientWidth;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth);
      setActiveCarouselIndex(index);
      setSubCardIndex(index);
    }
  };

  const scrollCarouselToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const clientWidth = carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth'
    });
    setActiveCarouselIndex(index);
    setSubCardIndex(index);
  };
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileInitialSubEditor, setEditProfileInitialSubEditor] = useState<'none' | 'basic' | 'job_studies' | 'description' | 'detail_picker' | 'interests' | 'verification' | 'phone'>('none');
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showLookingForMenu, setShowLookingForMenu] = useState(false);
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showInvisibleMode, setShowInvisibleMode] = useState(false);
  const [showConfidentiality, setShowConfidentiality] = useState(false);
  const [showCommunityCharter, setShowCommunityCharter] = useState(false);
  const [showSafetyCentre, setShowSafetyCentre] = useState(false);
  const [showRechargeCredits, setShowRechargeCredits] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState<{ open: boolean; tab: 'extra' | 'premium' }>({ open: false, tab: 'extra' });
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumSlideId, setPremiumSlideId] = useState<string | undefined>(undefined);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showPhotoAdvice, setShowPhotoAdvice] = useState(false);
  const [showSelfieVerification, setShowSelfieVerification] = useState(false);
  const [showCreditsStore, setShowCreditsStore] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showVipPassModal, setShowVipPassModal] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [isVerified, setIsVerified] = useState(securityService.isVerified());
  const [creditsBalance, setCreditsBalance] = useState(monetizationService.getCredits());

  useEffect(() => {
    const unsubMonetization = monetizationService.subscribe(() => {
      setCreditsBalance(monetizationService.getCredits());
    });
    return unsubMonetization;
  }, []);

  // Desktop real-time camera states
  const [showDesktopCamera, setShowDesktopCamera] = useState(false);
  const [desktopStream, setDesktopStream] = useState<MediaStream | null>(null);
  const [desktopCameraError, setDesktopCameraError] = useState<string | null>(null);
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const desktopCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const desktopStreamRef = useRef<MediaStream | null>(null);

  const [fbModal, setFbModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'success' | 'error' } | null>(null);

  // States for notification permission
  const [notificationsAuthorized, setNotificationsAuthorized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications_authorized') === 'true';
    }
    return false;
  });
  const [dismissedReminder, setDismissedReminder] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notification_reminder_dismissed') === 'true';
    }
    return false;
  });
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const { registerSubmenu, unregisterSubmenu } = useUX();

  const isAnySubmenuOpen = Boolean(
    showSettings ||
    showEditProfile ||
    showHelpCenter ||
    showLookingForMenu ||
    showActivityMenu ||
    showInvisibleMode ||
    showConfidentiality ||
    showCommunityCharter ||
    showSafetyCentre ||
    showRechargeCredits ||
    showAllFeatures.open ||
    showComparisonModal ||
    showExtraModal ||
    showPremiumModal ||
    showFullPhoto ||
    showAddMedia ||
    showPhotoAdvice ||
    showSelfieVerification ||
    showCreditsStore ||
    showBoostModal ||
    showVipPassModal ||
    showQuestsModal ||
    showTextSizeModal ||
    showDesktopCamera ||
    showPermissionDialog ||
    (fbModal && fbModal.isOpen)
  );

  useEffect(() => {
    if (isAnySubmenuOpen) {
      registerSubmenu('profile_submenus');
    } else {
      unregisterSubmenu('profile_submenus');
    }
    return () => {
      unregisterSubmenu('profile_submenus');
    };
  }, [isAnySubmenuOpen, registerSubmenu, unregisterSubmenu]);

  const handleEnableNotifications = () => {
    setShowPermissionDialog(true);
  };

  const handleAuthorize = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications_authorized', 'true');
    }
    setNotificationsAuthorized(true);
    setShowPermissionDialog(false);
  };

  const handleRefuse = () => {
    setShowPermissionDialog(false);
  };

  const handleDismissReminder = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification_reminder_dismissed', 'true');
    }
    setDismissedReminder(true);
  };

  const filledCount = userPhotos.filter(Boolean).length;
  let score = 20; // Base
  score += filledCount * 5; 
  if (userProfile?.bio && userProfile.bio.length > 10) score += 15;
  if (userProfile?.job || userProfile?.studies) score += 10;
  if (userProfile?.interests && userProfile.interests.length > 0) score += 10;
  if (userProfile?.details?.prompts && userProfile.details.prompts.length > 0) score += 15;
  const completionPercentage = Math.min(100, score);
  const circumference = 276.46;

  // Animating completion percentage with Framer Motion animate
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    let active = true;
    
    // Always start from 0 on initial mount of the Profile tab to showcase the full animation
    setAnimatedPercentage(0);

    const delayTimer = setTimeout(() => {
      if (!active) return;
      
      const controls = animate(0, completionPercentage, {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo: fast and elegant acceleration
        onUpdate: (latest) => {
          if (active) {
            setAnimatedPercentage(Math.round(latest));
          }
        }
      });
      
      return () => controls.stop();
    }, 240); // 240ms delay to wait for the page transition to settle perfectly

    return () => {
      active = false;
      clearTimeout(delayTimer);
    };
  }, [completionPercentage]);

  const strokeDashoffset = circumference - (circumference * animatedPercentage) / 100;

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const file = validFiles[0];
    try {
      const compressed = await ImageCompressionService.compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        format: 'image/webp',
      });
      const base64 = compressed.dataUrl;

      setUserPhotos?.(prev => {
        const slotToUse = prev.findIndex(p => !p);
        let updated;
        if (slotToUse === -1) {
          updated = [...prev, base64];
        } else {
          updated = [...prev];
          updated[slotToUse] = base64;
        }
        syncProfileToSupabase(userProfile, updated);
        return updated;
      });
    } catch (err) {
      console.warn("Image compression fallback:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (!base64) return;

        setUserPhotos?.(prev => {
          const slotToUse = prev.findIndex(p => !p);
          let updated;
          if (slotToUse === -1) {
            updated = [...prev, base64];
          } else {
            updated = [...prev];
            updated[slotToUse] = base64;
          }
          syncProfileToSupabase(userProfile, updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Check if current device is a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const startDesktopCamera = async () => {
    try {
      setDesktopCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      desktopStreamRef.current = mediaStream;
      setDesktopStream(mediaStream);
      if (desktopVideoRef.current) {
        desktopVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera stream unavailable, opening native file dialog:", err);
      setShowDesktopCamera(false);
      cameraInputRef.current?.click();
    }
  };

  const stopDesktopCamera = () => {
    if (desktopStreamRef.current) {
      desktopStreamRef.current.getTracks().forEach(track => track.stop());
      desktopStreamRef.current = null;
    }
    setDesktopStream(null);
    setShowDesktopCamera(false);
  };

  // Manage starting/stopping desktop camera based on visibility state
  useEffect(() => {
    if (showDesktopCamera) {
      startDesktopCamera();
    } else {
      stopDesktopCamera();
    }

    return () => {
      if (desktopStreamRef.current) {
        desktopStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [showDesktopCamera]);

  const captureDesktopPhoto = () => {
    if (desktopVideoRef.current && desktopCanvasRef.current) {
      const video = desktopVideoRef.current;
      const canvas = desktopCanvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Horizontal flip for a natural selfie preview
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Emulate processFiles on the captured Data URL
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "captured_selfie.jpg", { type: "image/jpeg" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            processFiles(dataTransfer.files);
          });
        
        // Stop the camera
        stopDesktopCamera();
      }
    }
  };

  const handleFacebookSync = async () => {
    try {
      const res = await fetch("/api/auth/facebook/url");
      const data = await res.json();
      if (data.error === "FACEBOOK_CREDS_MISSING") {
        setFbModal({
          isOpen: true,
          title: "Configuration requise",
          message: `${data.message}\n\nPour connecter un vrai compte, allez dans AI Studio (Settings > Secrets) et ajoutez les variables FACEBOOK_CLIENT_ID et FACEBOOK_CLIENT_SECRET.`,
          type: 'info'
        });
        return;
      }
      if (data.url) {
        const fbWindow = window.open(data.url, "Facebook", "width=600,height=700");
        if (!fbWindow) {
          setFbModal({
            isOpen: true,
            title: "Fenêtre bloquée",
            message: "Votre navigateur a bloqué l'ouverture de l'écran de connexion Facebook. Veuillez autoriser les fenêtres contextuelles (popups) pour Bavel.",
            type: 'error'
          });
        }
      } else {
        setFbModal({
          isOpen: true,
          title: "Erreur de connexion",
          message: "Impossible de générer l'adresse de connexion Facebook.",
          type: 'error'
        });
      }
    } catch (err) {
      console.error("Facebook auth initiation error:", err);
      setFbModal({
        isOpen: true,
        title: "Erreur",
        message: "Une erreur est survenue lors de l'initiation de la connexion Facebook.",
        type: 'error'
      });
    }
  };

  useEffect(() => {
    const handleFbMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'FACEBOOK_SYNC_SUCCESS') {
        const base64Photo = event.data.photo;
        const fbName = event.data.name;
        if (base64Photo) {
          setUserPhotos?.(prev => {
            const slotToUse = prev.findIndex(p => !p);
            if (slotToUse === -1) {
              return [...prev, base64Photo];
            }
            const updated = [...prev];
            updated[slotToUse] = base64Photo;
            return updated;
          });
        }
        if (fbName) {
          setFbModal({
            isOpen: true,
            title: "Synchronisation Réussie !",
            message: `Félicitations ! Le profil Facebook de "${fbName}" a été lié à votre compte Bavel avec succès.`,
            type: 'success'
          });
        }
        setShowAddMedia(false);
      }
    };
    window.addEventListener('message', handleFbMessage);
    return () => window.removeEventListener('message', handleFbMessage);
  }, [setUserPhotos]);

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white overflow-y-auto overflow-x-hidden pb-36 no-scrollbar selection:bg-[#f43f5e] selection:text-white">
      {/* Ambient Atmospheric Glows uniformes avec le Splash Screen */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-600/25 rounded-full blur-[100px] pointer-events-none" />
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleGalleryChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleCameraChange} 
        accept="image/*" 
        capture="user" 
        className="hidden" 
      />
      {showSettings && (
        <SettingsMenu 
          onClose={() => setShowSettings(false)} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onLogout={onLogout}
          textScale={textScale}
          onChangeTextScale={onChangeTextScale}
          onOpenAdmin={onOpenAdmin}
        />
      )}
      {showTextSizeModal && (
        <TextSizeSettingsMenu
          onClose={() => setShowTextSizeModal(false)}
          textScale={textScale}
          onChangeTextScale={onChangeTextScale}
        />
      )}
      {showEditProfile && (
        <EditProfileMenu 
          onClose={() => setShowEditProfile(false)} 
          userPhotos={userPhotos} 
          setUserPhotos={setUserPhotos} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          initialSubEditor={editProfileInitialSubEditor}
          userMood={userMood}
        />
      )}
      {showHelpCenter && <HelpCenterMenu onClose={() => setShowHelpCenter(false)} />}
      <AnimatePresence>
        {showSafetyCentre && (
          <SafetyCentreMenu 
            onClose={() => setShowSafetyCentre(false)}
            userName={userProfile?.name || 'Steven'}
            onOpenVerification={() => {
              setEditProfileInitialSubEditor('verification');
              setShowEditProfile(true);
            }}
            onOpenConfidentiality={() => setShowConfidentiality(true)}
            onOpenInvisibleMode={() => setShowInvisibleMode(true)}
          />
        )}
        {showRechargeCredits && (
          <RechargeCreditsMenu onClose={() => setShowRechargeCredits(false)} />
        )}
        {showAllFeatures.open && (
          <AllFeaturesModal 
            initialTab={showAllFeatures.tab} 
            onClose={() => setShowAllFeatures({ open: false, tab: 'extra' })} 
            onOpenExtra={() => setShowExtraModal(true)}
            onOpenPremium={() => setShowPremiumModal(true)}
          />
        )}
        {showComparisonModal && (
          <BavelComparisonModal 
            onClose={() => setShowComparisonModal(false)}
            onOpenExtra={() => setShowExtraModal(true)}
            onOpenPremium={() => setShowPremiumModal(true)}
          />
        )}
        {showExtraModal && (
          <BavelExtraModal 
            onClose={() => setShowExtraModal(false)}
            onOpenComparison={() => {
              setShowExtraModal(false);
              setShowComparisonModal(true);
            }}
            onSwitchToPremium={() => {
              setShowExtraModal(false);
              setShowPremiumModal(true);
            }}
          />
        )}
        {showPremiumModal && (
          <BavelPremiumModal 
            onClose={() => {
              setShowPremiumModal(false);
              setPremiumSlideId(undefined);
            }} 
            initialSlideId={premiumSlideId}
            onOpenComparison={() => {
              setShowPremiumModal(false);
              setShowComparisonModal(true);
            }}
            onSwitchToExtra={() => {
              setShowPremiumModal(false);
              setShowExtraModal(true);
            }}
          />
        )}
        {showInvisibleMode && (
          <InvisibleModeMenu 
            onClose={() => setShowInvisibleMode(false)} 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}
        {showActivityMenu && (
          <ActivityMenu 
            onClose={() => setShowActivityMenu(false)} 
            userId={userProfile?.id}
          />
        )}
        {showConfidentiality && <ConfidentialityMenu onClose={() => setShowConfidentiality(false)} />}
        {showCommunityCharter && <CommunityCharterMenu onClose={() => setShowCommunityCharter(false)} />}
        {showAddMedia && (
          <AddMediaSourceMenu 
            onClose={() => setShowAddMedia(false)} 
            onSelectGallery={() => galleryInputRef.current?.click()}
            onSelectCamera={() => {
              if (isMobileDevice()) {
                cameraInputRef.current?.click();
              } else {
                setShowDesktopCamera(true);
              }
              setShowAddMedia(false);
            }}
            onSyncFacebook={() => handleFacebookSync()}
            onOpenAdvice={() => setShowPhotoAdvice(true)}
          />
        )}
        {showPhotoAdvice && (
          <PhotoAdviceModal 
            onClose={() => setShowPhotoAdvice(false)} 
            onAddPhoto={() => setShowAddMedia(true)}
          />
        )}
        {showFullPhoto && (
          <FullProfilePhotoModal 
            onClose={() => setShowFullPhoto(false)} 
            userPhotos={userPhotos} 
            userProfile={userProfile} 
            userMood={userMood}
            onOpenEditProfile={() => {
              setEditProfileInitialSubEditor('none');
              setShowEditProfile(true);
            }}
            onOpenAddMedia={() => setShowAddMedia(true)}
          />
        )}
        {showDesktopCamera && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopDesktopCamera}
              className="absolute inset-0 bg-black/80 z-[150]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 z-[160] rounded-[24px] p-6 flex flex-col items-center text-center shadow-2xl w-[90%] max-w-[420px] text-white"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <span className="text-[15px] font-extrabold tracking-wide uppercase text-zinc-400">
                  Appareil Photo
                </span>
                <button 
                  onClick={stopDesktopCamera}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {desktopCameraError ? (
                <div className="flex flex-col items-center space-y-4 my-6">
                  <CameraOff className="w-12 h-12 text-red-500" />
                  <p className="text-[14px] text-zinc-300 px-4 leading-relaxed">
                    {desktopCameraError}
                  </p>
                </div>
              ) : (
                <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-inner my-2">
                  <video
                    ref={desktopVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {!desktopStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                      <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
                      <span className="text-[12px] font-bold">Initialisation...</span>
                    </div>
                  )}
                </div>
              )}

              <canvas ref={desktopCanvasRef} className="hidden" />

              <div className="flex items-center justify-center space-x-8 w-full mt-6 pb-2">
                <button
                  type="button"
                  onClick={stopDesktopCamera}
                  className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all active:scale-95 flex items-center justify-center shadow-md"
                  title="Annuler"
                >
                  <X className="w-5 h-5" />
                </button>
                {!desktopCameraError && desktopStream && (
                  <button
                    type="button"
                    onClick={captureDesktopPhoto}
                    className="w-16 h-16 bg-[#e20030] hover:bg-[#ff1643] text-white rounded-full transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-[#e20030]/30 border-4 border-zinc-800"
                    title="Prendre la photo"
                  >
                    <Camera className="w-7 h-7" />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FacebookInfoModal 
        isOpen={!!fbModal} 
        onClose={() => setFbModal(null)} 
        title={fbModal?.title || ""} 
        message={fbModal?.message || ""} 
        type={fbModal?.type} 
      />

      {showPermissionDialog && (
        <div className="absolute inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 select-none">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-[280px] bg-[#1a0832]/98 border border-purple-500/30 rounded-[22px] backdrop-blur-2xl text-center overflow-hidden shadow-2xl shadow-purple-950/80"
          >
            <div className="p-4.5 pb-3.5">
              <div className="w-11 h-11 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-[#2dd4bf]/20 via-[#ec4899]/20 to-[#8b5cf6]/20 border border-purple-400/30 flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#f43f5e]" />
              </div>
              <h3 className="text-[14.5px] sm:text-[15.5px] font-bold text-white leading-tight tracking-tight">
                « Bavel » souhaite vous envoyer des notifications
              </h3>
              <p className="text-[11.5px] sm:text-[12.5px] text-purple-200/80 mt-1.5 leading-normal">
                Les notifications peuvent inclure des alertes, des sons et des badges d'icônes pour vos nouveaux Matchs et messages.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-purple-500/20 text-[13.5px] font-semibold divide-x divide-purple-500/20">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="button" 
                onClick={handleRefuse}
                className="py-3 text-purple-300/70 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                Refuser
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="button" 
                onClick={handleAuthorize}
                className="py-3 text-pink-300 hover:text-white hover:bg-white/5 active:bg-white/10 font-bold transition-colors cursor-pointer"
              >
                Autoriser
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      {showLookingForMenu && (
        <LookingForMenu 
          onClose={() => setShowLookingForMenu(false)} 
          selected={userLookingFor}
          onSelect={(val) => {
            if (setUserLookingFor) setUserLookingFor(val);
            if (setUserProfile) {
              setUserProfile((prev: any) => {
                const updated = {
                  ...prev,
                  lookingFor: val
                };
                syncProfileToSupabase(updated, userPhotos);
                return updated;
              });
            }
          }}
        />
      )}
      {showActivityMenu && <ActivityMenu onClose={() => setShowActivityMenu(false)} />}
      
      {/* Screen Top Sticky Header */}
      <div className="flex justify-between items-center w-full px-4 sm:px-5 py-3 sticky top-0 z-40 bg-[#16042c]/95 backdrop-blur-md border-b border-purple-500/20 select-none">
        <h1 className="text-[21px] sm:text-[23px] font-extrabold text-white tracking-tight leading-none whitespace-nowrap">Profil</h1>
        <div className="flex items-center gap-1.5 sm:gap-2 text-white">
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowSettings(true)} 
            aria-label="Réglages" 
            className="w-9 h-9 rounded-full bg-[#240c44]/70 border border-purple-500/25 flex items-center justify-center text-purple-200 hover:text-white hover:bg-[#32115c]/80 transition-all cursor-pointer shadow-sm" 
            type="button"
          >
            <Settings className="w-4.5 h-4.5" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowHelpCenter(true)} 
            aria-label="Aide" 
            className="w-9 h-9 rounded-full bg-[#240c44]/70 border border-purple-500/25 flex items-center justify-center text-purple-200 hover:text-white hover:bg-[#32115c]/80 transition-all cursor-pointer shadow-sm" 
            type="button"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => { setEditProfileInitialSubEditor('none'); setShowEditProfile(true); }} 
            aria-label="Modifier profil" 
            className="w-9 h-9 rounded-full bg-[#240c44]/70 border border-purple-500/25 flex items-center justify-center text-purple-200 hover:text-white hover:bg-[#32115c]/80 transition-all cursor-pointer shadow-sm" 
            type="button"
          >
            <Pencil className="w-4.5 h-4.5" />
          </motion.button>
        </div>
      </div>

      {/* Profil Utilisateur */}
      <section className="px-4 sm:px-5 pt-3 pb-2 select-none">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#240c44]/75 border border-purple-500/25 backdrop-blur-md flex items-center gap-3.5 sm:gap-4 shadow-xl shadow-purple-950/40">
          <div 
            onClick={() => setShowFullPhoto(true)}
            className="relative flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-[80px] h-[80px] sm:w-[84px] sm:h-[84px] rounded-full p-[3px] border-2 border-purple-400/40 relative flex items-center justify-center shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden shadow-inner bg-[#1f093a] ring-1 ring-white/10">
                <img 
                  alt={`Photo de profil de ${userProfile?.name || 'Severin'}`} 
                  className="w-full h-full object-cover object-top scale-110" 
                  src={userPhotos[0] || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"} 
                />
              </div>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setEditProfileInitialSubEditor('none');
                setShowEditProfile(true);
              }}
              title="Compléter le profil"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/30 shadow-md flex items-center justify-center whitespace-nowrap active:scale-95 transition-transform"
            >
              {animatedPercentage} %
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight leading-none truncate">
                {userProfile?.name || 'Severin'}, {userProfile?.age || 18}
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#2dd4bf] shrink-0" title="En ligne"></span>
              {Boolean(isVerified || userProfile?.isVerified || localStorage.getItem('bavel_is_verified') === 'true' || localStorage.getItem('bavel_user_verified_liveness') === 'true') && (
                <span 
                  className="w-4.5 h-4.5 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#0084ff] text-white inline-flex items-center justify-center shrink-0 shadow-xs" 
                  title="Profil vérifié par photo"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
              )}
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLookingForMenu(true)}
              type="button"
              className="inline-flex items-center gap-1.5 bg-[#18052e]/80 text-purple-200 hover:text-white px-3 py-1.5 rounded-full w-fit border border-purple-500/30 backdrop-blur-md transition-all cursor-pointer text-left"
            >
              {userLookingFor === 'serieuse' ? (
                <Heart className="w-3.5 h-3.5 text-[#f43f5e] fill-[#f43f5e]" />
              ) : userLookingFor === 'discuter' ? (
                <MessageCircle className="w-3.5 h-3.5 text-pink-300" />
              ) : (
                <Coffee className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span className="font-semibold text-[12px] sm:text-[12.5px] text-purple-100 tracking-normal truncate">
                {userLookingFor === 'serieuse' ? 'Une histoire sérieuse' : userLookingFor === 'discuter' ? 'Discuter' : 'Des rencontres'}
              </span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section Notification dans la section profil */}
      <motion.div 
        id="notif-banner" 
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowPermissionDialog(true)}
        className="mx-4 sm:mx-5 my-2.5 bg-[#240c44]/80 hover:bg-[#2d0f54]/90 border border-purple-500/25 rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-purple-950/40 backdrop-blur-md cursor-pointer transition-all select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8b5cf6]/30 to-[#f43f5e]/30 border border-purple-400/30 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Bell className="w-4.5 h-4.5 text-pink-300" />
          </div>
          <p className="text-[13px] sm:text-[13.5px] font-semibold text-white leading-snug pr-1">
            Recevez une notification en cas de Match ou message
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 text-purple-300/60">
          <ChevronRight className="w-4.5 h-4.5" />
        </div>
      </motion.div>

      {/* Sub-tabs Navigation */}
      <nav className="flex border-b border-purple-500/20 px-4 sm:px-5 mt-2 justify-between select-none">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveSubTab('abonnements')}
          className={`pb-2.5 text-[14.5px] sm:text-[15.5px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer relative ${
            activeSubTab === 'abonnements' 
              ? 'text-white' 
              : 'text-purple-300/70 hover:text-white font-medium'
          }`} 
          type="button"
        >
          Abonnements
          {activeSubTab === 'abonnements' && (
            <motion.div layoutId="profileSubTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f43f5e] rounded-full shadow-xs" />
          )}
        </motion.button>
        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSubTab('securite')}
            className={`pb-2.5 text-[14.5px] sm:text-[15.5px] transition-colors whitespace-nowrap cursor-pointer relative ${
              activeSubTab === 'securite' 
                ? 'text-white font-bold' 
                : 'text-purple-300/70 font-medium hover:text-white'
            }`} 
            type="button"
          >
            Sécurité
            {activeSubTab === 'securite' && (
              <motion.div layoutId="profileSubTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f43f5e] rounded-full shadow-xs" />
            )}
          </motion.button>
        </div>
      </nav>

      {activeSubTab === 'abonnements' ? (
        <div className="px-4 sm:px-5 select-none">
          {/* Quick Stat Cards */}
          <div className="pt-3 pb-1">
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Votre activité */}
              <motion.div 
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowActivityMenu(true)}
                className="bg-[#240c44]/65 hover:bg-[#2d1054]/75 border border-purple-500/20 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all backdrop-blur-md shadow-md"
              >
                <div className="w-10 h-10 rounded-full bg-purple-900/40 flex items-center justify-center flex-shrink-0 border border-purple-400/20 shadow-xs">
                  <Gauge className="w-5 h-5 text-purple-200" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-purple-300/80 truncate">Votre activité</span>
                  <span className="text-[13.5px] sm:text-[14.5px] font-bold text-white truncate">Très basse</span>
                </div>
              </motion.div>

              {/* Card 2: Crédits */}
              <motion.div 
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowRechargeCredits(true)}
                className="bg-[#240c44]/65 hover:bg-[#2d1054]/75 border border-purple-500/20 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all backdrop-blur-md shadow-md"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2dd4bf]/20 to-[#f43f5e]/20 flex items-center justify-center flex-shrink-0 border border-pink-400/30 shadow-xs">
                  <Plus className="w-5 h-5 text-pink-300 stroke-[2.5]" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-purple-300/80 truncate">Crédits</span>
                  <span className="text-[13.5px] sm:text-[14.5px] font-bold text-pink-300 truncate">
                    {creditsBalance > 0 ? creditsBalance : 'Ajouter'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Snap Carousel: Bavel Extra & Bavel Premium */}
          <section className="mt-3 w-full overflow-hidden">
            <div 
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 scroll-smooth w-full"
              id="sub-carousel"
            >
              {/* Slide 1: Extra */}
              <div className="w-full flex-shrink-0 snap-center">
                <div className="bg-gradient-to-b from-[#290c48] via-[#1d0838] to-[#120324] rounded-2xl p-3.5 border border-purple-400/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-center gap-2 mb-3.5">
                    <span className="text-[22px] sm:text-[24px] font-extrabold font-sans tracking-tight text-white">Bavel</span>
                    <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white shadow-md">
                      Extra
                    </span>
                  </div>

                  <button 
                    onClick={() => setShowExtraModal(true)}
                    className="w-full bg-gradient-to-r from-white via-purple-50 to-white hover:opacity-95 text-[#16042c] text-[14.5px] sm:text-[15.5px] font-extrabold py-2.5 sm:py-3 px-3 rounded-full shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center text-center leading-tight cursor-pointer" 
                    type="button"
                  >
                    Profitez d'Extra (dès 5,99 €)
                  </button>

                  <div className="mt-3.5 sm:mt-4 pt-4 bg-[#130422]/90 rounded-2xl px-3 py-3.5 sm:py-4 border border-purple-500/20 backdrop-blur-xl relative w-full shadow-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                      <span className="bg-[#240c44] text-white text-[11.5px] sm:text-[12px] font-bold px-3 py-0.5 rounded-full border border-purple-400/30 shadow-md whitespace-nowrap tracking-wide">
                        Ma formule
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2.5 pt-1 border-b border-purple-500/20">
                      <div className="flex-1 text-left font-bold text-[13px] sm:text-[13.5px] text-purple-200/90 pr-1">Fonctionnalités</div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-12 text-center">
                          <span className="text-[12.5px] sm:text-[13px] font-semibold text-purple-300/70">Gratuit</span>
                        </div>
                        <div className="w-12 text-center">
                          <span className="text-[12.5px] sm:text-[13px] font-bold text-pink-300">Extra</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 divide-y divide-purple-500/10">
                      <div className="flex items-center justify-between pt-2.5">
                        <span className="flex-1 text-[12px] sm:text-[12.5px] font-medium text-white/90 pr-1 text-left leading-snug">
                          Swipez aussi souvent que vous voulez
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 flex items-center justify-center">
                            <X className="w-4 h-4 text-purple-400/50" />
                          </div>
                          <div className="w-12 flex items-center justify-center">
                            <Check className="w-4.5 h-4.5 text-[#2dd4bf] stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5">
                        <span className="flex-1 text-[12px] sm:text-[12.5px] font-medium text-white/90 pr-1 text-left leading-snug">
                          Des crédits bonus pour tout achat
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 flex items-center justify-center">
                            <X className="w-4 h-4 text-purple-400/50" />
                          </div>
                          <div className="w-12 flex items-center justify-center">
                            <Check className="w-4.5 h-4.5 text-[#2dd4bf] stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5">
                        <span className="flex-1 text-[12px] sm:text-[12.5px] font-medium text-white/90 pr-1 text-left leading-snug">
                          Supprimez toutes les pubs
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 flex items-center justify-center">
                            <X className="w-4 h-4 text-purple-400/50" />
                          </div>
                          <div className="w-12 flex items-center justify-center">
                            <Check className="w-4.5 h-4.5 text-[#2dd4bf] stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAllFeatures({ open: true, tab: 'extra' })}
                      className="w-full mt-3.5 sm:mt-4 border border-purple-500/30 hover:border-purple-400/60 text-white text-[13px] sm:text-[13.5px] font-bold py-2 sm:py-2.5 px-3 rounded-full transition-colors bg-purple-950/40 cursor-pointer" 
                      type="button"
                    >
                      Toutes les fonctionnalités
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Slide 2: Premium */}
              <div className="w-full flex-shrink-0 snap-center">
                <div className="bg-gradient-to-b from-[#380e54] via-[#24083d] to-[#120324] rounded-2xl p-3.5 border border-pink-400/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-rose-600/20 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-center gap-1.5 mb-3.5">
                    <span className="text-[21px] sm:text-[23px] font-extrabold font-sans tracking-tight text-white">Bavel</span>
                    <span className="text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ec4899] via-[#f43f5e] to-[#8b5cf6] text-white shadow-md ml-1">
                      Premium
                    </span>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setPremiumSlideId(undefined); setShowPremiumModal(true); }}
                    className="w-full bg-gradient-to-r from-white via-pink-50 to-white hover:opacity-95 text-[#16042c] text-[14px] sm:text-[15px] font-extrabold py-2.5 sm:py-3 px-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center text-center leading-tight cursor-pointer" 
                    type="button"
                  >
                    Passez à Premium (dès 11,99 €)
                  </motion.button>

                  <div className="mt-3.5 sm:mt-4 pt-4 bg-[#130422]/90 rounded-2xl px-3 py-3.5 sm:py-4 border border-pink-500/20 backdrop-blur-xl relative w-full shadow-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                      <span className="bg-[#240c44] text-white text-[11px] sm:text-[11.5px] font-bold px-3 py-0.5 rounded-full border border-pink-400/30 shadow-md whitespace-nowrap tracking-wide">
                        Ma formule
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2.5 pt-1 border-b border-purple-500/20">
                      <div className="flex-1 text-left font-bold text-[12.5px] sm:text-[13px] text-purple-200/90 pr-1">Fonctionnalités</div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-12 text-center">
                          <span className="text-[12px] sm:text-[12.5px] font-semibold text-purple-300/70">Gratuit</span>
                        </div>
                        <div className="w-12 text-center">
                          <span className="text-[12px] sm:text-[12.5px] font-bold text-pink-300">Premium</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 divide-y divide-purple-500/10">
                      <div className="flex items-center justify-between pt-2.5">
                        <span className="flex-1 text-[12px] sm:text-[12.5px] font-medium text-white/90 pr-1 text-left leading-snug">
                          Découvrez qui vous a donné un Like
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 flex items-center justify-center">
                            <X className="w-4 h-4 text-purple-400/50" />
                          </div>
                          <div className="w-12 flex items-center justify-center">
                            <Check className="w-4.5 h-4.5 text-[#f43f5e] stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5">
                        <span className="flex-1 text-[12px] sm:text-[12.5px] font-medium text-white/90 pr-1 text-left leading-snug">
                          Des crédits bonus pour tout achat
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 flex items-center justify-center">
                            <X className="w-4 h-4 text-purple-400/50" />
                          </div>
                          <div className="w-12 flex items-center justify-center">
                            <Check className="w-4.5 h-4.5 text-[#f43f5e] stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5">
                        <span className="flex-1 text-[12px] sm:text-[12.5px] font-medium text-white/90 pr-1 text-left leading-snug">
                          Profitez de filtres illimités
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 flex items-center justify-center">
                            <X className="w-4 h-4 text-purple-400/50" />
                          </div>
                          <div className="w-12 flex items-center justify-center">
                            <Check className="w-4.5 h-4.5 text-[#f43f5e] stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAllFeatures({ open: true, tab: 'premium' })}
                      className="w-full mt-3.5 sm:mt-4 border border-pink-500/30 hover:border-pink-400/60 text-white text-[13px] sm:text-[13.5px] font-bold py-2 sm:py-2.5 px-3 rounded-full transition-colors bg-pink-950/40 cursor-pointer" 
                      type="button"
                    >
                      Toutes les fonctionnalités
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Pagination Dots */}
            <div className="flex justify-center items-center gap-2 mt-3 mb-2">
              <button 
                aria-label="Voir Bavel Extra" 
                className={`transition-all duration-300 cursor-pointer ${activeCarouselIndex === 0 ? 'w-6 h-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] shadow-sm' : 'w-2 h-2 rounded-full bg-purple-400/40 hover:bg-white/50'}`} 
                onClick={() => scrollCarouselToIndex(0)} 
                type="button"
              />
              <button 
                aria-label="Voir Bavel Premium" 
                className={`transition-all duration-300 cursor-pointer ${activeCarouselIndex === 1 ? 'w-6 h-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] shadow-sm' : 'w-2 h-2 rounded-full bg-purple-400/40 hover:bg-white/50'}`} 
                onClick={() => scrollCarouselToIndex(1)} 
                type="button"
              />
            </div>
          </section>
        </div>
      ) : (
        <div className="px-4 sm:px-5 pb-6 space-y-2.5 mt-3 select-none">
          {/* Safety Centre Card */}
          <div 
            onClick={() => setShowSafetyCentre(true)}
            className="bg-[#240c44]/75 rounded-[18px] p-3.5 border border-purple-500/25 relative overflow-hidden flex items-center justify-between cursor-pointer hover:bg-[#2d1054]/85 active:scale-[0.99] transition-all shadow-md backdrop-blur-md"
          >
            <div className="z-10 max-w-[210px]">
              <h2 className="text-[14px] sm:text-[14.5px] font-bold text-white mb-0.5">Safety Centre</h2>
              <p className="text-[11.5px] sm:text-[12px] text-purple-200/80 font-medium leading-snug">
                Guides, outils et assistance téléphonique pour faire des rencontres en toute sécurité
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b5cf6]/25 to-[#2dd4bf]/25 border border-purple-400/30 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Shield className="w-5 h-5 text-[#2dd4bf]" />
            </div>
          </div>

          {/* Help Center */}
          <div 
            onClick={() => setShowHelpCenter(true)}
            className="bg-[#240c44]/75 rounded-[18px] p-3.5 border border-purple-500/25 flex items-center justify-between cursor-pointer hover:bg-[#2d1054]/85 active:scale-[0.99] transition-all shadow-md backdrop-blur-md"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-pink-300" />
              </div>
              <span className="text-[14px] sm:text-[14.5px] font-semibold text-white">Obtenir de l'aide de Bavel</span>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-300/60" />
          </div>

          <div className="space-y-2">
            {/* Verify Profile */}
            <button 
              onClick={() => {
                setEditProfileInitialSubEditor('verification');
                setShowEditProfile(true);
              }}
              className="w-full bg-[#240c44]/65 rounded-[16px] p-3 border border-purple-500/20 flex items-center text-left hover:bg-[#2d1054]/75 transition-colors active:scale-[0.99] backdrop-blur-md cursor-pointer"
            >
              <div className="w-[34px] h-[34px] bg-[#0084ff]/20 border border-[#0084ff]/40 rounded-full flex items-center justify-center shrink-0 mr-3">
                <CheckCircle className="w-4 h-4 text-[#60a5fa]" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white mb-0.5 truncate flex items-center gap-1.5">
                  Faire vérifier votre profil
                  {isVerified && (
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.2 rounded-full font-bold">Certifié ✓</span>
                  )}
                </div>
                <div className="text-[11px] sm:text-[11.5px] text-purple-200/70 leading-tight">Défi selfie pose & badge bleu (+50 crédits)</div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300/60 shrink-0 ml-1.5" />
            </button>

            {/* Invisible mode */}
            <button 
              onClick={() => setShowInvisibleMode(true)}
              className="w-full bg-[#240c44]/65 rounded-[16px] p-3 border border-purple-500/20 flex items-center text-left hover:bg-[#2d1054]/75 transition-colors active:scale-[0.99] backdrop-blur-md cursor-pointer"
            >
              <div className="w-[34px] h-[34px] bg-purple-900/40 rounded-full flex items-center justify-center shrink-0 mr-3 border border-purple-400/20">
                <EyeOff className="w-4 h-4 text-purple-200" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white mb-0.5 truncate">Activer le mode Invisible</div>
                <div className="text-[11px] sm:text-[11.5px] text-purple-200/70 leading-tight">Consultez les profils en toute discrétion</div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300/60 shrink-0 ml-1.5" />
            </button>

            {/* Confidentiality */}
            <button 
              onClick={() => setShowConfidentiality(true)}
              className="w-full bg-[#240c44]/65 rounded-[16px] p-3 border border-purple-500/20 flex items-center text-left hover:bg-[#2d1054]/75 transition-colors active:scale-[0.99] backdrop-blur-md cursor-pointer"
            >
              <div className="w-[34px] h-[34px] bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-full flex items-center justify-center shrink-0 mr-3">
                <Lock className="w-4 h-4 text-purple-300" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white mb-0.5 truncate">Gérer votre confidentialité</div>
                <div className="text-[11px] sm:text-[11.5px] text-purple-200/70 leading-tight">Choisissez les informations que vous partagez</div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300/60 shrink-0 ml-1.5" />
            </button>

            {/* Community Charter */}
            <button 
              onClick={() => setShowCommunityCharter(true)}
              className="w-full bg-[#240c44]/65 rounded-[16px] p-3 border border-purple-500/20 flex items-center text-left hover:bg-[#2d1054]/75 transition-colors active:scale-[0.99] backdrop-blur-md cursor-pointer"
            >
              <div className="w-[34px] h-[34px] bg-[#f43f5e]/20 border border-[#f43f5e]/30 rounded-full flex items-center justify-center shrink-0 mr-3">
                <Shield className="w-4 h-4 text-[#f43f5e]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white mb-0.5 truncate">Charte de la Communauté</div>
                <div className="text-[11px] sm:text-[11.5px] text-purple-200/70 leading-tight">Découvrez nos règles de vie et d'utilisation</div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300/60 shrink-0 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* Advanced Security, Monetization & Gamification Modals - Mount on demand */}
      {showSelfieVerification && (
        <SelfieVerificationModal
          isOpen={showSelfieVerification}
          onClose={() => setShowSelfieVerification(false)}
          onVerifiedSuccess={() => {
            setIsVerified(true);
          }}
        />
      )}

      {showCreditsStore && (
        <CreditsStoreModal
          isOpen={showCreditsStore}
          onClose={() => setShowCreditsStore(false)}
          onSuccess={() => {
            setCreditsBalance(monetizationService.getCredits());
          }}
        />
      )}

      {showBoostModal && (
        <ProfileBoostModal
          isOpen={showBoostModal}
          onClose={() => setShowBoostModal(false)}
          onOpenStore={() => {
            setShowBoostModal(false);
            setShowCreditsStore(true);
          }}
        />
      )}

      {showVipPassModal && (
        <PremiumPassModal
          isOpen={showVipPassModal}
          onClose={() => setShowVipPassModal(false)}
        />
      )}

      {showQuestsModal && (
        <QuestsAndRewardsModal
          isOpen={showQuestsModal}
          onClose={() => setShowQuestsModal(false)}
          onTriggerAction={(actionKey) => {
            setShowQuestsModal(false);
            if (actionKey === 'selfie_verify') {
              setShowSelfieVerification(true);
            } else if (actionKey === 'bio' || actionKey === 'photos_3') {
              setShowEditProfile(true);
            }
          }}
        />
      )}
    </div>
  );
}

