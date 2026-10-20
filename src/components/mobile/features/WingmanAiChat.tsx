import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, RefreshCw, X, MessageSquare, ThumbsUp } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface WingmanAiChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (text: string) => void;
  chatContext?: string;
}

export function WingmanAiChat({ isOpen, onClose, onSelectSuggestion, chatContext = 'Discussion en cours' }: WingmanAiChatProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Si tu devais choisir un plat pour le reste de ta vie, ce serait quoi ? 🍕",
    "Ton profil m'a fait sourire. Quel est ton plus grand talent caché ? ✨",
    "Entre un week-end spa au calme et un road trip improvisé, tu es plutôt quel camp ? 🌍",
    "On parie que tu ne devines pas quel est mon péché mignon number one ? 😉"
  ]);

  const handleGenerateNew = () => {
    triggerHaptic('light');
    setLoading(true);
    setTimeout(() => {
      setSuggestions([
        "J'ai l'impression qu'on a un point commun secret... Tu valides ou pas ? 🕵️‍♂️",
        "Si tu pouvais voyager dans le temps, tu irais à quelle époque ? ⏳",
        "Quel est le dernier film ou série qui t'a totalement captivé(e) ? 🍿",
        "Ton meilleur plan pour un dimanche parfait ensoleillé ? ☀️"
      ]);
      setLoading(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-20 left-4 right-4 bg-[#1b0632]/95 backdrop-blur-2xl border border-pink-500/30 rounded-3xl p-4 shadow-2xl z-[150] text-white select-none"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-md shadow-pink-500/30">
            <Wand2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xs bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Wingman AI Assistant</h4>
            <p className="text-[10px] text-gray-400">Zéro panne de conversation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleGenerateNew} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <RefreshCw className={`w-3.5 h-3.5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <X className="w-3.5 h-3.5 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-2 max-h-56 overflow-y-auto pr-1">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              triggerHaptic('medium');
              onSelectSuggestion(s);
              onClose();
            }}
            className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/40 text-xs text-gray-200 transition-all flex items-center justify-between group"
          >
            <span>{s}</span>
            <span className="opacity-0 group-hover:opacity-100 text-pink-400 font-bold text-[10px] flex items-center gap-1 transition-opacity">
              Utiliser <ThumbsUp className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
