import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import {
  CreateMotorcycleSchema,
  UpdateMotorcycleSchema,
  MotorcycleFiltersSchema,
  type Motorcycle,
  type MotorcycleWithImages,
} from "@/shared/types";
import {
  authMiddleware, 
  createSessionToken, 
  hashPassword, 
  SESSION_COOKIE_NAME 
} from "./auth";
import { getSupabaseClient } from "./database";
import { validator } from "hono/validator";
import { z } from "zod";

// Definição de Env (ajustada para Netlify Edge Functions)
interface Env {
  // DB: D1Database; // Removido
  // SUPABASE_URL: string; // Removido
  // SUPABASE_ANON_KEY: string; // Removido
  // SUPABASE_SERVICE_ROLE_KEY: string; // Removido
}

const app = new Hono<{ Bindings: Env; Variables: { user: any; db: any } }>();

// Auth endpoints
app.post("/api/auth/register", async (c) => {
  const body = await c.req.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email,
      },
    },
  });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (data.user) {
    // A sessão é gerenciada pelo Supabase. O cliente deve lidar com o token retornado.
    return c.json({ id: data.user.id, email: data.user.email, name: data.user.user_metadata.name });
  }

  return c.json({ error: "Erro desconhecido ao registrar" }, 500);
});

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return c.json({ error: error.message }, 401);
  }

  if (data.user) {
    // A sessão é gerenciada pelo Supabase. O cliente deve lidar com o token retornado.
    return c.json({ id: data.user.id, email: data.user.email, name: data.user.user_metadata.name });
  }

  return c.json({ error: "Email ou senha inválidos" }, 401);
});

app.post("/api/auth/logout", async (c) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: "Logout successful" });
});

app.get("/api/auth/me", async (c) => {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ id: user.id, email: user.email, name: user.user_metadata.name });
});

// Motorcycle endpoints
app.get("/api/motorcycles", async (c) => {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: motorcycles, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(motorcycles);
});

app.post("/api/motorcycles", validator("json", (value) => CreateMotorcycleSchema.parse(value)), async (c) => {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const motorcycleData = c.req.valid("json");

  const { data, error } = await supabase
    .from("motorcycles")
    .insert([{ ...motorcycleData, user_id: user.id }])
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

app.put("/api/motorcycles/:id", validator("json", (value) => UpdateMotorcycleSchema.parse(value)), async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const motorcycleData = c.req.valid("json");

  const { data, error } = await supabase
    .from("motorcycles")
    .update(motorcycleData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: "Motocicleta não encontrada ou você não tem permissão" }, 404);
  }

  return c.json(data);
});

app.delete("/api/motorcycles/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { error } = await supabase
    .from("motorcycles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: "Motocicleta excluída com sucesso" });
});

// Image management endpoints
app.get("/api/motorcycles/:id/images", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 1. Verificar se a moto pertence ao usuário
  const { data: motorcycle, error: fetchError } = await supabase
    .from("motorcycles")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !motorcycle) {
    return c.json({ error: "Motocicleta não encontrada ou você não tem permissão" }, 404);
  }

  // 2. Listar arquivos no Storage
  const { data, error } = await supabase.storage
    .from("motorcycle_images")
    .list(id, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // 3. Formatar a lista de imagens
  const images = data.map((file) => {
    const { data: publicUrlData } = supabase.storage
      .from("motorcycle_images")
      .getPublicUrl(`${id}/${file.name}`);
    
    return {
      name: file.name,
      url: publicUrlData.publicUrl,
      uploaded_at: file.created_at,
    };
  });

  return c.json(images);
});

app.post("/api/motorcycles/:id/images", async (c) => {
app.post("/api/motorcycles/:id/images", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 1. Verificar se a moto pertence ao usuário
  const { data: motorcycle, error: fetchError } = await supabase
    .from("motorcycles")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !motorcycle) {
    return c.json({ error: "Motocicleta não encontrada ou você não tem permissão" }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return c.json({ error: "Nenhum arquivo enviado" }, 400);
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${id}/${crypto.randomUUID()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("motorcycle_images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // 2. Obter a URL pública
  const { data: publicUrlData } = supabase.storage
    .from("motorcycle_images")
    .getPublicUrl(fileName);

  // 3. Inserir o registro da imagem no banco de dados (tabela 'motorcycle_images' - assumindo que existe ou será criada)
  // Como não há uma tabela 'motorcycle_images' no schema, vamos apenas retornar a URL e assumir que o frontend lida com a lista.
  // Para simplificar e seguir o schema atual, vamos apenas atualizar o campo 'thumbnail_url' se for a primeira imagem.
  // O gerenciamento completo de múltiplas imagens exigiria uma nova tabela.
  // Por enquanto, vamos apenas retornar a URL e deixar o frontend decidir.

  return c.json({ url: publicUrlData.publicUrl }, 201);
});

app.delete("/api/motorcycles/:motorcycleId/images/:imageName", async (c) => {
  const { motorcycleId, imageName } = c.req.param();
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 1. Verificar se a moto pertence ao usuário
  const { data: motorcycle, error: fetchError } = await supabase
    .from("motorcycles")
    .select("id")
    .eq("id", motorcycleId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !motorcycle) {
    return c.json({ error: "Motocicleta não encontrada ou você não tem permissão" }, 404);
  }

  // 2. Excluir do Storage
  const path = `${motorcycleId}/${imageName}`;
  const { error } = await supabase.storage
    .from("motorcycle_images")
    .remove([path]);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // 3. Atualizar o thumbnail_url se a imagem excluída for o thumbnail
  // Isso deve ser tratado no frontend, mas podemos limpar o campo aqui se for o caso.
  // Como não temos a lista de imagens no backend, vamos confiar no frontend para a lista.

  return c.json({ message: "Imagem excluída com sucesso" });
});

app.post("/api/motorcycles/:id/thumbnail", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { url } = body;
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 1. Verificar se a moto pertence ao usuário
  const { data: motorcycle, error: fetchError } = await supabase
    .from("motorcycles")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !motorcycle) {
    return c.json({ error: "Motocicleta não encontrada ou você não tem permissão" }, 404);
  }

  // 2. Atualizar o thumbnail_url
  const { error } = await supabase
    .from("motorcycles")
    .update({ thumbnail_url: url })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: "Thumbnail atualizado com sucesso" });
});

// User management endpoints
app.post("/api/users", async (c) => {
  const supabase = getSupabaseClient(true); // Usar Service Role Key para criar usuários
  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !adminUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Verificar se o usuário logado tem permissão de administrador (assumindo que o perfil tem um campo 'role')
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single();

  if (profileError || profile.role !== "admin") {
    return c.json({ error: "Forbidden: Apenas administradores podem criar novos usuários" }, 403);
  }

  const body = await c.req.json();
  const { email, password, name, role } = body;

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
  }

  // Criar usuário no Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Opcional: confirmar email automaticamente
    user_metadata: {
      name: name || email,
      role: role || "user",
    },
  });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // Inserir perfil na tabela 'profiles' (assumindo que o trigger não está configurado ou não funciona)
  // Se o trigger estiver configurado, esta etapa é redundante. Vamos assumir que o trigger está configurado.
  // Caso contrário, seria necessário:
  /*
  const { error: profileInsertError } = await supabase
    .from("profiles")
    .insert([{ id: data.user.id, email: data.user.email, name: name || email, role: role || "user" }]);

  if (profileInsertError) {
    // Logar erro, mas o usuário foi criado no Auth
  }
  */

  return c.json({ id: data.user.id, email: data.user.email, name: data.user.user_metadata.name, role: data.user.user_metadata.role }, 201);
});

// Financial data endpoints
app.get("/api/financial-data", async (c) => {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: financialData, error } = await supabase
    .from("financial_data")
    .select("*, motorcycles(*)")
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(financialData);
});

app.post("/api/financial-data", async (c) => {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { motorcycle_id, cost_price, sale_price, financing_details, notes } = body;

  const { data, error } = await supabase
    .from("financial_data")
    .insert([{ 
      motorcycle_id, 
      user_id: user.id, 
      cost_price, 
      sale_price, 
      financing_details, 
      notes 
    }])
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

app.put("/api/financial-data/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { cost_price, sale_price, financing_details, notes } = body;

  const { data, error } = await supabase
    .from("financial_data")
    .update({ cost_price, sale_price, financing_details, notes })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: "Dado financeiro não encontrado ou você não tem permissão" }, 404);
  }

  return c.json(data);
});

app.delete("/api/financial-data/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { error } = await supabase
    .from("financial_data")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ message: "Dado financeiro excluído com sucesso" });
});

export default app;
