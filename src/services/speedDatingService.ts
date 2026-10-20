/**
 * Service Speed Dating / Blind Date Quotidien en Temps Réel
 * Gère la file d'attente, la session synchronisée de 3 minutes,
 * le défloutage progressif de la photo et la décision mutuelle.
 */

export interface SpeedDatingPartner {
  id: string;
  name: string;
  age: number;
  city?: string;
  photoUrl: string;
  bio?: string;
  passions?: string[];
}

export interface SpeedDatingMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface SpeedDatingSessionData {
  sessionId: string;
  partner: SpeedDatingPartner;
  startedAt: number;
  durationSeconds: number; // 180s
  remainingSeconds: number;
  messages: SpeedDatingMessage[];
  blurLevel: number; // en px (de 28px à 0px)
  unblurProgress: number; // de 0 à 100%
  userDecision?: 'like' | 'pass' | null;
  partnerDecision?: 'like' | 'pass' | null;
  isCompleted: boolean;
  isMutualMatch?: boolean;
}

class SpeedDatingService {
  private activeSessionId: string | null = null;
  private socket: WebSocket | null = null;

  /**
   * Rejoint la session ou la file d'attente en temps réel
   */
  public async joinQueue(user: {
    id: string;
    name: string;
    age: number;
    photoUrl?: string;
    city?: string;
    genderPreference?: string;
  }): Promise<{ status: 'matched' | 'waiting'; session?: SpeedDatingSessionData; error?: string }> {
    try {
      const res = await fetch('/api/speed-dating/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      if (data.session) {
        this.activeSessionId = data.session.sessionId;
      }
      return data;
    } catch (err: any) {
      console.error('[SpeedDating] Erreur joinQueue:', err);
      return { status: 'waiting', error: err.message };
    }
  }

  /**
   * Récupère l'état courant de la session
   */
  public async getSessionStatus(sessionId: string, userId: string): Promise<SpeedDatingSessionData | null> {
    try {
      const res = await fetch(`/api/speed-dating/session/${sessionId}?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.session || null;
    } catch (err) {
      console.error('[SpeedDating] Erreur getSessionStatus:', err);
      return null;
    }
  }

  /**
   * Envoie un message dans le chat du Speed Dating (déclenche un palier de défloutage)
   */
  public async sendMessage(sessionId: string, senderId: string, senderName: string, text: string): Promise<SpeedDatingSessionData | null> {
    try {
      const res = await fetch(`/api/speed-dating/session/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, senderName, text })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.session || null;
    } catch (err) {
      console.error('[SpeedDating] Erreur sendMessage:', err);
      return null;
    }
  }

  /**
   * Transmet la décision finale de fin de date : 'like' ou 'pass'
   */
  public async submitDecision(
    sessionId: string, 
    userId: string, 
    decision: 'like' | 'pass'
  ): Promise<{ success: boolean; mutualMatch: boolean; partner?: SpeedDatingPartner }> {
    try {
      const res = await fetch(`/api/speed-dating/session/${sessionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, decision })
      });
      if (!res.ok) return { success: false, mutualMatch: false };
      return await res.json();
    } catch (err) {
      console.error('[SpeedDating] Erreur submitDecision:', err);
      return { success: false, mutualMatch: false };
    }
  }

  /**
   * Quitte la session ou annule la file d'attente
   */
  public async leaveSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      await fetch(`/api/speed-dating/session/${sessionId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      this.activeSessionId = null;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Suggestions brise-glace pour animer le Speed Dating
   */
  public getIcebreakers(): string[] {
    return [
      "Quel est ton rêve le plus fou ?",
      "Pizza ou sushis pour notre premier rencard ?",
      "Si tu pouvais te téléporter n'importe où maintenant ?",
      "Plutôt soirée cocooning ou fête jusqu'au matin ?",
      "La musique qui te met immédiatement de bonne humeur ?",
      "Quel est ton talent caché le plus inattendu ?",
      "Un voyage qui a changé ta façon de voir le monde ?"
    ];
  }
}

export const speedDatingService = new SpeedDatingService();
