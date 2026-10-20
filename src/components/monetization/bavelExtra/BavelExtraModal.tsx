import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { PaymentCheckoutModal, PaymentItem } from '../../modals/PaymentCheckoutModal';
import { BavelExtraModalProps, BavelExtraPlan, BavelExtraSlide } from './types';

// Custom icons tailored to 100% match screenshots (IMG_4314 - IMG_4319)
const CardsStackIcon = () => (
  <svg className="w-10 h-10 text-[#4f0a2d]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="9" width="16" height="18" rx="4" transform="rotate(-12 13 18)" fill="currentColor" fillOpacity="0.15" />
    <rect x="11" y="5" width="16" height="18" rx="4" transform="rotate(8 19 14)" fill="currentColor" fillOpacity="0.25" />
    <rect x="9" y="7" width="15" height="18" rx="3.5" fill="none" />
  </svg>
);

const HeartCoinIcon = () => (
  <svg className="w-10 h-10 text-[#4f0a2d]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="15" cy="16" r="11" />
    <path d="M15 20s-4.5-3.2-4.5-6a3 3 0 0 1 5.1-2.12A3 3 0 0 1 20.7 14c0 2.8-5.7 6-5.7 6z" fill="currentColor" />
    <path d="M26 11.5a11 11 0 0 1 0 9" strokeWidth="3" />
  </svg>
);

const ProhibitionIcon = () => (
  <svg className="w-10 h-10 text-[#4f0a2d]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="12" />
    <line x1="7.5" y1="24.5" x2="24.5" y2="7.5" />
  </svg>
);

const HeartArrowIcon = () => (
  <svg className="w-10 h-10 text-[#4f0a2d]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 26s-9-6.5-9-12a6 6 0 0 1 10.2-4.24A6 6 0 0 1 27 14c0 5.5-9 12-9 12z" fill="currentColor" fillOpacity="0.2" />
    <path d="M16 26s-9-6.5-9-12a6 6 0 0 1 10.2-4.24A6 6 0 0 1 27 14c0 5.5-9 12-9 12z" />
    <path d="M5 23L27 9" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M22 8.5l5.5 0.5l-0.5 5.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UndoIcon = () => (
  <svg className="w-10 h-10 text-[#4f0a2d]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 12a10 10 0 1 1 2.9 8.2" />
    <polyline points="8 6 8 13 15 13" />
  </svg>
);

const extraSlides = [
  {
    id: 'unlimited_swipes',
    title: 'Swipez aussi souvent que vous voulez',
    description: 'Profitez de swipes illimités sur Rencontres.',
    icon: CardsStackIcon,
  },
  {
    id: 'bonus_credits',
    title: 'Des crédits bonus pour tout achat de crédits',
    description: 'Recevez au moins 20 % de crédits en plus sur vos achats de crédits.',
    icon: HeartCoinIcon,
  },
  {
    id: 'no_ads',
    title: 'Supprimez toutes les pubs',
    description: 'Désactivez toutes les publicités sur l\'application.',
    icon: ProhibitionIcon,
  },
  {
    id: 'coup_de_coeur',
    title: '1 Coup de Cœur par jour',
    description: 'Indiquez à une personne qu\'elle vous plaît et démarquez-vous vraiment des autres.',
    icon: HeartArrowIcon,
  },
  {
    id: 'undo',
    title: 'Annulez vos Swipes à gauche',
    description: 'Possibilité de revenir sur un Swipe à gauche.',
    icon: UndoIcon,
  }
];

const extraPlans = [
  {
    id: '1week',
    duration: '1',
    unit: 'semaine',
    price: '5,99 €',
    crossedPrice: null,
    footer: '5,99 €/semaine',
    badge: null,
  },
  {
    id: '1month',
    duration: '1',
    unit: 'mois',
    price: '14,99 €',
    crossedPrice: '25 €',
    footer: '14,99 €/mois',
    badge: 'CHOIX Nº 1',
  },
  {
    id: '3months',
    duration: '3',
    unit: 'mois',
    price: '29,99 €',
    crossedPrice: '77 €',
    footer: '10 €/mois',
    badge: null,
  },
  {
    id: '6months',
    duration: '6',
    unit: 'mois',
    price: '44,99 €',
    crossedPrice: '154 €',
    footer: '7,50 €/mois',
    badge: 'MEILLEUR PRIX',
  }
];

export const BavelExtraModal: React.FC<BavelExtraModalProps> = ({ 
  onClose, 
  initialSlideId, 
  onSubscribe,
  onOpenComparison,
  onSwitchToPremium
}) => {
  const initialIndex = initialSlideId 
    ? extraSlides.findIndex(s => s.id === initialSlideId) 
    : 0;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [selectedPlanId, setSelectedPlanId] = useState('1month');
  const [direction, setDirection] = useState(0);
  const [checkoutItem, setCheckoutItem] = useState<PaymentItem | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = extraSlides[currentSlideIndex] || extraSlides[0];
  const IconComponent = currentSlide.icon;

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentSlideIndex((prev) => (prev + 1) % extraSlides.length);
    resetAutoPlay();
  };

  const handlePrevSlide = () => {
    setDirection(-1);
    setCurrentSlideIndex((prev) => (prev - 1 + extraSlides.length) % extraSlides.length);
    resetAutoPlay();
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      setDirection(1);
      setCurrentSlideIndex((prev) => (prev + 1) % extraSlides.length);
    }, 3500);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  };

  const resetAutoPlay = () => {
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX - currentX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  const handleSubscribeClick = () => {
    const plan = extraPlans.find(p => p.id === selectedPlanId) || extraPlans[1];
    
    setCheckoutItem({
      type: 'subscription',
      subscriptionPlan: 'extra',
      title: `Bavel Extra (${plan.duration} ${plan.unit})`,
      amount: plan.price,
      description: 'Accès illimité aux fonctionnalités Bavel Extra',
    });
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="absolute inset-0 z-[300] bg-gradient-to-b from-[#3a0820] via-[#2b0518] to-[#18030e] flex flex-col justify-between overflow-hidden text-white font-sans select-none"
    >
      {/* Top Header Bar */}
      <div className="pt-2.5 px-4 pb-1 shrink-0 border-b border-white/10">
        <div className="flex items-center justify-between relative h-9">
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-start text-white/90 hover:text-white active:scale-95 transition-all cursor-pointer z-10"
            aria-label="Fermer"
          >
            <X className="w-5.5 h-5.5" strokeWidth={2.5} />
          </button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[15.5px] font-extrabold text-white tracking-wide">Bavel Extra</span>
          </div>

          <button 
            onClick={() => {
              if (onOpenComparison) {
                onOpenComparison();
              } else {
                onClose();
              }
            }}
            className="text-[13px] font-bold text-pink-300 hover:text-pink-200 transition-colors cursor-pointer z-10 pr-0.5"
          >
            Comparer
          </button>
        </div>

        {/* Navigation Tabs (Extra | Premium) */}
        <div className="flex border-b border-white/10 mt-1.5 relative">
          <button 
            className="w-1/2 py-1.5 text-center text-[13.5px] font-bold text-white relative cursor-pointer"
          >
            Extra
            <motion.div 
              layoutId="extraActiveUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-400 to-rose-400"
            />
          </button>

          <button 
            onClick={() => {
              if (onSwitchToPremium) {
                onSwitchToPremium();
              }
            }}
            className="w-1/2 py-1.5 text-center text-[13.5px] font-medium text-white/60 hover:text-white/80 transition-colors cursor-pointer"
          >
            Premium
          </button>
        </div>
      </div>

      {/* Main Scrollable Body Container (Prevents mobile overflow while keeping 100% visibility) */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between py-2 px-3">
        {/* Central Rotating Carousel */}
        <div className="w-full flex flex-col items-center justify-center py-2 shrink-0">
          <div 
            className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 35 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center w-full max-w-[320px]"
              >
                {/* Compact White Icon Badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-2.5 shrink-0 p-2.5">
                  <div className="scale-75 sm:scale-85 origin-center">
                    <IconComponent />
                  </div>
                </div>

                {/* Slide Title */}
                <h2 className="text-[17px] sm:text-[18.5px] font-extrabold text-white leading-tight mb-1.5 px-2">
                  {currentSlide.title}
                </h2>

                {/* Slide Description */}
                <p className="text-[12px] sm:text-[13px] text-white/90 leading-snug max-w-[290px] font-normal px-2">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="flex justify-center items-center space-x-1.5 mt-3 mb-1">
              {extraSlides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDirection(idx > currentSlideIndex ? 1 : -1);
                    setCurrentSlideIndex(idx);
                    resetAutoPlay();
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlideIndex 
                      ? 'w-4 bg-gradient-to-r from-pink-400 to-rose-400' 
                      : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Grid + Disclaimer */}
        <div className="w-full shrink-0 pt-1">
          {/* Horizontal Scrollable Plans (compact, zero overflow) */}
          <div className="flex space-x-2 overflow-x-auto px-1 pt-3 pb-1.5 no-scrollbar justify-start sm:justify-center items-stretch touch-pan-x">
            {extraPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative min-w-[94px] w-[98px] sm:w-[102px] shrink-0 bg-[#4e102f]/90 rounded-[18px] pt-3 pb-2.5 px-1.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all select-none ${
                    isSelected 
                      ? 'border-[2px] border-pink-400 shadow-lg shadow-pink-950/50 ring-1 ring-pink-400/40 bg-[#5e1439]' 
                      : 'border border-white/15 hover:border-white/30 opacity-85'
                  }`}
                >
                  {/* Badge pill */}
                  {plan.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight shadow-md whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}

                  {/* Duration */}
                  <div className="flex flex-col items-center mt-0.5">
                    <span className="text-[20px] sm:text-[22px] font-black text-white leading-none tracking-tight">
                      {plan.duration}
                    </span>
                    <span className="text-[11px] font-semibold text-pink-200 mt-0.5 mb-1.5">
                      {plan.unit}
                    </span>
                  </div>

                  {/* Prices */}
                  <div className="flex flex-col items-center w-full">
                    {plan.crossedPrice ? (
                      <span className="text-[9.5px] font-medium text-white/50 line-through leading-tight">
                        {plan.crossedPrice}
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-medium text-transparent leading-tight select-none">
                        -
                      </span>
                    )}
                    <span className="text-[13px] sm:text-[13.5px] font-black text-white leading-tight">
                      {plan.price}
                    </span>
                    <span className="text-[9px] font-medium text-pink-300 leading-tight mt-0.5">
                      {plan.footer}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer Text */}
          <p className="text-[9.5px] text-white/60 text-center px-4 mt-2 mb-1.5 leading-tight font-normal">
            Facturation récurrente, annulation possible à tout moment.<br />
            <span className="underline cursor-pointer hover:text-white">Conditions</span> &{' '}
            <span className="underline cursor-pointer hover:text-white">Confidentialité</span>.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Action Button */}
      <div className="shrink-0 px-4 pb-4 pt-1.5 bg-[#200413]/95 backdrop-blur-md border-t border-white/10">
        <button
          onClick={handleSubscribeClick}
          className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-[14.5px] sm:text-[15px] py-3.5 rounded-full shadow-lg active:scale-[0.98] transition-all cursor-pointer text-center border border-white/20"
        >
          Continuer
        </button>
      </div>

      {/* Payment Checkout Modal Integration */}
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
};

export default BavelExtraModal;
