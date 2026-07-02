import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Base path for GitHub Pages project site (/smartphysics-kz/).
  // Local dev and other hosts stay at '/'. Set VITE_BASE in the Pages build.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 5180 to avoid colliding with other local dev servers already on 5173
    port: 5180,
    strictPort: true,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
