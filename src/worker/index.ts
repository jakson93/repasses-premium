import { Hono } from "hono";
// import { handle } from "hono/netlify"; // Removido: Usaremos o adaptador Edge

import { getSupabaseClient } from "../../database";
import { SupabaseClient } from "@supabase/supabase-js";

import {
  CreateMotorcycleSchema,
  UpdateMotorcycleSchema,
  MotorcycleFiltersSchema,
  type Motorcycle,
  type MotorcycleWithImages,
} from "@/shared/types";
import { 
  authMiddleware, 
} from "./auth";

// O Hono precisa de um tipo para o contexto, mas o Netlify Functions não usa Bindings
// Usaremos um tipo genérico para o Hono e injetaremos o Supabase Client via Middleware
const app = new Hono<{ Variables: { user: any; supabase: SupabaseClient } }>();

// Middleware para injetar o Supabase Client no contexto (apenas se não estiver no authMiddleware)
// Como o authMiddleware agora injeta o supabase client, este middleware não é mais necessário.
// Se o endpoint não usar authMiddleware, o cliente precisa ser injetado.
app.use("/api/motorcycles/*", async (c, next) => {
  if (!c.get("supabase")) {
    c.set("supabase", getSupabaseClient());
  }
  await next();
});

// Auth endpoints
app.post("/api/auth/register", async (c) => {
  const body = await c.req.json();
  const { email, password, name } = body;
  const supabase = getSupabaseClient(); // Usar o cliente padrão

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
  }

  // Usar a autenticação nativa do Supabase
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || null } // Adicionar metadados
    }
  });

  if (signUpError) {
    console.error("Supabase SignUp Error:", signUpError);
    return c.json({ error: signUpError.message }, 500);
  }

  // O Supabase já cuida da sessão e cookies.
  return c.json({ 
    success: true,
    user: { id: user?.id, email: user?.email, name: user?.user_metadata.name }
  }, 201);
});

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;
  const supabase = getSupabaseClient(); // Usar o cliente padrão

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  // Usar a autenticação nativa do Supabase
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Supabase SignIn Error:", signInError);
    return c.json({ error: "Email ou senha inválidos" }, 401);
  }

  // O Supabase já cuida da sessão e cookies.
  return c.json({ 
    success: true,
    user: { id: user?.id, email: user?.email, name: user?.user_metadata.name }
  });
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata.name,
  });
});

app.post("/api/auth/logout", async (c) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase SignOut Error:", error);
    return c.json({ error: "Erro ao fazer logout" }, 500);
  }

  return c.json({ success: true });
});

// Motorcycle endpoints
app.get("/api/motorcycles", async (c) => {
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
    return c.json({ error: "Database query failed" }, 500);
  }

  return c.json(results);
});

app.get("/api/motorcycles/featured", async (c) => {
  const supabase = c.get("supabase");
  const { data: results, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Supabase Query Error:", error);
    return c.json({ error: "Database query failed" }, 500);
  }

  return c.json(results);
});

app.get("/api/motorcycles/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = c.get("supabase");

  const { data: motorcycle, error: motoError } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", id)
    .single();

  if (motoError || !motorcycle) {
    return c.json({ error: "Motorcycle not found" }, 404);
  }

  const { data: images, error: imagesError } = await supabase
    .from("motorcycle_images")
    .select("*")
    .eq("motorcycle_id", id)
    .order("display_order", { ascending: true });

  if (imagesError) {
    console.error("Supabase Images Query Error:", imagesError);
    return c.json({ error: "Database query failed" }, 500);
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
  const supabase = c.get("supabase");

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
    .select("id")
    .single();

  if (error) {
    console.error("Supabase Insert Error:", error);
    return c.json({ error: "Database insert failed" }, 500);
  }

  return c.json({ id: newMoto.id }, 201);
});

app.put("/api/motorcycles/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const data = UpdateMotorcycleSchema.parse(body);
  const supabase = c.get("supabase");

  const updateData = { ...data };

  // Convert 1/0 to boolean for Supabase
  if (updateData.is_featured !== undefined) updateData.is_featured = updateData.is_featured ? true : false;
  if (updateData.is_financed !== undefined) updateData.is_financed = updateData.is_financed ? true : false;
  if (updateData.is_overdue !== undefined) updateData.is_overdue = updateData.is_overdue ? true : false;
  if (updateData.is_worth_financing !== undefined) updateData.is_worth_financing = updateData.is_worth_financing ? true : false;

  const { error } = await supabase
    .from("motorcycles")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Supabase Update Error:", error);
    return c.json({ error: "Database update failed" }, 500);
  }

  return c.json({ success: true });
});

app.delete("/api/motorcycles/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const supabase = c.get("supabase");

  // Delete images
  await supabase.from("motorcycle_images").delete().eq("motorcycle_id", id);

  // Delete motorcycle
  await supabase.from("motorcycles").delete().eq("id", id);

  return c.json({ success: true });
});

// Image upload endpoint
app.post("/api/motorcycles/:id/images", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const formData = await c.req.formData();
  const file = formData.get("image") as File;
  const supabase = c.get("supabase");
  
  if (!file) {
    return c.json({ error: "No image provided" }, 400);
  }

  const filename = `motorcycles/${id}/${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("motorcycle_images") // Assumindo que você tem um bucket chamado 'motorcycle_images'
    .upload(filename, file, { contentType: file.type });

  if (uploadError) {
    console.error("Supabase Upload Error:", uploadError);
    return c.json({ error: "Failed to upload image" }, 500);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("motorcycle_images")
    .getPublicUrl(filename);

  const imageUrl = publicUrlData.publicUrl;

  // Insert image record into database
  const { data: newImage, error: insertError } = await supabase
    .from("motorcycle_images")
    .insert({ motorcycle_id: id, image_url: imageUrl, display_order: 0 })
    .select("id")
    .single();

  if (insertError) {
    console.error("Supabase Insert Error:", insertError);
    return c.json({ error: "Failed to record image in database" }, 500);
  }

  return c.json({ id: newImage.id, image_url: imageUrl }, 201);
});

app.put("/api/motorcycles/:id/thumbnail", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const supabase = c.get("supabase");
  
  const { error } = await supabase
    .from("motorcycles")
    .update({ thumbnail_url: body.thumbnail_url, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Supabase Update Error:", error);
    return c.json({ error: "Database update failed" }, 500);
  }

  return c.json({ success: true });
});

app.delete("/api/images/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const supabase = c.get("supabase");

  const { data: image, error: fetchError } = await supabase
    .from("motorcycle_images")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    return c.json({ error: "Image not found" }, 404);
  }

  // Delete from Supabase Storage
  const filename = image.image_url.split("/").pop(); // Simplificação: assume que o nome do arquivo é o último segmento da URL
  const { error: deleteStorageError } = await supabase.storage
    .from("motorcycle_images")
    .remove([`motorcycles/${id}/${filename}`]); // O caminho exato pode precisar de ajuste

  if (deleteStorageError) {
    console.error("Supabase Storage Delete Error:", deleteStorageError);
    // Continua para deletar o registro do DB mesmo que o arquivo não seja deletado
  }

  // Delete from database
  const { error: deleteDbError } = await supabase
    .from("motorcycle_images")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    console.error("Supabase DB Delete Error:", deleteDbError);
    return c.json({ error: "Failed to delete image record" }, 500);
  }

  return c.json({ success: true });
});
// Exportar o handler para o Netlify Functions\nexport const handler = handle(app);
