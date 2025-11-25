import { createMiddleware } from "hono/factory";
import { getSupabaseClient } from "../../database";
import { SupabaseClient } from "@supabase/supabase-js";

export const SESSION_COOKIE_NAME = "sb-access-token";

/**
 * Middleware para verificar a autenticação do usuário
 * Extrai o token do cookie ou header Authorization
 * Valida o token com o Supabase Auth
 */
export const authMiddleware = createMiddleware<{ 
  Variables: { 
    user: any; 
    supabase: SupabaseClient;
    accessToken: string;
  } 
}>(async (c, next) => {
  const supabase = getSupabaseClient();
  
  // Tentar obter token do header Authorization
  const authHeader = c.req.header("Authorization");
  let token = authHeader?.replace("Bearer ", "");

  // Se não houver no header, tentar obter do cookie
  if (!token) {
    const cookieHeader = c.req.header("Cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies[SESSION_COOKIE_NAME];
    }
  }

  if (!token) {
    return c.json({ error: "Unauthorized: Missing authentication token" }, 401);
  }

  // Validar o token com o Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error("Auth error:", authError);
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }

  // Injetar usuário e cliente Supabase no contexto
  c.set("user", user);
  c.set("supabase", supabase);
  c.set("accessToken", token);
  
  await next();
});

/**
 * Middleware opcional para verificar se o usuário é admin
 */
export const adminMiddleware = createMiddleware<{ 
  Variables: { 
    user: any; 
    supabase: SupabaseClient;
  } 
}>(async (c, next) => {
  const user = c.get("user");
  const supabase = c.get("supabase");

  // Verificar se o usuário tem role de admin na tabela users
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData || userData.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }

  await next();
});
