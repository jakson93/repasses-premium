# 🚀 Guia Rápido de Configuração - Repasses Premium

## ⚡ Configuração em 5 Minutos

### 1️⃣ Configurar Variáveis de Ambiente no Netlify

**Acesse:** https://app.netlify.com → Seu site → **Site settings** → **Environment variables**

**Adicione estas variáveis:**

```env
SUPABASE_URL=https://glfmvdjlbxoxbpfukapx.supabase.co
SUPABASE_ANON_KEY=SEU_SUPABASE_ANON_KEY
```

### 2️⃣ Fazer Deploy

O Netlify detecta automaticamente o push no GitHub e faz o deploy.

**Ou force um novo deploy:**
- No painel do Netlify: **Deploys** → **Trigger deploy** → **Deploy site**

### 3️⃣ Verificar Deploy

Aguarde o build finalizar (2-3 minutos) e verifique:

✅ **Status:** Published  
✅ **Edge Functions:** 1 deployed  
✅ **Build log:** sem erros

### 4️⃣ Testar o Sistema

**Acesse seu site e teste:**

1. **Registro de usuário:**
   - Vá para a página de registro
   - Crie uma conta com email e senha
   - Verifique se o login funciona

2. **Dashboard:**
   - Após login, acesse o dashboard
   - Verifique se as estatísticas aparecem

3. **Catálogo de motos:**
   - Acesse a página de motos
   - Tente criar uma nova moto (se for admin)

---

## 🔧 Configuração Avançada (Opcional)

### Service Role Key

Para operações administrativas avançadas, adicione:

```env
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
```

**Como obter:**
1. Acesse: https://supabase.com/dashboard/project/glfmvdjlbxoxbpfukapx/settings/api
2. Copie a **service_role key** (⚠️ mantenha em segredo!)
3. Adicione no Netlify

---

## 🐛 Troubleshooting

### ❌ Erro 401 ao fazer login

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão no Netlify
2. Faça um novo deploy após adicionar as variáveis
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

### ❌ Imagens não carregam

**Causa:** Bucket de Storage não configurado

**Solução:**
- O bucket já foi criado automaticamente
- Verifique se as políticas RLS estão ativas no Supabase

### ❌ Dashboard mostra dados zerados

**Causa:** Banco de dados vazio

**Solução:**
- Adicione motos, clientes e transações pelo painel admin
- Os dados aparecerão automaticamente no dashboard

### ❌ Edge Functions não funcionam

**Causa:** Build falhou ou variáveis incorretas

**Solução:**
1. Verifique o build log no Netlify
2. Confirme que as variáveis estão corretas
3. Faça um novo deploy

---

## 📞 Precisa de Ajuda?

### Logs e Debugging

**Netlify Logs:**
- Acesse: **Functions** → **Edge Functions** → **Logs**

**Supabase Logs:**
- Acesse: https://supabase.com/dashboard/project/glfmvdjlbxoxbpfukapx/logs/explorer

### Documentação

- **Relatório Técnico Completo:** `RELATORIO_TECNICO.md`
- **Análise de Backend:** `ANALISE_BACKEND.md`

---

## ✅ Checklist Pós-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Edge Functions ativas
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] CRUD de motos funcionando
- [ ] Upload de imagens funcionando

---

**🎉 Pronto! Seu sistema está operacional!**
