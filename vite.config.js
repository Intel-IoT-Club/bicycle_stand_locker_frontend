import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://bicycle-stand-locker-backend-bu4h.onrender.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Spoof Origin to match backend expected origin
            proxyReq.setHeader('Origin', 'https://bicycle-stand-locker-backend-bu4h.onrender.com');
          });
        }
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('')
  }
})
