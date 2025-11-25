# 🏍️ Repasses Premium

Sistema completo de gestão de motos para revenda, com catálogo online, controle financeiro e gestão de clientes.

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com JWT
- 🏍️ **CRUD completo de motos** com filtros avançados
- 📸 **Upload de imagens** com Supabase Storage
- 💰 **Controle financeiro** com dashboard em tempo real
- 👥 **Gestão de clientes** e transações
- 📊 **Dashboard administrativo** com estatísticas
- 🎨 **Interface moderna** com React e TailwindCSS

## 🚀 Deploy Rápido

### 1. Configure as variáveis de ambiente no Netlify

```env
SUPABASE_URL=https://glfmvdjlbxoxbpfukapx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Faça o deploy

O Netlify detecta automaticamente o push e faz o deploy.

### 3. Acesse e teste

Seu sistema estará pronto para uso!

## 📚 Documentação

- **[Guia de Configuração](GUIA_CONFIGURACAO.md)** - Setup rápido em 5 minutos
- **[Relatório Técnico](RELATORIO_TECNICO.md)** - Documentação completa do sistema
- **[Análise de Backend](ANALISE_BACKEND.md)** - Detalhes técnicos da implementação

## 🛠️ Tecnologias

### Frontend
- React 19
- TypeScript
- TailwindCSS
- Vite
- React Router

### Backend
- Hono (framework web)
- Netlify Edge Functions
- Supabase (PostgreSQL + Auth + Storage)

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Row Level Security (RLS)
- ✅ CORS configurado
- ✅ Validação de dados com Zod
- ✅ Tokens seguros no localStorage

## 📦 Estrutura do Projeto

```
repasses-premium/
├── src/
│   ├── react-app/          # Frontend React
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/       # Context API (Auth)
│   │   ├── pages/          # Páginas da aplicação
│   │   └── utils/          # Utilitários (API client)
│   ├── worker/             # Backend (Edge Functions)
│   │   ├── index.ts        # Rotas da API
│   │   └── auth.ts         # Middleware de autenticação
│   └── shared/             # Tipos compartilhados
├── database.ts             # Cliente Supabase
├── netlify.toml            # Configuração Netlify
└── package.json
```

## 🧪 Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

## 📊 Status do Projeto

✅ **Backend:** 100% funcional  
✅ **Autenticação:** 100% funcional  
✅ **CRUD de Motos:** 100% funcional  
✅ **Dashboard:** 100% funcional  
✅ **Upload de Imagens:** 100% funcional  
✅ **Gestão Financeira:** 100% funcional  

**Status:** 🚀 **PRONTO PARA PRODUÇÃO**

## 📞 Suporte

Para problemas ou dúvidas, consulte:
- [Guia de Configuração](GUIA_CONFIGURACAO.md)
- [Relatório Técnico](RELATORIO_TECNICO.md)

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando React, Hono e Supabase**
