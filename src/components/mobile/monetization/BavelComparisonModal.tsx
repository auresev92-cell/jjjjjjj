import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Star, Shield, Sparkles, RotateCcw, Heart, Flame, EyeOff, CheckCheck, ArrowUp, SlidersHorizontal, ThumbsUp, Ban } from "lucide-react";
import { PaymentCheckoutModal, PaymentItem } from "../../modals/PaymentCheckoutModal";

export function BavelComparisonModal({ 
  onClose,
  onOpenExtra,
  onOpenPremium
}: { 
  onClose: () => void;
  onOpenExtra?: () => void;
  onOpenPremium?: () => void;
}) {
  const [checkoutItem, setCheckoutItem] = useState<PaymentItem | null>(null);

  const handleSubscribePremium = () => {
    if (onOpenPremium) {
      onClose();
      onOpenPremium();
    } else {
      setCheckoutItem({
        type: 'subscription',
        subscriptionPlan: 'premium',
        title: 'Bavel Premium (1 mois)',
        amount: '29,99 €',
        description: 'Accès VIP complet à toutes les fonctionnalités Premium'
      });
    }
  };

  const handleSubscribeExtra = () => {
    if (onOpenExtra) {
      onClose();
      onOpenExtra();
    } else {
      setCheckoutItem({
        type: 'subscription',
        subscriptionPlan: 'extra',
        title: 'Bavel Extra (1 mois)',
        amount: '14,99 €',
        description: 'Accès illimité aux fonctionnalités Bavel Extra'
      });
    }
  };

  const comparisonItems = [
    {
      id: 'like',
      title: 'Découvrez qui vous a donné un Like',
      icon: () => <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />,
      extra: false,
      premium: true,
    },
    {
      id: 'priority_msg',
      title: 'Envoyez vos messages en priorité',
      icon: () => <ArrowUp className="w-5 h-5 text-white" strokeWidth={2.8} />,
      extra: false,
      premium: true,
    },
    {
      id: 'unlimited_filters',
      title: 'Profitez de filtres illimités',
      icon: () => <SlidersHorizontal className="w-5 h-5 text-white" strokeWidth={2.5} />,
      extra: false,
      premium: true,
    },
    {
      id: 'incognito',
      title: 'Consultez les profils en toute discrétion',
      icon: () => (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10h18M6 10l2-5h8l2 5" />
          <circle cx="8" cy="15" r="2.5" />
          <circle cx="16" cy="15" r="2.5" />
          <path d="M10.5 15h3" />
        </svg>
      ),
      extra: false,
      premium: true,
    },
    {
      id: 'swipes',
      title: 'Swipez aussi souvent que vous voulez',
      icon: () => <ThumbsUp className="w-5 h-5 text-white fill-white" strokeWidth={1} />,
      extra: true,
      premium: true,
    },
    {
      id: 'no_ads',
      title: 'Supprimez toutes les pubs',
      icon: () => <Ban className="w-5 h-5 text-white" strokeWidth={2.5} />,
      extra: true,
      premium: true,
    },
    {
      id: 'coup_de_coeur',
      title: '1 Coup de Cœur par jour',
      icon: () => (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
          <path d="M3 18L21 6" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      ),
      extra: true,
      premium: true,
    },
    {
      id: 'undo',
      title: 'Annulez des swipes accidentels',
      icon: () => <RotateCcw className="w-5 h-5 text-white" strokeWidth={2.8} />,
      extra: true,
      premium: true,
    },
    {
      id: 'bonus_credits',
      title: 'Des crédits bonus pour tout achat de crédits',
      icon: () => (
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" strokeWidth="2.5" />
        </svg>
      ),
      extra: true,
      premium: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[300] flex flex-col h-full font-sans select-none overflow-hidden"
    >
      {/* Top Bar Indicator & Header */}
      <div className="pt-2 px-4 pb-2 shrink-0 border-b border-purple-500/20 relative bg-[#18052e]/80">
        <div className="w-full h-1.5 bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] rounded-full mb-3 mt-1" />

        <div className="flex items-center justify-between relative h-10 px-1">
          <div className="flex items-center space-x-1 bg-amber-500/20 border border-amber-400/40 rounded-full px-2.5 py-0.5 text-[12px] font-bold text-amber-300 shadow-sm">
            <span className="text-amber-400 font-extrabold text-[11px]">⚡</span>
            <span>12</span>
          </div>

          <h1 className="absolute inset-0 flex items-center justify-center text-[18px] sm:text-[19px] font-black text-white tracking-tight pointer-events-none">
            Comparaison
          </h1>

          <button 
            onClick={onClose} 
            className="p-1.5 -mr-1 text-purple-200 hover:text-white transition-opacity cursor-pointer z-10"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex items-center justify-between pt-4 pb-1 px-1">
          <span className="text-purple-300/80 font-medium text-[13.5px] flex-1">
            Les avantages
          </span>
          <span className="text-white font-bold text-[14.5px] w-16 text-center">
            Extra
          </span>
          <span className="text-white font-bold text-[14.5px] w-16 text-center">
            Premium
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-1 space-y-0 no-scrollbar">
        {comparisonItems.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div 
              key={item.id}
              className={`flex items-center justify-between py-3.5 ${
                idx < comparisonItems.length - 1 ? 'border-b border-dashed border-purple-500/20' : ''
              }`}
            >
              <div className="w-9.5 h-9.5 rounded-full bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shrink-0 text-white shadow-xs">
                <IconComp />
              </div>

              <div className="text-[13.5px] sm:text-[14px] font-semibold text-purple-100 leading-snug flex-1 pl-3 pr-2">
                {item.title}
              </div>

              <div className="w-16 flex items-center justify-center shrink-0">
                {item.extra ? (
                  <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                ) : (
                  <X className="w-4.5 h-4.5 text-purple-400/40 stroke-[2.2]" />
                )}
              </div>

              <div className="w-16 flex items-center justify-center shrink-0">
                {item.premium ? (
                  <Check className="w-5 h-5 text-pink-400 stroke-[3]" />
                ) : (
                  <X className="w-4.5 h-4.5 text-purple-400/40 stroke-[2.2]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 bg-[#18052e]/95 backdrop-blur-md border-t border-purple-500/20 p-4 space-y-2.5 z-20 shadow-xl">
        <button 
          onClick={handleSubscribePremium}
          className="w-full bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white font-extrabold text-[15.5px] py-3.5 rounded-full shadow-lg active:scale-[0.98] transition-transform cursor-pointer text-center"
        >
          Activez Premium
        </button>

        <button 
          onClick={handleSubscribeExtra}
          className="w-full bg-purple-900/50 border border-purple-400/40 hover:bg-purple-900/70 text-white font-extrabold text-[15.5px] py-3.5 rounded-full shadow-xs active:scale-[0.98] transition-transform cursor-pointer text-center"
        >
          Profitez d'Extra
        </button>
      </div>

      {checkoutItem && (
        <PaymentCheckoutModal
          item={checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onSuccess={() => {
            setCheckoutItem(null);
            onClose();
          }}
        />
      )}
    </motion.div>
  );
}