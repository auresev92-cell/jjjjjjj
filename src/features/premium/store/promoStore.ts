import { create } from 'zustand';

export interface PromotionState {
  promoId: string | null;
  title: string;
  priceCFA: number;
  priceEUR: number;
  originalPriceCFA: number;
  expiresAt: number | null; // Timestamp
  isActive: boolean;
  startPromotion: (title: string, originalPriceCFA: number, promoPriceCFA: number, durationMinutes: number) => void;
  expirePromotion: () => void;
  completePurchase: () => void;
}

export const usePromoStore = create<PromotionState>((set, get) => {
  // Try loading initial state from localStorage
  let savedPromo: any = null;
  try {
    const data = localStorage.getItem('bavel_promo_store');
    if (data) {
      savedPromo = JSON.parse(data);
      // Validate expiry
      if (savedPromo.expiresAt && savedPromo.expiresAt < Date.now()) {
        savedPromo = null;
        localStorage.removeItem('bavel_promo_store');
      }
    }
  } catch {}

  const initialState = savedPromo || {
    promoId: null,
    title: "",
    priceCFA: 650,
    priceEUR: 0.99,
    originalPriceCFA: 2000,
    expiresAt: null,
    isActive: false,
  };

  return {
    ...initialState,

    startPromotion: (title, originalPriceCFA, promoPriceCFA, durationMinutes) => {
      const expiresAt = Date.now() + durationMinutes * 60 * 1000;
      const newState = {
        promoId: `promo_${Date.now()}`,
        title,
        priceCFA: promoPriceCFA,
        priceEUR: Number((promoPriceCFA / 655).toFixed(2)),
        originalPriceCFA,
        expiresAt,
        isActive: true,
      };
      set(newState);
      try {
        localStorage.setItem('bavel_promo_store', JSON.stringify(newState));
      } catch {}
    },

    expirePromotion: () => {
      set({
        promoId: null,
        title: "",
        expiresAt: null,
        isActive: false,
      });
      try {
        localStorage.removeItem('bavel_promo_store');
      } catch {}
    },

    completePurchase: () => {
      // Triggered on purchase
      set({
        promoId: null,
        title: "",
        expiresAt: null,
        isActive: false,
      });
      try {
        localStorage.removeItem('bavel_promo_store');
      } catch {}
    }
  };
});
