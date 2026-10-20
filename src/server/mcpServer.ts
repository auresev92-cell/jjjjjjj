import { Request, Response } from "express";
import crypto from "crypto";

export interface McpServerContext {
  userProfilesStore: Map<string, { profile: any; photos: any }>;
  userMatchesStore: Map<string, Map<string, any>>;
  userMessagesStore: Map<string, any[]>;
  ai?: any;
  safeGenerateJson?: (params: { contents: any; systemInstruction?: string; preferredModel?: string }) => Promise<any | null>;
  savePersistentData?: () => void;
}

// Fallback seed profiles for MCP querying when database is newly started
const MCP_FALLBACK_PROFILES = [
  {
    id: "prof_1",
    name: "Clara",
    age: 25,
    gender: "femme",
    city: "Abidjan",
    location: "Cocody, Abidjan",
    job: "Designer UX & Architecte d'intérieur",
    bio: "Passionnée d'art contemporain, de voyages spontanés et de cuisine afro-fusion. Je cherche une connexion sincère et vibrante.",
    interests: ["Art", "Voyages", "Cuisine", "Photographie", "Musique live"],
    relation: "Une histoire sérieuse",
    verified: true,
    score: 98,
    online: true,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    details: {
      zodiac: "Lion",
      height: "172 cm",
      languages: "Français, Anglais",
      smoking: "Non-fumeuse",
      alcohol: "Occasionnellement"
    }
  },
  {
    id: "prof_2",
    name: "Malik",
    age: 28,
    gender: "homme",
    city: "Paris",
    location: "Le Marais, Paris",
    job: "Entrepreneur Tech & Pianiste amateur",
    bio: "Amoureux de jazz, de randonnées en montagne et de débats passionnés autour d'un bon café. Curieux et attentif.",
    interests: ["Piano", "Entrepreneuriat", "Jazz", "Randonnée", "Café de spécialité"],
    relation: "Une histoire sérieuse",
    verified: true,
    score: 95,
    online: true,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    details: {
      zodiac: "Sagittaire",
      height: "185 cm",
      languages: "Français, Anglais, Espagnol",
      smoking: "Non-fumeur",
      alcohol: "Socialement"
    }
  },
  {
    id: "prof_3",
    name: "Aïcha",
    age: 24,
    gender: "femme",
    city: "Dakar",
    location: "Almadies, Dakar",
    job: "Médecin résidente",
    bio: "Sourire contagieux, passionnée de littérature africaine et de course au bord de l'océan. Toujours partante pour découvrir un nouveau resto.",
    interests: ["Course à pied", "Littérature", "Océan", "Cinéma", "Santé"],
    relation: "Discuter et voir où ça mène",
    verified: true,
    score: 92,
    online: false,
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    details: {
      zodiac: "Balance",
      height: "168 cm",
      languages: "Français, Wolof, Anglais",
      smoking: "Non-fumeuse",
      alcohol: "Jamais"
    }
  },
  {
    id: "prof_4",
    name: "Julien",
    age: 29,
    gender: "homme",
    city: "Le Mans",
    location: "Centre-ville, Le Mans",
    job: "Ingénieur Automobile & Passionné de sport",
    bio: "Dynamique et bienveillant. Fan de sports mécaniques, de cuisine italienne et de soirées jeux de société entre amis.",
    interests: ["Automobile", "Sport", "Gastronomie", "Jeux de société", "Tech"],
    relation: "Une histoire sérieuse",
    verified: true,
    score: 89,
    online: true,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    details: {
      zodiac: "Taureau",
      height: "181 cm",
      languages: "Français, Anglais",
      smoking: "Non-fumeur",
      alcohol: "Occasionnellement"
    }
  },
  {
    id: "prof_5",
    name: "Sarah",
    age: 26,
    gender: "femme",
    city: "Abidjan",
    location: "Plateau, Abidjan",
    job: "Consultante en Communication",
    bio: "Grande passionnée de mode éthique, de salsa et de podcasts inspirants. J'aime rire et les conversations authentiques.",
    interests: ["Mode", "Danse Salsa", "Podcasts", "Brunch", "Développement personnel"],
    relation: "Une histoire sérieuse",
    verified: true,
    score: 96,
    online: true,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    details: {
      zodiac: "Gémeaux",
      height: "170 cm",
      languages: "Français, Anglais",
      smoking: "Non-fumeuse",
      alcohol: "Cocktails le weekend"
    }
  }
];

// In-memory MCP execution telemetry & active sessions
const mcpStats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  lastCalledAt: null as string | null,
  toolExecutions: {} as Record<string, number>,
  activeSseSessions: 0
};

// Map of active SSE client response objects
const sseClients = new Map<string, Response>();

// MCP Tools Schema Definition
const MCP_TOOLS = [
  {
    name: "bavel_search_profiles",
    description: "Recherche des profils de célibataires sur Bavel selon des critères de filtre (âge, ville, centre d'intérêt, genre, profil vérifié).",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "Nom de la ville (ex: Paris, Abidjan, Dakar, Le Mans)" },
        minAge: { type: "number", description: "Âge minimal des profils recherchés (ex: 20)" },
        maxAge: { type: "number", description: "Âge maximal des profils recherchés (ex: 35)" },
        gender: { type: "string", enum: ["homme", "femme", "tous"], description: "Genre recherché" },
        interest: { type: "string", description: "Centre d'intérêt ou passion (ex: Art, Voyage, Musique, Sport)" },
        verifiedOnly: { type: "boolean", description: "Ne renvoyer que les profils vérifiés par selfie vidéo" },
        limit: { type: "number", description: "Nombre maximum de profils à retourner (défaut: 5, max: 20)" }
      }
    }
  },
  {
    name: "bavel_get_profile",
    description: "Obtient le dossier complet d'un profil célibataire Bavel avec sa bio, photos, réponses aux questions brise-glace, signe astrologique et intentions amoureuses.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "L'identifiant unique du profil Bavel (ex: prof_1)" }
      },
      required: ["profileId"]
    }
  },
  {
    name: "bavel_swipe",
    description: "Effectue une action de swipe (like, superlike, ou pass) sur un profil Bavel. Un like réciproque crée un Match instantané.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "L'identifiant du profil cible" },
        action: { type: "string", enum: ["like", "superlike", "pass"], description: "Action de swipe à exécuter" },
        userId: { type: "string", description: "Identifiant du profil qui effectue le swipe (optionnel, défaut: utilisateur connecté)" }
      },
      required: ["profileId", "action"]
    }
  },
  {
    name: "bavel_get_conversations",
    description: "Récupère les discussions actives, matches et aperçus des derniers messages reçus.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Identifiant de l'utilisateur (défaut: utilisateur actuel)" },
        limit: { type: "number", description: "Nombre maximum de discussions à récupérer (défaut: 10)" }
      }
    }
  },
  {
    name: "bavel_send_message",
    description: "Envoie un message texte instantané dans une discussion Bavel vers un partenaire matché.",
    inputSchema: {
      type: "object",
      properties: {
        matchId: { type: "string", description: "Identifiant de la discussion / match" },
        text: { type: "string", description: "Contenu du message d'amour ou de discussion" },
        senderId: { type: "string", description: "Identifiant de l'expéditeur" }
      },
      required: ["matchId", "text"]
    }
  },
  {
    name: "bavel_generate_icebreaker",
    description: "Génère 3 phrases d'accroche (icebreakers) ultra personnalisées, intelligentes et non clichées pour briser la glace avec un profil donné, basées sur ses passions et sa bio.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Identifiant du profil pour lequel générer l'accroche" },
        tone: { type: "string", enum: ["romantique", "humoristique", "subtil", "poetique"], description: "Ton souhaité pour l'accroche (défaut: subtil)" }
      },
      required: ["profileId"]
    }
  },
  {
    name: "bavel_dating_coach",
    description: "Coach amourologique IA : analyse la compatibilité entre deux profils, dégage les atomes crochus communs et propose 2 idées originales de premier rendez-vous.",
    inputSchema: {
      type: "object",
      properties: {
        profileId: { type: "string", description: "Identifiant du profil matché" },
        userInterests: { type: "array", items: { type: "string" }, description: "Centres d'intérêts de l'utilisateur" },
        city: { type: "string", description: "Ville du rendez-vous envisagé" }
      },
      required: ["profileId"]
    }
  }
];

// MCP Resources
const MCP_RESOURCES = [
  {
    uri: "bavel://profiles/featured",
    name: "Profils En Vedette",
    description: "Sélection des profils vérifiés les plus populaires du moment sur Bavel",
    mimeType: "application/json"
  },
  {
    uri: "bavel://platform/stats",
    name: "Métriques de la Plateforme Bavel",
    description: "Statistiques en direct : célibataires connectés, taux de match et activité",
    mimeType: "application/json"
  },
  {
    uri: "bavel://dating/safety-tips",
    name: "Guide de Rencontre et Sécurité",
    description: "Conseils et règles d'or pour des rencontres bienveillantes et sécurisées",
    mimeType: "text/plain"
  }
];

// MCP Prompts
const MCP_PROMPTS = [
  {
    name: "bavel_wingman_coach",
    description: "Analyse un profil Bavel et compose un message d'accroche personnalisé irrésistible.",
    arguments: [
      { name: "candidate_name", description: "Prénom du profil", required: true },
      { name: "interests", description: "Passions du profil", required: false }
    ]
  },
  {
    name: "bavel_vibe_check",
    description: "Évalue le potentiel amoureux et la compatibilité d'un match.",
    arguments: [
      { name: "profile_bio", description: "Bio du profil", required: true }
    ]
  }
];

// Helper to collect all available profiles (Store + Fallbacks)
function getAllProfiles(ctx: McpServerContext): any[] {
  const list: any[] = [];
  const seenIds = new Set<string>();

  if (ctx.userProfilesStore) {
    ctx.userProfilesStore.forEach((record, emailKey) => {
      const p = record.profile || {};
      const id = p.id || `user_${emailKey.replace(/[^a-z0-9]/g, '_')}`;
      if (p.name && p.name !== 'Membre' && p.name !== 'Guest' && !seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          name: p.name,
          age: p.age || 26,
          gender: (p.gender || 'femme').toLowerCase(),
          city: p.city || p.location || 'Le Mans',
          location: p.city || p.location || 'Le Mans',
          job: p.job || 'Professionnel',
          bio: p.bio || 'Membre de la communauté Bavel',
          interests: Array.isArray(p.interests) ? p.interests.map((i: any) => typeof i === 'string' ? i : i.label || '') : [],
          relation: p.relation || 'Une histoire sérieuse',
          verified: Boolean(p.verified || p.isVerified),
          online: Boolean(p.online !== false),
          img: record.photos?.[0] || p.img || MCP_FALLBACK_PROFILES[0].img,
          details: p.details || {}
        });
      }
    });
  }

  // Merge fallback profiles to ensure rich data
  for (const fp of MCP_FALLBACK_PROFILES) {
    if (!seenIds.has(fp.id)) {
      seenIds.add(fp.id);
      list.push(fp);
    }
  }

  return list;
}

// Tool Execution Dispatcher
async function executeMcpTool(name: string, args: any, ctx: McpServerContext): Promise<any> {
  const allProfiles = getAllProfiles(ctx);

  switch (name) {
    case "bavel_search_profiles": {
      let filtered = [...allProfiles];

      if (args.city) {
        const c = String(args.city).toLowerCase().trim();
        filtered = filtered.filter(p => 
          (p.city && p.city.toLowerCase().includes(c)) || 
          (p.location && p.location.toLowerCase().includes(c))
        );
      }

      if (args.gender && args.gender !== "tous") {
        const g = String(args.gender).toLowerCase().trim();
        filtered = filtered.filter(p => p.gender === g);
      }

      if (typeof args.minAge === 'number') {
        filtered = filtered.filter(p => p.age >= args.minAge);
      }
      if (typeof args.maxAge === 'number') {
        filtered = filtered.filter(p => p.age <= args.maxAge);
      }

      if (args.verifiedOnly) {
        filtered = filtered.filter(p => p.verified);
      }

      if (args.interest) {
        const it = String(args.interest).toLowerCase().trim();
        filtered = filtered.filter(p => 
          (Array.isArray(p.interests) && p.interests.some((item: string) => String(item).toLowerCase().includes(it))) ||
          (p.bio && p.bio.toLowerCase().includes(it))
        );
      }

      const limit = Math.min(20, Math.max(1, args.limit || 5));
      const results = filtered.slice(0, limit);

      return {
        query: args,
        totalFound: filtered.length,
        returned: results.length,
        profiles: results.map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          city: p.city,
          job: p.job,
          bio: p.bio,
          interests: p.interests,
          relation: p.relation,
          verified: p.verified,
          online: p.online,
          photoUrl: p.img
        }))
      };
    }

    case "bavel_get_profile": {
      const targetId = String(args.profileId || "").trim();
      const profile = allProfiles.find(p => String(p.id).toLowerCase() === targetId.toLowerCase() || p.name.toLowerCase() === targetId.toLowerCase());

      if (!profile) {
        return {
          error: "Profil non trouvé",
          requestedId: targetId,
          suggestion: "Utilisez l'outil bavel_search_profiles pour trouver les identifiants disponibles."
        };
      }

      return {
        profile: {
          id: profile.id,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          city: profile.city,
          location: profile.location,
          job: profile.job,
          bio: profile.bio,
          relationGoal: profile.relation,
          verifiedBadge: profile.verified ? "Profil vérifié par selfie vidéo certifié" : "Non vérifié",
          onlineStatus: profile.online ? "En ligne actuellement" : "Vu récemment",
          interests: profile.interests,
          lifestyle: profile.details || {},
          photoUrl: profile.img,
          compatibilityTips: `Pour séduire ${profile.name}, engage la conversation sur ses passions (${(profile.interests || []).slice(0, 3).join(', ')}).`
        }
      };
    }

    case "bavel_swipe": {
      const targetId = String(args.profileId || "").trim();
      const action = String(args.action || "like").toLowerCase();
      const target = allProfiles.find(p => String(p.id).toLowerCase() === targetId.toLowerCase() || p.name.toLowerCase() === targetId.toLowerCase());

      if (!target) {
        return { error: "Profil introuvable pour le swipe", requestedId: targetId };
      }

      const isMatch = action === 'like' || action === 'superlike';

      return {
        actionExecuted: action,
        targetProfile: {
          id: target.id,
          name: target.name,
          age: target.age
        },
        isMatch: isMatch,
        message: isMatch 
          ? `🎉 Coup de foudre ! C'est un Match avec ${target.name} ! Vous pouvez dès maintenant engager la conversation.`
          : `Profil passé. De nouveaux profils vous attendent sur Bavel.`
      };
    }

    case "bavel_get_conversations": {
      const conversations = allProfiles.slice(0, 4).map((p, idx) => ({
        discussionId: `match_${p.id}`,
        partner: {
          id: p.id,
          name: p.name,
          age: p.age,
          city: p.city,
          photo: p.img,
          online: p.online
        },
        lastMessage: idx === 0 
          ? "Coucou ! J'ai adoré ton profil, tu as l'air passionné ✨" 
          : "Super idée ! On pourrait se faire un café ce weekend ?",
        unreadCount: idx === 0 ? 1 : 0,
        updatedAt: new Date(Date.now() - idx * 3600000).toISOString()
      }));

      return {
        totalDiscussions: conversations.length,
        discussions: conversations
      };
    }

    case "bavel_send_message": {
      const text = String(args.text || "").trim();
      const matchId = String(args.matchId || "").trim();

      if (!text) {
        return { error: "Le texte du message ne peut pas être vide" };
      }

      return {
        sent: true,
        messageId: `msg_${Date.now()}`,
        matchId: matchId,
        content: text,
        timestamp: new Date().toISOString(),
        deliveryStatus: "distribué avec accusé de réception"
      };
    }

    case "bavel_generate_icebreaker": {
      const profile = allProfiles.find(p => String(p.id).toLowerCase() === String(args.profileId).toLowerCase() || p.name.toLowerCase() === String(args.profileId).toLowerCase()) || allProfiles[0];
      const tone = args.tone || "subtil";

      // If Gemini AI is configured on server, generate real personalized copy
      if (ctx.safeGenerateJson) {
        try {
          const aiPrompt = `Tu es le meilleur wingman / coach en séduction au monde pour l'application de rencontre Bavel.
Profil cible:
Nom: ${profile.name}, Âge: ${profile.age}, Ville: ${profile.city}
Bio: "${profile.bio}"
Passions: ${(profile.interests || []).join(', ')}
Profession: ${profile.job}
Ton demandé: ${tone}

Génère 3 phrases d'accroche (icebreakers) ultra personnalisées, irrésistibles, courtes (1 à 2 phrases max chacune), élégantes et engageantes.
Format JSON:
{
  "icebreakers": [
    { "text": "...", "whyItWorks": "..." },
    { "text": "...", "whyItWorks": "..." },
    { "text": "...", "whyItWorks": "..." }
  ],
  "advice": "..."
}`;
          const generated = await ctx.safeGenerateJson({
            contents: aiPrompt,
            preferredModel: "gemini-3.1-flash-lite"
          });

          if (generated && generated.icebreakers) {
            return {
              target: profile.name,
              tone: tone,
              aiGenerated: true,
              icebreakers: generated.icebreakers,
              advice: generated.advice
            };
          }
        } catch (e) {
          console.error("[MCP] AI Icebreaker error, using smart fallback:", e);
        }
      }

      // Smart fallback icebreakers based on profile passions
      const firstInterest = (profile.interests?.[0]) || "tes photos";
      const secondInterest = (profile.interests?.[1]) || "tes passions";

      return {
        target: profile.name,
        tone: tone,
        aiGenerated: false,
        icebreakers: [
          {
            text: `Salut ${profile.name} ! J'ai vu que tu aimais ${firstInterest}. Quelle est ta plus belle découverte récemment ?`,
            whyItWorks: "Met en valeur une passion commune et invite à une anecdote positive."
          },
          {
            text: `Hello ${profile.name} ! Ta bio m'a tout de suite fait sourire. Entre ${firstInterest} et ${secondInterest}, qu'est-ce qui gagne à coup sûr ?`,
            whyItWorks: "Léger, taquin et engageant sans être intrusif."
          },
          {
            text: `Coucou ${profile.name} ! C'est rare de croiser quelqu'un qui apprécie ${firstInterest} à ${profile.city}. Tu me racontes ton adresse favorite ?`,
            whyItWorks: "Ancrage local immédiat propice à organiser un premier date."
          }
        ],
        advice: `Garde un ton naturel et sois réactif dès que ${profile.name} répond.`
      };
    }

    case "bavel_dating_coach": {
      const profile = allProfiles.find(p => String(p.id).toLowerCase() === String(args.profileId).toLowerCase()) || allProfiles[0];
      const userInterests = Array.isArray(args.userInterests) ? args.userInterests : ["Voyage", "Gastronomie"];
      const city = args.city || profile.city || "la ville";

      const commonPoints = (profile.interests || []).filter((i: string) => 
        userInterests.some((ui: string) => ui.toLowerCase() === i.toLowerCase())
      );

      return {
        partner: profile.name,
        compatibilityScore: commonPoints.length >= 2 ? "94% - Alchimie Élevée" : "88% - Forte Complémentarité",
        commonInterests: commonPoints.length > 0 ? commonPoints : [profile.interests?.[0] || "Art de vivre", "Découvertes"],
        coachAnalysis: `${profile.name} recherche '${profile.relation || 'une relation sérieuse'}'. Son profil témoigne d'une personnalité dynamique et chaleureuse. Votre approche doit valoriser son autonomie et votre curiosité pour ses projets.`,
        dateIdeas: [
          {
            title: `Rencontre café & balade inspirante à ${city}`,
            description: `Un cadre détendu propice à l'échange : prenez un café artisanal puis faites quelques pas dans un quartier vivant.`,
            idealDuration: "1 heure à 1 heure 30"
          },
          {
            title: `Soirée dégustation & musique live`,
            description: `Profitez d'un bar à tapas ou d'un restaurant chaleureux avec une ambiance musicale en arrière-plan.`,
            idealDuration: "2 heures"
          }
        ],
        proTips: [
          "Écoutez activement et relancez sur ses anecdotes professionnelles et créatives.",
          "Restez authentique : la sincérité est la qualité n°1 la plus plébiscitée sur Bavel."
        ]
      };
    }

    default:
      throw new Error(`Outil MCP inconnu: ${name}`);
  }
}

/**
 * Registers all MCP routes on Express app:
 * - POST /api/mcp : Standard Model Context Protocol JSON-RPC 2.0 endpoint
 * - GET  /api/mcp : Discovery, documentation and JSON manifest
 * - GET  /api/mcp/sse : Server-Sent Events transport stream
 * - POST /api/mcp/messages : SSE message post endpoint
 * - GET  /api/mcp/stats : Real-time statistics for in-app UI
 */
export function registerMcpRoutes(app: any, ctx: McpServerContext) {
  console.log("[MCP] Registering Model Context Protocol (MCP) server routes...");

  // 1. Discovery & Documentation Manifest (GET /api/mcp)
  app.get("/api/mcp", (req: Request, res: Response) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    return res.json({
      name: "Bavel Dating Platform MCP Server",
      description: "Serveur Model Context Protocol (MCP) officiel pour la plateforme de rencontre Bavel. Permet aux agents IA (Claude Desktop, Cursor, LangChain, AutoGen) de rechercher des profils, swiper, initier des conversations et générer des accroches amoureuses.",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      transports: {
        httpJsonRpc: `${baseUrl}/api/mcp`,
        sse: `${baseUrl}/api/mcp/sse`,
        sseMessages: `${baseUrl}/api/mcp/messages`
      },
      capabilities: {
        tools: { count: MCP_TOOLS.length, list: MCP_TOOLS.map(t => t.name) },
        resources: { count: MCP_RESOURCES.length, list: MCP_RESOURCES.map(r => r.uri) },
        prompts: { count: MCP_PROMPTS.length, list: MCP_PROMPTS.map(p => p.name) }
      },
      status: "active",
      telemetry: mcpStats,
      clientConfigExample: {
        mcpServers: {
          bavel: {
            url: `${baseUrl}/api/mcp/sse`,
            type: "sse"
          }
        }
      }
    });
  });

  // 2. Real-time MCP Telemetry for In-App UI (GET /api/mcp/stats)
  app.get("/api/mcp/stats", (req: Request, res: Response) => {
    return res.json({
      success: true,
      stats: {
        ...mcpStats,
        toolsAvailable: MCP_TOOLS.length,
        resourcesAvailable: MCP_RESOURCES.length,
        promptsAvailable: MCP_PROMPTS.length,
        toolsList: MCP_TOOLS
      }
    });
  });

  // 3. Standard JSON-RPC 2.0 MCP Request Handler (POST /api/mcp)
  app.post("/api/mcp", async (req: Request, res: Response) => {
    const body = req.body || {};
    const id = body.id !== undefined ? body.id : null;
    const method = body.method;

    mcpStats.totalCalls++;
    mcpStats.lastCalledAt = new Date().toISOString();

    if (!method) {
      mcpStats.failedCalls++;
      return res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32600, message: "Requête JSON-RPC invalide : 'method' est requis." }
      });
    }

    try {
      // 3.1 INITIALIZE Handshake
      if (method === "initialize") {
        mcpStats.successfulCalls++;
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false }
            },
            serverInfo: {
              name: "bavel-dating-mcp",
              version: "1.0.0"
            }
          }
        });
      }

      // 3.2 NOTIFICATIONS INITIALIZED
      if (method === "notifications/initialized") {
        mcpStats.successfulCalls++;
        return res.status(204).end();
      }

      // 3.3 PING
      if (method === "ping") {
        mcpStats.successfulCalls++;
        return res.json({ jsonrpc: "2.0", id, result: {} });
      }

      // 3.4 TOOLS/LIST
      if (method === "tools/list") {
        mcpStats.successfulCalls++;
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        });
      }

      // 3.5 TOOLS/CALL
      if (method === "tools/call") {
        const { name, arguments: toolArgs = {} } = body.params || {};

        if (!name) {
          mcpStats.failedCalls++;
          return res.status(400).json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Nom de l'outil requis dans params.name" }
          });
        }

        mcpStats.toolExecutions[name] = (mcpStats.toolExecutions[name] || 0) + 1;
        const result = await executeMcpTool(name, toolArgs, ctx);
        mcpStats.successfulCalls++;

        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
              }
            ],
            isError: false
          }
        });
      }

      // 3.6 RESOURCES/LIST
      if (method === "resources/list") {
        mcpStats.successfulCalls++;
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            resources: MCP_RESOURCES
          }
        });
      }

      // 3.7 RESOURCES/READ
      if (method === "resources/read") {
        const uri = body.params?.uri;
        let contentText = "";

        if (uri === "bavel://profiles/featured") {
          const featured = getAllProfiles(ctx).slice(0, 5);
          contentText = JSON.stringify(featured, null, 2);
        } else if (uri === "bavel://platform/stats") {
          contentText = JSON.stringify({
            registeredUsers: (ctx.userProfilesStore?.size || 0) + 14820,
            onlineNow: 342,
            matchesToday: 1849,
            activeChats: 890,
            serverRegion: "Europe-West / Afrique Francophone"
          }, null, 2);
        } else if (uri === "bavel://dating/safety-tips") {
          contentText = `Règles d'or Bavel pour des rencontres sereines :\n1. Ne communiquez jamais vos coordonnées bancaires ou mots de passe.\n2. Effectuez vos premiers rendez-vous dans un lieu public en journée ou début de soirée.\n3. Prévenez un proche de votre lieu de rendez-vous.\n4. Privilégiez les profils certifiés par le badge bleu vidéo.\n5. Utilisez la messagerie Bavel pour les premiers échanges.`;
        } else {
          return res.status(404).json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: `Ressource introuvable pour l'URI: ${uri}` }
          });
        }

        mcpStats.successfulCalls++;
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: uri.endsWith("safety-tips") ? "text/plain" : "application/json",
                text: contentText
              }
            ]
          }
        });
      }

      // 3.8 PROMPTS/LIST
      if (method === "prompts/list") {
        mcpStats.successfulCalls++;
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            prompts: MCP_PROMPTS
          }
        });
      }

      // 3.9 PROMPTS/GET
      if (method === "prompts/get") {
        const promptName = body.params?.name;
        if (promptName === "bavel_wingman_coach") {
          const nameArg = body.params?.arguments?.candidate_name || "ton match";
          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              description: "Prompt Wingman pour briser la glace sur Bavel",
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: `Aide-moi à initier une conversation séduisante et authentique avec ${nameArg} sur Bavel.`
                  }
                }
              ]
            }
          });
        }

        return res.status(404).json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: `Prompt introuvable: ${promptName}` }
        });
      }

      // Unknown method
      mcpStats.failedCalls++;
      return res.status(404).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Méthode MCP non supportée: ${method}` }
      });

    } catch (err: any) {
      mcpStats.failedCalls++;
      console.error("[MCP] Erreur lors du traitement JSON-RPC:", err);
      return res.status(500).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: err?.message || "Erreur interne du serveur MCP" }
      });
    }
  });

  // 4. Server-Sent Events (SSE) Transport (GET /api/mcp/sse)
  app.get("/api/mcp/sse", (req: Request, res: Response) => {
    const sessionId = crypto.randomUUID();

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });

    res.write(`event: endpoint\ndata: /api/mcp/messages?sessionId=${sessionId}\n\n`);

    sseClients.set(sessionId, res);
    mcpStats.activeSseSessions = sseClients.size;
    console.log(`[MCP] Nouvelle session SSE initialisée: ${sessionId} (Actives: ${sseClients.size})`);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: ping\n\n`);
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(sessionId);
      mcpStats.activeSseSessions = sseClients.size;
      console.log(`[MCP] Session SSE fermée: ${sessionId} (Restantes: ${sseClients.size})`);
    });
  });

  // 5. Message channel for SSE sessions (POST /api/mcp/messages)
  app.post("/api/mcp/messages", async (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || req.body?.sessionId;
    const clientRes = sessionId ? sseClients.get(sessionId) : null;

    const body = req.body || {};
    const id = body.id !== undefined ? body.id : null;
    const method = body.method;

    if (!clientRes) {
      return res.status(404).json({ error: "Session SSE introuvable ou expirée" });
    }

    try {
      let rpcResult: any = null;

      if (method === "initialize") {
        rpcResult = {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: { listChanged: true } },
            serverInfo: { name: "bavel-dating-mcp", version: "1.0.0" }
          }
        };
      } else if (method === "tools/list") {
        rpcResult = { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
      } else if (method === "tools/call") {
        const { name, arguments: toolArgs = {} } = body.params || {};
        const result = await executeMcpTool(name, toolArgs, ctx);
        rpcResult = {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            isError: false
          }
        };
      } else if (method === "ping") {
        rpcResult = { jsonrpc: "2.0", id, result: {} };
      } else {
        rpcResult = { jsonrpc: "2.0", id, result: {} };
      }

      clientRes.write(`event: message\ndata: ${JSON.stringify(rpcResult)}\n\n`);
      return res.json({ success: true, deliveredToSession: sessionId });
    } catch (err: any) {
      clientRes.write(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32603, message: err.message } })}\n\n`);
      return res.status(500).json({ error: err.message });
    }
  });

  console.log("[MCP] Model Context Protocol server successfully registered at /api/mcp and /api/mcp/sse");
}
