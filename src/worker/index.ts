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

const app = new Hono<{ Bindings: Env; Variables: { user: any } }>();

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
    secure: true,
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
  const user = await c.env.DB.prepare(
    "SELECT id, email, password, name FROM users WHERE email = ?"
  )
    .bind(email)
    .first() as any;

  if (!user) {
    return c.json({ error: "Email ou senha inválidos" }, 401);
  }

  // Verify password
  const hashedPassword = await hashPassword(password);
  if (hashedPassword !== user.password) {
    return c.json({ error: "Email ou senha inválidos" }, 401);
  }

  const sessionToken = createSessionToken(user.id, user.email);

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
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
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true });
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

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json(results);
});

app.get("/api/motorcycles/featured", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM motorcycles WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 6"
  ).all();

  return c.json(results);
});

app.get("/api/motorcycles/:id", async (c) => {
  const id = c.req.param("id");

  const motorcycle = await c.env.DB.prepare(
    "SELECT * FROM motorcycles WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!motorcycle) {
    return c.json({ error: "Motorcycle not found" }, 404);
  }

  const { results: images } = await c.env.DB.prepare(
    "SELECT * FROM motorcycle_images WHERE motorcycle_id = ? ORDER BY display_order ASC"
  )
    .bind(id)
    .all();

  const motorcycleWithImages: MotorcycleWithImages = {
    ...motorcycle as Motorcycle,
    images: images as any[],
  };

  return c.json(motorcycleWithImages);
});

app.post("/api/motorcycles", authMiddleware, async (c) => {
  const body = await c.req.json();
  const data = CreateMotorcycleSchema.parse(body);

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

  return c.json({ id: result.meta.last_row_id }, 201);
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

  await c.env.DB.prepare(
    `UPDATE motorcycles SET ${updates.join(", ")} WHERE id = ?`
  )
    .bind(...params)
    .run();

  return c.json({ success: true });
});

app.delete("/api/motorcycles/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare("DELETE FROM motorcycle_images WHERE motorcycle_id = ?")
    .bind(id)
    .run();

  await c.env.DB.prepare("DELETE FROM motorcycles WHERE id = ?")
    .bind(id)
    .run();

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

  const arrayBuffer = await file.arrayBuffer();
  const filename = `motorcycles/${id}/${Date.now()}-${file.name}`;

  await c.env.R2_BUCKET.put(filename, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const imageUrl = `/api/files/${filename}`;

  const result = await c.env.DB.prepare(
    "INSERT INTO motorcycle_images (motorcycle_id, image_url, display_order) VALUES (?, ?, ?)"
  )
    .bind(id, imageUrl, 0)
    .run();

  return c.json({ id: result.meta.last_row_id, image_url: imageUrl }, 201);
});

app.put("/api/motorcycles/:id/thumbnail", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  
  await c.env.DB.prepare(
    "UPDATE motorcycles SET thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(body.thumbnail_url, id)
    .run();

  return c.json({ success: true });
});

app.delete("/api/images/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

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

  return c.json({ success: true });
});

// File serving endpoint
app.get("/api/files/*", async (c) => {
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
