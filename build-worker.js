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
  target: 'esnext',
  format: 'esm',
  external: [],
  // Não definir variáveis de ambiente em tempo de build
  // As Edge Functions do Netlify acessam variáveis de ambiente em runtime via Deno.env
}).catch(() => process.exit(1));
