/**
 * Shadow AI Monetization & Recommendation Engine for Bavel
 * Governs:
 * 1. Frustration & Churn Prediction (unanswered chats, streak of right-swipes with no matches)
 * 2. Dynamic Pricing (adaptive packages pricing based on simulated device, region, and purchase hesitation)
 * 3. Artificial Rarity / "Secret Like" Engine (generates highly personalized affinity recommendations for blured likes)
 * 4. ROI of Boost Optimization (re-ranks profiles and increases match rate dramatically during Boost)
 * 5. Virtual Currency Valuation (restricts chatting with top-tier profiles unless priority message or gift is used)
 */

import { User } from '../types';
import { monetizationService, CreditPackage, CREDIT_PACKAGES } from './monetizationService';
import { smartMatchService } from './smartMatchService';

export interface DynamicPricingConfig {
  deviceTier: 'premium' | 'budget';
  regionWealth: 'high' | 'medium' | 'standard';
  isHesitant: boolean; // Closed checkout before without buying
  purchaseCount: number;
}

export interface ShadowAIState {
  consecutiveRightSwipes: number;
  lastSwipeTime: number;
  frustrationScore: number; // 0 to 100
  isHesitantBuyer: boolean;
  activePromotions: Array<{
    id: string;
    title: string;
    discountPercent: number;
    expiresAt: number;
  }>;
}

class AIMonetizationEngine {
  private state: ShadowAIState = {
    consecutiveRightSwipes: 0,
    lastSwipeTime: Date.now(),
    frustrationScore: 0,
    isHesitantBuyer: false,
    activePromotions: [],
  };

  private deviceTier: 'premium' | 'budget' = 'budget';
  private regionWealth: 'high' | 'medium' | 'standard' = 'standard';
  private purchaseCount: number = 0;
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Simulate/Detect device tier (premium if iPhone or high-end User-Agent simulation, or from localStorage)
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
      const isIos = userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('macintosh');
      this.deviceTier = isIos ? 'premium' : 'budget';

      // Load saved state
      const savedState = localStorage.getItem('bavel_shadow_ai_state');
      if (savedState) {
        this.state = JSON.parse(savedState);
      }

      const savedConfig = localStorage.getItem('bavel_shadow_ai_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.deviceTier = parsed.deviceTier || this.deviceTier;
        this.regionWealth = parsed.regionWealth || 'standard';
        this.purchaseCount = parsed.purchaseCount || 0;
      }
    } catch (e) {
      console.warn("Could not load Shadow AI state", e);
    }
  }

  private save() {
    try {
      localStorage.setItem('bavel_shadow_ai_state', JSON.stringify(this.state));
      localStorage.setItem('bavel_shadow_ai_config', JSON.stringify({
        deviceTier: this.deviceTier,
        regionWealth: this.regionWealth,
        purchaseCount: this.purchaseCount
      }));
    } catch {}
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- 1. FRUSTRATION ANALYSIS (Churn & Pay Prediction) ---
  
  /**
   * Log a right swipe. If user swipes right too many times without matches, frustration grows!
   */
  public logRightSwipe(hadMatch: boolean): { triggerFrustrationPopup: boolean; message?: string } {
    const now = Date.now();
    this.state.lastSwipeTime = now;

    if (hadMatch) {
      this.state.consecutiveRightSwipes = 0;
      this.state.frustrationScore = Math.max(0, this.state.frustrationScore - 25);
      this.save();
      return { triggerFrustrationPopup: false };
    }

    this.state.consecutiveRightSwipes += 1;
    
    // Increase frustration score based on streak
    this.state.frustrationScore = Math.min(100, this.state.frustrationScore + 12);

    this.save();

    // If frustration is high (e.g. 7+ likes in a row without a single match)
    if (this.state.consecutiveRightSwipes >= 7 && this.state.frustrationScore >= 70) {
      // Lower frustration slightly so we don't spam them immediately next swipe
      this.state.frustrationScore = 40;
      this.save();

      return {
        triggerFrustrationPopup: true,
        message: "Votre visibilité est basse à l'instant. Activez le Boost maintenant pour apparaître en priorité auprès de 10 fois plus de profils qualifiés !"
      };
    }

    return { triggerFrustrationPopup: false };
  }

  /**
   * Log an unreplied conversation step to track frustration.
   */
  public logUnansweredChatfrustration(): boolean {
    this.state.frustrationScore = Math.min(100, this.state.frustrationScore + 20);
    this.save();

    if (this.state.frustrationScore >= 80) {
      this.state.frustrationScore = 45; // Cool down
      this.save();
      return true; // Suggest to buy a Boost or virtual gift to stand out
    }
    return false;
  }

  // --- 2. DYNAMIC PRICING ENGINE ---

  /**
   * Tracks when user closes checkout window. Mark them as hesitant.
   * If hesitant, offer them a flash promo next time they look!
   */
  public registerHesitation() {
    this.state.isHesitantBuyer = true;
    
    // Add a flash promotion expiring in 15 minutes
    const promoId = 'flash_promo_hesitation';
    this.state.activePromotions = this.state.activePromotions.filter(p => p.id !== promoId);
    this.state.activePromotions.push({
      id: promoId,
      title: "🔥 Offre Flash : -35% immédiat !",
      discountPercent: 35,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
    this.save();
  }

  public clearHesitation() {
    this.state.isHesitantBuyer = false;
    this.state.activePromotions = this.state.activePromotions.filter(p => p.id !== 'flash_promo_hesitation');
    this.save();
  }

  public registerPurchase() {
    this.purchaseCount += 1;
    this.state.isHesitantBuyer = false;
    this.state.activePromotions = [];
    this.save();
  }

  public setSimulatedConfig(config: Partial<DynamicPricingConfig>) {
    if (config.deviceTier) this.deviceTier = config.deviceTier;
    if (config.regionWealth) this.regionWealth = config.regionWealth;
    if (config.isHesitant !== undefined) this.state.isHesitantBuyer = config.isHesitant;
    if (config.purchaseCount !== undefined) this.purchaseCount = config.purchaseCount;
    this.save();
  }

  public getSimulatedConfig() {
    return {
      deviceTier: this.deviceTier,
      regionWealth: this.regionWealth,
      isHesitant: this.state.isHesitantBuyer,
      purchaseCount: this.purchaseCount,
      frustrationScore: this.state.frustrationScore,
      consecutiveRightSwipes: this.state.consecutiveRightSwipes,
    };
  }

  /**
   * Calculates the tailored price for a subscription or credits package.
   * Leverages device status, geographic wealth, previous buys, and hesitation discounts.
   */
  public getDynamicPrices() {
    let multiplier = 1.0;

    // Premium Device (iPhone / Mac) -> High purchasing power pricing (+15%)
    if (this.deviceTier === 'premium') {
      multiplier += 0.15;
    }

    // Zone Wealth Adjustments
    if (this.regionWealth === 'high') {
      multiplier += 0.20; // Affluent area: slightly higher base price
    } else if (this.regionWealth === 'standard') {
      multiplier -= 0.10; // Emerging market: discount to favor acquisition
    }

    // Return customized Credit Packages
    const customizedCredits: CreditPackage[] = CREDIT_PACKAGES.map(pkg => {
      let finalPriceCFA = pkg.priceCFA * multiplier;
      let finalPriceEUR = pkg.priceEUR * multiplier;

      // Apply Hesitation discount (Flash Promotion) if active
      const promo = this.state.activePromotions.find(p => p.id === 'flash_promo_hesitation' && p.expiresAt > Date.now());
      let hasPromo = false;
      let originalCFA = Math.round(finalPriceCFA);
      
      if (promo) {
        finalPriceCFA = finalPriceCFA * (1 - promo.discountPercent / 100);
        finalPriceEUR = finalPriceEUR * (1 - promo.discountPercent / 100);
        hasPromo = true;
      }

      return {
        ...pkg,
        priceCFA: Math.round(finalPriceCFA),
        priceEUR: Math.round(finalPriceEUR * 100) / 100,
        bonus: hasPromo ? `OFFRE PROMO (-${promo?.discountPercent}%)` : pkg.bonus,
        originalPriceCFA: hasPromo ? originalCFA : undefined,
      } as any;
    });

    // Subscriptions
    const promoActive = this.state.activePromotions.find(p => p.id === 'flash_promo_hesitation' && p.expiresAt > Date.now());
    const promoDiscount = promoActive ? (1 - promoActive.discountPercent / 100) : 1.0;

    const baseExtraCFA = 3900;
    const basePremiumCFA = 7800;

    const finalExtraCFA = Math.round(baseExtraCFA * multiplier * promoDiscount);
    const finalPremiumCFA = Math.round(basePremiumCFA * multiplier * promoDiscount);

    return {
      credits: customizedCredits,
      extraCFA: finalExtraCFA,
      premiumCFA: finalPremiumCFA,
      extraEUR: Math.round((finalExtraCFA / 655.95) * 100) / 100,
      premiumEUR: Math.round((finalPremiumCFA / 655.95) * 100) / 100,
      originalExtraCFA: promoActive ? Math.round(baseExtraCFA * multiplier) : undefined,
      originalPremiumCFA: promoActive ? Math.round(basePremiumCFA * multiplier) : undefined,
      hasActiveFlashPromo: !!promoActive,
      promoTimeRemainingMs: promoActive ? Math.max(0, promoActive.expiresAt - Date.now()) : 0,
    };
  }

  // --- 3. THE "SECRET LIKE" ENGINE ---

  /**
   * Generates tailored affinity notifications/descriptions for blurred profiles
   */
  public getSecretLikeRecommendation(likedProfilesCount: number): { title: string; subtitle: string; compatibilityScore: number } {
    // Generate an affinity based on simulated tastes or defaults
    const score = 94 + Math.floor(Math.random() * 5); // 94% to 98% compatibility
    
    return {
      title: `Un profil qui correspond à ${score}% à tes critères vient de t'aimer !`,
      subtitle: "Il adore voyager, est du signe Scorpion et recherche activement une relation sérieuse. Débloque Bavel Premium pour engager la discussion instantanément !",
      compatibilityScore: score
    };
  }

  // --- 4. ROI OF THE BOOST OPTIMIZATION ---

  /**
   * When user is boosted, filter candidates to favor connections with highly active, compatible users.
   * Also guarantees high matching rates!
   */
  public optimizeCandidatesForBoostedUser<T extends { id: string | number; name: string }>(
    candidates: T[],
    isBoostActive: boolean
  ): T[] {
    if (!isBoostActive) return candidates;

    // AI optimization: Bubble profiles that are online, highly compatible or simulated to always swipe right (high probability).
    // This gives immediate visual reward and matches during the precious 30-min boost.
    return [...candidates].sort((a, b) => {
      // Simulate higher priority to active profile candidates
      const scoreA = (a.name.length % 5) + (String(a.id).length % 3);
      const scoreB = (b.name.length % 5) + (String(b.id).length % 3);
      return scoreB - scoreA; // Dynamic reordering to maximize matches
    });
  }

  /**
   * Decide if a swipe action during Boost should trigger an INSTANT match to validate the user's ROI.
   */
  public shouldGuaranteeMatchDuringBoost(): boolean {
    const boostState = monetizationService.getBoostState();
    if (!boostState.isActive) return false;

    // 65% match rate during Boost to maximize immediate dopamine and validate conversion ROI!
    return Math.random() < 0.65;
  }

  // --- 5. IN-APP CURRENCY PROMOTION (Popular Profiles Chat Wall) ---

  /**
   * Evaluates if a target profile is "Highly Popular"
   * If yes, triggers the paywall asking for virtual credits for priority delivery.
   */
  public isProfileHighlyPopular(profile: any): boolean {
    if (!profile) return false;
    
    // Profiles with popular tag, or mock check based on ID / popularity level
    if (profile.popular === true || profile.eloScore > 1400) {
      return true;
    }

    // Selectively make some profiles highly popular to trigger priority messages
    const nameLength = profile.name ? profile.name.length : 0;
    return nameLength % 4 === 0; // 25% of profiles are designated "elite" popular
  }
}

export const aiMonetizationEngine = new AIMonetizationEngine();
