import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart } from 'lucide-react';
import { PaymentCheckoutModal, PaymentItem } from '../../modals/PaymentCheckoutModal';
import { BavelPremiumModalProps } from './types';

// Premium custom SVG icons matching Bavel visual identity (IMG_4386.PNG & IMG_4322)
const HeartSolidIcon = () => (
  <svg className="w-11 h-11 text-[#1c0d18]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const MessageBubbleIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M26 15a9 9 0 0 1-9 9c-1.8 0-3.5-.5-5-1.4L6 24l1.5-5.5C6.5 17.1 6 15.6 6 14a9 9 0 0 1 9-9h2a9 9 0 0 1 9 9z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 13h8M12 17h5" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const UnlimitedSwipesIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="9" width="16" height="18" rx="4" transform="rotate(-12 13 18)" fill="currentColor" fillOpacity="0.15" />
    <rect x="11" y="5" width="16" height="18" rx="4" transform="rotate(8 19 14)" fill="currentColor" fillOpacity="0.25" />
    <rect x="9" y="7" width="15" height="18" rx="3.5" fill="none" />
  </svg>
);

const IncognitoIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 14h20M9 14l3-8h8l3 8" strokeWidth="2.5" />
    <circle cx="10" cy="21" r="3.5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="22" cy="21" r="3.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M13.5 21h5" strokeWidth="2" />
  </svg>
);

const FiveHeartsIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 26s-9-6.5-9-12a6 6 0 0 1 10.2-4.24A6 6 0 0 1 27 14c0 5.5-9 12-9 12z" fill="currentColor" />
    <path d="M5 23L27 9" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

const UndoSwipeIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 12a10 10 0 1 1 2.9 8.2" />
    <polyline points="8 6 8 13 15 13" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 4l3.8 8.2L29 13.5l-6.8 6.1L24 28l-8-4.6L8 28l1.8-8.4L3 13.5l9.2-1.3L16 4z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="4 6 28 6 18 18 18 26 14 28 14 18 4 6" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

const NoAdsIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="12" />
    <line x1="7.5" y1="24.5" x2="24.5" y2="7.5" />
  </svg>
);

const BonusIcon = () => (
  <svg className="w-10 h-10 text-[#1c0d18]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="11" />
    <path d="M16 9v14M9 16h14" strokeWidth="3" />
  </svg>
);

const getPremiumSlides = (likesCount: number = 1) => [
  {
    id: 'who_liked_you',
    title: `${likesCount} personne${likesCount > 1 ? 's' : ''} vous ont donné un Like !`,
    description: 'Découvrez qui a aimé votre profil pour pouvoir discuter tout de suite',
    icon: HeartSolidIcon,
  },
  {
    id: 'unlimited_messages',
    title: 'Discuter en illimité',
    description: 'Envoyez autant de messages que vous souhaitez avec tous vos matchs.',
    icon: MessageBubbleIcon,
  },
  {
    id: 'unlimited_swipes',
    title: 'Swipes illimités',
    description: 'Swipez autant que vous voulez sans aucune restriction sur Rencontres.',
    icon: UnlimitedSwipesIcon,
  },
  {
    id: 'incognito_mode',
    title: 'Mode Incognito',
    description: 'Visitez des profils sans être vu et masquez votre statut en ligne.',
    icon: IncognitoIcon,
  },
  {
    id: 'coups_de_coeur',
    title: '5 Coups de Cœur par jour',
    description: 'Démarquez-vous de la foule et montrez un grand intérêt.',
    icon: FiveHeartsIcon,
  },
  {
    id: 'undo',
    title: 'Annulez vos Swipes à gauche',
    description: 'Possibilité de revenir sur un profil que vous avez passé.',
    icon: UndoSwipeIcon,
  },
  {
    id: 'extra_included',
    title: 'Toutes les options Extra incluses',
    description: 'Bavel Premium inclut automatiquement toutes les fonctionnalités de Bavel Extra.',
    icon: StarIcon,
  },
  {
    id: 'boost_visibility',
    title: 'Passez en tête des résultats',
    description: 'Obtenez jusqu\'à 5 fois plus de visibilité auprès des profils proches de vous.',
    icon: BonusIcon,
  },
  {
    id: 'advanced_filters',
    title: 'Filtres de recherche avancés',
    description: 'Trouvez exactement la personne recherchée selon vos critères précis.',
    icon: FilterIcon,
  },
  {
    id: 'no_ads',
    title: 'Expérience sans publicité',
    description: 'Profitez d\'une navigation fluide et 100% sans aucune publicité.',
    icon: NoAdsIcon,
  }
];

const premiumPlans = [
  {
    id: '1week',
    duration: '1',
    unit: 'semaine',
    price: '11,99 €',
    crossedPrice: null,
    footer: '11,99 €/semaine',
    badge: null,
  },
  {
    id: '1month',
    duration: '1',
    unit: 'mois',
    price: '29,99 €',
    crossedPrice: '51 €',
    footer: '29,99 €/mois',
    badge: 'CHOIX Nº 1',
  },
  {
    id: '3months',
    duration: '3',
    unit: 'mois',
    price: '59,99 €',
    crossedPrice: '154 €',
    footer: '20 €/mois',
    badge: null,
  },
  {
    id: '6months',
    duration: '6',
    unit: 'mois',
    price: '89,99 €',
    crossedPrice: '308 €',
    footer: '15 €/mois',
    badge: null,
  },
  {
    id: 'lifetime',
    duration: '∞',
    unit: 'À vie',
    price: '149,99 €',
    crossedPrice: null,
    footer: null,
    badge: 'MEILLEUR PRIX',
  }
];

export const BavelPremiumModal: React.FC<BavelPremiumModalProps> = ({ 
  onClose, 
  initialSlideId, 
  onSubscribe,
  likesCount = 1,
  onOpenComparison
}) => {
  const slides = getPremiumSlides(likesCount);
  const initialIndex = initialSlideId 
    ? slides.findIndex(s => s.id === initialSlideId || (initialSlideId === 'likes' && s.id === 'who_liked_you')) 
    : 0;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [selectedPlanId, setSelectedPlanId] = useState('1month');
  const [direction, setDirection] = useState(0);
  const [checkoutItem, setCheckoutItem] = useState<PaymentItem | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const IconComponent = currentSlide.icon;

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    resetAutoPlay();
  };

  const handlePrevSlide = () => {
    setDirection(-1);
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    resetAutoPlay();
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      setDirection(1);
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3800);
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
    const plan = premiumPlans.find(p => p.id === selectedPlanId) || premiumPlans[1];
    
    setCheckoutItem({
      type: 'subscription',
      subscriptionPlan: 'premium',
      title: `Bavel Premium (${plan.duration} ${plan.unit})`,
      amount: plan.price,
      description: 'Accès VIP complet à toutes les fonctionnalités Premium de Bavel',
    });
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="absolute inset-0 z-[300] bg-gradient-to-b from-[#1f0b1b] via-[#160813] to-[#0d040a] flex flex-col justify-between overflow-hidden text-white font-sans select-none"
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
            <span className="text-[15.5px] font-extrabold text-white tracking-wide">Bavel Premium</span>
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
      </div>

      {/* Main Scrollable Body Container (Prevents mobile overflow while keeping 100% visibility) */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between py-2 px-3">
        {/* Central Rotating Carousel & Hero */}
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
                <p className="text-[12px] sm:text-[13px] text-white/80 leading-snug max-w-[290px] font-normal px-2">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="flex justify-center items-center space-x-1.5 mt-3 mb-1">
              {slides.map((s, idx) => (
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
            {premiumPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative min-w-[94px] w-[98px] sm:w-[102px] shrink-0 bg-[#2b1122]/90 rounded-[18px] pt-3 pb-2.5 px-1.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all select-none ${
                    isSelected 
                      ? 'border-[2px] border-pink-400 shadow-lg shadow-pink-950/50 ring-1 ring-pink-400/40 bg-[#36132b]' 
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
                    <span className="text-[11px] font-semibold text-purple-200 mt-0.5 mb-1.5">
                      {plan.unit}
                    </span>
                  </div>

                  {/* Prices */}
                  <div className="flex flex-col items-center w-full">
                    {plan.crossedPrice ? (
                      <span className="text-[9.5px] font-medium text-white/40 line-through leading-tight">
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
                    {plan.footer ? (
                      <span className="text-[9px] font-medium text-pink-300 leading-tight mt-0.5">
                        {plan.footer}
                      </span>
                    ) : (
                      <span className="text-[9px] font-normal text-transparent leading-tight mt-0.5 select-none">
                        -
                      </span>
                    )}
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
      <div className="shrink-0 px-4 pb-4 pt-1.5 bg-[#140611]/95 backdrop-blur-md border-t border-white/10">
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

export default BavelPremiumModal;

