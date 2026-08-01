import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  mode: 'development',
  server: {
    host: true, // Expose to LAN so other devices can connect
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-pdf';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
})
