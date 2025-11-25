# Auditoria Backend - Repasses Premium

## Data: 25/11/2025

## Estrutura do Banco de Dados (Supabase)

### Tabelas Identificadas:

1. **users** - Usuários do sistema
2. **motorcycles** - Motos cadastradas (com campo `status`)
3. **motorcycle_images** - Imagens das motos
4. **clients** - Clientes
5. **transactions** - Transações financeiras

## Problemas Identificados

### 1. **PROBLEMA CRÍTICO: Endpoints Financeiros Incompatíveis**

**Localização:** `/src/worker/index.ts` (linhas 230-308)

**Descrição:**
- O backend possui endpoints `/api/financial/summary` e `/api/financial/records`
- Estes endpoints consultam a tabela `transactions`
- A tabela `transactions` possui estrutura diferente do esperado pelo frontend

**Estrutura Real da Tabela `transactions`:**
```sql
- id (integer)
- motorcycle_id (integer, nullable)
- client_id (integer, nullable)
- type (text) 
- amount (numeric)
- payment_method (text, nullable)
- description (text, nullable)
- transaction_date (timestamp)
- created_at (timestamp)
```

**Problema:** 
- O frontend em `FinancialManagement.tsx` espera campos como `category`, `date` (não `transaction_date`)
- O backend não possui endpoint PUT/DELETE para `/api/financial/records/:id`
- Isso causa erro de tela branca ao acessar o módulo financeiro

### 2. **PROBLEMA: Falta de Responsividade entre Módulos**

**Descrição:**
- Quando uma moto é cadastrada, não há criação automática de transação financeira
- Quando uma moto é marcada como "vendida", não há:
  - Criação de transação de venda
  - Atualização do campo `sold_at`
  - Persistência do status no banco de dados

**Evidência:**
- `handleStatusChange` em `AdvancedMotorcycleManagement.tsx` (linha 127-141) atualiza apenas localmente
- Não há trigger ou lógica de backend para criar transações automaticamente

### 3. **PROBLEMA: Estrutura de Dados Inconsistente**

**Frontend espera (FinancialManagement.tsx):**
```typescript
interface FinancialRecord {
  id: number;
  type: 'entrada' | 'saida';
  description: string;
  amount: number;
  category: string;  // ❌ NÃO EXISTE NO BANCO
  date: string;      // ❌ DEVERIA SER transaction_date
  motorcycle_id?: number;
  client_id?: number;
  ...
}
```

**Banco de dados possui:**
```sql
type (text)
amount (numeric)
payment_method (text)
description (text)
transaction_date (timestamp)
```

### 4. **PROBLEMA: Falta de Endpoints CRUD Completos**

**Endpoints Faltantes:**
- `PUT /api/financial/records/:id` - Editar transação
- `DELETE /api/financial/records/:id` - Deletar transação
- `GET /api/financial/categories` - Listar categorias (se necessário)

### 5. **PROBLEMA: Campo `status` da Moto Não Persiste**

**Evidência:**
- O campo `status` existe no banco de dados
- O endpoint `PUT /api/motorcycles/:id` aceita o campo `status`
- Mas a atualização não está sendo persistida corretamente

**Causa Provável:**
- Falta de validação/conversão adequada no backend
- Possível problema com RLS (Row Level Security) do Supabase

## Soluções Propostas

### Solução 1: Adicionar Campo `category` à Tabela `transactions`
```sql
ALTER TABLE transactions ADD COLUMN category TEXT;
ALTER TABLE transactions RENAME COLUMN transaction_date TO date;
```

### Solução 2: Criar Endpoints CRUD Completos para Transações
- Implementar `PUT /api/financial/records/:id`
- Implementar `DELETE /api/financial/records/:id`

### Solução 3: Implementar Lógica de Responsividade
- Quando moto é cadastrada → criar transação de "entrada" (aquisição)
- Quando moto é vendida → criar transação de "saída" (venda)
- Atualizar campo `status` e `sold_at` corretamente

### Solução 4: Corrigir Persistência de Status
- Verificar RLS policies
- Garantir que o campo `status` seja atualizado corretamente

### Solução 5: Padronizar Interface de Dados
- Criar adaptadores/transformers para compatibilizar frontend e backend
- Ou ajustar frontend para usar a estrutura real do banco

## Prioridade de Correção

1. **ALTA:** Corrigir estrutura da tabela `transactions` (adicionar `category`)
2. **ALTA:** Implementar endpoints CRUD completos para transações
3. **ALTA:** Corrigir persistência do campo `status` das motos
4. **MÉDIA:** Implementar lógica de responsividade entre módulos
5. **BAIXA:** Otimizações e melhorias de performance

## Próximos Passos

1. Aplicar migrations no Supabase
2. Corrigir endpoints do backend
3. Testar todas as funcionalidades
4. Fazer deploy via GitHub
