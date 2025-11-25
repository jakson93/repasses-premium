import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(useServiceRole = false): SupabaseClient {
  // Variáveis de ambiente do Netlify
  const SUPABASE_URL = (globalThis as any).SUPABASE_URL;
  const SUPABASE_ANON_KEY = (globalThis as any).SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = (globalThis as any).SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL) {
    throw new Error("Missing Supabase URL. Please check Netlify configuration.");
  }

  const key = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("Missing Supabase Key. Please check Netlify configuration.");
  }

  return createClient(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
    },
  });
}
