import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap, Star, Shield, Play, Ban, Sparkles, Coins, Flame, Heart, ChevronRight, X,
  ThumbsUp, RotateCcw, ArrowUp, SlidersHorizontal, EyeOff, CheckCheck, ChevronsUp, Megaphone, Check
} from "lucide-react";
import { PaymentCheckoutModal, PaymentItem } from "../../modals/PaymentCheckoutModal";

export function AllFeaturesModal({ 
  onClose, 
  initialTab = 'extra',
  onSubscribe,
  onOpenExtra,
  onOpenPremium
}: { 
  onClose: () => void; 
  initialTab?: 'extra' | 'premium';
  onSubscribe?: () => void;
  onOpenExtra?: () => void;
  onOpenPremium?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'extra' | 'premium'>(initialTab);
  const [checkoutItem, setCheckoutItem] = useState<PaymentItem | null>(null);

  const handleCTA = () => {
    if (activeTab === 'extra') {
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
    } else {
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 bg-[#480A2B] z-[300] flex flex-col h-full font-sans text-white select-none overflow-hidden"
    >
      {/* Header */}
      <div className="pt-9 pb-1.5 px-4 flex items-center justify-between shrink-0 relative">
        <button 
          onClick={onClose} 
          className="absolute right-3.5 top-9 p-2 text-white/90 hover:text-white transition-colors cursor-pointer z-20"
          aria-label="Fermer"
        >
          <X className="w-5.5 h-5.5" strokeWidth={2.2} />
        </button>

        <div className="w-full text-center">
          <h1 className="text-[13.5px] font-bold text-white tracking-tight">
            Toutes les fonctionnalités
          </h1>
          <div className="flex justify-center items-center mt-1 mb-0.5">
            <span className="text-[22px] font-zapfino mr-2">Bavel</span>
            <span className="text-[18px] font-normal text-white/90">
              {activeTab === 'extra' ? 'Extra' : 'Premium'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/15 mx-5 shrink-0 mt-0.5">
        <button
          onClick={() => setActiveTab('extra')}
          className={`flex-1 pb-2 font-bold text-[14px] transition-colors relative text-center cursor-pointer ${
            activeTab === 'extra' ? 'text-white' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Extra
          {activeTab === 'extra' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('premium')}
          className={`flex-1 pb-2 font-bold text-[14px] transition-colors relative text-center cursor-pointer ${
            activeTab === 'premium' ? 'text-white' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Premium
          {activeTab === 'premium' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Subtitle */}
      <div className="text-center py-2 text-white/80 text-[12.5px] font-medium shrink-0">
        Découvrez les avantages
      </div>

      {/* Content Cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3.5 scrollbar-hide">
        {activeTab === 'extra' ? (
          <>
            {/* Card 1: Messages prioritaires */}
            <div className="bg-[#EFE5FA] text-black rounded-[20px] p-4 shadow-sm">
              <h2 className="text-[15.5px] font-extrabold text-black mb-3 tracking-tight">
                Messages prioritaires
              </h2>
              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    1 Coup de Cœur par jour
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Indiquez à une personne qu'elle vous plaît et démarquez-vous vraiment des autres.
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Prenez le contrôle */}
            <div className="bg-[#EFE5FA] text-black rounded-[20px] p-4 shadow-sm space-y-4">
              <h2 className="text-[15.5px] font-extrabold text-black mb-1.5 tracking-tight">
                Prenez le contrôle
              </h2>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Ban className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Supprimez toutes les pubs
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Désactivez toutes les publicités qui apparaissent sur l'application.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <ThumbsUp className="w-5 h-5 text-white fill-white" strokeWidth={1} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Swipez aussi souvent que vous voulez
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Profitez de swipes illimités sur Rencontres.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <RotateCcw className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Annulez vos Swipes à gauche
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Possibilité de revenir sur un Swipe à gauche.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Coins className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Des crédits bonus pour tout achat de crédits
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Pour tout achat de crédits sur l'application, recevez des crédits supplémentaires.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* TAB PREMIUM */}
            {/* Card 1: Exclusivités Bavel Premium */}
            <div className="bg-[#EFE5FA] text-black rounded-[20px] p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                <h2 className="text-[15.5px] font-extrabold text-black tracking-tight">
                  Exclusivités Bavel Premium
                </h2>
                <span className="bg-[#480A2B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Premium
                </span>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Découvrez qui vous a donné un Like
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Débloquez toutes les personnes qui vous ont déjà envoyé un Like.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <ArrowUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Les messages que vous envoyez ont la priorité
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Vos messages envoyés apparaîtront en tête de liste pour leurs destinataires.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <SlidersHorizontal className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Profitez de filtres illimités
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Utilisez des options de filtres illimités pour trouver le type de personnes que vous recherchez.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <EyeOff className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Consultez les profils en toute discrétion
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Consultez le profil d'une autre personne sans qu'elle en soit notifiée. Mettez votre profil en pause sans perdre vos Matchs et vos messages.
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Toutes les fonctionnalités Bavel Extra incluses */}
            <div className="bg-[#EFE5FA] text-black rounded-[20px] p-4 shadow-sm space-y-4 border-2 border-[#480A2B]/20">
              <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                <h2 className="text-[15.5px] font-extrabold text-black tracking-tight">
                  Inclus : Toutes les fonctionnalités Bavel Extra
                </h2>
                <span className="bg-[#480A2B]/15 text-[#480A2B] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Inclus dans Premium
                </span>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    1 Coup de Cœur par jour
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Indiquez à une personne qu'elle vous plaît et démarquez-vous vraiment des autres.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Ban className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Supprimez toutes les pubs
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Désactivez toutes les publicités qui apparaissent sur l'application.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <ThumbsUp className="w-5 h-5 text-white fill-white" strokeWidth={1} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Swipez aussi souvent que vous voulez
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Profitez de swipes illimités sur Rencontres.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <RotateCcw className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Annulez vos Swipes à gauche
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Possibilité de revenir sur un Swipe à gauche.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-9.5 h-9.5 rounded-full bg-[#480A2B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Coins className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px] text-black leading-snug">
                    Des crédits bonus pour tout achat de crédits
                  </div>
                  <div className="text-[#555] text-[12px] leading-snug mt-0.5 font-medium">
                    Pour tout achat de crédits sur l'application, recevez des crédits supplémentaires.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-[#480A2B] via-[#480A2B]/95 to-transparent pt-5 z-30">
        <button 
          onClick={handleCTA}
          className="w-full bg-white hover:bg-gray-100 text-black font-extrabold py-3.5 rounded-full text-[14px] shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
        >
          {activeTab === 'extra' 
            ? "Profitez d'Extra (à partir de 5,99 €)" 
            : "Passez à Premium (à partir de 11,99 €)"}
        </button>
      </div>

      {checkoutItem && (
        <PaymentCheckoutModal
          item={checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onSuccess={() => {
            setCheckoutItem(null);
            if (onSubscribe) onSubscribe();
            onClose();
          }}
        />
      )}
    </motion.div>
  );
}