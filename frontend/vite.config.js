import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/melodia_apps/',
  plugins: [
    react(),
    svgr({
      include: '**/*.svg', // optional, biar semua .svg bisa diimport sebagai component
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // dalam kB
  },
});
