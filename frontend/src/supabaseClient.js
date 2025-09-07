import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://niqrpkltxuxxzcpctxvi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcXJwa2x0eHV4eHpjcGN0eHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTgwOTYsImV4cCI6MjA3MDY3NDA5Nn0.8N_YkW029rMT4xVVGT_YEzjKUcQR6EKEy-sNEi6ke24';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'mindvault-web'
    }
  }
});