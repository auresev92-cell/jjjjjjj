export interface TestMessage {
  id: string;
  text: string;
  sender: 'user' | 'other' | 'me' | 'them';
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'voice' | 'location';
  time?: string;
}

export interface TestDiscussion {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  age: number;
  online: boolean;
  unreadCount: number;
  messages: TestMessage[];
  lastMessage: string;
  lastMessageTime: Date;
  tagline?: string;
  location?: string;
  allowVoiceCall?: boolean;
  allowVideoCall?: boolean;
  verified?: boolean;
  isTestDiscussion?: boolean;
}

const STORAGE_KEY = 'bavel_test_conversations_v1';

export const INITIAL_TEST_DISCUSSIONS: TestDiscussion[] = [];

class TestDiscussionsService {
  public getDiscussions(): TestDiscussion[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveDiscussions(INITIAL_TEST_DISCUSSIONS);
        return INITIAL_TEST_DISCUSSIONS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveDiscussions(INITIAL_TEST_DISCUSSIONS);
        return INITIAL_TEST_DISCUSSIONS;
      }
      return parsed.map((item: any) => ({
        ...item,
        lastMessageTime: new Date(item.lastMessageTime || Date.now()),
        messages: (item.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp || Date.now())
        }))
      }));
    } catch {
      return INITIAL_TEST_DISCUSSIONS;
    }
  }

  public saveDiscussions(discussions: TestDiscussion[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(discussions));
    } catch (err) {
      console.warn('Failed to save test discussions to localStorage:', err);
    }
  }

  public markAsRead(discussionId: string): TestDiscussion[] {
    const list = this.getDiscussions();
    const updated = list.map(d => {
      if (d.id === discussionId || d.userId === discussionId) {
        return {
          ...d,
          unreadCount: 0,
          messages: d.messages.map(m => ({ ...m, read: true }))
        };
      }
      return d;
    });
    this.saveDiscussions(updated);
    return updated;
  }

  public addMessage(discussionId: string, text: string, sender: 'user' | 'other' = 'user'): { updatedDiscussions: TestDiscussion[]; newMsg: TestMessage } {
    const list = this.getDiscussions();
    const newMsg: TestMessage = {
      id: `msg_test_${Date.now()}`,
      text,
      sender,
      timestamp: new Date(),
      read: sender === 'user',
      type: 'text',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = list.map(d => {
      if (d.id === discussionId || d.userId === discussionId) {
        return {
          ...d,
          messages: [...d.messages, newMsg],
          lastMessage: text,
          lastMessageTime: new Date(),
          unreadCount: sender === 'other' ? (d.unreadCount || 0) + 1 : 0
        };
      }
      return d;
    });

    this.saveDiscussions(updated);
    return { updatedDiscussions: updated, newMsg };
  }

  public getAutoReply(discussionId: string, userText: string): string {
    const lower = userText.toLowerCase();
    if (discussionId.includes('sylviane')) {
      if (lower.includes('week-end') || lower.includes('samedi') || lower.includes('dimanche') || lower.includes('dispo')) {
        return "Carrément ! On pourrait aller prendre un cocktail ou tester un chouette resto vers la lagune si ça te dit 🍹✨";
      }
      if (lower.includes('oui') || lower.includes('volontiers') || lower.includes('plaisir')) {
        return "Trop bien ! Donne-moi tes disponibilités et on s'organise ça avec grand plaisir 😊";
      }
      if (lower.includes('voyage') || lower.includes('passion')) {
        return "J'adore voyager ! Mon dernier coup de cœur c'était Assinie, et toi tu aimes quoi comme destinations ?";
      }
      return "C'est super intéressant ! J'aime beaucoup discuter avec toi, tu as l'air vraiment sympa et posé ✨";
    }

    if (discussionId.includes('maila')) {
      if (lower.includes('cherche') || lower.includes('amour') || lower.includes('sérieux') || lower.includes('rencontre')) {
        return "Je recherche avant tout une vraie connexion, quelqu'un avec qui rire, partager et construire sans prise de tête 🌿";
      }
      if (lower.includes('travail') || lower.includes('boulot') || lower.includes('vie')) {
        return "Je travaille dans la communication et le design ! Et toi, quel est ton domaine d'activité ?";
      }
      return "Exactement ! La communication et le feeling naturel, c'est ce qu'il y a de plus précieux. Tu es souvent sur l'appli ?";
    }

    return "Merci pour ton message ! C'est super agréable d'échanger avec toi 😊";
  }
}

export const testDiscussionsService = new TestDiscussionsService();
