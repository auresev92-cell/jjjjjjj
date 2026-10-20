import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Hand, Heart, Zap, ArrowRight, Star } from 'lucide-react';
import { noCodeStudioEngine, CustomButton, CustomSection, NoCodeStudioState } from '../../services/noCodeStudioStore';

interface DynamicButtonsProps {
  container: 'discover' | 'encounters' | 'profile' | 'navbar';
  onNavigateTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

export function DynamicButtons({ container, onNavigateTab, onShowToast }: DynamicButtonsProps) {
  const [studioState, setStudioState] = useState<NoCodeStudioState>(() => noCodeStudioEngine.getState());

  useEffect(() => {
    const unsub = noCodeStudioEngine.subscribe(() => {
      setStudioState({ ...noCodeStudioEngine.getState() });
    });
    return unsub;
  }, []);

  const matchingButtons = studioState.customButtons.filter(b => b.targetContainer === container);

  if (matchingButtons.length === 0) return null;

  const handleButtonClick = (btn: CustomButton) => {
    if (btn.actionType === 'toast') {
      if (onShowToast) onShowToast(btn.actionTarget);
    } else if (btn.actionType === 'navigate') {
      if (onNavigateTab) onNavigateTab(btn.actionTarget);
    }
  };

  const colorClasses: Record<string, string> = {
    rose: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/25',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/25',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25',
    slate: 'bg-neutral-800 text-white shadow-black/20'
  };

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {matchingButtons.map(btn => (
        <motion.button
          key={btn.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonClick(btn)}
          className={`px-4 py-2.5 rounded-2xl font-black text-[12px] flex items-center space-x-2 shadow-md cursor-pointer ${colorClasses[btn.color] || colorClasses.rose}`}
        >
          <Sparkles className="w-4 h-4 fill-white/20" />
          <span>{btn.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

interface DynamicSectionsProps {
  targetTab: 'discover' | 'encounters' | 'likes' | 'discussions' | 'profile';
  onNavigateTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

export function DynamicSections({ targetTab, onNavigateTab, onShowToast }: DynamicSectionsProps) {
  const [studioState, setStudioState] = useState<NoCodeStudioState>(() => noCodeStudioEngine.getState());

  useEffect(() => {
    const unsub = noCodeStudioEngine.subscribe(() => {
      setStudioState({ ...noCodeStudioEngine.getState() });
    });
    return unsub;
  }, []);

  const matchingSections = studioState.customSections
    .filter(s => s.targetTab === targetTab && s.visible)
    .sort((a, b) => a.order - b.order);

  if (matchingSections.length === 0) return null;

  return (
    <div className="space-y-3 my-3">
      {matchingSections.map(sec => (
        <motion.div 
          key={sec.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141416] p-3.5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13.5px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{sec.title}</span>
              </h3>
              {sec.description && (
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                  {sec.description}
                </p>
              )}
            </div>

            <button 
              onClick={() => {
                noCodeStudioEngine.updateSection(sec.id, { collapsed: !sec.collapsed });
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <span className="text-[10px] font-bold uppercase">{sec.collapsed ? 'Afficher' : 'Réduire'}</span>
            </button>
          </div>

          {!sec.collapsed && sec.items && sec.items.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {sec.items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    if (onShowToast) onShowToast(`${item.title} sélectionné ! ✨`);
                  }}
                  className="bg-slate-50 dark:bg-[#1c1c1f] p-2.5 rounded-xl border border-slate-200/60 dark:border-neutral-800 cursor-pointer hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{item.icon || '🌟'}</span>
                    <div className="truncate">
                      <h4 className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                      {item.subtitle && <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">{item.subtitle}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
