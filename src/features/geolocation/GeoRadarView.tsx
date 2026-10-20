import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  SlidersHorizontal, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Radio
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geoService } from '../../services/geoService';
import { Profile } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useUX } from '../../context/UXContext';

interface GeoRadarViewProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onClose?: () => void;
}

export const GeoRadarView: React.FC<GeoRadarViewProps> = React.memo(({
  profiles,
  onSelectProfile,
  onClose,
}) => {
  const { coords, loading, error, fetchPosition, permission } = useGeolocation({
    enableHighAccuracy: true,
    autoFetch: true,
  });

  const { triggerFeedback } = useUX();
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(15);
  const [showSqlInspector, setShowSqlInspector] = useState<boolean>(false);

  // Calculate distances for all profiles
  const profilesWithDistance = useMemo(() => {
    return profiles.map((p) => {
      // If profile has specific coords, calculate real distance; otherwise derive from mock data
      let dist = (p as any).distance ? parseFloat(String((p as any).distance)) : 2.5;
      if (coords && (p as any).lat && (p as any).lon) {
        dist = geoService.calculateDistance(
          coords.latitude,
          coords.longitude,
          (p as any).lat,
          (p as any).lon
        );
      }
      return { ...p, calculatedDistance: dist };
    });
  }, [profiles, coords]);

  // Filter profiles within radius
  const nearbyProfiles = useMemo(() => {
    return profilesWithDistance
      .filter((p) => p.calculatedDistance <= maxRadiusKm)
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [profilesWithDistance, maxRadiusKm]);

  // Generated PostGIS Query for demonstration/inspection
  const postgisQuery = useMemo(() => {
    if (!coords) return '-- Activez votre GPS pour générer la requête PostGIS';
    return geoService.generatePostGisRadiusQuery(
      coords.latitude,
      coords.longitude,
      maxRadiusKm
    );
  }, [coords, maxRadiusKm]);

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white rounded-3xl p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-[#e20030] flex items-center justify-center border border-rose-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              Radar de Proximité
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/30">
                GPS Réel
              </Badge>
            </h2>
            <p className="text-xs text-neutral-400">
              {coords
                ? `Position: ${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}° (±${Math.round(coords.accuracy || 0)}m)`
                : 'Recherche de votre position...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              triggerFeedback('light');
              fetchPosition();
            }}
            disabled={loading}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Rafraîchir la position GPS"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-xs font-bold"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Permission alert if denied */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Radar Graphic Canvas */}
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] mx-auto my-2 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Radar concentric rings */}
        <div className="absolute inset-4 rounded-full border border-neutral-800/80" />
        <div className="absolute inset-16 rounded-full border border-neutral-800/80" />
        <div className="absolute inset-28 rounded-full border border-neutral-800/80" />
        <div className="absolute w-full h-[1px] bg-neutral-800/60" />
        <div className="absolute h-full w-[1px] bg-neutral-800/60" />

        {/* Radar sweeping scan line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 origin-center pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(226, 0, 48, 0.25) 360deg)',
          }}
        />

        {/* Center User Dot */}
        <div className="relative z-10 w-4 h-4 rounded-full bg-[#e20030] shadow-[0_0_15px_#e20030] border-2 border-white" />

        {/* Nearby Blips (Profiles) */}
        {nearbyProfiles.slice(0, 8).map((p, idx) => {
          const angle = (idx * (360 / Math.min(nearbyProfiles.length, 8)) * Math.PI) / 180;
          const normalizedDist = Math.max(0.2, Math.min(0.85, p.calculatedDistance / maxRadiusKm));
          const x = Math.cos(angle) * (normalizedDist * 110);
          const y = Math.sin(angle) * (normalizedDist * 110);

          return (
            <motion.button
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => {
                triggerFeedback('medium');
                onSelectProfile(p);
              }}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute z-20 group flex flex-col items-center cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-full border-2 border-rose-500 overflow-hidden shadow-lg group-hover:scale-125 transition-transform">
                <img
                  src={(p as any).img || (p as any).photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] font-bold bg-black/80 px-1 rounded-full text-white mt-0.5 whitespace-nowrap shadow">
                {p.calculatedDistance} km
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Radius Slider Control */}
      <div className="bg-neutral-800/60 rounded-2xl p-4 my-3 border border-neutral-700/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            Rayon de recherche
          </span>
          <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            {maxRadiusKm} km
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={maxRadiusKm}
          onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
          className="w-full accent-[#e20030] cursor-pointer h-1.5 bg-neutral-700 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
          <span>1 km (Proche)</span>
          <span>25 km</span>
          <span>50 km (Région)</span>
        </div>
      </div>

      {/* Nearby Results List */}
      <div className="space-y-2 mt-1">
        <div className="flex justify-between items-center text-xs font-bold text-neutral-400 px-1">
          <span>{nearbyProfiles.length} profils trouvés dans un rayon de {maxRadiusKm} km</span>
          <button
            onClick={() => setShowSqlInspector(!showSqlInspector)}
            className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
          >
            <Database className="w-3 h-3" />
            {showSqlInspector ? 'Masquer PostGIS' : 'Requête PostGIS'}
          </button>
        </div>

        {/* PostGIS Query Code Inspector */}
        {showSqlInspector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-black/80 rounded-xl border border-neutral-700 font-mono text-[11px] text-emerald-400 overflow-x-auto"
          >
            <pre>{postgisQuery}</pre>
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {nearbyProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                triggerFeedback('light');
                onSelectProfile(p);
              }}
              className="flex items-center space-x-2.5 p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 transition-colors text-left border border-neutral-700/40"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-700">
                <img
                  src={(p as any).img || (p as any).photos?.[0]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black truncate">{p.name}, {p.age}</p>
                <p className="text-[10px] text-rose-400 font-medium flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {p.calculatedDistance} km
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

GeoRadarView.displayName = 'GeoRadarView';
