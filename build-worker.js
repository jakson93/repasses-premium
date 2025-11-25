import { build } from 'esbuild';

build({
  entryPoints: ['src/worker/index.ts'],
  alias: {
    '@': './src',
  },
  footer: {
    js: "const { handle } = require('@hono/netlify'); module.exports.handler = handle(app);",
  },
  bundle: true,
  outfile: 'netlify/functions/index.js',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external: [],
  define: {
    'globalThis.SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'globalThis.SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'globalThis.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }
}).catch(() => process.exit(1));
