import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Video, 
  Heart, 
  Gift, 
  Send, 
  X, 
  Users, 
  Sparkles, 
  Eye, 
  Camera, 
  Volume2, 
  VolumeX, 
  Crown, 
  Coins, 
  Flame,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Profile } from '../../types';
import { useUX } from '../../context/UXContext';
import { monetizationService } from '../../services/monetizationService';
import { playNotificationAudio } from '../../services/notificationService';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface BadooLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: Profile;
  onOpenStore?: () => void;
}

export interface LiveGiftItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  color: string;
}

export const LIVE_GIFTS: LiveGiftItem[] = [
  { id: 'g_1', name: 'Rose', cost: 10, icon: '🌹', color: 'from-rose-500 to-pink-500' },
  { id: 'g_2', name: 'Cœur enflammé', cost: 25, icon: '🔥', color: 'from-amber-500 to-red-500' },
  { id: 'g_3', name: 'Diamant Bavel', cost: 50, icon: '💎', color: 'from-cyan-400 to-blue-600' },
  { id: 'g_4', name: 'Couronne VIP', cost: 100, icon: '👑', color: 'from-yellow-400 to-amber-600' },
  { id: 'g_5', name: 'Voile de Sport', cost: 250, icon: '🏎️', color: 'from-purple-500 to-indigo-600' },
];

export interface LiveChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  giftIcon?: string;
  giftName?: string;
  timestamp: string;
}

export const BadooLiveModal: React.FC<BadooLiveModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onOpenStore,
}) => {
  const { triggerFeedback } = useUX();
  const [activeTab, setActiveTab] = useState<'watch' | 'broadcast'>('watch');
  const [selectedHost, setSelectedHost] = useState<Profile | null>(initialProfile || null);
  
  // Real camera state for broadcaster mode
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live Stream stats
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDiamonds, setStreamDiamonds] = useState(0);
  const [credits, setCredits] = useState(monetizationService.getCredits());

  // Chat & Gifts
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);

  // Floating Hearts Effect
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);

  useEffect(() => {
    const unsub = monetizationService.subscribe(() => {
      setCredits(monetizationService.getCredits());
    });
    return unsub;
  }, []);

  // Simulate viewer count fluctuation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + (Math.random() > 0.4 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Start real web camera for broadcaster mode
  const startBroadcastCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsBroadcasting(true);
      triggerFeedback('heavy');
    } catch (err: any) {
      setCameraError('Accès caméra/micro refusé ou indisponible.');
    }
  };

  const stopBroadcastCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsBroadcasting(false);
  };

  const handleSendHeart = () => {
    triggerFeedback('light');
    const newHeart = { id: Date.now() + Math.random(), left: Math.floor(Math.random() * 70) + 15 };
    setFloatingHearts((prev) => [...prev.slice(-15), newHeart]);
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    triggerFeedback('medium');
    const newMsg: LiveChatMessage = {
      id: `msg_${Date.now()}`,
      senderName: 'Moi',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const handleSendGift = (gift: LiveGiftItem) => {
    if (credits < gift.cost) {
      triggerFeedback('heavy');
      alert(`Crédits insuffisants. Il vous faut ${gift.cost} CR pour offrir un/une ${gift.name}.`);
      onOpenStore?.();
      return;
    }

    if (monetizationService.spendCredits(gift.cost, `Cadeau Badoo Live: ${gift.name}`)) {
      triggerFeedback('heavy');
      playNotificationAudio('like');
      setStreamDiamonds((prev) => prev + gift.cost * 2);

      const giftMsg: LiveChatMessage = {
        id: `gift_${Date.now()}`,
        senderName: 'Moi',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        text: `a envoyé un cadeau ${gift.name} ${gift.icon} !`,
        giftIcon: gift.icon,
        giftName: gift.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, giftMsg]);
      setShowGiftDrawer(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full sm:h-[92vh] max-w-md bg-neutral-950 text-white sm:rounded-3xl overflow-hidden flex flex-col"
        >
          {/* Top Floating Header Controls */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
            {/* Host Avatar & Viewers Badge */}
            <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <img
                src={activeTab === 'broadcast' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' : (selectedHost?.photos?.[0] || (selectedHost as any)?.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80')}
                alt="Host"
                className="w-8 h-8 rounded-full object-cover border-2 border-rose-500"
              />
              <div className="text-left leading-tight">
                <div className="text-xs font-black text-white flex items-center gap-1">
                  {activeTab === 'broadcast' ? 'Mon Direct Live' : (selectedHost?.name || 'Live Bavel')}
                  <Badge className="bg-rose-500 text-white text-[8px] px-1 py-0 font-black animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <div className="text-[10px] text-neutral-300 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-rose-400" /> {viewerCount} spectateurs
                </div>
              </div>
            </div>

            {/* Diamonds & Close Button */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-2.5 py-1 rounded-full text-amber-300 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{streamDiamonds}</span>
              </div>

              <button
                onClick={() => {
                  stopBroadcastCamera();
                  onClose();
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-neutral-800 text-white backdrop-blur-md border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => {
                triggerFeedback('light');
                stopBroadcastCamera();
                setActiveTab('watch');
              }}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'watch' ? 'bg-rose-500 text-white' : 'text-neutral-400'
              }`}
            >
              Regarder
            </button>
            <button
              onClick={() => {
                triggerFeedback('light');
                setActiveTab('broadcast');
              }}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'broadcast' ? 'bg-rose-500 text-white' : 'text-neutral-400'
              }`}
            >
              Lancer un Live
            </button>
          </div>

          {/* Main Video View Canvas */}
          <div className="relative flex-1 w-full bg-neutral-900 flex items-center justify-center overflow-hidden">
            {activeTab === 'broadcast' ? (
              // Broadcaster Mode
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isBroadcasting && (
                  <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-[#e20030] flex items-center justify-center border border-rose-500/40 animate-pulse">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Prêt à lancer votre Badoo Live ?</h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Passez en direct pour échanger avec les personnes à proximité et recevoir des cadeaux virtuels.
                      </p>
                    </div>
                    {cameraError && <p className="text-xs text-rose-400 font-bold">{cameraError}</p>}
                    <Button
                      onClick={startBroadcastCamera}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg"
                    >
                      Démarrer le Direct Vidéo 🎥
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Watcher Stream Canvas
              <div className="relative w-full h-full">
                <img
                  src={selectedHost?.photos?.[0] || (selectedHost as any)?.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt="Live Stream Host"
                  className="w-full h-full object-cover filter brightness-[0.88]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
              </div>
            )}

            {/* Floating Hearts Container */}
            <div className="absolute right-4 bottom-24 z-20 pointer-events-none h-64 w-20 overflow-hidden">
              {floatingHearts.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ y: 200, opacity: 1, scale: 0.8 }}
                  animate={{ y: 0, opacity: 0, scale: 1.5 }}
                  transition={{ duration: 2.2, ease: 'easeOut' }}
                  style={{ left: `${h.left}%` }}
                  className="absolute text-rose-500 text-2xl drop-shadow-md"
                >
                  ❤️
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Audience Live Chat & Action Bar */}
          <div className="relative z-30 p-3 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 space-y-2.5">
            {/* Live Chat Stream */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start space-x-2 bg-neutral-900/80 backdrop-blur-sm p-2 rounded-xl border border-neutral-800/60 max-w-[90%]"
                >
                  <img
                    src={m.senderAvatar}
                    alt={m.senderName}
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-rose-500"
                  />
                  <div className="text-xs leading-tight min-w-0">
                    <span className="font-bold text-rose-400 mr-1.5">{m.senderName}:</span>
                    <span className="text-neutral-200">{m.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input & Action Buttons */}
            <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Commenter en direct..."
                className="flex-1 bg-neutral-900 text-white text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />

              {/* Send Heart */}
              <button
                type="button"
                onClick={handleSendHeart}
                className="p-2.5 rounded-2xl bg-rose-500/20 text-[#e20030] hover:bg-rose-500/30 border border-rose-500/40 shrink-0 active:scale-95 transition-transform"
              >
                <Heart className="w-5 h-5 fill-rose-500" />
              </button>

              {/* Gift Drawer Trigger */}
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('medium');
                  setShowGiftDrawer(!showGiftDrawer);
                }}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shrink-0 shadow-lg active:scale-95 transition-transform"
              >
                <Gift className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Virtual Gifts Drawer */}
          <AnimatePresence>
            {showGiftDrawer && (
              <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="absolute bottom-0 inset-x-0 z-40 bg-neutral-900 border-t border-neutral-800 p-4 rounded-t-3xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    Offrir un Cadeau Badoo Live 🎁
                  </h4>
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{credits} CR</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-3">
                  {LIVE_GIFTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSendGift(g)}
                      className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 flex flex-col items-center justify-center space-y-1 transition-all active:scale-95"
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <span className="text-[10px] font-black text-amber-400">{g.cost} CR</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setShowGiftDrawer(false)}
                  className="w-full h-10 rounded-2xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  Fermer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
