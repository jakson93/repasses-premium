import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getSupabaseClient } from "../../database";
import { SupabaseClient } from "@supabase/supabase-js";

export const SESSION_COOKIE_NAME = "repasses_session";

// Middleware para verificar a sessão do Supabase
export const authMiddleware = createMiddleware<{ Variables: { user: any; supabase: SupabaseClient } }>(async (c, next) => {
  const supabase = getSupabaseClient();
  
  // O Supabase usa o token de sessão no header Authorization ou no cookie
  // Vamos usar o método nativo do Supabase para obter a sessão
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return c.json({ error: "Unauthorized: Invalid or expired session" }, 401);
  }

  // O Supabase já tem a informação do usuário na sessão
  const user = session.user;

  // Opcional: buscar dados adicionais do perfil na tabela 'users' customizada
  // Se a tabela 'users' for removida, esta parte deve ser removida também.
  // Por enquanto, vamos assumir que a tabela 'users' customizada não é mais necessária.
  
  c.set("user", user);
  c.set("supabase", supabase); // Adicionando o cliente Supabase ao contexto
  await next();
});
