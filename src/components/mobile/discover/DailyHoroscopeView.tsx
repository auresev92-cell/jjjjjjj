import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Clock, Compass, Star, ChevronRight, RefreshCw, Flame, ArrowRight } from 'lucide-react';
import { aiSystemEngine, DailyHoroscopeReading } from '../../../services/aiSystemEngine';

const ALL_ZODIAC_SIGNS = [
  { name: 'Bélier', symbol: '♈', dates: '21 mars - 19 avril' },
  { name: 'Taureau', symbol: '♉', dates: '20 avril - 20 mai' },
  { name: 'Gémeaux', symbol: '♊', dates: '21 mai - 20 juin' },
  { name: 'Cancer', symbol: '♋', dates: '21 juin - 22 juillet' },
  { name: 'Lion', symbol: '♌', dates: '23 juillet - 22 août' },
  { name: 'Vierge', symbol: '♍', dates: '23 août - 22 septembre' },
  { name: 'Balance', symbol: '♎', dates: '23 septembre - 22 octobre' },
  { name: 'Scorpion', symbol: '♏', dates: '23 octobre - 21 novembre' },
  { name: 'Sagittaire', symbol: '♐', dates: '22 novembre - 21 décembre' },
  { name: 'Capricorne', symbol: '♑', dates: '22 décembre - 19 janvier' },
  { name: 'Verseau', symbol: '♒', dates: '20 janvier - 18 février' },
  { name: 'Poissons', symbol: '♓', dates: '19 février - 20 mars' },
];

export function DailyHoroscopeView({
  userZodiac,
  onSelectCompatibleSign,
  onClose
}: {
  userZodiac?: string;
  onSelectCompatibleSign?: (sign: string) => void;
  onClose?: () => void;
}) {
  const [selectedSign, setSelectedSign] = useState<string>(() => {
    if (userZodiac) {
      const match = ALL_ZODIAC_SIGNS.find(s => userZodiac.toLowerCase().includes(s.name.toLowerCase()));
      if (match) return match.name;
    }
    try {
      const savedProfile = JSON.parse(localStorage.getItem('bavel_user_profile') || '{}');
      if (savedProfile?.details?.zodiac) {
        const match = ALL_ZODIAC_SIGNS.find(s => savedProfile.details.zodiac.toLowerCase().includes(s.name.toLowerCase()));
        if (match) return match.name;
      }
    } catch {}
    return 'Lion';
  });

  const [horoscope, setHoroscope] = useState<DailyHoroscopeReading>(() => 
    aiSystemEngine.generateDailyHoroscope(selectedSign)
  );

  const [showSignPicker, setShowSignPicker] = useState(false);

  useEffect(() => {
    setHoroscope(aiSystemEngine.generateDailyHoroscope(selectedSign));
  }, [selectedSign]);

  return (
    <div className="flex flex-col space-y-4 text-white pb-20 select-none">
      {/* Apple-Glass Main Horoscope Card */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="apple-glass-card rounded-[28px] p-5 relative overflow-hidden shadow-2xl border border-purple-500/30"
      >
        {/* Glow ambient effects */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header info */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200/70 block">
                Astrologie & Affinités IA
              </span>
              <span className="text-[13px] font-extrabold text-white">
                {horoscope.date}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSignPicker(!showSignPicker)}
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 active:scale-95 transition-all px-3 py-1.5 rounded-full border border-white/15 text-[12px] font-bold text-white cursor-pointer"
          >
            <span className="text-base leading-none">{horoscope.symbol}</span>
            <span>{horoscope.sign}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showSignPicker ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Sign Selector Dropdown / Grid */}
        {showSignPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-3 border-b border-white/10 grid grid-cols-4 gap-1.5 relative z-20"
          >
            {ALL_ZODIAC_SIGNS.map((s) => {
              const isCurrent = s.name === selectedSign;
              return (
                <button
                  key={s.name}
                  onClick={() => {
                    setSelectedSign(s.name);
                    setShowSignPicker(false);
                  }}
                  className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-md scale-105'
                      : 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-200/80 border border-white/5'
                  }`}
                >
                  <span className="text-lg leading-none mb-0.5">{s.symbol}</span>
                  <span className="text-[10px] tracking-tight truncate max-w-full">{s.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Main Reading & Scores */}
        <div className="pt-4 space-y-4 relative z-10">
          {/* Affinity Score & Mood Bar */}
          <div className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/30 to-purple-500/40 border border-pink-400/40 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-base font-black text-pink-300 leading-none">
                  {horoscope.loveAffinityScore}%
                </span>
                <span className="text-[8px] uppercase tracking-wider text-white/70 font-semibold mt-0.5">
                  Amour
                </span>
              </div>
              <div>
                <span className="text-[11px] text-purple-300 font-semibold block">Humeur du Ciel</span>
                <span className="text-[13.5px] font-bold text-white flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                  {horoscope.mood}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10.5px] text-purple-300/80 block">Élément</span>
              <span className="text-[12px] font-extrabold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                {horoscope.element}
              </span>
            </div>
          </div>

          {/* AI Love Reading Text */}
          <div className="bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl p-4 border border-white/10">
            <h4 className="text-[13px] font-bold text-pink-300 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
              <span>Message Cosmique d'Amour</span>
            </h4>
            <p className="text-[13.5px] text-purple-100/90 leading-relaxed font-normal">
              {horoscope.reading}
            </p>
          </div>

          {/* Love Advice & Date Idea */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-[#1b0833]/70 rounded-2xl p-3 border border-purple-500/20">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-pink-300/80 block mb-1">
                Conseil Séduction
              </span>
              <p className="text-[12px] text-purple-200/90 leading-snug">
                {horoscope.loveAdvice}
              </p>
            </div>

            <div className="bg-[#1b0833]/70 rounded-2xl p-3 border border-purple-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-teal-300/80">
                  Heure Idéale
                </span>
                <span className="text-[10px] text-white/70 font-semibold flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {horoscope.luckyHour}
                </span>
              </div>
              <p className="text-[12px] text-purple-200/90 leading-snug">
                {horoscope.dateSuggestion}
              </p>
            </div>
          </div>

          {/* Compatible Signs Section */}
          <div className="bg-black/25 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 block mb-2">
              Affinités Cosmiques Recommandées Aujourd'hui
            </span>
            <div className="flex flex-wrap gap-2">
              {horoscope.compatibleSigns.map((sign) => {
                const sData = ALL_ZODIAC_SIGNS.find(s => s.name === sign);
                return (
                  <button
                    key={sign}
                    onClick={() => {
                      if (onSelectCompatibleSign) {
                        onSelectCompatibleSign(sign);
                      }
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/35 hover:to-purple-600/35 border border-pink-400/30 text-white text-[12px] font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <span>{sData?.symbol || '✨'}</span>
                    <span>{sign}</span>
                    <ArrowRight className="w-3 h-3 text-pink-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
