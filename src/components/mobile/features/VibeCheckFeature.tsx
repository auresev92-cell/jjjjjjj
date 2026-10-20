import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Video, Play, Pause, Square, Sparkles, Check, X, RotateCcw, Volume2, ShieldAlert } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface VibeCheckFeatureProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: 'audio' | 'video', url: string) => void;
  existingVibe?: { type: 'audio' | 'video'; url: string };
}

export function VibeCheckFeature({ isOpen, onClose, onSave, existingVibe }: VibeCheckFeatureProps) {
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(existingVibe?.url || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {stopCamera();};
  }, [isOpen, mode]);

  const startCamera = async () => {
    try {
      if (mode === 'video') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }
    } catch (e) {
      console.log('Media device permission simulation fallback', e);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsPlaying(false);
  };

  const startRecording = () => {
    triggerHaptic('medium');
    setIsRecording(true);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    triggerHaptic('heavy');
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    // Simulate recording result
    setRecordedUrl(mode === 'video' ? 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-camera-and-smiling-41583-large.mp4' : 'audio_sample.mp3');
  };

  const handleRetake = () => {
    triggerHaptic('light');
    setRecordedUrl(null);
    setTimeLeft(30);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[200] flex flex-col text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Vibe Check 30s</h2>
            <p className="text-[11px] text-gray-400">Remplacez votre bio par votre vraie énergie</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
          <X className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Mode Switcher */}
      {!recordedUrl && (
        <div className="flex justify-center p-3">
          <div className="bg-white/10 p-1 rounded-full flex gap-1 border border-white/10">
            <button
              onClick={() => { setMode('video'); triggerHaptic('selection'); }}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'video' ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <Video className="w-3.5 h-3.5" /> Vidéo 30s
            </button>
            <button
              onClick={() => { setMode('audio'); triggerHaptic('selection'); }}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'audio' ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <Mic className="w-3.5 h-3.5" /> Audio 30s
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <div className="flex-1 relative mx-4 my-2 rounded-2xl overflow-hidden bg-gray-950 border border-white/10 flex items-center justify-center">
        {recordedUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {mode === 'video' ? (
              <video src={recordedUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-pink-500/50 animate-pulse">
                <Volume2 className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-xl">
                <Check className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Vibe Check enregistré !</h3>
              <p className="text-xs text-gray-300 max-w-xs mb-6">Votre profil affiche désormais votre badge certifié Vibe Check.</p>
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-medium text-xs flex items-center justify-center gap-2 border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Refaire
                </button>
                <button
                  onClick={() => { onSave(mode, recordedUrl); onClose(); }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" /> Valider
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {mode === 'video' ? (
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover mirror" autoPlay muted playsInline />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className={`w-32 h-32 rounded-full border-4 border-pink-500/30 flex items-center justify-center ${isRecording ? 'animate-ping border-pink-500' : ''}`}>
                  <Mic className={`w-12 h-12 ${isRecording ? 'text-pink-400' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-400 mt-4">{isRecording ? 'Enregistrement de votre voix en cours...' : 'Appuyez pour enregistrer votre message vocal'}</p>
              </div>
            )}

            {/* Timer Overlay */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-pink-500/40 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono font-bold text-sm text-pink-400">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {!recordedUrl && (
        <div className="p-6 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-[11px] text-gray-400 mb-2">Maximum 30 secondes • Sans filtre</p>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 p-1 shadow-xl shadow-pink-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all mx-auto"
              >
                <div className="w-14 h-14 rounded-full bg-[#10011a] flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-pink-500" />
                </div>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-red-500 shadow-xl shadow-red-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all mx-auto"
              >
                <Square className="w-7 h-7 text-white fill-current" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
