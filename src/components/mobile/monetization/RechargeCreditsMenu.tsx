import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap, Coins, Flame, Heart, ChevronRight, X, Sparkles, Check, CheckCheck,
  Tv, Gift, ThumbsUp, RotateCcw, ChevronsUp, Megaphone
} from "lucide-react";
import { PaymentCheckoutModal, PaymentItem } from "../../modals/PaymentCheckoutModal";
import { RewardObtainedModal } from "../../modals/RewardObtainedModal";
import { RewardedAdPlayer } from "../RewardedAdsManager";

export function RechargeCreditsMenu({ 
  onClose, 
  initialSlideIndex = 0, 
  targetProfileName, 
  showReadReceiptBenefit = false, 
  showUnlockChatBenefit = false,
  onRechargeSuccess
}: { 
  onClose: () => void; 
  initialSlideIndex?: number; 
  targetProfileName?: string; 
  showReadReceiptBenefit?: boolean; 
  showUnlockChatBenefit?: boolean;
  onRechargeSuccess?: (creditsAdded: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialSlideIndex);
  const [checkoutItem, setCheckoutItem] = useState<PaymentItem | null>(null);
  const [showVideoAdPlayer, setShowVideoAdPlayer] = useState(false);
  const [videoRewardType, setVideoRewardType] = useState<'credits' | 'coup_de_coeur_credit'>('credits');
  const [pendingRewardModal, setPendingRewardModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const handleRewardEarned = (amount: number, type: 'credits' | 'coup_de_coeur_credit' = 'credits') => {
    try {
      let userEmail = '';
      // 1. Update bavel_user_profile in localStorage
      const saved = localStorage.getItem('bavel_user_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        userEmail = profile.email || '';
        if (type === 'credits') {
          profile.credits = (profile.credits || 0) + amount;
        } else if (type === 'coup_de_coeur_credit') {
          profile.coupDeCoeurCredits = (profile.coupDeCoeurCredits || 0) + amount;
        }
        localStorage.setItem('bavel_user_profile', JSON.stringify(profile));
        
        // Also update the account store cache for offline resilience
        if (profile.email) {
          const accKey = `bavel_account_${profile.email}`;
          const cachedAcc = localStorage.getItem(accKey);
          if (cachedAcc) {
            const parsed = JSON.parse(cachedAcc);
            parsed.profile = profile;
            localStorage.setItem(accKey, JSON.stringify(parsed));
          }
        }
      }

      // Sync with real-time backend endpoint
      fetch('/api/rewards/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          rewardType: type,
          amount: amount
        })
      }).then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            // Further sync server response with localStorage
            localStorage.setItem('bavel_user_profile', JSON.stringify(data.profile));
            window.dispatchEvent(new Event('bavel-profile-updated'));
          }
        })
        .catch(err => console.warn('Server reward grant sync notice:', err));
      
      // 2. Dispatch custom event to notify MobileApp to update its React state instantly
      window.dispatchEvent(new Event('bavel-profile-updated'));

      // 3. Trigger onRechargeSuccess callback (mostly useful for credits)
      if (type === 'credits') {
        onRechargeSuccess?.(amount);
      }

      setPendingRewardModal(true);
    } catch (err) {
      console.error('Failed to store rewarded ad credits:', err);
    }
  };

  const benefits = [
    ...(showUnlockChatBenefit ? [{
      title: `Discutez avec ${targetProfileName || 'cette personne'}`,
      description: `Il vous faut 250 crédits pour démarrer cette discussion`,
      renderIcon: () => (
        <svg viewBox="0 0 32 32" className="w-11 h-11">
          <path d="M16 4C9.37 4 4 8.7 4 14.5C4 17.8 5.8 20.7 8.6 22.7C8.1 24.5 7.1 26.2 5.5 27.3C7.8 27.5 10.3 27 12.3 25.7C13.5 26.1 14.7 26.3 16 26.3C22.63 26.3 28 21.6 28 15.8C28 10 22.63 4 16 4Z" fill="black" />
          <circle cx="11" cy="15" r="1.5" fill="white" />
          <circle cx="16" cy="15" r="1.5" fill="white" />
          <circle cx="21" cy="15" r="1.5" fill="white" />
        </svg>
      )
    }] : []),
    ...(showReadReceiptBenefit ? [{
      title: `Vous voulez savoir si ${targetProfileName || 'cette personne'} a lu votre message ?`,
      description: `Grâce aux accusés de réception, vous saurez si ${targetProfileName || 'cette personne'} a vu votre message... Et tout ça pour seulement 50 crédits !`,
      renderIcon: () => (
        <CheckCheck className="w-12 h-12 text-black" strokeWidth={3} />
      )
    }] : []),
    {
      title: "Obtenez plus de Matchs",
      description: "Il vous faut 150 crédits pour montrer votre profil plus souvent dans la section Rencontres.",
      renderIcon: () => (
        <Zap className="w-11 h-11 text-black fill-black" strokeWidth={1} />
      )
    },
    {
      title: "Passez en tête de liste",
      description: "Il vous faut 100 crédits pour passer en tête dans la section À proximité.",
      renderIcon: () => (
        <ChevronsUp className="w-12 h-12 text-black" strokeWidth={3} />
      )
    },
    {
      title: "Recevez plus de messages",
      description: "Il vous faut 100 crédits pour montrer aux autres que vous êtes en ligne.",
      renderIcon: () => (
        <Megaphone className="w-10 h-10 text-black fill-black" />
      )
    }
  ];

  // Auto-slide carousel animation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % benefits.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [benefits.length]);

  const packages = [
    { credits: 3050, price: "59,99 €", oldPrice: "182 €", badge: "CHOIX N° 1" },
    { credits: 1350, price: "39,99 €", oldPrice: "80 €" },
    { credits: 450, price: "19,99 €", oldPrice: "26 €" },
    { credits: 100, price: "5,99 €" }
  ];

  const [selectedPackage, setSelectedPackage] = useState(0);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[250] flex flex-col h-full font-sans select-none overflow-hidden"
    >
      {/* Top Header */}
      <div className="pt-10 pb-3 px-4 flex items-center justify-between shrink-0 bg-[#18052e]/95 backdrop-blur-md relative border-b border-purple-500/20 text-white">
        <button onClick={onClose} className="p-2 -ml-2 text-purple-200 hover:text-white active:scale-95 transition-transform z-10 cursor-pointer">
          <X className="w-6.5 h-6.5 text-white" strokeWidth={2.2} />
        </button>
        <h1 className="text-[17px] font-extrabold text-white absolute inset-x-0 text-center tracking-tight pointer-events-none">
          Rechargez vos crédits
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto pb-4 scrollbar-hide">
        {/* Carousel Slide */}
        <div className="mt-2 mb-2 flex-1 flex flex-col justify-center items-center">
          <div className="relative w-full h-[235px] overflow-hidden">
            <motion.div 
              className="flex h-full w-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -30) {
                  setActiveIndex(prev => (prev + 1) % benefits.length);
                } else if (info.offset.x > 30) {
                  setActiveIndex(prev => (prev - 1 + benefits.length) % benefits.length);
                }
              }}
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              {benefits.map((benefit, i) => (
                <div key={i} className="w-full shrink-0 px-6 flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full bg-purple-900/60 border border-purple-500/30 flex items-center justify-center mb-4 shadow-md text-white">
                    {benefit.renderIcon()}
                  </div>
                  <h2 className="text-[20px] font-extrabold text-white mb-2 tracking-tight max-w-[320px] leading-tight">
                    {benefit.title}
                  </h2>
                  <p className="text-purple-200/80 text-[14px] leading-[1.38] font-normal max-w-[310px] px-2">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-2">
            {benefits.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeIndex === i ? 'bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] w-5' : 'bg-purple-800/60 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Packages Horizontal Scrolling List */}
        <div className="w-full my-3">
          <div className="flex space-x-3 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
            {packages.map((pkg, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedPackage(i)}
                className={`relative w-[115px] shrink-0 rounded-[18px] p-3 pt-5 flex flex-col items-center justify-between min-h-[148px] transition-all bg-[#1f093a]/90 text-white cursor-pointer select-none ${
                  selectedPackage === i 
                    ? 'border-[2px] border-[#ec4899] shadow-lg shadow-pink-950/40 ring-2 ring-pink-500/20' 
                    : 'border border-purple-500/25 hover:border-purple-400/50'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                    {pkg.badge}
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <span className="text-[22px] font-extrabold text-white leading-none pt-1">
                    {pkg.credits}
                  </span>
                  <span className="text-[13.5px] font-bold text-purple-200 mt-1">
                    crédits
                  </span>
                </div>
                <div className="flex flex-col items-center mt-3">
                  {pkg.oldPrice ? (
                    <span className="text-[12px] text-purple-400/60 line-through font-normal">
                      {pkg.oldPrice}
                    </span>
                  ) : (
                    <span className="text-[12px] opacity-0 font-normal">0 €</span>
                  )}
                  <span className="text-[15px] font-bold text-white mt-0.5">
                    {pkg.price}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Button */}
      <div className="px-4 pb-8 pt-2 bg-[#18052e]/95 backdrop-blur-md border-t border-purple-500/20 shrink-0">
        <button 
          onClick={() => {
            const pkg = packages[selectedPackage];
            const fcfaEquivalent = pkg.credits === 3050 ? '39 000 FCFA' : pkg.credits === 1350 ? '26 000 FCFA' : pkg.credits === 450 ? '13 000 FCFA' : '3 900 FCFA';
            setCheckoutItem({
              type: 'credits',
              title: `Recharge ${pkg.credits} crédits Bavel`,
              amount: `${pkg.price} (${fcfaEquivalent})`,
              creditsAmount: pkg.credits,
              description: `Achat sécurisé de ${pkg.credits} crédits via Mobile Money ou Carte`
            });
          }}
          className="w-full bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white font-extrabold py-4 rounded-full text-[16px] active:scale-[0.98] transition-transform shadow-lg cursor-pointer"
        >
          Continuer
        </button>
      </div>

      {checkoutItem && (
        <PaymentCheckoutModal
          item={checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onSuccess={() => {
            const added = checkoutItem.creditsAmount || 100;
            setCheckoutItem(null);
            onRechargeSuccess?.(added);
            onClose();
          }}
        />
      )}

      <AnimatePresence>
        {showVideoAdPlayer && (
          <RewardedAdPlayer
            rewardType={videoRewardType}
            rewardAmount={videoRewardType === 'credits' ? 15 : 1}
            onClose={() => {
              setShowVideoAdPlayer(false);
              if (pendingRewardModal) {
                setPendingRewardModal(false);
                setShowRewardModal(true);
              }
            }}
            onRewardEarned={(amount) => {
              handleRewardEarned(amount, videoRewardType);
            }}
          />
        )}
      </AnimatePresence>
      <RewardObtainedModal
        show={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewardAmount={videoRewardType === 'credits' ? 15 : 1}
      />
    </motion.div>
  );
}