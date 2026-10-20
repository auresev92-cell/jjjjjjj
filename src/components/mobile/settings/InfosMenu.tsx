import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Search, X, MapPin } from 'lucide-react';
import { syncProfileToSupabase } from '../../../lib/supabase';
import { triggerHaptic } from '../../../utils/audio';
import { searchLocations } from '../../../data/worldCities';
import { getSavedUserSafe } from '../../../utils/safeStorage';

export interface InfosMenuProps {
  onClose: () => void;
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
}

export function InfosMenu({ 
  onClose, 
  userProfile, 
  setUserProfile 
}: InfosMenuProps) {
  const [editingField, setEditingField] = useState<'name' | 'gender' | 'city' | 'info_explanation' | null>(null);
  const [tempName, setTempName] = useState(userProfile?.name || 'Steven');
  const [tempGender, setTempGender] = useState(userProfile?.gender || 'homme');
  const [tempCity, setTempCity] = useState(userProfile?.city || 'Le Mans');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSaveField = (field: 'name' | 'gender' | 'city') => {
    setUserProfile?.((prev: any) => {
      const updated = {
        ...prev,
        name: field === 'name' ? tempName : prev?.name,
        gender: field === 'gender' ? tempGender : prev?.gender,
        city: field === 'city' ? tempCity : prev?.city,
      };
      syncProfileToSupabase(updated);
      
      const savedUser = getSavedUserSafe() || {};
      localStorage.setItem('app_user', JSON.stringify({ ...savedUser, ...updated }));
      return updated;
    });
    setEditingField(null);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[110] flex flex-col h-full overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between relative pt-8 pb-[env(safe-area-inset-bottom,20px)] px-4 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 shrink-0">
        <button 
          onClick={onClose} 
          className="p-1 -ml-1 text-white hover:text-purple-300 transition-colors cursor-pointer"
          aria-label="Retour"
        >
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
        <h2 className="text-[14.5px] font-extrabold text-white tracking-tight">Infos personnelles</h2>
        <div className="w-5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-[env(safe-area-inset-bottom,20px)]">
        {/* Row List */}
        <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl overflow-hidden shadow-lg shadow-purple-950/40 divide-y divide-purple-500/15">
          
          {/* Prénom */}
          <button 
            onClick={() => {
              setTempName(userProfile?.name || 'Steven');
              setEditingField('name');
            }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] font-medium text-white">Prénom</span>
            <div className="flex items-center space-x-1.5 text-purple-300/70">
              <span className="text-[13px] text-purple-200/80 font-medium">{userProfile?.name || 'Steven'}</span>
              <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" strokeWidth={2} />
            </div>
          </button>

          {/* Né(e) le */}
          <div className="w-full flex items-center justify-between px-4 py-3 text-left">
            <span className="text-[13.5px] font-medium text-white">Né(e) le</span>
            <span className="text-[13px] text-purple-200/80 font-medium">1 novembre 1991</span>
          </div>

          {/* Sexe */}
          <button 
            onClick={() => {
              setTempGender(userProfile?.gender || 'homme');
              setEditingField('gender');
            }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] font-medium text-white">Sexe</span>
            <div className="flex items-center space-x-1.5 text-purple-300/70">
              <span className="text-[13px] text-purple-200/80 font-medium capitalize">
                {userProfile?.gender === 'femme' ? 'Femme' : userProfile?.gender === 'autre' ? 'Autre' : 'Homme'}
              </span>
              <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" strokeWidth={2} />
            </div>
          </button>

          {/* Emplacement */}
          <button 
            onClick={() => {
              setTempCity(userProfile?.city || 'Le Mans');
              setEditingField('city');
            }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/30 transition-colors text-left cursor-pointer"
          >
            <span className="text-[13.5px] font-medium text-white">Emplacement</span>
            <div className="flex items-center space-x-1.5 text-purple-300/70">
              <span className="text-[13px] text-purple-200/80 font-medium">{userProfile?.city || 'Le Mans'}</span>
              <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" strokeWidth={2} />
            </div>
          </button>

        </div>

        {/* Footnote Explanation */}
        <div className="px-2 pt-3 text-left space-y-1">
          <p className="text-[11.5px] text-purple-300/70 leading-snug">
            Les autres pourront voir que tu n'utilises pas ta localisation actuelle :
          </p>
          <button 
            onClick={() => setEditingField('info_explanation')}
            className="text-[11.5px] font-semibold text-rose-400 underline underline-offset-2 hover:text-rose-300 transition-colors text-left cursor-pointer block"
          >
            Comment est-ce que ça apparaît sur mon profil ?
          </button>
        </div>
      </div>

      {/* Editing Sub-sheets / Modals */}
      <AnimatePresence>
        {editingField === 'name' && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[130] flex flex-col"
          >
            <div className="flex items-center justify-between pt-8 pb-3 px-4 border-b border-purple-500/20 bg-[#18052e]/95">
              <button onClick={() => setEditingField(null)} className="text-purple-300 font-medium text-[14px] cursor-pointer">Annuler</button>
              <h3 className="font-bold text-[15px] text-white">Prénom</h3>
              <button onClick={() => handleSaveField('name')} className="text-pink-400 font-bold text-[14px] cursor-pointer">Enregistrer</button>
            </div>
            <div className="p-4">
              <label className="block text-[12px] font-bold text-purple-300 uppercase mb-2">Modifier votre prénom</label>
              <input 
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-[#200a38]/85 border border-purple-500/30 rounded-xl px-4 py-3 text-[15px] text-white outline-none focus:border-pink-500 font-medium"
                placeholder="Votre prénom"
                autoFocus
              />
            </div>
          </motion.div>
        )}

        {editingField === 'gender' && (
          <div 
            className="fixed inset-0 bg-black/60 z-[200] flex items-end justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-200"
            onClick={() => setEditingField(null)}
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-sm sm:max-w-md flex flex-col space-y-2 mb-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Options Card */}
              <div className="bg-[#200a38] border border-purple-500/30 backdrop-blur-md rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl divide-y divide-purple-500/20">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTempGender('homme');
                    setUserProfile?.((prev: any) => {
                      const updated = { ...prev, gender: 'homme' };
                      syncProfileToSupabase(updated);
                      const savedUser = getSavedUserSafe() || {};
                      localStorage.setItem('app_user', JSON.stringify({ ...savedUser, ...updated }));
                      return updated;
                    });
                    setEditingField(null);
                  }}
                  className="w-full py-3.5 sm:py-4 text-center text-pink-400 text-[18px] sm:text-[19px] font-semibold hover:bg-purple-900/30 active:bg-purple-900/50 transition-colors cursor-pointer block"
                >
                  Homme
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTempGender('femme');
                    setUserProfile?.((prev: any) => {
                      const updated = { ...prev, gender: 'femme' };
                      syncProfileToSupabase(updated);
                      const savedUser = getSavedUserSafe() || {};
                      localStorage.setItem('app_user', JSON.stringify({ ...savedUser, ...updated }));
                      return updated;
                    });
                    setEditingField(null);
                  }}
                  className="w-full py-3.5 sm:py-4 text-center text-pink-400 text-[18px] sm:text-[19px] font-semibold hover:bg-purple-900/30 active:bg-purple-900/50 transition-colors cursor-pointer block"
                >
                  Femme
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTempGender('autre');
                    setUserProfile?.((prev: any) => {
                      const updated = { ...prev, gender: 'autre' };
                      syncProfileToSupabase(updated);
                      const savedUser = getSavedUserSafe() || {};
                      localStorage.setItem('app_user', JSON.stringify({ ...savedUser, ...updated }));
                      return updated;
                    });
                    setEditingField(null);
                  }}
                  className="w-full py-3.5 sm:py-4 text-center text-pink-400 text-[18px] sm:text-[19px] font-semibold hover:bg-purple-900/30 active:bg-purple-900/50 transition-colors cursor-pointer block"
                >
                  Autres identités
                </button>
              </div>

              {/* Cancel Button Card */}
              <div className="bg-[#200a38] border border-purple-500/30 backdrop-blur-md rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setEditingField(null);
                  }}
                  className="w-full py-3.5 sm:py-4 text-center text-white text-[18px] sm:text-[19px] font-bold hover:bg-purple-900/30 active:bg-purple-900/50 transition-colors cursor-pointer block"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingField === 'city' && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[130] flex flex-col h-full overflow-hidden select-none font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between relative pt-8 pb-2.5 px-4 bg-[#18052e]/95 border-b border-purple-500/20 shrink-0">
              <button 
                onClick={() => setEditingField(null)} 
                className="p-1 -ml-1 text-white hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="Retour"
              >
                <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Votre emplacement</h2>
              <div className="w-5" />
            </div>

            {/* Search Input Bar */}
            <div className="px-3 py-2.5 bg-[#18052e]/80 border-b border-purple-500/20 flex items-center space-x-2 shrink-0">
              <div className="flex-1 bg-[#200a38] border border-purple-500/30 focus-within:border-pink-500 rounded-xl px-3 py-2 flex items-center space-x-2 transition-all">
                <Search className="w-4 h-4 text-purple-300 shrink-0" />
                <input 
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Votre ville"
                  className="w-full bg-transparent text-[15px] text-white outline-none font-normal placeholder:text-purple-400/60"
                  autoFocus
                />
                {locationQuery.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setLocationQuery('')}
                    className="bg-purple-800 hover:bg-purple-700 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X className="w-3 h-3" strokeWidth={3} />
                  </button>
                )}
              </div>
              {locationQuery.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setLocationQuery('')}
                  className="text-pink-400 text-[15px] font-medium pl-1 pr-1 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                >
                  Annuler
                </button>
              )}
            </div>

            {/* Location Results List */}
            <div className="flex-1 overflow-y-auto bg-[#16042c]/90 px-3 py-2 pb-2">
              {locationQuery.trim().length > 0 && (
                <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl divide-y divide-purple-500/15 overflow-hidden shadow-lg">
                  {searchLocations(locationQuery).map((loc, idx) => (
                    <button
                      key={`${loc.fullName}-${idx}`}
                      type="button"
                      onClick={() => {
                        triggerHaptic('success');
                        const newCityName = loc.name || loc.fullName;
                        setTempCity(newCityName);
                        setUserProfile?.((prev: any) => {
                          const updated = { ...prev, city: newCityName, location_full: loc.fullName };
                          syncProfileToSupabase(updated);
                          const savedUser = getSavedUserSafe() || {};
                          localStorage.setItem('app_user', JSON.stringify({ ...savedUser, ...updated }));
                          return updated;
                        });
                        setEditingField(null);
                      }}
                      className="w-full px-4 py-3.5 text-left hover:bg-purple-900/30 active:bg-purple-900/50 transition-colors cursor-pointer block"
                    >
                      <span className="text-[14px] sm:text-[14.5px] font-normal text-white block truncate">
                        {loc.fullName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {editingField === 'info_explanation' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[140] flex items-end justify-center"
            onClick={() => setEditingField(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-[#18052e] border-t border-purple-500/30 w-full rounded-t-[28px] p-6 pb-6 text-white select-none relative max-h-[92vh] overflow-y-auto scrollbar-hide shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={() => setEditingField(null)}
                className="absolute top-5 right-5 p-1 text-purple-300 hover:text-white transition-colors cursor-pointer z-10"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>

              {/* Top Purple Icon Badge */}
              <div className="w-12 h-12 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center mb-5 mt-1">
                <MapPin className="w-6 h-6 text-pink-400" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-extrabold text-white leading-[1.25] mb-3 tracking-tight text-left">
                Nous avons rendu les détails de localisation plus clairs
              </h3>

              {/* Subtitle */}
              <p className="text-[13.5px] text-purple-200/80 leading-snug mb-5 font-normal text-left">
                Voir sur les profils des autres s'ils utilisent leur emplacement actuel, par exemple:
              </p>

              {/* Cards Container */}
              <div className="space-y-3">
                {/* Card 1: Emplacement actuel */}
                <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-[20px] p-4 text-left">
                  <div className="text-[12.5px] text-purple-300/70 font-normal mb-0.5">Position</div>
                  <div className="text-[18px] font-extrabold text-white mb-1">
                    {userProfile?.city || 'Le Mans'}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[12px] text-purple-200/80 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" strokeWidth={2} />
                    <span>Emplacement actuel</span>
                  </div>
                </div>

                {/* "ou" divider */}
                <div className="text-center text-[13px] text-purple-300/60 font-normal py-1">
                  ou
                </div>

                {/* Card 2: La localisation choisie */}
                <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-[20px] p-4 text-left">
                  <div className="text-[12.5px] text-purple-300/70 font-normal mb-0.5">Position</div>
                  <div className="text-[18px] font-extrabold text-white mb-1">
                    {userProfile?.city || 'Le Mans'}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[12px] text-purple-200/80 font-medium">
                    <svg className="w-3.5 h-3.5 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="8" width="18" height="12" rx="2" />
                      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>La localisation choisie</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2.5">
                <button 
                  onClick={() => setEditingField(null)}
                  className="w-full bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] hover:opacity-95 text-white font-extrabold py-3.5 rounded-full text-[15px] shadow-md shadow-pink-900/40 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  C'est compris
                </button>

                <button 
                  onClick={() => {
                    setEditingField(null);
                  }}
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-white font-extrabold py-3.5 rounded-full text-[15px] active:scale-[0.98] transition-transform cursor-pointer"
                >
                  Définir l'emplacement actuel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
