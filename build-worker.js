import { build } from 'esbuild';

build({
  entryPoints: ['src/worker/index.ts'],
  alias: {
    '@': './src',
  },

  bundle: true,
  // Compilar para o diretório correto de Edge Functions
  outfile: 'netlify/edge-functions/index.js',
  platform: 'browser',
  target: 'node18',
  format: 'esm',
  external: [],
  define: {
    // Injetar variáveis de ambiente para o worker
    'globalThis.SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'globalThis.SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'globalThis.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }
}).catch(() => process.exit(1));
