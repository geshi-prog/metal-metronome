import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/metal-metronome/',
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Metal Metronome',
        short_name: 'Metronome',
        icons: [
          {
            src: '/metal-metronome/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/metal-metronome/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        start_url: '/metal-metronome/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
