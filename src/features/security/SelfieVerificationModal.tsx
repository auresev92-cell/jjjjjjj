import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  X, 
  AlertCircle, 
  Smile, 
  Hand,
  RotateCw,
  Zap,
  User as UserIcon
} from 'lucide-react';
import { VERIFICATION_POSES, VerificationPose, securityService } from '../../services/securityService';
import { gamificationService } from '../../services/gamificationService';
import { useUX } from '../../context/UXContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { poseImg } from '../../components/MobileApp';

interface SelfieVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess?: () => void;
}

export const SelfieVerificationModal: React.FC<SelfieVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerifiedSuccess,
}) => {
  const { triggerFeedback, playSound } = useUX();
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashMode, setFlashMode] = useState<'auto' | 'on' | 'off'>('auto');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("Ton visage n'est pas assez clair");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPose = VERIFICATION_POSES[currentPoseIndex] || VERIFICATION_POSES[0];

  // Start Camera Stream
  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Accès caméra indisponible ou refusé.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const toggleFacingMode = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    triggerFeedback('light');
    stopCamera();
    startCamera(next);
  };

  const toggleFlash = () => {
    triggerFeedback('light');
    setFlashMode((prev) => prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto');
  };

  useEffect(() => {
    if (isOpen) {
      startCamera('user');
      setIsSuccess(false);
      setIsVerifying(false);
      setIsCapturingFlash(false);
      setProgress(0);
      setFeedbackMessage("Ton visage n'est pas assez clair");
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Pose verification simulation with visual frame capture
  const handleStartPoseVerification = () => {
    if (isVerifying) return;
    triggerFeedback('medium');
    setIsCapturingFlash(true);

    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const w = video.videoWidth || 720;
        const h = video.videoHeight || 1280;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, w, h);
        }
      } catch (err) {
        console.warn('Canvas frame capture fallback:', err);
      }
    }

    setTimeout(() => {
      setIsCapturingFlash(false);
      setIsVerifying(true);
      setProgress(0);

      const duration = currentPose.requiredDurationMs || 2000;
      const interval = 50;
      const step = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            completeVerification();
            return 100;
          }
          return prev + step;
        });
      }, interval);
    }, 300);
  };

  const completeVerification = () => {
    setIsVerifying(false);
    setIsSuccess(true);
    securityService.setVerified(true);
    gamificationService.markQuestCompleted('quest_selfie');
    playSound('match');
    triggerFeedback('heavy');

    if (onVerifiedSuccess) {
      onVerifiedSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black select-none">
        
        {/* Full-bleed camera view container */}
        <div className="relative w-full h-full max-w-md max-h-[100dvh] bg-[#1a1f26] overflow-hidden flex flex-col justify-between shadow-2xl">
          
          {/* Shutter White Flash overlay */}
          <AnimatePresence>
            {isCapturingFlash && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 bg-white z-[200] pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Background Live Camera Feed */}
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {/* Fallback silhouette if webcam isn't physically present */}
            {!stream && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#2b3340] via-[#3d4858] to-[#1c222b] flex items-center justify-center">
                <div className="w-72 h-96 rounded-[56px] border border-white/15 bg-white/5 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center shadow-inner">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mb-4">
                    <UserIcon className="w-12 h-12 text-white/40" />
                  </div>
                  <p className="text-[12px] font-bold text-white/70 max-w-[200px]">
                    Cadrez votre visage dans l'objectif
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isSuccess ? (
            <>
              {/* TOP OVERLAYS: Flash (Left), Dynamic Island (Center), Flip Camera (Right) */}
              <div className="relative z-20 pt-10 sm:pt-12 px-6 flex items-center justify-between w-full">
                {/* Flash Toggle */}
                <button
                  onClick={toggleFlash}
                  className="flex items-center text-white active:scale-90 transition-transform cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] p-2 -ml-2"
                  title="Flash"
                >
                  <Zap className="w-7 h-7 text-white fill-white" />
                  <span className="text-[11px] font-black -ml-0.5 tracking-tighter">
                    {flashMode === 'auto' ? 'A' : flashMode === 'on' ? 'ON' : ''}
                  </span>
                </button>

                {/* iOS Dynamic Island Pill with Camera Activity LED */}
                <div className="w-28 h-7 bg-black rounded-full flex items-center justify-end px-3 shadow-lg border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                </div>

                {/* Camera Flip */}
                <button
                  onClick={toggleFacingMode}
                  className="text-white active:scale-90 transition-transform cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] p-2 -mr-2"
                  title="Changer de caméra"
                >
                  <RefreshCw className="w-7 h-7 text-white stroke-[2.4]" />
                </button>
              </div>

              {/* MID-BOTTOM PROMPT ALERT PILL */}
              <div className="relative z-20 flex items-center justify-center w-full px-4 mb-4">
                <div className="inline-flex items-center space-x-2.5 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-2xl text-white">
                  <div className="w-4 h-4 rounded-full bg-[#ff2d55] text-white flex items-center justify-center text-[10.5px] font-black shrink-0">
                    !
                  </div>
                  <span className="text-[13.5px] font-medium text-white tracking-tight">
                    {feedbackMessage}
                  </span>
                </div>
              </div>

              {/* BOTTOM CONTROLS BAR: Close (Left), Shutter (Center), Pose Card (Right) */}
              <div className="relative z-20 px-6 pb-10 sm:pb-12 flex items-center justify-between w-full max-w-md mx-auto">
                
                {/* Round White Close Button */}
                <button
                  onClick={onClose}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-pointer text-black shrink-0"
                  title="Fermer"
                >
                  <X className="w-6 h-6 text-black stroke-[2.8]" />
                </button>

                {/* Large Center Shutter Button */}
                <button
                  onClick={handleStartPoseVerification}
                  disabled={isVerifying}
                  className="w-20 h-20 rounded-full border-[4px] border-white p-1 flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer bg-transparent shrink-0 mx-2"
                  title="Prendre la photo"
                >
                  <div className="w-full h-full rounded-full bg-[#111111] hover:bg-black active:bg-white/40 transition-colors border border-white/20 flex items-center justify-center">
                    {isVerifying && (
                      <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    )}
                  </div>
                </button>

                {/* Reference Pose Thumbnail */}
                <div className="w-[74px] h-[102px] sm:w-[82px] sm:h-[114px] rounded-2xl border-[2.5px] border-white overflow-hidden shadow-2xl bg-black shrink-0 relative">
                  <img 
                    src={poseImg} 
                    className="w-full h-full object-cover" 
                    alt="Pose de référence" 
                    referrerPolicy="no-referrer"
                  />
                </div>

              </div>
            </>
          ) : (
            /* Success View */
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/90 backdrop-blur-md space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl animate-scale">
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-neutral-900 text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                  +50 Crédits
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <h4 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
                  Profil Certifié !
                  <span className="w-6 h-6 rounded-full bg-[#007eff] text-white inline-flex items-center justify-center text-xs font-bold">✓</span>
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Félicitations, vous êtes désormais certifié(e) ! Le badge bleu de confiance apparaîtra sur votre profil.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-full shadow-lg active:scale-95 transition-transform text-base cursor-pointer"
              >
                Génial, continuer !
              </button>
            </div>
          )}

          {/* Hidden canvas for snapshot capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </AnimatePresence>
  );
};
