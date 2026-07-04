import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA plugin temporarily disabled to fix ESM/CJS build error
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'CIGI.png', 'children-learning.png'],
    //   workbox: {
    //     importScripts: ['sw-custom.js']
    //   },
    //   manifest: { ... }
    // })
  ],
  mode: 'development',
  server: {
    host: true, // Expose to LAN so other devices can connect
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
})

