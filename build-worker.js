import { build } from 'esbuild';

build({
  entryPoints: ['src/worker/index.ts'],
  alias: {
    '@': './src',
  },
  bundle: true,
  outfile: 'netlify/functions/index.js',
  platform: 'node',
  target: 'node20',
  format: 'esm',
  external: ['@hono/node-server/netlify'],
}).catch(() => process.exit(1));
