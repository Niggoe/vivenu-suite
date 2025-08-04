import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Declare console for Node.js environment
declare const console: {
  log: (...args: any[]) => void
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy für Vivenu Dev API (MUSS VOR /api/vivenu stehen!)
      '/api/vivenu-dev': {
        target: 'https://vivenu.dev',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = '/api' + path.replace(/^\/api\/vivenu-dev/, '')
          console.log('🔄 Proxy Dev Rewrite:', path, '→', newPath)
          return newPath
        },
        headers: {
          'User-Agent': 'Vivenu-Suite/1.0.0'
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('🌐 Proxy Dev:', req.method, req.originalUrl, '→', options.target + proxyReq.path)
          })
        }
      },
      // Proxy für Vivenu Live API
      '/api/vivenu': {
        target: 'https://vivenu.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = '/api' + path.replace(/^\/api\/vivenu/, '')
          console.log('🔄 Proxy Live Rewrite:', path, '→', newPath)
          return newPath
        },
        headers: {
          'User-Agent': 'Vivenu-Suite/1.0.0'
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('🌐 Proxy Live:', req.method, req.originalUrl, '→', options.target + proxyReq.path)
          })
        }
      }
    }
  }
})
