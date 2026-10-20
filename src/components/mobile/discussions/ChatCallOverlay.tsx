import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Sparkles, Shield, Lock } from 'lucide-react';

interface ChatCallOverlayProps {
  profile: any;
  call: { type: 'audio' | 'video'; status: string; duration: number };
  localStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  callDuration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

const AR_FILTERS = [
  { id: 'normal', name: 'Normal', emoji: '✨' },
  { id: 'hearts', name: 'Cœurs Flottants', emoji: '💖' },
  { id: 'neon', name: 'Cyber Néon', emoji: '🌐' },
  { id: 'cat', name: 'Oreilles de Chat', emoji: '🐱' },
  { id: 'crown', name: 'Couronne VIP', emoji: '👑' },
];

export const ChatCallOverlay: React.FC<ChatCallOverlayProps> = ({
  profile,
  call,
  localVideoRef,
  callDuration,
  isMuted,
  onToggleMute,
  onEndCall,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col items-center justify-between p-6 sm:p-8"
    >
      {/* Top Bar: Encryption & Status */}
      <div className="w-full flex items-center justify-between max-w-md mt-4">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
          <Lock className="w-3 h-3" />
          <span>WebRTC P2P Sécurisé</span>
        </div>
        <div className="text-xs font-mono text-slate-400">{formatTime(callDuration)}</div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center my-4 space-y-3">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
          <img src={profile.img || profile.photos?.[0]} alt={profile.name} className="w-full h-full object-cover" />
          {selectedFilter !== 'normal' && (
            <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-2xl animate-bounce">
                {AR_FILTERS.find(f => f.id === selectedFilter)?.emoji}
              </span>
            </div>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">{profile.name}</h2>
        <p className="text-xs sm:text-sm font-medium text-slate-400">
          {call.type === 'video' ? 'Speed Dating Vidéo HD' : 'Appel Vocal HD'}
        </p>
      </div>

      {/* Video Container with AR filter effect */}
      {call.type === 'video' && (
        <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl my-auto">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          
          {/* AR Overlay badge */}
          {selectedFilter !== 'normal' && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
              <span>{AR_FILTERS.find(f => f.id === selectedFilter)?.emoji}</span>
              <span>{AR_FILTERS.find(f => f.id === selectedFilter)?.name}</span>
            </div>
          )}

          {/* AR Filters Toggle Button */}
          <div className="absolute bottom-3 right-3">
            <button
              onClick={() => setShowFiltersMenu(!showFiltersMenu)}
              className="px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 hover:bg-black/80 transition-all"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Filtres AR</span>
            </button>
          </div>

          {/* AR Filters Selector Modal / Drawer */}
          <AnimatePresence>
            {showFiltersMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-2 bottom-16 bg-neutral-900/95 backdrop-blur-xl p-3 rounded-2xl border border-white/20 flex items-center justify-around z-10"
              >
                {AR_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => { setSelectedFilter(filter.id); setShowFiltersMenu(false); }}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      selectedFilter === filter.id ? 'bg-pink-600 text-white' : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-lg mb-1">{filter.emoji}</span>
                    <span className="text-[9px] font-bold">{filter.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex items-center space-x-6 mb-6">
        <button
          onClick={onToggleMute}
          className={`p-4 rounded-full transition-colors shadow-lg ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={onEndCall}
          className="p-5 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-transform hover:scale-105 active:scale-95"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </motion.div>
  );
};
