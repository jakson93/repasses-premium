import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { Env } from './worker-configuration'; // Removido para Netlify

// Função para criar e retornar o Supabase Client
export function getSupabaseClient(useServiceRole = false): SupabaseClient {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // O Supabase Client precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
  // para operações de escrita/leitura seguras no backend.
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

// O restante do código do backend (index.ts) precisará ser reescrito
// para usar o Supabase Query Builder em vez de SQL cru.
