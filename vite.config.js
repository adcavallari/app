import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW', 
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Aumenta o limite de cache para 10MB (Permite guardar a Bíblia offline!)
        maximumFileSizeToCacheInBytes: 10000000 
      },
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'],
      manifest: false 
    })
  ]
});