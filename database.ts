import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { Env } from './worker-configuration'; // Removido para Netlify

// Função para criar e retornar o Supabase Client
export function getSupabaseClient(): SupabaseClient {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // O Supabase Client precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
  // para operações de escrita/leitura seguras no backend.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase URL or Anon Key. Please check Netlify configuration.");
  }

  // O Supabase Client precisa de SUPABASE_SERVICE_ROLE_KEY para operações de servidor
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Service Role Key. Cannot perform server-side operations.");
  }
  
  return createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
  );
}

// O restante do código do backend (index.ts) precisará ser reescrito
// para usar o Supabase Query Builder em vez de SQL cru.
