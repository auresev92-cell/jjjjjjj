/**
 * Engagement & Gamification Service
 * Calculates profile popularity gauges, manages quest incentives, and awards credits.
 */

import { UserQuest } from '../types';
import { monetizationService } from './monetizationService';
import { securityService } from './securityService';

const QUESTS_STORAGE_KEY = 'bavel_user_quests';
const POPULARITY_STORAGE_KEY = 'bavel_popularity_score';

export interface PopularityMetrics {
  score: number; // 0 to 100
  level: 'low' | 'medium' | 'high' | 'star';
  label: string;
  dailyViews: number;
  matchRatePercent: number;
  topTip: string;
}

export const INITIAL_QUESTS: UserQuest[] = [
  {
    id: 'quest_selfie',
    title: 'Vérifier votre profil par selfie',
    description: 'Obtenez le badge bleu certifié et rassurez vos matchs.',
    rewardCredits: 50,
    isCompleted: false,
    actionKey: 'selfie_verify',
  },
  {
    id: 'quest_photos',
    title: 'Ajouter 3 photos de qualité',
    description: 'Les profils avec 3+ photos reçoivent 4x plus de likes.',
    rewardCredits: 30,
    isCompleted: false,
    actionKey: 'photos_3',
  },
  {
    id: 'quest_bio',
    title: 'Rédiger une bio captivante',
    description: 'Décrivez vos passions, humour ou ce que vous recherchez.',
    rewardCredits: 20,
    isCompleted: true,
    actionKey: 'bio',
  },
  {
    id: 'quest_location',
    title: 'Activer la géolocalisation GPS',
    description: 'Trouvez instantanément les célibataires dans votre quartier.',
    rewardCredits: 15,
    isCompleted: true,
    actionKey: 'location',
  },
  {
    id: 'quest_first_swipe',
    title: 'Faire vos 10 premiers swipes',
    description: 'Entraînez l’algorithme de compatibilité Bavel.',
    rewardCredits: 25,
    isCompleted: false,
    actionKey: 'first_swipe',
  },
];

class GamificationService {
  private quests: UserQuest[] = INITIAL_QUESTS;
  private popularityScore: number = 72; // default dynamic score
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedQuests = localStorage.getItem(QUESTS_STORAGE_KEY);
      if (savedQuests) {
        this.quests = JSON.parse(savedQuests);
      }

      const savedScore = localStorage.getItem(POPULARITY_STORAGE_KEY);
      if (savedScore) {
        this.popularityScore = parseInt(savedScore, 10);
      }

      // Check if user is verified to complete selfie quest automatically
      if (securityService.isVerified()) {
        this.markQuestCompleted('quest_selfie');
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
    this.listeners.forEach((fn) => fn());
  }

  public getQuests(): UserQuest[] {
    return [...this.quests];
  }

  public getCompletedQuestsCount(): number {
    return this.quests.filter((q) => q.isCompleted).length;
  }

  public getProfileCompletenessPercent(): number {
    const total = this.quests.length;
    const completed = this.getCompletedQuestsCount();
    return Math.round((completed / total) * 100);
  }

  public markQuestCompleted(questId: string): boolean {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || quest.isCompleted) return false;

    quest.isCompleted = true;
    localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(this.quests));

    // Award virtual credits
    monetizationService.addCredits(quest.rewardCredits, `Quête: ${quest.title}`);

    // Boost popularity score
    this.popularityScore = Math.min(100, this.popularityScore + 8);
    localStorage.setItem(POPULARITY_STORAGE_KEY, this.popularityScore.toString());

    this.notify();
    return true;
  }

  public getPopularityMetrics(): PopularityMetrics {
    const boost = monetizationService.getBoostState();
    let currentScore = this.popularityScore;

    if (boost.isActive) {
      currentScore = Math.min(100, currentScore + 25);
    }

    let level: PopularityMetrics['level'] = 'low';
    let label = 'Faible';
    let dailyViews = 14;
    let matchRatePercent = 12;
    let topTip = 'Ajoutez des photos récentes et complétez vos centres d’intérêt pour monter de rang.';

    if (currentScore >= 85) {
      level = 'star';
      label = 'Star du Moment 🌟';
      dailyViews = 185;
      matchRatePercent = 48;
      topTip = 'Votre profil est au sommet des swipes dans votre région !';
    } else if (currentScore >= 65) {
      level = 'high';
      label = 'Très Populaire 🔥';
      dailyViews = 94;
      matchRatePercent = 32;
      topTip = 'Activez un Boost de 30 min pour atteindre le statut Star et tripler vos matchs.';
    } else if (currentScore >= 40) {
      level = 'medium';
      label = 'Moyenne ⚡';
      dailyViews = 42;
      matchRatePercent = 20;
      topTip = 'Vérifiez votre profil par selfie pour rassurer vos interlocuteurs (+50 crédits).';
    }

    return {
      score: currentScore,
      level,
      label,
      dailyViews: boost.isActive ? dailyViews * 3 : dailyViews,
      matchRatePercent: boost.isActive ? matchRatePercent + 15 : matchRatePercent,
      topTip,
    };
  }
}

export const gamificationService = new GamificationService();
