/**
 * Bavel Support AI Service Engine
 * Manages the automated onboarding, profile diagnosis, and real-time AI customer assistance for Bavel.
 */

import { aiSystemEngine } from './aiSystemEngine';
import { monetizationService } from './monetizationService';

export interface BavelSupportMessage {
  id: string;
  sender: 'bavel' | 'user';
  text: string;
  time?: string;
  dateHeader?: string;
  actionLinks?: Array<{
    targetText: string;
    actionType: 'encounters' | 'premium' | 'profile';
  }>;
}

export interface UserProfileState {
  name: string;
  photos?: string[];
  bio?: string;
  isPremium?: boolean;
  interests?: string[];
  city?: string;
}

const STORAGE_KEY = 'bavel_support_full_messages_v5';

class BavelSupportService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialMessages();
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

  /**
   * Helper to sanitize any historical strings containing 'IA'
   */
  private sanitizeMessageText(text: string): string {
    if (!text) return text;
    return text
      .replace(/Diagnostic IA Bavel/gi, 'Astuce Bavel')
      .replace(/Analyse IA Bavel/gi, 'Astuce Bavel')
      .replace(/Conseil IA Bavel/gi, 'Astuce Bavel')
      .replace(/Astuce IA Bavel/gi, 'Astuce Bavel')
      .replace(/L'Assistant IA Bavel vous répond\s*:/gi, 'Astuce Bavel VIP :')
      .replace(/Conseil de rédaction IA\s*:/gi, 'Astuce Bavel Rédaction :')
      .replace(/L'intelligence Bavel/gi, "L'équipe Bavel")
      .replace(/l'IA Bavel/gi, 'Bavel')
      .replace(/\bIA Bavel\b/gi, 'Bavel')
      .replace(/\bIA\b/g, 'Bavel');
  }

  /**
   * Helper to fetch current stored user profile info
   */
  public getStoredUser(): UserProfileState {
    try {
      const saved = localStorage.getItem('app_user') || localStorage.getItem('user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Steven',
          photos: parsed.photos || [],
          bio: parsed.bio || '',
          isPremium: !!parsed.isPremium,
          interests: parsed.interests || [],
          city: parsed.city || 'Paris'
        };
      }
    } catch {}

    return {
      name: 'Steven',
      photos: [],
      bio: '',
      isPremium: false,
      interests: [],
      city: 'Paris'
    };
  }

  /**
   * Generates the baseline initial messages and automated dynamic audit based on user state
   */
  public getInitialMessages(userState?: UserProfileState): BavelSupportMessage[] {
    const user = userState || this.getStoredUser();
    const name = user.name || 'Steven';

    const baseMessages: BavelSupportMessage[] = [
      {
        id: 'bavel_msg_2',
        sender: 'bavel',
        text: `Enfin vous voilà sur Bavel 💜 Ça fait plaisir !\nChez nous, vous allez pouvoir oser être vous pour faire des rencontres sympas. Et si vous voulez que le succès soit au rendez-vous... Bavel Premium vous ouvrira toutes les portes !\n\nVous verrez qui a liké votre profil 👀\nVous ferez passer vos messages en priorité pour que vos contacts les lisent en premier ⬆️\nVous aurez la possibilité d'annuler votre dernier Swipe à gauche (eh oui, parfois on va trop vite) ⬆️\nVous pourrez savoir si quelqu'un a mis votre profil dans ses favoris ⭐️\nVous pourrez même passer en mode invisible pour parcourir Bavel en toute discrétion 👻\n\nAllez, c'est par ici que ça se passe !`,
        actionLinks: [
          { targetText: 'par ici', actionType: 'premium' }
        ]
      },
      {
        id: 'bavel_msg_3',
        sender: 'bavel',
        dateHeader: '23 juil. 2026',
        text: `C'est un plaisir de vous revoir, ${name} ! 👋 Voici quelques conseils pour votre retour parmi nous. 📸 Ajoutez au moins 6 photos récentes : voyages, animaux, activités en tout genre permettent de discuter plus facilement. ✏️ N'hésitez pas à revoir votre bio : les choses ont peut-être changé depuis la dernière fois que vous nous avez rendu visite. Appuyez ici pour mettre votre profil à jour et à vous de jouer ! 💪`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      },
      {
        id: 'bavel_msg_4',
        sender: 'bavel',
        dateHeader: '10 août 2026',
        text: `Salut ${name} 👋 Ça fait plaisir de vous revoir ! Et en plus, on a quelques conseils pour vous aider à passer à la vitesse supérieure. 📸 Ajoutez au moins 6 photos récentes : voyages, animaux, activités en tout genre... vous avez l'embarras du choix !\n✏️ N'hésitez pas à revoir votre description : les choses ont peut-être changé depuis la dernière fois que vous nous avez rendu visite. Appuyez ici pour mettre votre profil à jour, et à vous de jouer 💪`,
        actionLinks: [
          { targetText: 'ici', actionType: 'profile' }
        ]
      }
    ];

    // Dynamic inspection of what's missing on the profile
    const photoCount = user.photos?.length || 0;
    const bioText = (user.bio || '').trim();

    if (photoCount < 6) {
      baseMessages.push({
        id: 'bavel_msg_ai_photos',
        sender: 'bavel',
        dateHeader: 'Aujourd\'hui',
        text: `📸 Astuce Bavel : Nous suivons votre profil de près, ${name} ! Vous possédez actuellement ${photoCount} photo${photoCount > 1 ? 's' : ''}. Les membres ayant au moins 6 photos reçoivent 4x plus de Likes et de demandes de discussions ! Appuyez ici pour en ajouter d'autres et maximiser vos matchs.`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      });
    }

    if (!bioText || bioText.length < 15) {
      baseMessages.push({
        id: 'bavel_msg_ai_bio',
        sender: 'bavel',
        text: `✏️ Astuce Bavel : Votre description est encore un peu courte ! Une bio personnalisée avec vos passions et votre humour permet de briser la glace facilement. Appuyez ici pour compléter votre profil.`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      });
    }

    if (!user.isPremium) {
      baseMessages.push({
        id: 'bavel_msg_ai_premium',
        sender: 'bavel',
        text: `⭐ Astuce Bavel : Passez à la vitesse supérieure ! Découvrez Bavel Premium pour voir qui consulte votre profil et faire passer vos messages en priorité. Allez, c'est par ici que ça se passe !`,
        actionLinks: [
          { targetText: 'par ici', actionType: 'premium' }
        ]
      });
    }

    return baseMessages;
  }

  private ensureInitialMessages() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const initial = this.getInitialMessages();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {}
  }

  /**
   * Retrieves all current messages for Bavel Support thread
   */
  public getMessages(): BavelSupportMessage[] {
    try {
      // Also clean older storage keys if present
      const oldKeys = ['bavel_support_full_messages_v3', 'bavel_support_full_messages_v4'];
      let rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        for (const k of oldKeys) {
          const val = localStorage.getItem(k);
          if (val) {
            rawData = val;
            break;
          }
        }
      }

      if (rawData) {
        const parsed: BavelSupportMessage[] = JSON.parse(rawData);
        const filtered = parsed
          .filter(m => m.id !== 'bavel_msg_1' && !m.text?.toLowerCase().includes('bienvenue sur bavel'))
          .map(m => ({
            ...m,
            text: this.sanitizeMessageText(m.text)
          }));
        this.saveMessages(filtered);
        return filtered;
      }
    } catch {}
    const initial = this.getInitialMessages();
    this.saveMessages(initial);
    return initial;
  }

  /**
   * Save messages array to persistent storage
   */
  public saveMessages(messages: BavelSupportMessage[]) {
    try {
      const sanitized = messages.map(m => ({
        ...m,
        text: this.sanitizeMessageText(m.text)
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {}
    this.notify();
  }

  /**
   * Run dynamic profile evaluation and inject new missing-item tips if needed
   */
  public runProfileAudit(userState?: UserProfileState) {
    const user = userState || this.getStoredUser();
    const currentMsgs = this.getMessages();
    const name = user.name || 'Steven';
    const photoCount = user.photos?.length || 0;
    const bioText = (user.bio || '').trim();
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let updated = false;
    const newMsgs = [...currentMsgs];

    // Check if photo warning was already sent
    const hasPhotoAudit = newMsgs.some(m => m.id.includes('photos') || m.text.includes('Astuce Bavel'));
    if (!hasPhotoAudit && photoCount < 6) {
      newMsgs.push({
        id: `bavel_msg_ai_photos_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `📸 Astuce Bavel : Nous suivons votre profil de près, ${name} ! Vous possédez actuellement ${photoCount} photo${photoCount > 1 ? 's' : ''}. Les membres ayant au moins 6 photos reçoivent 4x plus de Likes et de demandes de discussions ! Appuyez ici pour en ajouter d'autres.`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      });
      updated = true;
    }

    // Check if bio audit was sent
    const hasBioAudit = newMsgs.some(m => m.id.includes('bio') || m.text.includes('Astuce Bavel'));
    if (!hasBioAudit && (!bioText || bioText.length < 15)) {
      newMsgs.push({
        id: `bavel_msg_ai_bio_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `✏️ Astuce Bavel : Votre description est actuellement très courte. Racontez en quelques mots ce qui vous anime pour faciliter la discussion ! Appuyez ici pour éditer votre profil.`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      });
      updated = true;
    }

    if (updated) {
      this.saveMessages(newMsgs);
    }
  }

  /**
   * Interactive Response Generator for User Queries sent in Customer Service chat
   */
  public generateAIResponse(userQuery: string, userState?: UserProfileState): BavelSupportMessage {
    const user = userState || this.getStoredUser();
    const name = user.name || 'Steven';
    const lower = userQuery.toLowerCase().trim();
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // 1. Photos & Profile advice
    if (lower.includes('photo') || lower.includes('image') || lower.includes('avatar') || lower.includes('picture')) {
      return {
        id: `bavel_reply_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `📸 Astuce Bavel pour vos photos, ${name} :\n\n• Privilégiez un beau portrait lumineux en première position (évitez les lunettes de soleil et les photos floues).\n• Ajoutez au moins 6 photos illustrant vos loisirs, vos voyages et vos animaux.\n\nAppuyez ici pour mettre à jour vos photos dès maintenant !`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      };
    }

    // 2. Monetization queries, Extra vs Premium, Swipes, Likes, Incognito, Bonus, Ads, Filters, Priority
    const isMonetizationQuery = 
      lower.includes('premium') || 
      lower.includes('extra') || 
      lower.includes('abonnement') || 
      lower.includes('forfait') || 
      lower.includes('payant') || 
      lower.includes('prix') || 
      lower.includes('tarif') || 
      lower.includes('like') || 
      lower.includes('admirateur') || 
      lower.includes('invisible') || 
      lower.includes('discrétion') || 
      lower.includes('incognito') || 
      lower.includes('swipe') || 
      lower.includes('filtre') || 
      lower.includes('pub') || 
      lower.includes('coup de coeur') || 
      lower.includes('super like') || 
      lower.includes('annuler') || 
      lower.includes('rewind') || 
      lower.includes('credit') || 
      lower.includes('bonus') || 
      lower.includes('priorite');

    if (isMonetizationQuery) {
      const currentTier = monetizationService.getUserStatus();
      const aiQueryResult = aiSystemEngine.answerMonetizationQueryWithBavelAi(userQuery, currentTier);

      return {
        id: `bavel_reply_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `${aiQueryResult.reply}\n\nPour gérer ou activer votre abonnement, appuyez sur par ici.`,
        actionLinks: [
          { targetText: 'par ici', actionType: 'premium' }
        ]
      };
    }

    // 3. Rencontres / Swipe / Near me
    if (lower.includes('rencontre') || lower.includes('proximité') || lower.includes('match') || lower.includes('swipe') || lower.includes('chercher')) {
      return {
        id: `bavel_reply_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `📍 Astuce Rencontres :\n\nPour faire de belles rencontres rapidement, visitez l'onglet À proximité 📍 pour envoyer des messages directs ou swiper les profils qui vous plaisent !\n\nCliquez ici pour faire une nouvelle rencontre.`,
        actionLinks: [
          { targetText: 'Cliquez ici pour faire une nouvelle rencontre.', actionType: 'encounters' }
        ]
      };
    }

    // 4. Bio & Profile updates
    if (lower.includes('bio') || lower.includes('description') || lower.includes('profil') || lower.includes('modifier') || lower.includes('présentation')) {
      return {
        id: `bavel_reply_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `✏️ Astuce Bavel Rédaction :\n\nUne description idéale comprend :\n1. Vos passions principales 🎨⚽️✈️\n2. Ce que vous recherchez sur Bavel 💕\n3. Une petite touche d'humour 😃\n\nAppuyez ici pour modifier votre profil.`,
        actionLinks: [
          { targetText: 'Appuyez ici', actionType: 'profile' }
        ]
      };
    }

    // 5. Greeting or General
    if (lower.includes('salut') || lower.includes('bonjour') || lower.includes('coucou') || lower.includes('hello') || lower.includes('ca va') || lower.includes('ça va')) {
      return {
        id: `bavel_reply_${Date.now()}`,
        sender: 'bavel',
        time: nowTime,
        text: `Salut ${name} ! 💜 Ça fait super plaisir de vous lire. L'équipe Bavel est là pour vous accompagner dans vos rencontres. Avez-vous besoin d'une astuce pour vos photos, votre bio ou Bavel Premium ?`
      };
    }

    // Fallback default customer support answer
    return {
      id: `bavel_reply_${Date.now()}`,
      sender: 'bavel',
      time: nowTime,
      text: `Merci pour votre message, ${name} ! 💜 L'équipe du Service Client Bavel a bien pris en compte votre demande. Nous suivons l'activité de tous nos membres pour garantir une expérience fluide. Si vous avez besoin de booster votre profil, appuyez ici pour personnaliser votre compte ou consultez nos offres Premium.`,
      actionLinks: [
        { targetText: 'appuyez ici', actionType: 'profile' }
      ]
    };
  }

  /**
   * Adds a user message and automatically queries the server-side Gemini Lara AI endpoint
   */
  public sendMessage(userText: string, userState?: UserProfileState): { userMsg: BavelSupportMessage; aiMsgPromise: Promise<BavelSupportMessage> } {
    const current = this.getMessages();
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const userMsg: BavelSupportMessage = {
      id: `user_msg_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: nowTime
    };

    const nextMessages = [...current, userMsg];
    this.saveMessages(nextMessages);

    const aiMsgPromise = (async () => {
      try {
        const res = await fetch('/api/lara-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userQuery: userText,
            history: current,
            userState: userState || this.getStoredUser()
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            const aiResponse: BavelSupportMessage = {
              id: `bavel_reply_${Date.now()}`,
              sender: 'bavel',
              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              text: data.reply
            };
            const latestMsgs = this.getMessages();
            this.saveMessages([...latestMsgs, aiResponse]);
            return aiResponse;
          }
        }
      } catch (err) {
        console.warn("[Lara AI] Network error, falling back to local engine:", err);
      }

      // Fallback local engine response
      const aiResponse = this.generateAIResponse(userText, userState);
      const latestMsgs = this.getMessages();
      this.saveMessages([...latestMsgs, aiResponse]);
      return aiResponse;
    })();

    return { userMsg, aiMsgPromise };
  }
}

export const bavelSupportService = new BavelSupportService();
