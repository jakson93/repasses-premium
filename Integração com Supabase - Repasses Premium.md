# Integração com Supabase - Repasses Premium

## Visão Geral

Este documento descreve como preparar e executar a migração do banco de dados local (D1) para o Supabase PostgreSQL.

## Estrutura Atual do Banco de Dados

### Tabelas Existentes

#### 1. users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. motorcycles
```sql
CREATE TABLE motorcycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  mileage INTEGER,
  displacement INTEGER,
  price REAL,
  description TEXT,
  condition TEXT DEFAULT 'usado',
  payment_methods TEXT DEFAULT 'à vista',
  features TEXT,
  thumbnail_url TEXT,
  is_featured INTEGER DEFAULT 0,
  is_financed INTEGER DEFAULT 0,
  is_overdue INTEGER DEFAULT 0,
  finance_days_remaining INTEGER DEFAULT 0,
  finance_monthly_payment REAL DEFAULT 0,
  finance_total_remaining REAL DEFAULT 0,
  is_worth_financing INTEGER DEFAULT 0,
  status TEXT DEFAULT 'disponivel',
  sold_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. motorcycle_images
```sql
CREATE TABLE motorcycle_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  motorcycle_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
);
```

#### 4. clients
```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. transactions
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  motorcycle_id INTEGER,
  client_id INTEGER,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  description TEXT,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);
```

## Migração para Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote as credenciais:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Passo 2: Adaptar Schema para PostgreSQL

As principais diferenças entre SQLite (D1) e PostgreSQL:

1. **AUTOINCREMENT → SERIAL**
   - SQLite: `id INTEGER PRIMARY KEY AUTOINCREMENT`
   - PostgreSQL: `id SERIAL PRIMARY KEY`

2. **INTEGER (boolean) → BOOLEAN**
   - SQLite: `is_featured INTEGER DEFAULT 0`
   - PostgreSQL: `is_featured BOOLEAN DEFAULT FALSE`

3. **DATETIME → TIMESTAMP**
   - SQLite: `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
   - PostgreSQL: `created_at TIMESTAMP DEFAULT NOW()`

4. **REAL → NUMERIC/DECIMAL**
   - SQLite: `price REAL`
   - PostgreSQL: `price NUMERIC(10, 2)`

### Passo 3: Scripts de Migração PostgreSQL

Criar arquivo `supabase_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Motorcycles table
CREATE TABLE motorcycles (
  id SERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  mileage INTEGER,
  displacement INTEGER,
  price NUMERIC(10, 2),
  description TEXT,
  condition TEXT DEFAULT 'usado',
  payment_methods TEXT DEFAULT 'à vista',
  features TEXT,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_financed BOOLEAN DEFAULT FALSE,
  is_overdue BOOLEAN DEFAULT FALSE,
  finance_days_remaining INTEGER DEFAULT 0,
  finance_monthly_payment NUMERIC(10, 2) DEFAULT 0,
  finance_total_remaining NUMERIC(10, 2) DEFAULT 0,
  is_worth_financing BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'disponivel',
  sold_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Motorcycle images table
CREATE TABLE motorcycle_images (
  id SERIAL PRIMARY KEY,
  motorcycle_id INTEGER NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  motorcycle_id INTEGER REFERENCES motorcycles(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  description TEXT,
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_motorcycles_status ON motorcycles(status);
CREATE INDEX idx_motorcycles_featured ON motorcycles(is_featured);
CREATE INDEX idx_motorcycle_images_motorcycle_id ON motorcycle_images(motorcycle_id);
CREATE INDEX idx_transactions_motorcycle_id ON transactions(motorcycle_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_motorcycles_updated_at BEFORE UPDATE ON motorcycles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Passo 4: Configurar Variáveis de Ambiente

Adicionar ao arquivo `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Database Mode (local ou supabase)
DATABASE_MODE=local
```

### Passo 5: Adaptar Código do Worker

Criar um arquivo `src/worker/database.ts` para abstrair a camada de banco de dados:

```typescript
import { createClient } from '@supabase/supabase-js';

export interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any>;
  execute(sql: string, params?: any[]): Promise<any>;
}

export class D1Adapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}
  
  async query(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    for (const param of params) {
      stmt.bind(param);
    }
    return await stmt.all();
  }
  
  async execute(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    for (const param of params) {
      stmt.bind(param);
    }
    return await stmt.run();
  }
}

export class SupabaseAdapter implements DatabaseAdapter {
  private client;
  
  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }
  
  async query(sql: string, params: any[] = []) {
    // Implementar queries usando Supabase client
    // Converter SQL parametrizado para queries Supabase
  }
  
  async execute(sql: string, params: any[] = []) {
    // Implementar execução usando Supabase client
  }
}

export function getDatabaseAdapter(env: Env): DatabaseAdapter {
  if (env.DATABASE_MODE === 'supabase') {
    return new SupabaseAdapter(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return new D1Adapter(env.DB);
}
```

### Passo 6: Storage de Imagens

Atualmente as imagens são armazenadas no R2 (Cloudflare). Para Supabase:

**Opção 1: Manter R2**
- Continuar usando Cloudflare R2 para storage
- Apenas migrar o banco de dados

**Opção 2: Migrar para Supabase Storage**
- Usar Supabase Storage para imagens
- Atualizar código de upload/delete

Exemplo de upload com Supabase Storage:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Upload
const { data, error } = await supabase.storage
  .from('motorcycle-images')
  .upload(`${motorcycleId}/${filename}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('motorcycle-images')
  .getPublicUrl(`${motorcycleId}/${filename}`);

// Delete
await supabase.storage
  .from('motorcycle-images')
  .remove([`${motorcycleId}/${filename}`]);
```

## Checklist de Migração

- [ ] Criar projeto no Supabase
- [ ] Executar script `supabase_schema.sql` no SQL Editor do Supabase
- [ ] Configurar variáveis de ambiente
- [ ] Exportar dados do D1 (se houver dados de produção)
- [ ] Importar dados para Supabase
- [ ] Testar queries básicas
- [ ] Implementar adapter de banco de dados
- [ ] Decidir sobre storage de imagens
- [ ] Atualizar código do worker
- [ ] Testar todas as funcionalidades
- [ ] Configurar Row Level Security (RLS) no Supabase
- [ ] Deploy em produção

## Segurança - Row Level Security (RLS)

Após criar as tabelas, habilitar RLS:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorcycle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies para leitura pública de motos
CREATE POLICY "Motorcycles are viewable by everyone"
ON motorcycles FOR SELECT
USING (true);

-- Policies para admin (autenticado)
CREATE POLICY "Authenticated users can insert motorcycles"
ON motorcycles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update motorcycles"
ON motorcycles FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete motorcycles"
ON motorcycles FOR DELETE
TO authenticated
USING (true);

-- Similar para outras tabelas...
```

## Notas Importantes

1. **Backup**: Sempre fazer backup dos dados antes de migrar
2. **Testes**: Testar extensivamente em ambiente de desenvolvimento
3. **Rollback**: Ter plano de rollback caso algo dê errado
4. **Performance**: Monitorar performance após migração
5. **Custos**: Verificar limites do plano gratuito do Supabase

## Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Migrações](https://supabase.com/docs/guides/cli/local-development)
