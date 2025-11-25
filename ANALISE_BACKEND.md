# Análise do Backend - Repasses Premium

## 1. Estrutura do Projeto

### Tecnologias Identificadas
- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS
- **Backend**: Hono (framework web) + Supabase
- **Deploy**: Netlify (frontend) + Netlify Functions (backend)
- **Banco de Dados**: Supabase PostgreSQL

### Estrutura de Arquivos
```
src/
├── react-app/          # Frontend React
│   ├── components/
│   ├── contexts/
│   └── pages/
├── worker/             # Backend (Hono)
│   ├── index.ts        # Rotas principais
│   └── auth.ts         # Middleware de autenticação
└── shared/
    └── types.ts        # Tipos compartilhados
```

## 2. Configuração do Supabase

### Projeto Identificado
- **Nome**: repasses-premium-2
- **ID**: glfmvdjlbxoxbpfukapx
- **URL**: https://glfmvdjlbxoxbpfukapx.supabase.co
- **Região**: us-east-1
- **Status**: ACTIVE_HEALTHY

### Tabelas do Banco de Dados
1. **users** - Gestão de usuários (RLS habilitado)
   - Campos: id, email, name, role, created_at
   - FK: auth.users.id

2. **motorcycles** - Catálogo de motos (RLS habilitado)
   - Campos: id, brand, model, year, color, mileage, displacement, price, etc.
   - Status: disponivel/vendido
   - Financiamento: is_financed, is_overdue, finance_days_remaining, etc.

3. **motorcycle_images** - Imagens das motos (RLS habilitado)
   - Campos: id, motorcycle_id, image_url, display_order

4. **clients** - Cadastro de clientes (RLS habilitado)
   - Campos: id, name, email, phone, cpf, address, city, state

5. **transactions** - Transações financeiras (RLS habilitado)
   - Campos: id, motorcycle_id, client_id, type, amount, payment_method

## 3. Problemas Identificados

### 3.1 Autenticação
**Problema**: O backend usa `getSupabaseClient()` que busca variáveis de ambiente do Netlify via `globalThis`, mas essas variáveis não estão configuradas corretamente.

```typescript
// database.ts
const SUPABASE_URL = (globalThis as any).SUPABASE_URL;
const SUPABASE_ANON_KEY = (globalThis as any).SUPABASE_ANON_KEY;
```

**Impacto**: Todas as requisições ao Supabase falham porque o cliente não é inicializado corretamente.

### 3.2 Middleware de Autenticação
**Problema**: O `authMiddleware` espera um token no header `Authorization`, mas o frontend não está enviando o token corretamente após o login.

```typescript
// auth.ts
const authHeader = c.req.header("Authorization");
const token = authHeader?.replace("Bearer ", "");
```

**Impacto**: Endpoints protegidos retornam 401 Unauthorized.

### 3.3 Persistência de Sessão
**Problema**: O cliente Supabase no backend está configurado com `persistSession: false`, o que impede o gerenciamento adequado de sessões.

```typescript
// database.ts
return createClient(SUPABASE_URL, key, {
  auth: {
    persistSession: false,
  },
});
```

**Impacto**: Usuários precisam fazer login repetidamente.

### 3.4 CORS e Configuração Netlify
**Problema**: Não há configuração explícita de CORS no backend Hono, o que pode causar problemas de comunicação entre frontend e backend.

**Impacto**: Requisições podem ser bloqueadas pelo navegador.

### 3.5 Endpoints de Dashboard e Financeiro
**Problema**: Os endpoints `/api/dashboard/stats`, `/api/financial/summary`, `/api/financial/records` e `/api/clients` retornam dados mockados.

```typescript
app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  return c.json({
    totalMotorcycles: 10,
    availableMotorcycles: 5,
    soldMotorcycles: 5,
    totalRevenue: 50000.00,
  });
});
```

**Impacto**: Dashboard não reflete dados reais do banco.

### 3.6 RLS (Row Level Security)
**Problema**: Todas as tabelas têm RLS habilitado, mas não há evidências de políticas RLS configuradas. Isso pode bloquear todas as operações no banco.

**Impacto**: CRUD de motos, clientes e transações podem estar falhando silenciosamente.

### 3.7 Gestão de Imagens
**Problema**: O código busca imagens do Supabase Storage (`motorcycle_images` bucket), mas não há verificação se o bucket existe ou se as permissões estão corretas.

**Impacto**: Imagens podem não carregar no frontend.

### 3.8 Service Role Key
**Problema**: O código referencia `SUPABASE_SERVICE_ROLE_KEY` para operações administrativas, mas não está claro se essa chave está configurada no Netlify.

**Impacto**: Operações que exigem privilégios elevados (como criar usuários) podem falhar.

## 4. Avisos de Segurança

### Função com Search Path Mutável
- **Função**: `public.update_updated_at_column`
- **Nível**: WARN
- **Descrição**: Função sem search_path definido, potencial vulnerabilidade de segurança
- **Remediação**: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

## 5. Próximos Passos

1. **Verificar políticas RLS** no Supabase
2. **Configurar variáveis de ambiente** no Netlify
3. **Implementar endpoints reais** para dashboard e financeiro
4. **Adicionar CORS** ao backend Hono
5. **Corrigir autenticação** e persistência de sessão
6. **Verificar bucket de imagens** no Supabase Storage
7. **Implementar gestão de usuários** adequada
8. **Testar CRUD completo** de todas as entidades
