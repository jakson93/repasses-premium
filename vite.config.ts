import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { cloudflare } from "@cloudflare/vite-plugin"; // Removido para Netlify
import { mochaPlugins } from "@getmocha/vite-plugins";
// import netlifyEdge from "@netlify/vite-plugin"; // Removido: O Netlify Edge Functions não precisa de plugin no Vite

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [...mochaPlugins(process.env as any), react()],
  server: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
