import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { Env } from './worker-configuration'; // Removido para Netlify
export function getSupabaseClient(useServiceRole = false): SupabaseClient {
  // Variáveis injetadas pelo esbuild
  // Linha 5
  const SUPABASE_URL = (globalThis as any).SUPABASE_URL;
  
  // Linha 6
  const SUPABASE_ANON_KEY = (globalThis as any).SUPABASE_ANON_KEY;
  
  // Linha 7
  const SUPABASE_SERVICE_ROLE_KEY = (globalThis as any).SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL) {
    throw new Error("Missing Supabase URL. Please check Netlify configuration.");
  }

  const key = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(`Missing Supabase ${useServiceRole ? 'Service Role Key' : 'Anon Key'}. Please check Netlify configuration.`);
  }
  
  return createClient(
    SUPABASE_URL, 
    key
  );
}
