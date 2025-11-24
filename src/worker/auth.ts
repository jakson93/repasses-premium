import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getSupabaseClient } from "../../database"; // Importação corrigida
// import { Env } from "../worker-configuration"; // Removido para Netlify

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
  // Simple hash for demo purposes
  // In production, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const authMiddleware = createMiddleware<{ Variables: { user: any } }>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = verifySessionToken(token);
  if (!session) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  // Get user from database
  const supabase = getSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name, created_at")
    .eq("id", session.userId)
    .single();

  if (error) {
    console.error("Supabase Error:", error);
    return c.json({ error: "Database error" }, 500);
  }  
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  c.set("user", user);
  await next();
});
