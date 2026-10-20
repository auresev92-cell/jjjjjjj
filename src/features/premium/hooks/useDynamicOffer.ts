import { useEffect } from 'react';
import { usePromoStore } from '../store/promoStore';
import { aiMonetizationEngine } from '../../../services/aiMonetizationEngine';

export function useDynamicOffer() {
  const promo = usePromoStore();

  useEffect(() => {
    // Listen to changes in the monetization engine state
    const unsubscribe = aiMonetizationEngine.subscribe(() => {
      const config = aiMonetizationEngine.getSimulatedConfig();
      
      // If user frustration score is exceptionally high (swipes a lot with no matches)
      // or if they closed a purchase window (hesitant buyer), trigger the FOMO promotion
      if ((config.frustrationScore >= 70 || config.isHesitant) && !promo.isActive) {
        promo.startPromotion(
          "⚡ Offre Spéciale : Débloquez tous les Likes pour 650 F CFA (0.99 €) !",
          2000, // Original price (CFA)
          650,  // Promotional price (CFA)
          60    // Expires in exactly 60 minutes
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [promo.isActive]);

  return {
    ...promo,
    triggerFrustrationOffer: () => {
      promo.startPromotion(
        "⚡ Offre Spéciale : Débloquez tous les Likes pour 650 F CFA (0.99 €) !",
        2000,
        650,
        60
      );
    }
  };
}
