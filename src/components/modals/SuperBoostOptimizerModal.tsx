import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Image as ImageIcon, 
  FileText, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Star,
  Check
} from 'lucide-react';
import { aiSystemEngine } from '../../services/aiSystemEngine';
import { monetizationService } from '../../services/monetizationService';
import { syncProfileToSupabase } from '../../lib/supabase';

interface SuperBoostOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhotos: string[];
  setUserPhotos?: React.Dispatch<React.SetStateAction<string[]>>;
  userProfile: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
}

export const SuperBoostOptimizerModal: React.FC<SuperBoostOptimizerModalProps> = ({
  isOpen,
  onClose,
  userPhotos,
  setUserPhotos,
  userProfile,
  setUserProfile,
}) => {
  const [step, setStep] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof aiSystemEngine.runSuperBoostOptimizer> | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'bio'>('photos');
  const [boostTimeLeft, setBoostTimeLeft] = useState<string>('30:00');
  const [boostState, setBoostState] = useState(monetizationService.getBoostState());

  useEffect(() => {
    const unsub = monetizationService.subscribe(() => {
      setBoostState(monetizationService.getBoostState());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!boostState.isActive || !boostState.expiresAt) return;
    const interval = setInterval(() => {
      const remainingMs = boostState.expiresAt! - Date.now();
      if (remainingMs <= 0) {
        setBoostTimeLeft('00:00');
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setBoostTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [boostState]);

  if (!isOpen) return null;

  const handleStartOptimization = () => {
    setStep('analyzing');
    setTimeout(() => {
      const res = aiSystemEngine.runSuperBoostOptimizer({
        userPhotos,
        bio: userProfile?.bio,
        name: userProfile?.name,
        interests: userProfile?.interests,
        city: userProfile?.location || userProfile?.city,
        lookingFor: userProfile?.lookingFor,
      });

      setAnalysisResult(res);
      setStep('completed');
    }, 2200);
  };

  const handleApplyOptimization = () => {
    if (!analysisResult) return;

    // 1. Update photos
    if (setUserPhotos && analysisResult.optimizedPhotos.length > 0) {
      setUserPhotos(analysisResult.optimizedPhotos);
    }

    // 2. Update bio
    if (setUserProfile && analysisResult.optimizedBio) {
      setUserProfile((prev: any) => {
        const updated = {
          ...prev,
          bio: analysisResult.optimizedBio,
        };
        syncProfileToSupabase(updated, analysisResult.optimizedPhotos);
        return updated;
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-md bg-neutral-900 text-white rounded-[28px] p-6 shadow-2xl border border-purple-500/30 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header glowing background */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-purple-600/25 via-pink-600/10 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title bar */}
          <div className="flex items-center space-x-2.5 z-10 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/30 shrink-0">
              <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-[17px] font-black tracking-tight text-white">Match Optimizer IA</h3>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40 uppercase">
                  100% Autonome
                </span>
              </div>
              <p className="text-[12px] text-neutral-400 font-medium">
                Optimisation autonome & visibilité prioritaire 30 min
              </p>
            </div>
          </div>

          {/* STEP 1: IDLE PROMPT */}
          {step === 'idle' && (
            <div className="flex flex-col space-y-4 z-10 my-auto py-2">
              {/* Active boost indicator if active */}
              {boostState.isActive && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span className="text-[12.5px] font-bold text-emerald-300">Boost IA Actif (+380% visibilité)</span>
                  </div>
                  <span className="text-[12.5px] font-black text-emerald-400 font-mono">{boostTimeLeft}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-3.5 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ImageIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-white">Classement intelligent des photos</h4>
                    <p className="text-[12px] text-neutral-400 leading-snug mt-0.5">
                      L'IA interne évalue la netteté et la convivialité de chaque photo pour placer la plus séduisante en couverture.
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-3.5 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-white">Réécriture captivante de la bio</h4>
                    <p className="text-[12px] text-neutral-400 leading-snug mt-0.5">
                      Génère une biographie accrocheuse basée sur vos vrais centres d'intérêt, sans phrase toute faite.
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-3.5 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-white">Boost de visibilité 30 min (+380%)</h4>
                    <p className="text-[12px] text-neutral-400 leading-snug mt-0.5">
                      Propulse votre profil en 1ère position dans la section « Pour vous » et « Rencontres ».
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/40 border border-purple-500/25 rounded-xl p-2.5 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-[11.5px] text-purple-200">
                  Moteur IA local dédié : Gratuit, instantané et sans transfert de données externes.
                </span>
              </div>

              <button
                onClick={handleStartOptimization}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-[15px] rounded-2xl shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-5 h-5 fill-white/20" />
                <span>Lancer l'Optimisation par l'IA</span>
              </button>
            </div>
          )}

          {/* STEP 2: ANALYZING ANIMATION */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-5 z-10 text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 border-r-pink-500"
                />
                <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[16px] font-bold text-white">Analyse autonome en cours...</h4>
                <p className="text-[12.5px] text-neutral-400 max-w-[280px] mx-auto leading-relaxed">
                  Calcul des scores esthétiques, réorganisation des visuels et création de la biographie optimisée.
                </p>
              </div>

              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden max-w-[240px]">
                <motion.div
                  initial={{ width: '5%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.1, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                />
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED RESULTS */}
          {step === 'completed' && analysisResult && (
            <div className="flex flex-col space-y-3.5 z-10 overflow-y-auto pr-1 scrollbar-hide py-1">
              {/* Top summary badge */}
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[13px] font-extrabold text-white block">Optimisation IA Terminée !</span>
                    <span className="text-[11px] text-emerald-300 font-medium">{analysisResult.estimatedVisibilityBoost}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Boost 30 min</span>
                  <span className="text-[13px] font-black text-emerald-400 font-mono">{boostTimeLeft}</span>
                </div>
              </div>

              {/* Tabs for detail inspection */}
              <div className="flex bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex-1 py-1.5 text-[12.5px] font-bold rounded-lg transition-all ${
                    activeTab === 'photos' ? 'bg-purple-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  📸 Photos ({analysisResult.photoScores.length})
                </button>
                <button
                  onClick={() => setActiveTab('bio')}
                  className={`flex-1 py-1.5 text-[12.5px] font-bold rounded-lg transition-all ${
                    activeTab === 'bio' ? 'bg-purple-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ✍️ Bio Optimisée
                </button>
              </div>

              {/* Tab 1: Photo rankings */}
              {activeTab === 'photos' && (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {analysisResult.photoScores.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl p-2.5 flex items-center justify-between space-x-3"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-neutral-700">
                          <img src={p.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-0.5 left-0.5 bg-amber-400 text-black text-[9px] font-black px-1 rounded-xs">
                              1ÈRE
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[12px] font-bold text-white block">
                            {idx === 0 ? "Photo Vedette Sélectionnée" : `Photo #${idx + 1}`}
                          </span>
                          <span className="text-[10.5px] text-neutral-400 block leading-tight">
                            {p.advice}
                          </span>
                        </div>
                      </div>
                      <div className="bg-purple-500/20 text-purple-300 font-mono font-bold text-[12px] px-2 py-0.5 rounded-md border border-purple-500/30 shrink-0">
                        {p.score}/100
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Bio before/after */}
              {activeTab === 'bio' && (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-left">
                  <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase text-purple-400 tracking-wider block">
                      Nouvelle Bio Optimisée
                    </span>
                    <p className="text-[13px] text-white leading-relaxed font-medium">
                      "{analysisResult.optimizedBio}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 px-1">Améliorations apportées :</span>
                    {analysisResult.bioImprovements.map((imp, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11.5px] text-neutral-300 px-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Action Button */}
              <button
                onClick={handleApplyOptimization}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[15px] rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer mt-1"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Appliquer et profiter du Boost</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
