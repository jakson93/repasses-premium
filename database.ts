import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Obtém o cliente Supabase configurado
 * Para Netlify Edge Functions, as variáveis de ambiente são acessadas via Deno.env
 */
export function getSupabaseClient(useServiceRole = false): SupabaseClient {
  // Tentar acessar variáveis de ambiente do Netlify Edge Functions (Deno)
  let SUPABASE_URL: string | undefined;
  let SUPABASE_ANON_KEY: string | undefined;
  let SUPABASE_SERVICE_ROLE_KEY: string | undefined;

  // Verificar se estamos em ambiente Deno (Netlify Edge Functions)
  if (typeof (globalThis as any).Deno !== 'undefined' && (globalThis as any).Deno.env) {
    SUPABASE_URL = (globalThis as any).Deno.env.get('SUPABASE_URL');
    SUPABASE_ANON_KEY = (globalThis as any).Deno.env.get('SUPABASE_ANON_KEY');
    SUPABASE_SERVICE_ROLE_KEY = (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  } 
  // Fallback para Node.js (desenvolvimento local)
  else if (typeof process !== 'undefined' && process.env) {
    SUPABASE_URL = process.env.SUPABASE_URL;
    SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  // Fallback para globalThis (compatibilidade com código antigo)
  else {
    SUPABASE_URL = (globalThis as any).SUPABASE_URL;
    SUPABASE_ANON_KEY = (globalThis as any).SUPABASE_ANON_KEY;
    SUPABASE_SERVICE_ROLE_KEY = (globalThis as any).SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL. Please configure environment variables in Netlify.");
  }

  const key = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(`Missing ${useServiceRole ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_ANON_KEY'}. Please configure environment variables in Netlify.`);
  }

  return createClient(SUPABASE_URL, key, {
    auth: {
      // Para Edge Functions, não persistir sessão no servidor
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Obtém o cliente Supabase com o token do usuário autenticado
 * Usado para operações que respeitam RLS
 */
export function getSupabaseClientWithAuth(accessToken: string): SupabaseClient {
  let SUPABASE_URL: string | undefined;
  let SUPABASE_ANON_KEY: string | undefined;

  if (typeof (globalThis as any).Deno !== 'undefined' && (globalThis as any).Deno.env) {
    SUPABASE_URL = (globalThis as any).Deno.env.get('SUPABASE_URL');
    SUPABASE_ANON_KEY = (globalThis as any).Deno.env.get('SUPABASE_ANON_KEY');
  } else if (typeof process !== 'undefined' && process.env) {
    SUPABASE_URL = process.env.SUPABASE_URL;
    SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  } else {
    SUPABASE_URL = (globalThis as any).SUPABASE_URL;
    SUPABASE_ANON_KEY = (globalThis as any).SUPABASE_ANON_KEY;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase configuration.");
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
