import { Hono } from "hono";
import { setCookie } from "hono/cookie";
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

  // Check if user already exists
  const existingUser = await c.env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (existingUser) {
    return c.json({ error: "Este email já está cadastrado" }, 400);
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  
  const supabase = getSupabaseClient(c.env);
  if (supabase) {
    const { data, error } = await supabase.from('users').insert({ email, password: hashedPassword, name }).select('id').single();
    if (error) {
      console.error("Supabase registration error:", error);
      return c.json({ error: "Erro ao criar usuário" }, 500);
    }
    const userId = data.id;
    const sessionToken = createSessionToken(userId, email);

    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: false,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return c.json({ 
      success: true,
      user: { id: userId, email, name }
    }, 201);
  } else {
    const result = await c.env.DB.prepare(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)"
    )
      .bind(email, hashedPassword, name || null)
      .run();

    const userId = result.meta.last_row_id as number;
    const sessionToken = createSessionToken(userId, email);

    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: false,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return c.json({ 
      success: true,
      user: { id: userId, email, name }
    }, 201);
  }
  const sessionToken = createSessionToken(userId, email);

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: false,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return c.json({ 
    success: true,
    user: { id: userId, email, name }
  }, 201);
});

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  // Find user
  const supabase = getSupabaseClient(c.env);
  let user: any;

  if (supabase) {
    const { data, error } = await supabase.from('users').select('id, email, password, name').eq('email', email).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error("Supabase login error:", error);
      return c.json({ error: "Erro ao buscar usuário" }, 500);
    }
    user = data;
  } else {
    user = await c.env.DB.prepare(
      "SELECT id, email, password, name FROM users WHERE email = ?"
    )
      .bind(email)
      .first() as any;
  }

  if (!user) {
    return c.json({ error: "Email ou senha inválidos" }, 401);
  }

   // Verify password
  // Com hashPassword desabilitado, a comparação é direta
  if (password !== user.password) {
    return c.json({ error: "Email ou senha inválidos" }, 401);
  }

  const sessionToken = createSessionToken(user.id, user.email);

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: false,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return c.json({ 
    success: true,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.post("/api/auth/logout", async (c) => {
  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: false,
    maxAge: 0,
  });

  return c.json({ success: true });
});

// User management endpoints
app.post("/api/users", authMiddleware, async (c) => {
  const body = await c.req.json();
  const { email, password, name, role } = body;

  if (!email || !password || !role) {
    return c.json({ error: "Email, senha e role são obrigatórios" }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: "A senha deve ter no mínimo 6 caracteres" }, 400);
  }

  // Check if user already exists
  const supabase = getSupabaseClient(c.env);
  if (supabase) {
    const { data: existingUser, error: fetchError } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingUser) {
      return c.json({ error: "Usuário com este email já existe" }, 409);
    }
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Supabase user check error:", fetchError);
      return c.json({ error: "Erro ao verificar usuário existente" }, 500);
    }
  } else {
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    )
      .bind(email)
      .first();
    if (existingUser) {
      return c.json({ error: "Usuário com este email já existe" }, 409);
    }
  }

  // Hash password (using the temporary non-hashing function)
  const hashedPassword = await hashPassword(password);

  // Insert user
  if (supabase) {
    const { data, error } = await supabase.from('users').insert([{ email, password: hashedPassword, name, role }]).select('id, email, name, role').single();
    if (error) {
      console.error("Supabase user insert error:", error);
      return c.json({ error: "Erro ao cadastrar usuário" }, 500);
    }
    return c.json({ success: true, user: data }, 201);
  } else {
    const result = await c.env.DB.prepare(
      "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)"
    )
      .bind(email, hashedPassword, name, role)
      .run();
    
    if (result.success) {
      return c.json({ success: true, user: { email, name, role } }, 201);
    } else {
      console.error("D1 user insert error:", result.error);
      return c.json({ error: "Erro ao cadastrar usuário" }, 500);
    }
  }
});

// Motorcycle endpoints
app.get("/api/motorcycles", async (c) => {
  const query = c.req.query();
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

  let sql = "SELECT * FROM motorcycles WHERE 1=1";
  const params: any[] = [];

  if (filters.brand) {
    sql += " AND brand LIKE ?";
    params.push(`%${filters.brand}%`);
  }
  if (filters.model) {
    sql += " AND model LIKE ?";
    params.push(`%${filters.model}%`);
  }
  if (filters.minYear) {
    sql += " AND year >= ?";
    params.push(filters.minYear);
  }
  if (filters.maxYear) {
    sql += " AND year <= ?";
    params.push(filters.maxYear);
  }
  if (filters.minPrice) {
    sql += " AND price >= ?";
    params.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    sql += " AND price <= ?";
    params.push(filters.maxPrice);
  }
  if (filters.minMileage) {
    sql += " AND mileage >= ?";
    params.push(filters.minMileage);
  }
  if (filters.maxMileage) {
    sql += " AND mileage <= ?";
    params.push(filters.maxMileage);
  }
  if (filters.minDisplacement) {
    sql += " AND displacement >= ?";
    params.push(filters.minDisplacement);
  }
  if (filters.maxDisplacement) {
    sql += " AND displacement <= ?";
    params.push(filters.maxDisplacement);
  }
  if (filters.condition) {
    sql += " AND condition = ?";
    params.push(filters.condition);
  }
  if (filters.is_financed !== undefined) {
    sql += " AND is_financed = ?";
    params.push(filters.is_financed ? 1 : 0);
  }

  // Sorting
  if (filters.sortBy === "price_asc") {
    sql += " ORDER BY price ASC";
  } else if (filters.sortBy === "price_desc") {
    sql += " ORDER BY price DESC";
  } else if (filters.sortBy === "year_asc") {
    sql += " ORDER BY year ASC";
  } else if (filters.sortBy === "year_desc") {
    sql += " ORDER BY year DESC";
  } else {
    sql += " ORDER BY created_at DESC";
  }

  const supabase = getSupabaseClient(c.env);
  let results: any[] = [];

  if (supabase) {
    let query = supabase.from('motorcycles').select('*');

    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`);
    }
    if (filters.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    if (filters.minYear) {
      query = query.gte('year', filters.minYear);
    }
    if (filters.maxYear) {
      query = query.lte('year', filters.maxYear);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.minMileage) {
      query = query.gte('mileage', filters.minMileage);
    }
    if (filters.maxMileage) {
      query = query.lte('mileage', filters.maxMileage);
    }
    if (filters.minDisplacement) {
      query = query.gte('displacement', filters.minDisplacement);
    }
    if (filters.maxDisplacement) {
      query = query.lte('displacement', filters.maxDisplacement);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.is_financed !== undefined) {
      query = query.eq('is_financed', filters.is_financed);
    }

    // Sorting
    if (filters.sortBy === "price_asc") {
      query = query.order('price', { ascending: true });
    } else if (filters.sortBy === "price_desc") {
      query = query.order('price', { ascending: false });
    } else if (filters.sortBy === "year_asc") {
      query = query.order('year', { ascending: true });
    } else if (filters.sortBy === "year_desc") {
      query = query.order('year', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase list error:", error);
      return c.json({ error: "Erro ao buscar motos" }, 500);
    }
    results = data;
  } else {
    results = await c.env.DB.prepare(sql).bind(...params).all().then(res => res.results);
  }

  return c.json(results);
});

app.get("/api/motorcycles/featured", async (c) => {
  const supabase = getSupabaseClient(c.env);
  let results: any[] = [];

  if (supabase) {
    const { data, error } = await supabase.from('motorcycles').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(6);
    if (error) {
      console.error("Supabase featured error:", error);
      return c.json({ error: "Erro ao buscar motos em destaque" }, 500);
    }
    results = data;
  } else {
    results = await c.env.DB.prepare(
      "SELECT * FROM motorcycles WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 6"
    ).all().then(res => res.results);
  }

  return c.json(results);
});

app.get("/api/motorcycles/:id", async (c) => {
  const id = c.req.param("id");

  const supabase = getSupabaseClient(c.env);
  let motorcycle: any;
  let images: any[] = [];

  if (supabase) {
    const { data: motoData, error: motoError } = await supabase.from('motorcycles').select('*').eq('id', id).single();
    if (motoError && motoError.code !== 'PGRST116') {
      console.error("Supabase motorcycle error:", motoError);
      return c.json({ error: "Erro ao buscar moto" }, 500);
    }
    motorcycle = motoData;

    if (!motorcycle) {
      return c.json({ error: "Motorcycle not found" }, 404);
    }

    const { data: imagesData, error: imagesError } = await supabase.from('motorcycle_images').select('*').eq('motorcycle_id', id).order('display_order', { ascending: true });
    if (imagesError) {
      console.error("Supabase images error:", imagesError);
      return c.json({ error: "Erro ao buscar imagens" }, 500);
    }
    images = imagesData;
  } else {
    motorcycle = await c.env.DB.prepare(
      "SELECT * FROM motorcycles WHERE id = ?"
    )
      .bind(id)
      .first();

    if (!motorcycle) {
      return c.json({ error: "Motorcycle not found" }, 404);
    }

    images = await c.env.DB.prepare(
      "SELECT * FROM motorcycle_images WHERE motorcycle_id = ? ORDER BY display_order ASC"
    )
      .bind(id)
      .all().then(res => res.results);
  }

  const motorcycleWithImages: MotorcycleWithImages = {
    ...motorcycle as Motorcycle,
    images: images as any[],
  };

  return c.json(motorcycleWithImages);
});

app.post("/api/motorcycles", authMiddleware, async (c) => {
  const body = await c.req.json();
  const data = CreateMotorcycleSchema.parse(body);

  const supabase = getSupabaseClient(c.env);
  let lastId: number | null = null;

  if (supabase) {
    const { data: motoData, error } = await supabase.from('motorcycles').insert({
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color || null,
      mileage: data.mileage || null,
      displacement: data.displacement || null,
      price: data.price,
      description: data.description || null,
      condition: data.condition || null,
      payment_methods: data.payment_methods || null,
      features: data.features || null,
      is_featured: data.is_featured,
      is_financed: data.is_financed,
      is_overdue: data.is_overdue,
      finance_days_remaining: data.finance_days_remaining || null,
      finance_monthly_payment: data.finance_monthly_payment || null,
      finance_total_remaining: data.finance_total_remaining || null,
      is_worth_financing: data.is_worth_financing,
    }).select('id').single();

    if (error) {
      console.error("Supabase insert error:", error);
      return c.json({ error: "Erro ao cadastrar moto" }, 500);
    }
    lastId = motoData.id;
  } else {
    const result = await c.env.DB.prepare(
      `INSERT INTO motorcycles (
        brand, model, year, color, mileage, displacement, price, description,
        condition, payment_methods, features, is_featured, is_financed, is_overdue,
        finance_days_remaining, finance_monthly_payment, finance_total_remaining,
        is_worth_financing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        data.brand,
        data.model,
        data.year,
        data.color || null,
        data.mileage || null,
        data.displacement || null,
        data.price,
        data.description || null,
        data.condition || null,
        data.payment_methods || null,
        data.features || null,
        data.is_featured ? 1 : 0,
        data.is_financed ? 1 : 0,
        data.is_overdue ? 1 : 0,
        data.finance_days_remaining || null,
        data.finance_monthly_payment || null,
        data.finance_total_remaining || null,
        data.is_worth_financing ? 1 : 0
      )
      .run();
    lastId = result.meta.last_row_id as number;
  }

  return c.json({ id: lastId }, 201);
});

app.put("/api/motorcycles/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const data = UpdateMotorcycleSchema.parse(body);

  const updates: string[] = [];
  const params: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === "is_featured" || key === "is_financed" || key === "is_overdue" || key === "is_worth_financing") {
        updates.push(`${key} = ?`);
        params.push(value ? 1 : 0);
      } else {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
  });

  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  const supabase = getSupabaseClient(c.env);

  if (supabase) {
    const updateData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    const { error } = await supabase.from('motorcycles').update(updateData).eq('id', id);
    if (error) {
      console.error("Supabase update error:", error);
      return c.json({ error: "Erro ao atualizar moto" }, 500);
    }
  } else {
    await c.env.DB.prepare(
      `UPDATE motorcycles SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...params)
      .run();
  }

  return c.json({ success: true });
});

app.delete("/api/motorcycles/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const supabase = getSupabaseClient(c.env);

  if (supabase) {
    const { error: imagesError } = await supabase.from('motorcycle_images').delete().eq('motorcycle_id', id);
    if (imagesError) {
      console.error("Supabase delete images error:", imagesError);
      return c.json({ error: "Erro ao deletar imagens" }, 500);
    }

    const { error: motoError } = await supabase.from('motorcycles').delete().eq('id', id);
    if (motoError) {
      console.error("Supabase delete motorcycle error:", motoError);
      return c.json({ error: "Erro ao deletar moto" }, 500);
    }
  } else {
    await c.env.DB.prepare("DELETE FROM motorcycle_images WHERE motorcycle_id = ?")
      .bind(id)
      .run();

    await c.env.DB.prepare("DELETE FROM motorcycles WHERE id = ?")
      .bind(id)
      .run();
  }

  return c.json({ success: true });
});

// Image upload endpoint
app.post("/api/motorcycles/:id/images", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const formData = await c.req.formData();
  const file = formData.get("image") as File;
  
  if (!file) {
    return c.json({ error: "No image provided" }, 400);
  }

  const supabase = getSupabaseClient(c.env);
  let imageUrl: string;
  let lastId: number | null = null;

  if (supabase) {
    const filename = `${id}/${Date.now()}-${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('motorcycle-images')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error("Supabase storage upload error:", storageError);
      return c.json({ error: "Erro ao fazer upload da imagem" }, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from('motorcycle-images')
      .getPublicUrl(storageData.path);
    
    imageUrl = publicUrlData.publicUrl;

    const { data: insertData, error: insertError } = await supabase.from('motorcycle_images').insert({
      motorcycle_id: id,
      image_url: imageUrl,
      display_order: 0,
    }).select('id').single();

    if (insertError) {
      console.error("Supabase image insert error:", insertError);
      return c.json({ error: "Erro ao registrar imagem no banco" }, 500);
    }
    lastId = insertData.id;
  } else {
    const arrayBuffer = await file.arrayBuffer();
    const filename = `motorcycles/${id}/${Date.now()}-${file.name}`;

    await c.env.R2_BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    imageUrl = `/api/files/${filename}`;

    const result = await c.env.DB.prepare(
      "INSERT INTO motorcycle_images (motorcycle_id, image_url, display_order) VALUES (?, ?, ?)"
    )
      .bind(id, imageUrl, 0)
      .run();
    lastId = result.meta.last_row_id as number;
  }

  return c.json({ id: lastId, image_url: imageUrl }, 201);
});

app.put("/api/motorcycles/:id/thumbnail", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  
  const supabase = getSupabaseClient(c.env);

  if (supabase) {
    const { error } = await supabase.from('motorcycles').update({ thumbnail_url: body.thumbnail_url }).eq('id', id);
    if (error) {
      console.error("Supabase thumbnail update error:", error);
      return c.json({ error: "Erro ao definir thumbnail" }, 500);
    }
  } else {
    await c.env.DB.prepare(
      "UPDATE motorcycles SET thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(body.thumbnail_url, id)
      .run();
  }

  return c.json({ success: true });
});

app.delete("/api/images/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const supabase = getSupabaseClient(c.env);

  if (supabase) {
    const { data: imageData, error: imageError } = await supabase.from('motorcycle_images').select('*').eq('id', id).single();
    if (imageError && imageError.code !== 'PGRST116') {
      console.error("Supabase image select error:", imageError);
      return c.json({ error: "Erro ao buscar imagem" }, 500);
    }
    const image = imageData;

    if (!image) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Delete from Supabase Storage
    const filename = image.image_url.split('/').pop(); // Assuming filename is the last part of the URL
    const { error: storageError } = await supabase.storage
      .from('motorcycle-images')
      .remove([`${image.motorcycle_id}/${filename}`]);

    if (storageError) {
      console.error("Supabase storage delete error:", storageError);
      // Continue to delete from DB even if storage fails
    }

    // Delete from Supabase DB
    const { error: dbError } = await supabase.from('motorcycle_images').delete().eq('id', id);
    if (dbError) {
      console.error("Supabase image delete error:", dbError);
      return c.json({ error: "Erro ao deletar imagem do banco" }, 500);
    }
  } else {
    const image = await c.env.DB.prepare(
      "SELECT * FROM motorcycle_images WHERE id = ?"
    )
      .bind(id)
      .first() as any;

    if (!image) {
      return c.json({ error: "Image not found" }, 404);
    }

    const filename = image.image_url.replace("/api/files/", "");
    await c.env.R2_BUCKET.delete(filename);

    await c.env.DB.prepare("DELETE FROM motorcycle_images WHERE id = ?")
      .bind(id)
      .run();
  }

  return c.json({ success: true });
});

// Dashboard Stats endpoint
app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  const supabase = getSupabaseClient(c.env);

  if (!supabase) {
    return c.json({ error: "Dashboard stats not supported in D1 mode" }, 501);
  }

  try {
    // 1. Motorcycle Stats
    const { data: motoCounts, error: motoError } = await supabase
      .from('motorcycles')
      .select('status, is_financed, is_overdue', { count: 'exact' });

    if (motoError) throw motoError;

    const totalMotos = motoCounts.length;
    const motosDisponiveis = motoCounts.filter(m => m.status === 'disponivel').length;
    const motosVendidas = motoCounts.filter(m => m.status === 'vendida').length;
    const motosReservadas = motoCounts.filter(m => m.status === 'reservada').length;
    const motosFinanciadas = motoCounts.filter(m => m.is_financed).length;
    const motosAtrasadas = motoCounts.filter(m => m.is_overdue).length;

    // 2. Financial Stats (Total)
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount');

    if (transError) throw transError;

    const totalEntradas = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSaidas = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);

    const saldo = totalEntradas - totalSaidas;

    // 3. Financial Stats (Monthly - Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data: monthlyTransactions, error: monthlyError } = await supabase
      .from('transactions')
      .select('type, amount, transaction_date')
      .gte('transaction_date', sixMonthsAgo.toISOString());

    if (monthlyError) throw monthlyError;

    const monthlyDataMap = new Map<string, { vendas: number, entradas: number, saidas: number, lucro: number }>();
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
      monthlyDataMap.set(monthKey, { vendas: 0, entradas: 0, saidas: 0, lucro: 0 });
    }

    monthlyTransactions.forEach(t => {
      const date = new Date(t.transaction_date);
      const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
      const data = monthlyDataMap.get(monthKey);
      if (data) {
        if (t.type === 'entrada') {
          data.entradas += t.amount;
          data.lucro += t.amount;
        } else if (t.type === 'saida') {
          data.saidas += t.amount;
          data.lucro -= t.amount;
        }
        // Assuming 'vendas' is a count of 'entrada' transactions for simplicity
        if (t.type === 'entrada') {
          data.vendas += 1;
        }
      }
    });

    const monthlyData = Array.from(monthlyDataMap.entries())
      .sort(([keyA], [keyB]) => {
        const [monthA, yearA] = keyA.split('/').map(s => parseInt(s));
        const [monthB, yearB] = keyB.split('/').map(s => parseInt(s));
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      })
      .map(([month, data]) => ({ month, ...data }));

    // 4. Other Stats (Placeholder for now)
    const vendasMes = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].vendas : 0;
	    const lucroMes = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].lucro : 0;
	    const clientesAtivos = 0; // Requires client table logic
	
	    const stats = {
	      totalMotos,
	      motosDisponiveis,
	      motosVendidas,
	      motosReservadas,
	      totalEntradas,
	      totalSaidas,
	      saldo,
	      motosFinanciadas,
	      motosAtrasadas,
	      clientesAtivos,
	      vendasMes,
	      lucroMes,
	    };
	
	    return c.json({ stats, monthlyData });
	
	  } catch (error) {
	    console.error("Dashboard stats error:", error);
	    return c.json({ error: "Erro ao buscar dados do dashboard" }, 500);
	  }
	});
	
	// File serving endpoint (Mantido para compatibilidade com D1)
app.get("/api/files/*", async (c) => {
  const supabase = getSupabaseClient(c.env);
  if (supabase) {
    // Se estiver no modo Supabase, as imagens virão do Supabase Storage
    // e o URL será direto, não passando por este endpoint.
    return c.json({ error: "File serving not supported in Supabase mode" }, 404);
  }

  const path = c.req.path.replace("/api/files/", "");
  const object = await c.env.R2_BUCKET.get(path);

  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return c.body(object.body, { headers });
});

export default app;
