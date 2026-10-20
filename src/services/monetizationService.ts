/**
 * Monetization & Freemium Economic System
 * Handles credits, virtual currency, boosts with 30-min timers, and VIP passes.
 */

import { Transaction, BoostState } from '../types';

const CREDITS_STORAGE_KEY = 'bavel_credits_balance';
const TRANSACTIONS_STORAGE_KEY = 'bavel_transactions';
const BOOST_STORAGE_KEY = 'bavel_active_boost';
const USER_STATUS_STORAGE_KEY = 'bavel_user_status';

export type MonetizationTier = 'free' | 'extra' | 'premium';

/**
 * Matrice des 9 autorisations et restrictions Bavel Extra & Bavel Premium
 */
export interface MonetizationPermissions {
  // 1- Découvrir qui a donné un like : Extra (NON) - Premium (OUI)
  canSeeWhoLikedYou: boolean;
  // 2- Envoyer vos messages en priorité : Extra (NON) - Premium (OUI)
  hasPriorityMessaging: boolean;
  // 3- Profiter de filtres illimités : Extra (NON) - Premium (OUI)
  hasUnlimitedFilters: boolean;
  // 4- Consulter les profils en toute discrétion (mode incognito / invisible) : Extra (NON) - Premium (OUI)
  canBrowseIncognito: boolean;
  // 5- Swiper aussi souvent que vous voulez (illimité) : Extra (OUI) - Premium (OUI)
  hasUnlimitedSwipes: boolean;
  // 6- Supprimer toutes les pubs (zéro pub) : Extra (OUI) - Premium (OUI)
  hasNoAds: boolean;
  // 7- Un coup de cœur par jour offert : Extra (OUI) - Premium (OUI)
  hasDailyCoupDeCoeur: boolean;
  // 8- Annuler des swipes accidentels (rewind / retour arrière) : Extra (OUI) - Premium (OUI)
  canRewindSwipes: boolean;
  // 9- Des crédits bonus pour tout achat de crédits (+20% à +50%) : Extra (OUI) - Premium (OUI)
  hasBonusCreditsOnPurchase: boolean;
}

export const MONETIZATION_MATRIX: Record<MonetizationTier, MonetizationPermissions> = {
  free: {
    canSeeWhoLikedYou: false,
    hasPriorityMessaging: false,
    hasUnlimitedFilters: false,
    canBrowseIncognito: false,
    hasUnlimitedSwipes: false,
    hasNoAds: false,
    hasDailyCoupDeCoeur: false,
    canRewindSwipes: false,
    hasBonusCreditsOnPurchase: false,
  },
  extra: {
    canSeeWhoLikedYou: false,
    hasPriorityMessaging: false,
    hasUnlimitedFilters: false,
    canBrowseIncognito: false,
    hasUnlimitedSwipes: true,
    hasNoAds: true,
    hasDailyCoupDeCoeur: true,
    canRewindSwipes: true,
    hasBonusCreditsOnPurchase: true,
  },
  premium: {
    canSeeWhoLikedYou: true,
    hasPriorityMessaging: true,
    hasUnlimitedFilters: true,
    canBrowseIncognito: true,
    hasUnlimitedSwipes: true,
    hasNoAds: true,
    hasDailyCoupDeCoeur: true,
    canRewindSwipes: true,
    hasBonusCreditsOnPurchase: true,
  }
};

export interface CreditPackage {
  id: string;
  credits: number;
  priceCFA: number;
  priceEUR: number;
  popular?: boolean;
  bonus?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'pack_100', credits: 100, priceCFA: 1500, priceEUR: 2.49 },
  { id: 'pack_550', credits: 550, priceCFA: 6000, priceEUR: 8.99, popular: true, bonus: '+10% GRATUIT' },
  { id: 'pack_1250', credits: 1250, priceCFA: 12000, priceEUR: 17.99, bonus: '+25% GRATUIT' },
  { id: 'pack_3000', credits: 3000, priceCFA: 25000, priceEUR: 36.99, bonus: 'BEST DEAL +50%' },
];

export const BOOST_COST_CREDITS = 100;
export const BOOST_DURATION_MS = 30 * 60 * 1000; // 30 minutes

class MonetizationService {
  private credits: number = 0;
  private userStatus: MonetizationTier = 'free';
  private transactions: Transaction[] = [];
  private boostState: BoostState = {
    isActive: false,
    startedAt: null,
    expiresAt: null,
    multiplier: 1,
  };
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedCredits = localStorage.getItem(CREDITS_STORAGE_KEY);
      if (savedCredits !== null) {
        this.credits = parseInt(savedCredits, 10);
      }

      const savedStatus = localStorage.getItem(USER_STATUS_STORAGE_KEY);
      if (savedStatus) {
        this.userStatus = savedStatus as MonetizationTier;
      }

      const savedTx = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (savedTx) {
        this.transactions = JSON.parse(savedTx);
      }

      const savedBoost = localStorage.getItem(BOOST_STORAGE_KEY);
      if (savedBoost) {
        const parsed = JSON.parse(savedBoost);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          this.boostState = parsed;
        } else {
          this.clearBoost();
        }
      }
    } catch {}
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Monetization listener error:', e);
      }
    });
  }

  // ============================================
  // GESTION DES PERMISSIONS EN TEMPS RÉEL
  // ============================================

  public getPermissions(tier?: MonetizationTier): MonetizationPermissions {
    const currentTier = tier || this.userStatus;
    return MONETIZATION_MATRIX[currentTier] || MONETIZATION_MATRIX.free;
  }

  public hasPermission(permissionKey: keyof MonetizationPermissions): boolean {
    const permissions = this.getPermissions();
    return Boolean(permissions[permissionKey]);
  }

  public getUserStatus(): MonetizationTier {
    return this.userStatus;
  }

  public setUserStatus(status: MonetizationTier): void {
    this.userStatus = status;
    try {
      localStorage.setItem(USER_STATUS_STORAGE_KEY, status);
      localStorage.setItem('bavel_is_premium', String(status === 'premium'));
      localStorage.setItem('bavel_is_extra', String(status === 'extra'));
    } catch {}
    this.notify();
  }

  public isPremium(): boolean {
    return this.userStatus === 'premium';
  }

  public isExtra(): boolean {
    return this.userStatus === 'extra';
  }

  public isFree(): boolean {
    return this.userStatus === 'free';
  }

  /**
   * Vérification détaillée avec explication pour l'UI et Bavel AI
   */
  public checkFeatureAccess(featureKey: keyof MonetizationPermissions): {
    allowed: boolean;
    requiredTier: 'extra' | 'premium';
    featureLabel: string;
    description: string;
  } {
    const allowed = this.hasPermission(featureKey);
    const labels: Record<keyof MonetizationPermissions, { label: string; tier: 'extra' | 'premium'; desc: string }> = {
      canSeeWhoLikedYou: {
        label: 'Découvrir qui vous a liké',
        tier: 'premium',
        desc: 'Voyez tous vos admirateurs secrets sans attendre de liker en retour.'
      },
      hasPriorityMessaging: {
        label: 'Messages prioritaires',
        tier: 'premium',
        desc: 'Placez vos messages tout en haut de la boîte de réception de vos matchs.'
      },
      hasUnlimitedFilters: {
        label: 'Filtres de recherche illimités',
        tier: 'premium',
        desc: 'Affinez vos critères par taille, silhouette, études, signe astro et habitudes.'
      },
      canBrowseIncognito: {
        label: 'Navigation en toute discrétion (Mode Incognito)',
        tier: 'premium',
        desc: 'Visitez les profils sans laisser de trace et masquez votre statut en ligne.'
      },
      hasUnlimitedSwipes: {
        label: 'Swipes illimités',
        tier: 'extra',
        desc: 'Swipez autant que vous le souhaitez sans être bloqué par le quota quotidien de 50 likes.'
      },
      hasNoAds: {
        label: 'Suppression totale des publicités',
        tier: 'extra',
        desc: 'Naviguez sans aucune interruption publicitaire.'
      },
      hasDailyCoupDeCoeur: {
        label: '1 Coup de Cœur par jour offert',
        tier: 'extra',
        desc: 'Envoyez un Super Like quotidien gratuit pour multiplier vos chances par 3.'
      },
      canRewindSwipes: {
        label: 'Annulation des swipes accidentels (Rewind)',
        tier: 'extra',
        desc: 'Revenez en arrière instantanément si vous avez passé un profil par erreur.'
      },
      hasBonusCreditsOnPurchase: {
        label: 'Crédits bonus sur tout achat',
        tier: 'extra',
        desc: 'Bénéficiez de +20% à +50% de crédits offerts à chaque rechargement.'
      }
    };

    const config = labels[featureKey];
    return {
      allowed,
      requiredTier: config.tier,
      featureLabel: config.label,
      description: config.desc
    };
  }

  // ============================================
  // TRANSACTIONS & CRÉDITS
  // ============================================

  public spendCredits(amount: number, description = 'achat'): boolean {
    if (this.credits < amount) {
      return false;
    }
    this.credits -= amount;
    try {
      localStorage.setItem(CREDITS_STORAGE_KEY, this.credits.toString());
    } catch {}

    const tx: Transaction = {
      id: `tx_spend_${Date.now()}`,
      userId: 'current_user',
      amount: -amount,
      credits: -amount,
      currency: 'CREDITS',
      type: 'boost',
      provider: 'reward',
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    this.transactions.unshift(tx);
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(this.transactions));
    } catch {}
    this.notify();
    return true;
  }

  public getCredits(): number {
    return this.credits;
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getBoostState(): BoostState {
    if (this.boostState.isActive && this.boostState.expiresAt && Date.now() > this.boostState.expiresAt) {
      this.clearBoost();
    }
    return { ...this.boostState };
  }

  public addCredits(amount: number, reason = 'reward', provider: Transaction['provider'] = 'reward'): void {
    // Calcul de bonus si abonné Extra ou Premium (Règle 9)
    let finalCredits = amount;
    if (this.hasPermission('hasBonusCreditsOnPurchase') && reason === 'purchase') {
      finalCredits = Math.round(amount * 1.25); // +25% de bonus
    }

    this.credits += finalCredits;
    try {
      localStorage.setItem(CREDITS_STORAGE_KEY, this.credits.toString());
    } catch {}

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: 'current_user',
      amount: finalCredits,
      credits: finalCredits,
      currency: 'CREDITS',
      type: 'reward',
      provider,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    this.transactions.unshift(tx);
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(this.transactions));
    } catch {}
    this.notify();
  }

  public purchaseCredits(pkg: CreditPackage, provider: Transaction['provider']): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Appliquer bonus pour abonnés Extra et Premium (Règle 9)
        let creditedAmount = pkg.credits;
        if (this.hasPermission('hasBonusCreditsOnPurchase')) {
          creditedAmount = Math.round(pkg.credits * 1.25); // +25% bonus Extra/Premium
        }

        this.credits += creditedAmount;
        try {
          localStorage.setItem(CREDITS_STORAGE_KEY, this.credits.toString());
        } catch {}

        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          userId: 'current_user',
          amount: pkg.priceCFA,
          credits: creditedAmount,
          currency: 'XOF',
          type: 'credit_purchase',
          provider,
          status: 'completed',
          timestamp: new Date().toISOString(),
        };

        this.transactions.unshift(tx);
        try {
          localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(this.transactions));
        } catch {}
        this.notify();
        resolve(true);
      }, 1200);
    });
  }

  public activateBoost(): { success: boolean; error?: string } {
    if (this.boostState.isActive && this.boostState.expiresAt && Date.now() < this.boostState.expiresAt) {
      return { success: false, error: 'Un Boost est déjà actif sur votre profil.' };
    }

    if (this.credits < BOOST_COST_CREDITS) {
      return { success: false, error: 'Solde de crédits insuffisant. Veuillez recharger.' };
    }

    // Deduct credits
    this.credits -= BOOST_COST_CREDITS;
    try {
      localStorage.setItem(CREDITS_STORAGE_KEY, this.credits.toString());
    } catch {}

    const now = Date.now();
    this.boostState = {
      isActive: true,
      startedAt: now,
      expiresAt: now + BOOST_DURATION_MS,
      multiplier: 5,
    };
    try {
      localStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify(this.boostState));
    } catch {}

    const tx: Transaction = {
      id: `tx_boost_${now}`,
      userId: 'current_user',
      amount: -BOOST_COST_CREDITS,
      credits: -BOOST_COST_CREDITS,
      currency: 'CREDITS',
      type: 'boost',
      provider: 'reward',
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    this.transactions.unshift(tx);
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(this.transactions));
    } catch {}

    this.notify();
    return { success: true };
  }

  public activateFreeSuperBoost(multiplier = 5.2): { success: boolean } {
    const now = Date.now();
    this.boostState = {
      isActive: true,
      startedAt: now,
      expiresAt: now + BOOST_DURATION_MS,
      multiplier,
    };
    try {
      localStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify(this.boostState));
    } catch {}
    this.notify();
    return { success: true };
  }

  public activateSubscription(status: MonetizationTier, provider: Transaction['provider']): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setUserStatus(status);

        const amounts: Record<MonetizationTier, number> = {
          free: 0,
          extra: 3500,
          premium: 7500,
        };

        const tx: Transaction = {
          id: `tx_sub_${Date.now()}`,
          userId: 'current_user',
          amount: amounts[status],
          credits: 0,
          currency: 'XOF',
          type: 'subscription',
          provider,
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
        this.transactions.unshift(tx);
        try {
          localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(this.transactions));
        } catch {}

        this.notify();
        resolve(true);
      }, 1400);
    });
  }

  private clearBoost() {
    this.boostState = {
      isActive: false,
      startedAt: null,
      expiresAt: null,
      multiplier: 1,
    };
    try {
      localStorage.removeItem(BOOST_STORAGE_KEY);
    } catch {}
    this.notify();
  }
}

export const monetizationService = new MonetizationService();

