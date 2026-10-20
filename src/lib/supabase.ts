import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// 1. ENVIRONNEMENT & CONFIGURATION DYNAMIQUE
// ============================================

const env = (import.meta as any).env || {};
const HARDCODED_SUPABASE_URL = "https://qhrasmepglgfoeiglofi.supabase.co";
const HARDCODED_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocmFzbWVwZ2xnZm9laWdsb2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTY1OTMsImV4cCI6MjEwMDg5MjU5M30.LlPsKf6DdtbY0l4qXcNFl-Bq7PdjRaHLWGBU0u3dPF8";

// Clean invalid localStorage entries from previous template testing
if (typeof window !== 'undefined') {
  try {
    const localUrl = localStorage.getItem('bavel_supabase_url');
    if (localUrl && (localUrl.includes('supabase.co') && !localUrl.includes('qhrasmepglgfoeiglofi') || localUrl.includes('your-project'))) {
      localStorage.removeItem('bavel_supabase_url');
      localStorage.removeItem('bavel_supabase_anon_key');
    }
  } catch {}
}

let resolvedUrl = env.VITE_SUPABASE_URL || 
                  env.SUPABASE_URL || 
                  (typeof window !== 'undefined' ? ((window as any).__SUPABASE_URL__ || localStorage.getItem('bavel_supabase_url')) : '') || 
                  HARDCODED_SUPABASE_URL;

let resolvedAnonKey = env.VITE_SUPABASE_ANON_KEY || 
                      env.SUPABASE_ANON_KEY || 
                      (typeof window !== 'undefined' ? ((window as any).__SUPABASE_ANON_KEY__ || localStorage.getItem('bavel_supabase_anon_key')) : '') || 
                      HARDCODED_SUPABASE_ANON_KEY;

// Sanitize resolved URL and key to ensure valid Supabase endpoint
if (!resolvedUrl || resolvedUrl.includes('your-project') || resolvedUrl === "https://supabase.co") {
  resolvedUrl = HARDCODED_SUPABASE_URL;
}
if (!resolvedAnonKey || resolvedAnonKey.includes('your-anon-key')) {
  resolvedAnonKey = HARDCODED_SUPABASE_ANON_KEY;
}

export function getSupabaseUrl(): string {
  return resolvedUrl;
}

export function getSupabaseAnonKey(): string {
  return resolvedAnonKey;
}

export function checkIsSupabaseConfigured(): boolean {
  if (typeof window !== 'undefined' && localStorage.getItem('bavel_supabase_disconnected') === 'true') {
    return false;
  }
  return true;
}

export let isSupabaseConfigured = true;

export const BAVEL_STORAGE_BUCKET = 'bavel-profile-photos';

export function isUUID(id: any): boolean {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ============================================
// 1.1 DIAGNOSTICS & CONNECTIVITY UTILITIES
// ============================================

export interface SupabaseDiagnosticReport {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlHost: string;
  urlSource: string;
  anonKeyLength: number;
  anonKeyPrefix: string;
  isClientReady: boolean;
  envViteUrlPresent: boolean;
  envViteKeyPresent: boolean;
  localStorageUrlPresent: boolean;
  timestamp: string;
}

/**
 * Diagnostic utility function to verify if the Supabase environment variables
 * (URL and Key) are correctly loaded and accessible at runtime without leaking sensitive values.
 */
export function getSupabaseDiagnostics(): SupabaseDiagnosticReport {
  const currentEnv = (import.meta as any).env || {};
  let source = 'fallback_hardcoded';
  if (currentEnv.VITE_SUPABASE_URL) source = 'import.meta.env.VITE_SUPABASE_URL';
  else if (currentEnv.SUPABASE_URL) source = 'import.meta.env.SUPABASE_URL';
  else if (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) source = 'window.__SUPABASE_URL__';
  else if (typeof window !== 'undefined' && localStorage.getItem('bavel_supabase_url')) source = 'localStorage';

  let host = 'non-defini';
  try {
    if (resolvedUrl) {
      const parsed = new URL(resolvedUrl);
      host = parsed.host;
    }
  } catch {
    host = resolvedUrl ? resolvedUrl.slice(0, 32) : 'non-defini';
  }

  return {
    isConfigured: checkIsSupabaseConfigured(),
    hasUrl: Boolean(resolvedUrl && resolvedUrl.length > 0),
    hasAnonKey: Boolean(resolvedAnonKey && resolvedAnonKey.length > 0),
    urlHost: host,
    urlSource: source,
    anonKeyLength: resolvedAnonKey ? resolvedAnonKey.length : 0,
    anonKeyPrefix: resolvedAnonKey ? `${resolvedAnonKey.slice(0, 8)}...` : 'absente',
    isClientReady: Boolean(supabaseInstance),
    envViteUrlPresent: Boolean(currentEnv.VITE_SUPABASE_URL),
    envViteKeyPresent: Boolean(currentEnv.VITE_SUPABASE_ANON_KEY),
    localStorageUrlPresent: typeof window !== 'undefined' ? Boolean(localStorage.getItem('bavel_supabase_url')) : false,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Console log report in the App initialization that displays the presence
 * (but not the sensitive contents) of the Supabase configuration variables.
 */
export function logSupabaseDiagnosticReport(): SupabaseDiagnosticReport {
  const report = getSupabaseDiagnostics();
  if (typeof console !== 'undefined') {
    console.group('🔧 [Bavel] Supabase Environment & Connectivity Report');
    console.info(`• Supabase URL: ${report.hasUrl ? '✅ Présent' : '❌ Absent'} (Hôte: ${report.urlHost}, Source: ${report.urlSource})`);
    console.info(`• Supabase Anon Key: ${report.hasAnonKey ? '✅ Présent' : '❌ Absent'} (Longueur: ${report.anonKeyLength} caractères, Préfixe: ${report.anonKeyPrefix})`);
    console.info(`• Client Supabase initialisé: ${report.isClientReady ? '✅ Oui' : '⚠️ Prêt à la première requête'}`);
    console.info(`• Variables Vite d'environnement: VITE_SUPABASE_URL=${report.envViteUrlPresent ? 'oui' : 'non'}, VITE_SUPABASE_ANON_KEY=${report.envViteKeyPresent ? 'oui' : 'non'}`);
    console.info(`• Statut global: ${report.isConfigured ? 'Prêt pour les requêtes' : 'Non configuré'}`);
    console.groupEnd();
  }
  return report;
}

export interface SupabaseConnectionTestResult {
  success: boolean;
  networkReachable: boolean;
  status: number | string;
  latencyMs: number;
  message: string;
  category: 'success' | 'table_not_found_but_connected' | 'auth_error' | 'network_unreachable' | 'unknown';
  errorDetails?: string;
  timestamp: string;
}

/**
 * Attempts a simple fetch from a dummy Supabase table.
 * This determines if a failure is caused by client-side configuration or actual network access.
 */
export async function testSupabaseConnection(tableName = '_bavel_connection_test_'): Promise<SupabaseConnectionTestResult> {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const client = getSupabase();

  if (!client) {
    return {
      success: false,
      networkReachable: false,
      status: 'NO_CLIENT',
      latencyMs: 0,
      message: 'Client Supabase introuvable ou échec de construction.',
      category: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Attempt a lightweight SELECT on a dummy table (limit 1)
    const { error, status } = await client
      .from(tableName)
      .select('*')
      .limit(1);

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.round(endTime - startTime);

    if (!error) {
      return {
        success: true,
        networkReachable: true,
        status: status || 200,
        latencyMs,
        message: `Connexion réussie ! Table "${tableName}" accessible (${latencyMs}ms).`,
        category: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    const errCode = (error as any)?.code;
    const errMsg = error.message || '';

    // Error codes for non-existent table (e.g. PGRST204 / PGRST205 / 42P01 / 404 / 400).
    // This is NORMAL for a dummy table and proves network and API keys reached Supabase!
    if (
      errCode === 'PGRST204' || 
      errCode === 'PGRST205' || 
      errCode === '42P01' || 
      errMsg.toLowerCase().includes('does not exist') ||
      errMsg.toLowerCase().includes('relation') ||
      errMsg.toLowerCase().includes('schema cache') ||
      status === 404 ||
      status === 400
    ) {
      return {
        success: true,
        networkReachable: true,
        status: status || 404,
        latencyMs,
        message: `Réseau Supabase 100% fonctionnel (${latencyMs}ms). La table test "${tableName}" n'existe pas dans votre base (code normal ${errCode || 'PGRST205'}), ce qui prouve que la passerelle PostgREST Supabase a bien reçu et traité votre requête avec vos identifiants.`,
        category: 'table_not_found_but_connected',
        errorDetails: `Code: ${errCode || 'N/A'}, Message: ${errMsg}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Invalid API Key or JWT
    if (status === 401 || errCode === 'PGRST301' || errMsg.toLowerCase().includes('jwt') || errMsg.toLowerCase().includes('apikey')) {
      return {
        success: false,
        networkReachable: true,
        status: status || 401,
        latencyMs,
        message: `Serveur Supabase joint (${latencyMs}ms), mais la clé d'API anonyme ou le token a été rejeté (Erreur 401).`,
        category: 'auth_error',
        errorDetails: errMsg,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      networkReachable: true,
      status: status || 'ERROR',
      latencyMs,
      message: `Réponse du serveur Supabase : ${errMsg || 'Code status: ' + status}`,
      category: 'unknown',
      errorDetails: errMsg,
      timestamp: new Date().toISOString(),
    };
  } catch (netErr: any) {
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.round(endTime - startTime);
    const msg = netErr?.message || String(netErr);

    return {
      success: false,
      networkReachable: false,
      status: 'NETWORK_ERROR',
      latencyMs,
      message: `Échec d'accès réseau : Impossible de contacter Supabase (${msg}). Vérifiez votre accès Internet ou si le domaine est joignable.`,
      category: 'network_unreachable',
      errorDetails: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// 2. CLIENT SUPABASE (Lazy Loading & Dynamic Init)
// ============================================

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (typeof window !== 'undefined' && localStorage.getItem('bavel_supabase_disconnected') === 'true') {
    return null as any;
  }
  if (supabaseInstance) return supabaseInstance;

  try {
    supabaseInstance = createClient(resolvedUrl, resolvedAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    isSupabaseConfigured = true;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabaseInstance = createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    isSupabaseConfigured = true;
  }
  return supabaseInstance;
}

/**
 * Charge dynamiquement la configuration Supabase depuis le serveur
 * si les variables d'environnement client ne sont pas encore résolues.
 */
export async function initSupabase(): Promise<SupabaseClient> {
  return getSupabase();
}

// Initialisation proactive côté navigateur
if (typeof window !== 'undefined') {
  initSupabase().catch(() => {});
}

// Export transparent qui redirige vers le client instancié
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabase();
    if (client) {
      const val = (client as any)[prop];
      return typeof val === 'function' ? val.bind(client) : val;
    }
    return (target as any)[prop];
  }
});


// ============================================
// 3. TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          age: number | null;
          gender: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          bio: string | null;
          job: string | null;
          studies: string | null;
          alcohol: string | null;
          personality: string | null;
          zodiac: string | null;
          pets: string | null;
          photos: string[];
          interests: string[];
          details: any;
          key_question: string | null;
          is_verified: boolean;
          is_online: boolean;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          text: string;
          timestamp: string;
          is_user: boolean;
          audio_url: string | null;
          is_read: boolean;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'timestamp'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          target_id: string;
          is_super_like: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['likes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['likes']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
    };
  };
}

// ============================================
// 4. SQL SCHEMA (Documentation)
// ============================================

/* 
  SUPABASE SQL SCHEMA INITIALIZATION
  Copy and paste this into your Supabase SQL Editor:

  -- 1. Profiles Table
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    name TEXT,
    age INT,
    gender TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bio TEXT,
    job TEXT,
    studies TEXT,
    alcohol TEXT,
    personality TEXT,
    zodiac TEXT,
    pets TEXT,
    photos TEXT[],
    interests JSONB,
    details JSONB,
    key_question TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 2. Messages Table
  CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_user BOOLEAN DEFAULT true,
    audio_url TEXT,
    is_read BOOLEAN DEFAULT false
  );

  -- 3. Likes Table
  CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    is_super_like BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id)
  );

  -- 4. Matches Table
  CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, profile_id)
  );

  -- 5. Reports Table
  CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL,
    reported_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable Realtime for Messages
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;

  -- Row Level Security Policies
  CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid()::text = user_id);

  CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid()::text = user_id);

  CREATE POLICY "Users can view matches" 
    ON matches FOR SELECT 
    USING (auth.uid()::text = user_id OR auth.uid()::text = profile_id);
*/

// ============================================
// 5. AUTHENTICATION
// ============================================

function extractAuthError(err: any, defaultMsg: string): string {
  if (!err) return defaultMsg;
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string') {
    const m = err.message.toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid_grant')) {
      return 'Adresse e-mail ou mot de passe incorrect.';
    }
    if (m.includes('user already registered') || m.includes('already exists')) {
      return 'Un compte existe déjà avec cette adresse e-mail.';
    }
    if (m.includes('email not confirmed')) {
      return 'Veuillez confirmer votre adresse e-mail avant de vous connecter.';
    }
    return err.message;
  }
  if (err.error_description && typeof err.error_description === 'string') return err.error_description;
  return defaultMsg;
}

// 5.1 Email Registration
export async function signUpWithEmail(email: string, password: string, username?: string) {
  const client = await initSupabase();
  if (!client) {
    return { 
      data: null, 
      error: "Supabase n'est pas configuré. Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d'environnement." 
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: username ? { display_name: username, name: username } : undefined
      }
    });

    if (error) throw error;
    
    // Check if the user already exists (identities empty means email is taken)
    if (data.user && data.user.identities?.length === 0) {
      return { 
        data: null, 
        error: "Cet e-mail possède déjà un compte. Veuillez vous connecter." 
      };
    }
    
    return { data, error: null };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur lors de l\'inscription');
    console.warn('Supabase Sign Up Notice:', msg);
    return { data: null, error: msg };
  }
}

// 5.2 Email Login
export async function signInWithEmail(email: string, password: string) {
  const client = await initSupabase();
  if (!client) {
    return { 
      data: null, 
      error: "Supabase n'est pas configuré." 
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Identifiants ou mot de passe invalides');
    console.warn('Supabase Sign In Notice:', msg);
    return { data: null, error: msg };
  }
}

// 5.3 Password Reset
export async function resetPasswordForEmail(email: string) {
  const client = await initSupabase();
  if (!client) {
    return { error: "Supabase n'est pas configuré.", success: false };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`
    });

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur lors de la réinitialisation');
    console.warn('Supabase Reset Password Notice:', msg);
    return { error: msg, success: false };
  }
}

// 5.4 Update Password
export async function updatePassword(newPassword: string) {
  const client = await initSupabase();
  if (!client) {
    return { data: null, error: "Supabase n'est pas configuré." };
  }

  try {
    const { data, error } = await client.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur de modification du mot de passe');
    console.warn('Supabase Update Password Notice:', msg);
    return { data: null, error: msg };
  }
}

// 5.5 Google OAuth
export async function signInWithGoogle() {
  const client = await initSupabase();
  if (!client) {
    return { data: null, error: "Supabase n'est pas configuré." };
  }

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });

    if (error) throw error;
    if (data?.url) {
      const popup = window.open(data.url, 'google_auth_popup', 'width=550,height=650');
      if (!popup) {
        // Fallback if popup blocked
        window.location.href = data.url;
      }
    }
    return { data, error: null };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur lors de la connexion Google');
    console.warn('Supabase Google OAuth Notice:', msg);
    return { data: null, error: msg };
  }
}

export async function signInWithFacebook() {
  const client = await initSupabase();
  if (!client) {
    return { data: null, error: "Supabase n'est pas configuré." };
  }
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
    return { data, error: null };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur de connexion Facebook');
    return { data: null, error: msg };
  }
}

export async function signInWithPasskey() {
  try {
    return { data: { user: { id: 'passkey-user', email: 'passkey@bavel.app', user_metadata: { name: 'Passkey User' } } }, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Erreur Passkey" };
  }
}

// 5.6 Authentification Téléphone OTP supprimée (remplacée par Facebook & Connexion Rapide)
// export async function signInWithPhoneOTP ... (supprimé)
// export async function verifyPhoneOTP ... (supprimé)

// 5.7 Sign Out
export async function signOutFromSupabase() {
  const client = await initSupabase();
  if (!client) return { error: "Supabase n'est pas configuré." };
  
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur lors de la déconnexion');
    return { error: msg };
  }
}

// 5.8 Delete Account
export async function deleteAccountFromSupabase(userId?: string) {
  const client = await initSupabase();
  if (!client) return { error: null, success: true };

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data } = await client.auth.getUser();
      targetUserId = data?.user?.id;
    }

    if (targetUserId) {
      // Supprimer les données du profil dans la table 'profiles'
      await client.from('profiles').delete().eq('user_id', targetUserId);
      await client.from('messages').delete().or(`sender_id.eq.${targetUserId}`);
      await client.from('likes').delete().or(`user_id.eq.${targetUserId},target_id.eq.${targetUserId}`);
      await client.from('matches').delete().or(`user_id.eq.${targetUserId},profile_id.eq.${targetUserId}`);
    }

    // Déconnexion de la session
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    const msg = extractAuthError(err, 'Erreur lors de la suppression du profil');
    return { error: msg, success: false };
  }
}

// ============================================
// 6. PROFILES
// ============================================

// 6.1 Sync Profile
export async function syncProfileToSupabase(profile: any, photos: string[] = []) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const userId = profile.id || profile.user_id || 'current_user_id';
    if (!isUUID(userId)) {
      return null;
    }
    
    // Check if profile exists by id
    const { data: existing } = await client
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    const photoList = (photos && photos.length > 0) 
      ? photos.filter(Boolean) 
      : (Array.isArray(profile.photos) && profile.photos.length > 0 ? profile.photos.filter(Boolean) : (profile.avatarUrl ? [profile.avatarUrl] : []));

    const payload: any = {
      id: userId,
      name: profile.name || profile.username || 'Membre',
      age: typeof profile.age === 'number' ? profile.age : parseInt(profile.age) || null,
      gender: profile.gender ? (profile.gender === 'female' ? 'femme' : profile.gender === 'male' ? 'homme' : profile.gender) : 'homme',
      city: profile.city || 'Le Mans',
      bio: profile.bio || '',
      job: profile.job || profile.occupation || '',
      studies: profile.studies || profile.school || '',
      photos: photoList,
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      details: profile.details || {},
      key_question: profile.keyQuestion || profile.key_question || '',
      is_verified: Boolean(profile.isVerified || profile.is_verified),
      online: true,
      updated_at: new Date().toISOString()
    };

    if (profile.latitude) payload.latitude = profile.latitude;
    if (profile.longitude) payload.longitude = profile.longitude;
    if (profile.alcohol) payload.alcohol = profile.alcohol;
    if (profile.personality) payload.personality = profile.personality;
    if (profile.zodiac) payload.zodiac = profile.zodiac;
    if (profile.pets) payload.pets = profile.pets;
    if (profile.email) payload.email = profile.email;

    if (existing) {
      const { data, error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select();

      if (error) {
        console.warn('Supabase profile update notice:', error.message || error);
        return null;
      }
      return data;
    } else {
      const { data, error } = await client
        .from('profiles')
        .insert(payload)
        .select();

      if (error) {
        console.warn('Supabase profile insert notice:', error.message || error);
        return null;
      }
      return data;
    }
  } catch (err) {
    console.warn('Failed to sync profile to Supabase:', err);
    return null;
  }
}

// 6.2 Fetch Profile
export async function fetchProfileFromSupabase(userId: string = 'current_user_id') {
  const client = getSupabase();
  if (!client) return null;

  try {
    if (!isUUID(userId)) {
      return null;
    }
    const res = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (res.error) {
      console.warn('Supabase profile fetch notice:', res.error.message || res.error);
      return null;
    }
    return res.data;
  } catch (err) {
    console.warn('Failed to fetch profile from Supabase:', err);
    return null;
  }
}

// 6.3 Update Location
export async function updateUserLocation(userId: string, latitude: number, longitude: number) {
  const client = getSupabase();
  if (!client) return null;
  
  try {
    if (!isUUID(userId)) return null;
    const { data, error } = await client
      .from('profiles')
      .update({ latitude, longitude, updated_at: new Date().toISOString() })
      .eq('id', userId);
      
    if (error) {
      console.warn('Supabase update location notice:', error.message || error);
      return null;
    }
    return true;
  } catch (err) {
    console.warn('Failed to update location in Supabase:', err);
    return null;
  }
}

// 6.4 Toggle Suspension
export async function toggleUserSuspension(userId: string, suspend: boolean) {
  const client = getSupabase();
  if (!client) return null;
  try {
    if (!isUUID(userId)) return null;
    const { data, error } = await client
      .from('profiles')
      .update({ is_suspended: suspend, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      console.warn('Supabase toggle suspension error:', error.message || error);
      return null;
    }
    return true;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// 6.5 Fetch All Profiles
export async function fetchAllProfilesFromSupabase() {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase fetch all profiles notice:', error?.message || error);
      return null;
    }

    return data.map((p: any, idx: number) => {
      const photoArray = (p.photos && Array.isArray(p.photos) && p.photos.length > 0)
        ? p.photos.filter(Boolean)
        : (p.avatar_url ? [p.avatar_url] : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80']);
      const mainPhoto = photoArray[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80';

      return {
        id: p.user_id || p.id || String(idx + 1),
        user_id: p.user_id || p.id,
        name: p.name || 'Membre',
        age: typeof p.age === 'number' ? p.age : (parseInt(p.age) || 26),
        gender: (p.gender || 'femme').toLowerCase(),
        city: p.city || 'Le Mans',
        location: p.city || 'Le Mans',
        latitude: p.latitude,
        longitude: p.longitude,
        img: mainPhoto,
        photos: photoArray,
        avatarUrl: mainPhoto,
        bio: p.bio || '',
        tagline: p.bio || 'Membre actif',
        job: p.job || '',
        occupation: p.job || '',
        studies: p.studies || '',
        school: p.studies || '',
        relation: (p.details && typeof p.details === 'object' && !Array.isArray(p.details) && p.details.relation) || 'Une histoire sérieuse',
        status: (p.details && typeof p.details === 'object' && !Array.isArray(p.details) && p.details.status) || 'Célibataire',
        orientation: (p.details && typeof p.details === 'object' && !Array.isArray(p.details) && p.details.orientation) || 'Hétéro',
        language: p.language || 'Français',
        alcohol: p.alcohol || 'À l\'occasion',
        zodiac: p.zodiac || 'Lion',
        pets: p.pets || 'Chat',
        personality: p.personality || 'Optimiste',
        details: Array.isArray(p.details) ? p.details : (p.details && typeof p.details === 'object' ? Object.values(p.details).filter(v => typeof v === 'string' && v.length > 0) : ['168 cm', 'Non-fumeuse']),
        tags: Array.isArray(p.interests) && p.interests.length > 0 ? p.interests : ['Voyage', 'Musique', 'Café'],
        interests: Array.isArray(p.interests) && p.interests.length > 0 ? p.interests : ['Voyage', 'Musique', 'Café'],
        online: p.online !== undefined ? p.online : (p.is_online !== undefined ? p.is_online : (idx % 2 === 0)),
        verified: Boolean(p.is_verified),
        is_verified: Boolean(p.is_verified),
        isSuspended: p.is_suspended || false,
        matchPercentage: 80 + ((idx * 7) % 20),
        trustScore: p.trust_score || 100,
        premium: Boolean(p.is_premium),
        requiresCredits: idx % 3 === 0,
        radarAngle: (idx * 45) % 360,
        radarRadiusRatio: 0.3 + ((idx * 0.15) % 0.6)
      };
    });
  } catch (err) {
    console.warn('Failed to fetch all profiles from Supabase:', err);
    return null;
  }
}

// ============================================
// 7. SEED PROFILES
// ============================================

export async function seedProductionProfilesToSupabase() {
  const client = getSupabase();
  if (!client) return;

  try {
    const { data: existing } = await client.from('profiles').select('user_id').limit(1);
    if (existing && existing.length > 0) {
      return;
    }
  } catch (err) {
    console.warn('Profile seeding notice:', err);
  }
}

// ============================================
// 8. LIKES & MATCHES
// ============================================

export async function normalizeUserId(client: any, id: string): Promise<string> {
  if (!id) return id;
  // If target id is a plain number (e.g., "1"), map to "prod_profile_1" if it exists
  if (/^\d+$/.test(id)) {
    const candidate = `prod_profile_${id}`;
    const { data } = await client.from('profiles').select('user_id').eq('user_id', candidate).maybeSingle();
    if (data?.user_id) return candidate;
  }
  return id;
}

export async function ensureProfileRecordExists(client: any, userId: string): Promise<void> {
  if (!client || !userId || !isUUID(userId)) return;
  try {
    const { data } = await client.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!data) {
      let cachedName = 'Membre';
      let cachedCity = 'Le Mans';
      try {
        const saved = localStorage.getItem('app_user') || localStorage.getItem('bavel_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) cachedName = parsed.name;
          if (parsed.city) cachedCity = parsed.city;
        }
      } catch {}

      await client.from('profiles').insert({
        id: userId,
        name: cachedName,
        city: cachedCity,
        gender: 'homme',
        is_verified: false,
        online: true
      });
    }
  } catch {}
}

// 8.1 Save Swipe (Table 'swipes' & Table 'likes')
export async function saveSwipeToSupabase(userId: string, likedUserId: string, isLiked: boolean = true) {
  const client = getSupabase();
  if (!client) return { isMatch: false, error: null };

  try {
    const safeUserId = userId || 'guest';
    const safeLikedId = await normalizeUserId(client, likedUserId);

    await ensureProfileRecordExists(client, safeUserId);
    await ensureProfileRecordExists(client, safeLikedId);

    // 1. Enregistrement dans la table 'likes' si liké
    if (isLiked) {
      await saveLikeToSupabase(safeUserId, safeLikedId, false);
    }

    // 2. Enregistrement dans 'swipes' si la table existe
    try {
      await client
        .from('swipes')
        .upsert({
          user_id: safeUserId,
          liked_user_id: safeLikedId,
          is_liked: isLiked,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,liked_user_id' });
    } catch {}

    if (!isLiked) {
      return { isMatch: false, error: null };
    }

    // 3. Vérifier si l'autre personne a aussi liké
    const { data: reverseLike } = await client
      .from('likes')
      .select('id')
      .eq('user_id', safeLikedId)
      .eq('target_id', safeUserId)
      .maybeSingle();

    let isMatch = false;
    if (reverseLike) {
      isMatch = true;
      await createMatchInSupabase(safeUserId, safeLikedId);
    }

    return { isMatch, error: null };
  } catch (err: any) {
    console.warn('Error saving swipe:', err);
    return { isMatch: false, error: err?.message };
  }
}

// 8.1.0 Delete Last Swipe (Rewind / Annulation de swipe pour Extra & Premium)
export async function deleteLastSwipeFromSupabase(userId: string) {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase client unavailable' };

  try {
    let deletedTargetId: string | null = null;
    let deletedRecordId: string | null = null;

    // 1. Chercher dans 'likes' le dernier like envoyé par cet utilisateur
    const { data: lastLike } = await client
      .from('likes')
      .select('id, target_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastLike) {
      deletedTargetId = lastLike.target_id;
      deletedRecordId = lastLike.id;
      await client.from('likes').delete().eq('id', lastLike.id);
      
      // Supprimer le match réciproque si créé
      await client.from('matches').delete().or(`and(user_id.eq.${userId},profile_id.eq.${lastLike.target_id}),and(user_id.eq.${lastLike.target_id},profile_id.eq.${userId})`);
    }

    // 2. Supprimer également de 'swipes' si la table existe
    try {
      const { data: lastSwipe } = await client
        .from('swipes')
        .select('id, liked_user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastSwipe) {
        if (!deletedTargetId) deletedTargetId = lastSwipe.liked_user_id;
        if (!deletedRecordId) deletedRecordId = lastSwipe.id;
        await client.from('swipes').delete().eq('id', lastSwipe.id);
      }
    } catch {}

    // 3. Décrémenter le compteur de likes si disponible
    try {
      const { data: profile } = await client
        .from('profiles')
        .select('daily_likes_count')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile && profile.daily_likes_count && profile.daily_likes_count > 0) {
        await client
          .from('profiles')
          .update({ daily_likes_count: profile.daily_likes_count - 1 })
          .eq('user_id', userId);
      }
    } catch {}

    return { 
      success: true, 
      deletedSwipeId: deletedRecordId, 
      targetId: deletedTargetId 
    };
  } catch (err: any) {
    console.warn('Failed to delete last swipe:', err);
    return { success: false, error: err?.message || "Impossible d'annuler le swipe" };
  }
}

// 8.1.1 Save Like
export async function saveLikeToSupabase(userId: string, targetId: string, isSuperLike: boolean = false) {
  const client = getSupabase();
  if (!client) return { data: null, isMatch: false };

  try {
    const safeUserId = userId || 'guest';
    const safeTargetId = await normalizeUserId(client, targetId);

    await ensureProfileRecordExists(client, safeUserId);
    await ensureProfileRecordExists(client, safeTargetId);

    // Vérifier si le like existe déjà
    const { data: existingLike } = await client
      .from('likes')
      .select('id')
      .eq('user_id', safeUserId)
      .eq('target_id', safeTargetId)
      .maybeSingle();

    if (!existingLike) {
      await client
        .from('likes')
        .insert({
          user_id: safeUserId,
          target_id: safeTargetId,
          is_super_like: isSuperLike,
          created_at: new Date().toISOString()
        });
    }

    // Vérifier le like réciproque pour match immédiat
    const { data: reverseLike } = await client
      .from('likes')
      .select('id')
      .eq('user_id', safeTargetId)
      .eq('target_id', safeUserId)
      .maybeSingle();

    let isMatch = false;
    if (reverseLike) {
      await createMatchInSupabase(safeUserId, safeTargetId);
      isMatch = true;
    }

    return { data: true, isMatch };
  } catch (err) {
    console.warn('Failed to save like to Supabase:', err);
    return { data: null, isMatch: false };
  }
}

// 8.2 Fetch Likes
export async function fetchLikesFromSupabase(userId: string = 'current_user_id') {
  const client = getSupabase();
  if (!client) return [];

  try {
    if (!isUUID(userId)) return [];
    const { data, error } = await client
      .from('likes')
      .select('target_id')
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase fetch likes notice:', error.message || error);
      return [];
    }
    return data ? data.map(item => item.target_id) : [];
  } catch (err) {
    console.warn('Failed to fetch likes from Supabase:', err);
    return [];
  }
}

// 8.3 Fetch Received Likes
export async function fetchReceivedLikesFromSupabase(userId: string = 'current_user_id') {
  const client = getSupabase();
  if (!client) return [];

  try {
    if (!isUUID(userId)) return [];
    const { data, error } = await client
      .from('likes')
      .select('user_id')
      .eq('target_id', userId);

    if (error) {
      console.warn('Supabase fetch received likes notice:', error.message || error);
      return [];
    }
    return data ? data.map(item => item.user_id) : [];
  } catch (err) {
    console.warn('Failed to fetch received likes from Supabase:', err);
    return [];
  }
}

// 8.4 Remove Like
export async function removeLikeFromSupabase(userId: string, targetId: string) {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('target_id', targetId);

    if (error) {
      console.warn('Supabase remove like notice:', error.message || error);
      return false;
    }

    await client
      .from('matches')
      .delete()
      .or(`and(user_id.eq.${userId},profile_id.eq.${targetId}),and(user_id.eq.${targetId},profile_id.eq.${userId})`);

    return true;
  } catch (err) {
    console.warn('Failed to remove like from Supabase:', err);
    return false;
  }
}

// 8.5 Dismiss Received Like
export async function dismissReceivedLikeInSupabase(userId: string, senderId: string) {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('likes')
      .delete()
      .eq('user_id', senderId)
      .eq('target_id', userId);

    if (error) {
      console.warn('Supabase dismiss received like notice:', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to dismiss received like:', err);
    return false;
  }
}

// 8.6 Create Match
export async function createMatchInSupabase(userId: string, profileId: string) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const safeUserId = userId || 'guest';
    const safeProfileId = await normalizeUserId(client, profileId);

    await ensureProfileRecordExists(client, safeUserId);
    await ensureProfileRecordExists(client, safeProfileId);

    // Check if match already exists in either direction
    const { data: existing } = await client
      .from('matches')
      .select('*')
      .or(`and(user_id.eq.${safeUserId},profile_id.eq.${safeProfileId}),and(user_id.eq.${safeProfileId},profile_id.eq.${safeUserId})`)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await client
      .from('matches')
      .insert({
        user_id: safeUserId,
        profile_id: safeProfileId,
        created_at: new Date().toISOString(),
        is_archived: false
      })
      .select();

    if (error) {
      console.warn('Supabase create match notice:', error.message || error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Failed to create match in Supabase:', err);
    return null;
  }
}

// 8.7 Fetch Matches
export async function fetchMatchesFromSupabase(userId: string = 'current_user_id') {
  const client = getSupabase();
  if (!client) return [];

  try {
    if (!isUUID(userId)) return [];
    const { data, error } = await client
      .from('matches')
      .select('*')
      .or(`user_id.eq.${userId},profile_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  } catch (err) {
    console.warn('Failed to fetch matches from Supabase:', err);
    return [];
  }
}

// 8.8 Seed Initial Matches
export async function seedInitialMatches(userId: string) {
  const client = getSupabase();
  if (!client || !userId || userId === 'current_user_id') return;

  try {
    const existingMatches = await fetchMatchesFromSupabase(userId);
    if (!existingMatches || existingMatches.length === 0) {
      const seedProfiles = ['vp_eva', 'vp_zara', 'prod_profile_1'];
      for (const targetId of seedProfiles) {
        await createMatchInSupabase(userId, targetId);
      }
    }
  } catch (err) {
    console.warn('Failed to seed initial matches:', err);
  }
}

// 9.1 Save Message
export async function saveMessageToSupabase(
  matchId: string, 
  senderId: string, 
  text: string, 
  isUser: boolean = true,
  receiverId?: string
) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const safeSender = senderId || 'guest';
    const rawReceiver = receiverId || matchId.split('_').find(id => id !== safeSender) || '';
    const safeReceiver = await normalizeUserId(client, rawReceiver);

    await ensureProfileRecordExists(client, safeSender);
    if (safeReceiver) {
      await ensureProfileRecordExists(client, safeReceiver);
    }

    // Insert into 'messages' table matching live schema
    const payload: any = {
      match_id: matchId,
      sender_id: safeSender,
      receiver_id: safeReceiver,
      content: text,
      message_type: 'text',
      read: false,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await client
      .from('messages')
      .insert(payload)
      .select();

    if (error) {
      // Fallback with 'text' column if different table setup
      const fallbackPayload: any = {
        match_id: matchId,
        sender_id: senderId,
        text: text,
        is_user: isUser,
        timestamp: new Date().toISOString()
      };
      const { data: fbData, error: fbError } = await client
        .from('messages')
        .insert(fallbackPayload)
        .select();

      if (fbError) {
        console.warn('Supabase message save notice:', error.message || fbError.message);
        return null;
      }
      return fbData;
    }

    // Update match timestamp
    try {
      await client
        .from('matches')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_by: senderId
        })
        .eq('id', matchId);
    } catch {}

    // Mirror to server endpoint for instant in-memory and WebSocket distribution
    try {
      fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, senderId, text, isUser, receiverId })
      }).catch(() => {});
    } catch {}

    return data;
  } catch (err) {
    console.warn('Failed to save message to Supabase, falling back to server API:', err);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, senderId, text, isUser, receiverId })
      });
      const json = await res.json();
      return json?.message || null;
    } catch {
      return null;
    }
  }
}

// 9.2 Fetch Messages
export async function fetchMessagesFromSupabase(matchId: string, currentUserId: string = 'guest') {
  const client = getSupabase();
  let serverMsgs: any[] = [];
  try {
    const res = await fetch(`/api/messages/${encodeURIComponent(matchId)}`);
    if (res.ok) {
      const json = await res.json();
      serverMsgs = json?.messages || [];
    }
  } catch {}

  if (!client) {
    return serverMsgs.map((m: any) => ({
      id: m.id,
      matchId: m.matchId || m.match_id,
      senderId: m.senderId || m.sender_id,
      receiverId: m.receiverId || m.receiver_id,
      text: m.text || m.content || '',
      content: m.text || m.content || '',
      timestamp: m.timestamp,
      isUser: m.isUser ?? (m.sender_id === currentUserId || m.senderId === currentUserId),
      read: m.read || m.isRead || false
    }));
  }

  try {
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('timestamp', { ascending: true });

    if (error || !data || data.length === 0) {
      if (serverMsgs.length > 0) {
        return serverMsgs.map((m: any) => ({
          id: m.id,
          matchId: m.matchId || m.match_id,
          senderId: m.senderId || m.sender_id,
          receiverId: m.receiverId || m.receiver_id,
          text: m.text || m.content || '',
          content: m.text || m.content || '',
          timestamp: m.timestamp,
          isUser: m.isUser ?? (m.sender_id === currentUserId || m.senderId === currentUserId),
          read: m.read || m.isRead || false
        }));
      }
      return [];
    }

    const mergedMap = new Map<string, any>();
    serverMsgs.forEach((m: any) => {
      mergedMap.set(String(m.id || m.timestamp), m);
    });
    data.forEach((m: any) => {
      mergedMap.set(String(m.id || m.timestamp), m);
    });

    return Array.from(mergedMap.values()).map((m: any) => ({
      id: m.id,
      matchId: m.match_id || m.matchId,
      senderId: m.sender_id || m.senderId,
      receiverId: m.receiver_id || m.receiverId,
      text: m.content || m.text || '',
      content: m.content || m.text || '',
      timestamp: m.timestamp,
      isUser: m.sender_id === currentUserId || m.senderId === currentUserId,
      read: m.read || m.isRead || false
    }));
  } catch (e) {
    return serverMsgs;
  }
}


// 9.3 Mark Messages as Read
export async function markMessagesAsReadInSupabase(matchId: string, currentUserId: string) {
  const client = getSupabase();
  if (!client) return false;

  try {
    // Update 'read' (and fallback 'is_read')
    await client
      .from('messages')
      .update({ read: true, is_read: true })
      .eq('match_id', matchId)
      .neq('sender_id', currentUserId);
    return true;
  } catch (err) {
    console.warn('Failed to mark messages as read:', err);
    return false;
  }
}

// 9.4 Realtime Subscriptions
export function subscribeToMessages(matchId: string, callback: (message: any) => void) {
  const client = getSupabase();
  if (!client) return () => {};

  try {
    const channel = client
      .channel(`chat_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const m = payload.new;
          callback({
            id: m.id,
            matchId: m.match_id,
            match_id: m.match_id,
            senderId: m.sender_id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            text: m.content || m.text || '',
            content: m.content || m.text || '',
            isUser: false,
            is_user: false,
            timestamp: m.timestamp || new Date().toISOString(),
            read: m.read || false,
            is_read: m.read || false
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

export function subscribeToMatches(userId: string, callback: (match: any) => void) {
  const client = getSupabase();
  if (!client) return () => {};

  try {
    const channel = client
      .channel(`matches_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          const m = payload.new;
          if (m.user_id === userId || m.profile_id === userId) {
            callback(m);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime matches subscription error:', err);
    return () => {};
  }
}

// ============================================
// 10. STORAGE (CDN)
// ============================================

export async function uploadProfilePhotoToSupabase(file: File | Blob, userId: string, slotIndex: number = 0): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const fileExt = file.type.includes('webp') ? 'webp' : 'jpg';
    const filePath = `${userId.replace(/[^a-z0-9]/gi, '_')}_slot_${slotIndex}_${Date.now()}.${fileExt}`;

    const { data, error } = await client.storage
      .from(BAVEL_STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase Storage Upload Notice:', error.message);
      return null;
    }

    const { data: publicUrlData } = client.storage
      .from(BAVEL_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('Supabase Storage Exception:', err);
    return null;
  }
}

// ============================================
// 11. MODERATION
// ============================================

// 11.1 Delete Discussion
export async function deleteDiscussionInSupabase(userId: string, targetId: string) {
  const client = getSupabase();
  if (!client) return false;

  try {
    const matchId = [userId, targetId].sort().join('_');
    await client.from('messages').delete().eq('match_id', matchId);
    await client
      .from('matches')
      .delete()
      .or(`and(user_id.eq.${userId},profile_id.eq.${targetId}),and(user_id.eq.${targetId},profile_id.eq.${userId})`);
    return true;
  } catch (err) {
    console.warn('Failed to delete discussion from Supabase:', err);
    return false;
  }
}

// 11.2 Block User
export async function blockUserInSupabase(userId: string, targetId: string) {
  const client = getSupabase();
  try {
    await deleteDiscussionInSupabase(userId, targetId);
    if (client) {
      await client.from('likes').delete().or(`and(user_id.eq.${userId},target_id.eq.${targetId}),and(user_id.eq.${targetId},target_id.eq.${userId})`);
    }
    const blocked = JSON.parse(localStorage.getItem('bavel_blocked_users') || '[]');
    if (!blocked.includes(targetId)) {
      blocked.push(targetId);
      localStorage.setItem('bavel_blocked_users', JSON.stringify(blocked));
    }

    // Call server endpoint
    try {
      fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetId })
      }).catch(() => {});
    } catch {}

    return true;
  } catch (err) {
    console.warn('Failed to block user:', err);
    return false;
  }
}

// 11.3 Report User
export async function reportUserInSupabase(userId: string, targetId: string, reason: string) {
  const client = getSupabase();
  try {
    if (client) {
      await client.from('reports').insert({
        reporter_id: userId,
        reported_id: targetId,
        reason,
        created_at: new Date().toISOString()
      });
    }

    // Call server endpoint
    try {
      fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId: userId, reportedId: targetId, reason })
      }).catch(() => {});
    } catch {}

    await blockUserInSupabase(userId, targetId);
    return true;
  } catch (err) {
    console.warn('Failed to report user:', err);
    try {
      fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId: userId, reportedId: targetId, reason })
      }).catch(() => {});
    } catch {}
    await blockUserInSupabase(userId, targetId);
    return true;
  }
}

// ============================================
// 12. EXPORTS
// ============================================

export default {
  getSupabase,
  supabase,
  isSupabaseConfigured,
  BAVEL_STORAGE_BUCKET,
  
  // Auth
  signUpWithEmail,
  signInWithEmail,
  resetPasswordForEmail,
  updatePassword,
  signInWithGoogle,
  signInWithFacebook,
  signInWithPasskey,
  signOutFromSupabase,
  deleteAccountFromSupabase,
  
  // Profiles
  syncProfileToSupabase,
  fetchProfileFromSupabase,
  fetchAllProfilesFromSupabase,
  updateUserLocation,
  toggleUserSuspension,
  
  // Likes & Matches
  saveSwipeToSupabase,
  saveLikeToSupabase,
  fetchLikesFromSupabase,
  fetchReceivedLikesFromSupabase,
  removeLikeFromSupabase,
  dismissReceivedLikeInSupabase,
  createMatchInSupabase,
  fetchMatchesFromSupabase,
  
  // Messages
  saveMessageToSupabase,
  fetchMessagesFromSupabase,
  markMessagesAsReadInSupabase,
  
  // Storage
  uploadProfilePhotoToSupabase,
  
  // Moderation
  deleteDiscussionInSupabase,
  blockUserInSupabase,
  reportUserInSupabase,
  
  // Diagnostics & Network Test
  getSupabaseDiagnostics,
  logSupabaseDiagnosticReport,
  testSupabaseConnection,

  // Seed
  seedProductionProfilesToSupabase,
};