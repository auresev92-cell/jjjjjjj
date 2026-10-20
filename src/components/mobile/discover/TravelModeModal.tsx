import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, MapPin, Search, Check, X, RotateCcw, Sparkles } from 'lucide-react';

export interface TravelDestination {
  id: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
}

export const POPULAR_DESTINATIONS: TravelDestination[] = [
  { id: 'abidjan', name: 'Abidjan', country: 'Côte d’Ivoire', flag: '🇨🇮', lat: 5.3600, lon: -4.0083 },
  { id: 'paris', name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lon: 2.3522 },
  { id: 'lyon', name: 'Lyon', country: 'France', flag: '🇫🇷', lat: 45.7640, lon: 4.8357 },
  { id: 'marseille', name: 'Marseille', country: 'France', flag: '🇫🇷', lat: 43.2965, lon: 5.3698 },
  { id: 'montreal', name: 'Montréal', country: 'Canada', flag: '🇨🇦', lat: 45.5017, lon: -73.5673 },
  { id: 'dakar', name: 'Dakar', country: 'Sénégal', flag: '🇸🇳', lat: 14.7167, lon: -17.4677 },
  { id: 'bruxelles', name: 'Bruxelles', country: 'Belgique', flag: '🇧🇪', lat: 50.8503, lon: 4.3517 },
  { id: 'geneve', name: 'Genève', country: 'Suisse', flag: '🇨🇭', lat: 46.2044, lon: 6.1432 },
  { id: 'new_york', name: 'New York', country: 'États-Unis', flag: '🇺🇸', lat: 40.7128, lon: -74.0060 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japon', flag: '🇯🇵', lat: 35.6762, lon: 139.6503 }
];

interface TravelModeModalProps {
  currentDestination: TravelDestination | null;
  onSelectDestination: (dest: TravelDestination | null) => void;
  onClose: () => void;
}

export function TravelModeModal({
  currentDestination,
  onSelectDestination,
  onClose
}: TravelModeModalProps) {
  const [search, setSearch] = useState('');

  const filtered = POPULAR_DESTINATIONS.filter(
    d => d.name.toLowerCase().includes(search.toLowerCase()) || 
         d.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (dest: TravelDestination) => {
    onSelectDestination(dest);
    onClose();
  };

  const handleReset = () => {
    onSelectDestination(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full max-w-md bg-gradient-to-b from-[#1e0a38] via-[#16042c] to-[#0e021c] border-t sm:border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative z-10 text-white max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#ec4899] flex items-center justify-center shadow-md">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Mode Voyage</span>
                <span className="text-[10px] bg-pink-500/30 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-full font-bold">VIP</span>
              </h3>
              <p className="text-[12px] text-purple-200/70">
                Téléportez-vous et découvrez des célibataires partout dans le monde
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-900/40 hover:bg-purple-900/60 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une destination..."
            className="w-full pl-9 pr-4 py-2.5 bg-purple-950/40 border border-purple-500/25 rounded-2xl text-[13.5px] text-white placeholder-purple-300/50 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        {/* Current status / Reset Button */}
        {currentDestination && (
          <div className="mt-3 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-transparent border border-pink-500/30 p-2.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{currentDestination.flag}</span>
              <div>
                <span className="text-[12px] font-bold text-white block">
                  Position active : {currentDestination.name}
                </span>
                <span className="text-[11px] text-pink-300/80">
                  Calcul de proximité depuis {currentDestination.name}
                </span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] bg-purple-900/50 hover:bg-purple-900/80 border border-purple-400/30 text-white font-semibold px-2.5 py-1 rounded-xl flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-pink-400" />
              <span>Position réelle</span>
            </button>
          </div>
        )}

        {/* Destinations List */}
        <div className="mt-3 overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-hide">
          <span className="text-[11px] font-extrabold uppercase text-purple-300/60 tracking-wider px-1">
            Destinations populaires
          </span>
          {filtered.map((dest) => {
            const isSelected = currentDestination?.id === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => handleSelect(dest)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-pink-500/25 to-purple-600/25 border-pink-500/60 shadow-md' 
                    : 'bg-purple-950/25 border-purple-500/15 hover:bg-purple-900/30 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{dest.flag}</span>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-white block leading-tight">
                      {dest.name}
                    </span>
                    <span className="text-[12px] text-purple-200/70">
                      {dest.country}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#f43f5e] flex items-center justify-center text-white shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <MapPin className="w-4 h-4 text-purple-400/40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="mt-4 pt-3 border-t border-purple-500/20 text-center">
          <p className="text-[11.5px] text-purple-200/60 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Tous les profils sont automatiquement recalculés et triés par distance.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
