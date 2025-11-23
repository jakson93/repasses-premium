import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { Env } from './worker-configuration'; // Removido para Netlify

// Função para criar e retornar o Supabase Client
export function getSupabaseClient(env: any): SupabaseClient {
  // O Supabase Client precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
  // para operações de escrita/leitura seguras no backend.
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }
  
  return createClient(
    env.SUPABASE_URL, 
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// O restante do código do backend (index.ts) precisará ser reescrito
// para usar o Supabase Query Builder em vez de SQL cru.
