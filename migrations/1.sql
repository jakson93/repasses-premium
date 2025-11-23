
CREATE TABLE motorcycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  mileage INTEGER,
  displacement INTEGER,
  price REAL,
  description TEXT,
  condition TEXT,
  payment_methods TEXT,
  features TEXT,
  is_featured BOOLEAN DEFAULT 0,
  is_financed BOOLEAN DEFAULT 0,
  is_overdue BOOLEAN DEFAULT 0,
  finance_days_remaining INTEGER,
  finance_monthly_payment REAL,
  finance_total_remaining REAL,
  is_worth_financing BOOLEAN DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE motorcycle_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  motorcycle_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_motorcycles_brand ON motorcycles(brand);
CREATE INDEX idx_motorcycles_year ON motorcycles(year);
CREATE INDEX idx_motorcycles_price ON motorcycles(price);
CREATE INDEX idx_motorcycles_is_featured ON motorcycles(is_featured);
CREATE INDEX idx_motorcycle_images_motorcycle_id ON motorcycle_images(motorcycle_id);
