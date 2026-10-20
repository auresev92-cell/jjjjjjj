import { createClient } from '@supabase/supabase-js';
import { supabase as defaultClient, getSupabase } from './supabase';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Instance exportée compatible avec le modèle Supabase standard
export const supabase = getSupabase() || createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
