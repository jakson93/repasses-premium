import { build } from 'esbuild';

build({
  entryPoints: ['src/worker/index.ts'],
  alias: {
    '@': './src',
  },
  footer: {
    js: "import { handle } from '@hono/node-server/netlify'; export const handler = handle(app);",
  },
  bundle: true,
  outfile: 'netlify/functions/index.js',
  platform: 'node',
  target: 'node20',
  format: 'esm',
  external: [],
}).catch(() => process.exit(1));
