import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: { include: [] },
    optimizeDeps: false,
  },
  server: {
    port: 3000,
  },
  base: '/',
  publicDir: 'src/assets',
});