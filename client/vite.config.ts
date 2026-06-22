import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  // .env centralizado em server/ — o Vite lê as VITE_* de lá.
  envDir: fileURLToPath(new URL('../server', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Em dev, encaminha /api para a API local (porta 3000). Assim o front
    // usa "/api" relativo igual em produção — funciona em localhost e na rede.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
