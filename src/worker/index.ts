import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSupabaseClient, getSupabaseClientWithAuth } from "../../database";
import { SupabaseClient } from "@supabase/supabase-js";

import {
  CreateMotorcycleSchema,
  UpdateMotorcycleSchema,
  MotorcycleFiltersSchema,


} from "@/shared/types";
import { 
  authMiddleware, 
} from "./auth";

// Configurar Hono com tipos para o contexto
const app = new Hono<{ 
  Variables: { 
    user: any; 
    supabase: SupabaseClient;
    accessToken: string;
  } 
}>();

// Middleware CORS para permitir requisições do frontend
app.use("/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Middleware para injetar o Supabase Client em rotas públicas
app.use("/api/motorcycles/*", async (c, next) => {
  if (!c.get("supabase")) {
    c.set("supabase", getSupabaseClient());
  }
  await next();
});

// ============================================
// AUTH ENDPOINTS
// ============================================

app.post("/api/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    const supabase = getSupabaseClient();

    if (!email || !password) {
      return c.json({ error: "Email e senha são obrigatórios" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || null }
      }
    });

    if (signUpError) {
      console.error("Supabase SignUp Error:", signUpError);
      return c.json({ error: signUpError.message }, 500);
    }

    const user = authData.user;
    const session = authData.session;

    if (!user) {
      return c.json({ error: "Falha ao criar usuário" }, 500);
    }

    // Criar registro na tabela users (usando service role para bypass RLS)
    const supabaseAdmin = getSupabaseClient(true);
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
        name: name || null,
        role: "user",
      });

    if (insertError) {
      console.error("Error creating user record:", insertError);
    }

    return c.json({ 
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.user_metadata?.name 
      },
      session: {
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
      }
    }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    const supabase = getSupabaseClient();

    if (!email || !password) {
      return c.json({ error: "Email e senha são obrigatórios" }, 400);
    }

    // Autenticar com Supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Supabase SignIn Error:", signInError);
      return c.json({ error: "Email ou senha inválidos" }, 401);
    }

    const user = data.user;
    const session = data.session;

    return c.json({ 
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.user_metadata?.name 
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name,
  });
});

app.post("/api/auth/logout", authMiddleware, async (c) => {
  const accessToken = c.get("accessToken");
  const supabase = getSupabaseClientWithAuth(accessToken);
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase SignOut Error:", error);
    return c.json({ error: "Erro ao fazer logout" }, 500);
  }

  return c.json({ success: true });
});

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  try {
    const supabase = c.get("supabase");

    // Buscar estatísticas reais do banco
    const { data: motorcycles, error: motoError } = await supabase
      .from("motorcycles")
      .select("id, status, price");

    if (motoError) {
      console.error("Error fetching motorcycles:", motoError);
      return c.json({ error: "Erro ao buscar estatísticas" }, 500);
    }

    const totalMotorcycles = motorcycles?.length || 0;
    const availableMotorcycles = motorcycles?.filter(m => m.status === "disponivel").length || 0;
    const soldMotorcycles = motorcycles?.filter(m => m.status === "vendido").length || 0;

    // Buscar receita total das transações
    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select("amount, type");

    if (transError) {
      console.error("Error fetching transactions:", transError);
    }

    const totalRevenue = transactions
      ?.filter(t => t.type === "sale")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return c.json({
      totalMotorcycles,
      availableMotorcycles,
      soldMotorcycles,
      totalRevenue,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

// ============================================
// FINANCIAL ENDPOINTS
// ============================================

app.get("/api/financial/summary", authMiddleware, async (c) => {
  try {
    const supabase = c.get("supabase");

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("amount, type");

    if (error) {
      console.error("Error fetching transactions:", error);
      return c.json({ error: "Erro ao buscar resumo financeiro" }, 500);
    }

    const totalRevenue = transactions
      ?.filter(t => t.type === "sale")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalCost = transactions
      ?.filter(t => t.type === "purchase")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;

    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;

    return c.json({
      totalRevenue,
      totalCost,
      netProfit,
      profitMargin,
    });
  } catch (error) {
    console.error("Financial summary error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.get("/api/financial/records", authMiddleware, async (c) => {
  try {
    const supabase = c.get("supabase");

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return c.json({ error: "Erro ao buscar registros financeiros" }, 500);
    }

    return c.json(transactions || []);
  } catch (error) {
    console.error("Financial records error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.post("/api/financial/records", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Garantir que o campo date seja populado
    const insertData = {
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      transaction_date: body.transaction_date || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      return c.json({ error: "Erro ao criar registro financeiro" }, 500);
    }

    return c.json(data, 201);
  } catch (error) {
    console.error("Create transaction error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.put("/api/financial/records/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      return c.json({ error: "Erro ao atualizar registro financeiro" }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error("Update transaction error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.delete("/api/financial/records/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      return c.json({ error: "Erro ao deletar registro financeiro" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

// ============================================
// CLIENT ENDPOINTS
// ============================================

app.get("/api/clients", authMiddleware, async (c) => {
  try {
    const supabase = c.get("supabase");

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      return c.json({ error: "Erro ao buscar clientes" }, 500);
    }

    return c.json(clients || []);
  } catch (error) {
    console.error("Clients error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.post("/api/clients", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const supabase = c.get("supabase");

    const { data, error } = await supabase
      .from("clients")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Error creating client:", error);
      return c.json({ error: "Erro ao criar cliente" }, 500);
    }

    return c.json(data, 201);
  } catch (error) {
    console.error("Create client error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.put("/api/clients/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const supabase = c.get("supabase");

    const { data, error } = await supabase
      .from("clients")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating client:", error);
      return c.json({ error: "Erro ao atualizar cliente" }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error("Update client error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.delete("/api/clients/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = c.get("supabase");

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting client:", error);
      return c.json({ error: "Erro ao deletar cliente" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete client error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

// ============================================
// MOTORCYCLE ENDPOINTS
// ============================================

app.get("/api/motorcycles", async (c) => {
  try {
    const query = c.req.query();
    const supabase = c.get("supabase");
    
    const filters = MotorcycleFiltersSchema.parse({
      brand: query.brand || undefined,
      model: query.model || undefined,
      minYear: query.minYear ? parseInt(query.minYear) : undefined,
      maxYear: query.maxYear ? parseInt(query.maxYear) : undefined,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      minMileage: query.minMileage ? parseInt(query.minMileage) : undefined,
      maxMileage: query.maxMileage ? parseInt(query.maxMileage) : undefined,
      minDisplacement: query.minDisplacement ? parseInt(query.minDisplacement) : undefined,
      maxDisplacement: query.maxDisplacement ? parseInt(query.maxDisplacement) : undefined,
      condition: query.condition || undefined,
      is_financed: query.is_financed === "true" ? true : query.is_financed === "false" ? false : undefined,
      sortBy: query.sortBy as any || undefined,
    });

    let queryBuilder = supabase.from("motorcycles").select("*");

    if (filters.brand) {
      queryBuilder = queryBuilder.ilike("brand", `%${filters.brand}%`);
    }
    if (filters.model) {
      queryBuilder = queryBuilder.ilike("model", `%${filters.model}%`);
    }
    if (filters.minYear) {
      queryBuilder = queryBuilder.gte("year", filters.minYear);
    }
    if (filters.maxYear) {
      queryBuilder = queryBuilder.lte("year", filters.maxYear);
    }
    if (filters.minPrice) {
      queryBuilder = queryBuilder.gte("price", filters.minPrice);
    }
    if (filters.maxPrice) {
      queryBuilder = queryBuilder.lte("price", filters.maxPrice);
    }
    if (filters.minMileage) {
      queryBuilder = queryBuilder.gte("mileage", filters.minMileage);
    }
    if (filters.maxMileage) {
      queryBuilder = queryBuilder.lte("mileage", filters.maxMileage);
    }
    if (filters.minDisplacement) {
      queryBuilder = queryBuilder.gte("displacement", filters.minDisplacement);
    }
    if (filters.maxDisplacement) {
      queryBuilder = queryBuilder.lte("displacement", filters.maxDisplacement);
    }
    if (filters.condition) {
      queryBuilder = queryBuilder.eq("condition", filters.condition);
    }
    if (filters.is_financed !== undefined) {
      queryBuilder = queryBuilder.eq("is_financed", filters.is_financed);
    }

    // Sorting
    if (filters.sortBy === "price_asc") {
      queryBuilder = queryBuilder.order("price", { ascending: true });
    } else if (filters.sortBy === "price_desc") {
      queryBuilder = queryBuilder.order("price", { ascending: false });
    } else if (filters.sortBy === "year_asc") {
      queryBuilder = queryBuilder.order("year", { ascending: true });
    } else if (filters.sortBy === "year_desc") {
      queryBuilder = queryBuilder.order("year", { ascending: false });
    } else {
      queryBuilder = queryBuilder.order("created_at", { ascending: false });
    }

    const { data: results, error } = await queryBuilder;

    if (error) {
      console.error("Supabase Query Error:", error);
      return c.json({ error: "Erro ao buscar motos" }, 500);
    }

    // Adicionar thumbnail_url
    const motorcyclesWithThumbnails = await Promise.all(
      (results || []).map(async (motorcycle) => {
        if (motorcycle.thumbnail_url) {
          return motorcycle;
        }

        // Se não tiver thumbnail_url, buscar a primeira imagem do storage
        const { data: imageList, error: storageError } = await supabase.storage
          .from("motorcycle_images")
          .list(`motorcycles/${motorcycle.id}`, {
            limit: 1,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (!storageError && imageList && imageList.length > 0) {
          const publicUrl = supabase.storage.from("motorcycle_images").getPublicUrl(`motorcycles/${motorcycle.id}/${imageList[0].name}`).data.publicUrl;
          return { ...motorcycle, thumbnail_url: publicUrl };
        }

        return motorcycle;
      })
    );

    return c.json(motorcyclesWithThumbnails || []);
  } catch (error) {
    console.error("Get motorcycles error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.get("/api/motorcycles/featured", async (c) => {
  try {
    const supabase = c.get("supabase");
    
    const { data: results, error } = await supabase
      .from("motorcycles")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Supabase Query Error:", error);
      return c.json({ error: "Erro ao buscar motos em destaque" }, 500);
    }

    // Adicionar thumbnail_url
    const motorcyclesWithThumbnails = await Promise.all(
      (results || []).map(async (motorcycle) => {
        if (motorcycle.thumbnail_url) {
          return motorcycle;
        }

        // Se não tiver thumbnail_url, buscar a primeira imagem do storage
        const { data: imageList, error: storageError } = await supabase.storage
          .from("motorcycle_images")
          .list(`motorcycles/${motorcycle.id}`, {
            limit: 1,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (!storageError && imageList && imageList.length > 0) {
          const publicUrl = supabase.storage.from("motorcycle_images").getPublicUrl(`motorcycles/${motorcycle.id}/${imageList[0].name}`).data.publicUrl;
          return { ...motorcycle, thumbnail_url: publicUrl };
        }

        return motorcycle;
      })
    );

    return c.json(motorcyclesWithThumbnails || []);
  } catch (error) {
    console.error("Get featured motorcycles error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.get("/api/motorcycles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = c.get("supabase");

    const { data: motorcycle, error: motoError } = await supabase
      .from("motorcycles")
      .select("*")
      .eq("id", id)
      .single();

    if (motoError || !motorcycle) {
      return c.json({ error: "Moto não encontrada" }, 404);
    }

    // Buscar URLs das imagens no Supabase Storage
    const { data: imageList, error: storageError } = await supabase.storage
      .from("motorcycle_images")
      .list(`motorcycles/${id}`, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      });

    let images: any[] = [];
    
    if (!storageError && imageList) {
      images = imageList.map(file => ({
        url: supabase.storage.from("motorcycle_images").getPublicUrl(`motorcycles/${id}/${file.name}`).data.publicUrl,
        name: file.name,
      }));
    }

    const motorcycleWithImages = {
      ...motorcycle,
      images: images,
    };

    return c.json(motorcycleWithImages);
  } catch (error) {
    console.error("Get motorcycle error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.post("/api/motorcycles", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const data = CreateMotorcycleSchema.parse(body);
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    const insertData = {
      ...data,
      is_featured: data.is_featured ? true : false,
      is_financed: data.is_financed ? true : false,
      is_overdue: data.is_overdue ? true : false,
      is_worth_financing: data.is_worth_financing ? true : false,
    };

    const { data: newMoto, error } = await supabase
      .from("motorcycles")
      .insert(insertData)
      .select("id, brand, model, price")
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return c.json({ error: "Erro ao criar moto" }, 500);
    }

    // Criar transacao de entrada automaticamente
    if (newMoto.price && newMoto.price > 0) {
      try {
        await supabase
          .from("transactions")
          .insert({
            motorcycle_id: newMoto.id,
            type: "purchase",
            amount: newMoto.price,
            category: "Aquisicao",
            description: `Aquisicao de ${newMoto.brand} ${newMoto.model}`,
            date: new Date().toISOString().split('T')[0],
            transaction_date: new Date().toISOString(),
          });
      } catch (transError) {
        console.error("Error creating transaction:", transError);
      }
    }

    return c.json({ id: newMoto.id }, 201);
  } catch (error) {
    console.error("Create motorcycle error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.put("/api/motorcycles/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Buscar moto atual para verificar mudanca de status
    const { data: currentMoto } = await supabase
      .from("motorcycles")
      .select("status, brand, model, price")
      .eq("id", id)
      .single();

    const updateData: any = { ...body };

    // Convert to boolean for Supabase
    if (updateData.is_featured !== undefined) updateData.is_featured = updateData.is_featured ? true : false;
    if (updateData.is_financed !== undefined) updateData.is_financed = updateData.is_financed ? true : false;
    if (updateData.is_overdue !== undefined) updateData.is_overdue = updateData.is_overdue ? true : false;
    if (updateData.is_worth_financing !== undefined) updateData.is_worth_financing = updateData.is_worth_financing ? true : false;

    // Se status mudou para vendida, adicionar sold_at
    if (updateData.status === "vendida" && currentMoto?.status !== "vendida") {
      updateData.sold_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("motorcycles")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Supabase Update Error:", error);
      return c.json({ error: "Erro ao atualizar moto" }, 500);
    }

    // Se moto foi vendida, criar transacao de venda
    if (updateData.status === "vendida" && currentMoto?.status !== "vendida" && currentMoto?.price) {
      try {
        await supabase
          .from("transactions")
          .insert({
            motorcycle_id: parseInt(id),
            type: "sale",
            amount: currentMoto.price,
            category: "Venda",
            description: `Venda de ${currentMoto.brand} ${currentMoto.model}`,
            date: new Date().toISOString().split('T')[0],
            transaction_date: new Date().toISOString(),
          });
      } catch (transError) {
        console.error("Error creating sale transaction:", transError);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Update motorcycle error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.delete("/api/motorcycles/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Delete images from Storage
    const { data: imageList } = await supabase.storage
      .from("motorcycle_images")
      .list(`motorcycles/${id}`);

    if (imageList && imageList.length > 0) {
      const filesToRemove = imageList.map(file => `motorcycles/${id}/${file.name}`);
      await supabase.storage.from("motorcycle_images").remove(filesToRemove);
    }

    // Delete motorcycle from database
    const { error } = await supabase.from("motorcycles").delete().eq("id", id);

    if (error) {
      console.error("Error deleting motorcycle:", error);
      return c.json({ error: "Erro ao deletar moto" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete motorcycle error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

// ============================================
// IMAGE UPLOAD ENDPOINTS
// ============================================

app.post("/api/motorcycles/:id/images", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const formData = await c.req.formData();
    const file = formData.get("image") as File;
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);
    
    if (!file) {
      return c.json({ error: "Nenhuma imagem fornecida" }, 400);
    }

    const filename = `motorcycles/${id}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("motorcycle_images")
      .upload(filename, file, { contentType: file.type });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return c.json({ error: "Erro ao fazer upload da imagem" }, 500);
    }

    const publicUrl = supabase.storage.from("motorcycle_images").getPublicUrl(filename).data.publicUrl;

    return c.json({ 
      success: true,
      url: publicUrl
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.put("/api/motorcycles/:id/thumbnail", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);
    
    const { error } = await supabase
      .from("motorcycles")
      .update({ thumbnail_url: body.thumbnail_url })
      .eq("id", id);

    if (error) {
      console.error("Error updating thumbnail:", error);
      return c.json({ error: "Erro ao atualizar thumbnail" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Update thumbnail error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

app.delete("/api/motorcycles/:id/images/:imageName", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const imageName = c.req.param("imageName");
    const accessToken = c.get("accessToken");
    const supabase = getSupabaseClientWithAuth(accessToken);

    const filePath = `motorcycles/${id}/${imageName}`;

    const { error } = await supabase.storage
      .from("motorcycle_images")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return c.json({ error: "Erro ao deletar imagem" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return c.json({ error: "Erro interno no servidor" }, 500);
  }
});

// ============================================
// EXPORT HANDLER FOR NETLIFY EDGE FUNCTIONS
// ============================================

// Netlify Edge Functions requer uma função como export default
export default async (request: Request, context: any) => {
  return app.fetch(request, context);
};
