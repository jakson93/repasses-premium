# Deploy no Netlify - Repasses Premium

## 📋 Pré-requisitos

- Conta no [Netlify](https://www.netlify.com/)
- Repositório no GitHub
- Credenciais do Supabase

## 🚀 Instruções de Deploy

### 1. Conectar o Repositório ao Netlify

1. Acesse [Netlify](https://app.netlify.com/)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha **GitHub** como provedor
4. Selecione o repositório: `jakson93/repasses-premium`

### 2. Configurar o Build

Na tela de configuração do site, use as seguintes configurações:

- **Branch to deploy**: `main` (ou a branch principal do seu projeto)
- **Build command**: `pnpm install && pnpm run build`
- **Publish directory**: `dist`

### 3. Configurar Variáveis de Ambiente

Antes de fazer o deploy, você **DEVE** configurar as variáveis de ambiente no Netlify:

1. No painel do Netlify, vá em **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:

```
SUPABASE_URL=SEU_SUPABASE_URL
SUPABASE_ANON_KEY=SEU_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SEU_SUPABASE_SERVICE_ROLE_KEY
DATABASE_MODE=supabase
```

### 4. Fazer o Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build ser concluído (geralmente leva 2-5 minutos)
3. Seu site estará disponível em uma URL do tipo: `https://seu-site.netlify.app`

## ✅ Correções Aplicadas

As seguintes correções foram feitas no projeto para garantir um deploy sem erros:

1. **Configuração do TypeScript**: Adicionado suporte para tipos do Cloudflare Workers no `tsconfig.worker.json`
2. **Geração de tipos**: Criado o arquivo `worker-configuration.d.ts` necessário para o build
3. **Segurança**: Arquivo `.env` removido do repositório e adicionado ao `.gitignore`
4. **Documentação**: Criado arquivo `.env.example` como template

## 🔒 Segurança

⚠️ **IMPORTANTE**: As credenciais do Supabase foram removidas do repositório por questões de segurança. Elas devem ser configuradas apenas como variáveis de ambiente no Netlify.

## 📝 Notas

- O projeto usa **pnpm** como gerenciador de pacotes
- O build gera os arquivos na pasta `dist`
- O Netlify está configurado para redirecionar todas as rotas para `index.html` (SPA)
- As funções serverless estão configuradas para funcionar em `netlify/functions`

## 🆘 Problemas Comuns

### Build falha no Netlify

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o comando de build está correto: `pnpm install && pnpm run build`
- Verifique os logs de build no painel do Netlify

### Site carrega mas não funciona

- Verifique se as variáveis de ambiente do Supabase estão corretas
- Abra o console do navegador para verificar erros
- Verifique se o Supabase está configurado corretamente

## 📞 Suporte

Para mais informações sobre deploy no Netlify, consulte a [documentação oficial](https://docs.netlify.com/).
