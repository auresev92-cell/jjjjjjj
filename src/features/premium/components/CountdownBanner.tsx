import React, { useState, useEffect } from 'react';
import { Zap, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { useDynamicOffer } from '../hooks/useDynamicOffer';
import { monetizationService } from '../../../services/monetizationService';

interface CountdownBannerProps {
  onSuccess: () => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ onSuccess }) => {
  const offer = useDynamicOffer();
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');

  useEffect(() => {
    if (!offer.isActive || !offer.expiresAt) return;

    const timer = setInterval(() => {
      const difference = offer.expiresAt! - Date.now();
      
      if (difference <= 0) {
        offer.expirePromotion();
        clearInterval(timer);
        return;
      }

      // Format to HH:MM:SS
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (num: number) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [offer.isActive, offer.expiresAt]);

  if (!offer.isActive) return null;

  const handlePurchase = () => {
    // Activate premium subscription through monetization service
    monetizationService.activateSubscription('premium', 'mobile_money').then((success) => {
      if (success) {
        offer.completePurchase();
        onSuccess();
      }
    });
  };

  return (
    <div 
      id="countdown_promo_banner"
      className="mx-3 mt-3 overflow-hidden rounded-[24px] bg-gradient-to-r from-purple-900 via-indigo-950 to-neutral-950 p-4 text-white shadow-lg border border-purple-500/30 relative select-none"
    >
      {/* Decorative pulse glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full filter blur-xl animate-pulse" />

      <div className="flex flex-col space-y-3">
        {/* Header with Title and Clock */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="p-1 rounded-lg bg-yellow-400 text-neutral-950">
              <Zap className="w-3.5 h-3.5 fill-neutral-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block leading-none">Offre Spéciale</span>
              <h4 className="text-[12.5px] font-extrabold text-white mt-0.5 leading-tight">Activer le Pass Premium complet</h4>
            </div>
          </div>

          {/* Chrono Timer */}
          <div className="flex items-center space-x-1 bg-black/40 px-2.5 py-1 rounded-full border border-purple-500/20">
            <Clock className="w-3 h-3 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-mono text-[11px] font-black text-yellow-300 tracking-wider">
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Dynamic Offer details */}
        <p className="text-[10.5px] text-purple-200 leading-relaxed max-w-[90%]">
          Une opportunité unique détectée pour vous ! Débloquez tous les likes, visiteurs de profil et accédez à l'outil de ressemblance sans limite de crédit.
        </p>

        {/* Actions row */}
        <div className="flex items-center justify-between pt-1 border-t border-purple-500/15">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-[17px] font-black text-yellow-300">{offer.priceCFA} F CFA</span>
            <span className="text-[10.5px] text-gray-400 line-through">{offer.originalPriceCFA} F CFA</span>
          </div>

          <button
            onClick={handlePurchase}
            className="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black text-[11px] py-2 px-4 rounded-full flex items-center space-x-1 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <span>Profiter maintenant</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
