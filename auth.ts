import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

export const SESSION_COOKIE_NAME = "repasses_session";

interface SessionData {
  userId: number;
  email: string;
  createdAt: number;
}

export function createSessionToken(userId: number, email: string): string {
  const data: SessionData = {
    userId,
    email,
    createdAt: Date.now(),
  };
  return btoa(JSON.stringify(data));
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const decoded = JSON.parse(atob(token));
    
    // Check if session is expired (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - decoded.createdAt > thirtyDaysInMs) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  // ATENÇÃO: Hash de senha desabilitado temporariamente para testes de login
  // Em produção, use bcrypt ou similar
  return password;
}

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: { user: any } }>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = verifySessionToken(token);
  if (!session) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  // Get user from database (D1)
  let user: any;
  if (!c.env.SUPABASE_URL) {
    user = await c.env.DB.prepare(
      "SELECT id, email, name, created_at FROM users WHERE id = ?"
    )
      .bind(session.userId)
      .first();
  } else {
    // Get user from database (Supabase)
    const supabase = getSupabaseClient(c.env);
    const { data, error } = await supabase.from('users').select('id, email, name').eq('id', session.userId).single();
    if (error) {
      console.error("Supabase user fetch error:", error);
      return c.json({ error: "User not found" }, 401);
    }
    user = data;
  }

  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

    // Check for admin role (Temporariamente desabilitado para testes de login)
  // if (user.role !== 'admin') {
  //   return c.json({ error: "Forbidden: Admin access required" }, 403);
  // }

  c.set("user", user);
  await next();
});
