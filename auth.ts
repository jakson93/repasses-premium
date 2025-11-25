import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { getSupabaseClient } from "./database";

// As funções de sessão e hash de senha foram removidas, pois a autenticação
// agora é tratada diretamente pelo Supabase Auth no lado do cliente e nos endpoints da API.

// O middleware de autenticação não é mais necessário, pois a verificação de usuário
// é feita diretamente em cada endpoint da API usando supabase.auth.getUser().

// export const SESSION_COOKIE_NAME = "repasses_session";
// export function createSessionToken(userId: number, email: string): string { ... }
// export function verifySessionToken(token: string): SessionData | null { ... }
// export async function hashPassword(password: string): Promise<string> { ... }
// export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: { user: any } }>(async (c, next) => { ... });
