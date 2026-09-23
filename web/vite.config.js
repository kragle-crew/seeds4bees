import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    // `npm run dev` serves the UI locally but has no Lambda behind it, so /api
    // calls are forwarded to the deployed backend. In production CloudFront
    // performs this same split, and the app is unaware of either.
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'https://seeds4bees.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
