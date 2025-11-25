
import { createMiddleware } from "hono/factory";
import { getSupabaseClient } from "../../database";
import { SupabaseClient } from "@supabase/supabase-js";

export const SESSION_COOKIE_NAME = "repasses_session";

// Middleware para verificar a sessão do Supabase
export const authMiddleware = createMiddleware<{ Variables: { user: any; supabase: SupabaseClient } }>(async (c, next) => {
  const supabase = getSupabaseClient();
  
  // O Supabase usa o token de sessão no header Authorization ou no cookie
  // O Supabase usa o token de sessão no header Authorization ou no cookie
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  // Definir o token de autorização no cliente Supabase
  supabase.auth.setAuth(token);

  // Obter o usuário a partir do token (o Supabase faz a validação)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }

  c.set("user", user);
  c.set("supabase", supabase); // Adicionando o cliente Supabase ao contexto
  await next();
});
