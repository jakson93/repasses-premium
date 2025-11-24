import { build } from 'esbuild';

build({
  entryPoints: ['src/worker/index.ts'],
  alias: {
    '@': './src',
  },
  footer: {
    js: "const { handle } = require('@hono/node-server/netlify'); module.exports.handler = handle(app);",
  },
  bundle: true,
  outfile: 'netlify/functions/index.js',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external: [],
}).catch(() => process.exit(1));
