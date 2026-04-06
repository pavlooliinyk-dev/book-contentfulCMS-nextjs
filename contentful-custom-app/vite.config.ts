import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: 'https://book-contentful-cms-nextjs.vercel.app/contentful-app/',
  server: {
    port: 3001,
  },
  build: {
    outDir: 'build',
  },
});
