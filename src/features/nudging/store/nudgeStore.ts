import { create } from 'zustand';

export interface NudgeGoal {
  id: string;
  type: 'swipe_challenge' | 'like_challenge' | 'verification_challenge';
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  xpReward: number;
  creditsReward: number;
}

export interface NudgeState {
  activeGoal: NudgeGoal | null;
  sessionSwipes: number;
  sessionLikes: number;
  passivityScore: number; // calculated locally
  lastActionTimestamp: number;
  
  // Actions
  initializeSession: () => void;
  recordAction: () => void;
  incrementSwipe: () => void;
  incrementLike: () => void;
  triggerChallenge: (type: NudgeGoal['type']) => void;
  claimReward: () => { credits: number; xp: number } | null;
  dismissNudge: () => void;
}

export const useNudgeStore = create<NudgeState>((set, get) => {
  // Load initial challenge from localStorage if available
  let savedGoal: NudgeGoal | null = null;
  try {
    const data = localStorage.getItem('bavel_nudge_active_goal');
    if (data) {
      savedGoal = JSON.parse(data);
    }
  } catch {}

  return {
    activeGoal: savedGoal,
    sessionSwipes: 0,
    sessionLikes: 0,
    passivityScore: 0,
    lastActionTimestamp: Date.now(),

    initializeSession: () => {
      // If no active goal, start a default fun challenge
      if (!get().activeGoal) {
        get().triggerChallenge('swipe_challenge');
      }
    },

    recordAction: () => {
      set({
        lastActionTimestamp: Date.now(),
        passivityScore: 0,
      });
    },

    incrementSwipe: () => {
      const state = get();
      state.recordAction();
      
      const newSwipes = state.sessionSwipes + 1;
      let goal = state.activeGoal;

      if (goal && goal.type === 'swipe_challenge' && !goal.isCompleted) {
        const nextCount = Math.min(goal.targetCount, goal.currentCount + 1);
        const isNowCompleted = nextCount >= goal.targetCount;
        
        goal = {
          ...goal,
          currentCount: nextCount,
          isCompleted: isNowCompleted,
        };

        try {
          localStorage.setItem('bavel_nudge_active_goal', JSON.stringify(goal));
        } catch {}
      }

      set({
        sessionSwipes: newSwipes,
        activeGoal: goal,
      });
    },

    incrementLike: () => {
      const state = get();
      state.recordAction();
      
      const newLikes = state.sessionLikes + 1;
      let goal = state.activeGoal;

      if (goal && goal.type === 'like_challenge' && !goal.isCompleted) {
        const nextCount = Math.min(goal.targetCount, goal.currentCount + 1);
        const isNowCompleted = nextCount >= goal.targetCount;
        
        goal = {
          ...goal,
          currentCount: nextCount,
          isCompleted: isNowCompleted,
        };

        try {
          localStorage.setItem('bavel_nudge_active_goal', JSON.stringify(goal));
        } catch {}
      }

      set({
        sessionLikes: newLikes,
        activeGoal: goal,
      });
    },

    triggerChallenge: (type) => {
      let title = "";
      let description = "";
      let targetCount = 10;
      let xpReward = 150;
      let creditsReward = 50;

      if (type === 'swipe_challenge') {
        title = "⚡ Défi Swipe Ultra-Vitesse";
        description = "Swipez 30 fois sur le radar pour propulser instantanément votre profil dans le flux prioritaire !";
        targetCount = 30;
        xpReward = 200;
        creditsReward = 50;
      } else if (type === 'like_challenge') {
        title = "❤️ Briseur de Glace";
        description = "Envoyez 8 Coups de Cœur ou Likes directs pour doubler votre taux d'affinités ce soir.";
        targetCount = 8;
        xpReward = 250;
        creditsReward = 100;
      } else {
        title = "🛡️ Badge de Confiance Biométrique";
        description = "Complétez votre Liveness 3D pour débloquer +300% de visibilité radar.";
        targetCount = 1;
        xpReward = 500;
        creditsReward = 200;
      }

      const newGoal: NudgeGoal = {
        id: `challenge_${Date.now()}`,
        type,
        title,
        description,
        targetCount,
        currentCount: 0,
        isCompleted: false,
        rewardClaimed: false,
        xpReward,
        creditsReward,
      };

      set({ activeGoal: newGoal });
      try {
        localStorage.setItem('bavel_nudge_active_goal', JSON.stringify(newGoal));
      } catch {}
    },

    claimReward: () => {
      const { activeGoal } = get();
      if (activeGoal && activeGoal.isCompleted && !activeGoal.rewardClaimed) {
        const rewards = {
          credits: activeGoal.creditsReward,
          xp: activeGoal.xpReward,
        };

        const updatedGoal = {
          ...activeGoal,
          rewardClaimed: true,
        };

        set({ activeGoal: updatedGoal });
        try {
          localStorage.setItem('bavel_nudge_active_goal', JSON.stringify(updatedGoal));
        } catch {}

        return rewards;
      }
      return null;
    },

    dismissNudge: () => {
      set({ activeGoal: null });
      try {
        localStorage.removeItem('bavel_nudge_active_goal');
      } catch {}
    }
  };
});
