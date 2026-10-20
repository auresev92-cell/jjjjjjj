/**
 * Robust Offline Action Sync Manager
 * Queues mutations when offline and processes them sequentially with backoff upon reconnection.
 */

export type OfflineActionType =
  | 'LIKE_USER'
  | 'PASS_USER'
  | 'SUPERLIKE_USER'
  | 'SEND_MESSAGE'
  | 'UPDATE_LOCATION'
  | 'UPDATE_PROFILE';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

const STORAGE_KEY = 'bavel_offline_action_queue';

class OfflineSyncService {
  private queue: OfflineAction[] = [];
  private isProcessing = false;
  private listeners: ((queue: OfflineAction[]) => void)[] = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {}
    this.notifyListeners();
  }

  public subscribe(listener: (queue: OfflineAction[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.queue);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l([...this.queue]));
  }

  public getQueue(): OfflineAction[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((a) => a.status === 'pending' || a.status === 'failed').length;
  }

  public enqueue(type: OfflineActionType, payload: any): OfflineAction {
    const action: OfflineAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(action);
    this.saveQueue();

    // If we are currently online, process immediately in the background
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.processQueue();
    }

    return action;
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isProcessing = true;

    const pendingActions = this.queue.filter((a) => a.status !== 'completed');

    for (const action of pendingActions) {
      action.status = 'syncing';
      this.saveQueue();

      try {
        await this.executeAction(action);
        action.status = 'completed';
      } catch (err) {
        console.warn(`[Sync] Failed action ${action.id}:`, err);
        action.retryCount += 1;
        action.status = action.retryCount >= 5 ? 'failed' : 'pending';
      }

      this.saveQueue();
    }

    // Clean up completed actions
    this.queue = this.queue.filter((a) => a.status !== 'completed');
    this.saveQueue();
    this.isProcessing = false;
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'LIKE_USER': {
        const { userId, targetId } = action.payload;
        const { saveLikeToSupabase } = await import('../lib/supabase');
        await saveLikeToSupabase(userId, targetId, false);
        break;
      }
      case 'SUPERLIKE_USER': {
        const { userId, targetId } = action.payload;
        const { saveLikeToSupabase } = await import('../lib/supabase');
        await saveLikeToSupabase(userId, targetId, true);
        break;
      }
      case 'PASS_USER': {
        // Pass is local/cache acknowledged
        break;
      }
      case 'SEND_MESSAGE': {
        const { matchId, senderId, text } = action.payload;
        const { saveMessageToSupabase } = await import('../lib/supabase');
        await saveMessageToSupabase(matchId, senderId, text, true);
        break;
      }
      case 'UPDATE_PROFILE': {
        const { profile } = action.payload;
        const { syncProfileToSupabase } = await import('../lib/supabase');
        await syncProfileToSupabase(profile);
        break;
      }
      default:
        break;
    }
  }

  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineSyncService = new OfflineSyncService();
