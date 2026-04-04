import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base URL for production (Flask serves the build at this path).
// In development mode Vite ignores this and serves from '/'.
const PROD_BASE = '/static/portfolio/';

export default defineConfig({
  plugins: [react()],

  // Production base path so asset URLs are correct when served by Flask.
  base: PROD_BASE,

  build: {
    // Output directly into Flask's static folder so `flask run` picks it up.
    outDir: '../website/static/portfolio',
    emptyOutDir: true,
  },

  server: {
    // In dev mode, proxy /static/images/* to a running Flask instance so
    // production-style image URLs also work without copying files manually.
    // (Images in public/images/ are the primary dev asset source.)
    proxy: {
      '/static/images': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
