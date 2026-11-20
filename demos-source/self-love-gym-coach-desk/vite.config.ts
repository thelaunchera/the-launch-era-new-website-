import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/demos/self-love-gym-coach-desk/',
  plugins: [react()],
  resolve: { alias: { '@appdeploy/client': fileURLToPath(new URL('./src/demoClient.ts', import.meta.url)) } },
});
