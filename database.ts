import { createClient } from '@supabase/supabase-js';
import { Env } from './index';

export interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any>;
  execute(sql: string, params?: any[]): Promise<any>;
}

// Adaptador para o D1 (SQLite local)
export class D1Adapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}
  
  async query(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    const { results } = await stmt.bind(...params).all();
    return results;
  }
  
  async execute(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    return await stmt.bind(...params).run();
  }
}

// Adaptador para o Supabase (PostgreSQL)
export class SupabaseAdapter implements DatabaseAdapter {
  private client: ReturnType<typeof createClient>;
  
  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }
  
  // Adaptação simples: usar RPC para queries complexas ou funções do Supabase
  // Para queries simples, vamos usar o client.from().select()
  async query(sql: string, params: any[] = []) {
    // Implementação simplificada: para queries complexas, o ideal é usar RPC
    // Aqui, vamos assumir que as queries serão adaptadas para o Supabase client
    // ou que o Hono/Worker fará a adaptação para o Supabase.
    // Como o Hono/Worker não tem um ORM, vamos usar uma função RPC simulada.
    // Para este MVP, vamos retornar um erro para forçar o uso de RPC/funções.
    throw new Error("Supabase Adapter: Raw SQL queries are not supported. Use RPC or client methods.");
  }
  
  async execute(sql: string, params: any[] = []) {
    // Implementação simplificada: para execuções complexas, o ideal é usar RPC
    throw new Error("Supabase Adapter: Raw SQL executions are not supported. Use RPC or client methods.");
  }

  // Métodos específicos para Supabase (ex: Auth, Storage)
  getSupabaseClient() {
    return this.client;
  }
}

export function getDatabaseAdapter(env: Env): DatabaseAdapter {
  if (env.DATABASE_MODE === 'supabase') {
    return new SupabaseAdapter(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return new D1Adapter(env.DB);
}

export function getSupabaseClient(env: Env) {
  if (env.DATABASE_MODE === 'supabase') {
    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return null;
}
