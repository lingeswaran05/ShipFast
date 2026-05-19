import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8085', // Default target
        changeOrigin: true,
        secure: false,
        router: function (req) {
            // Dynamically route to the correct microservice based on path
            if (req.url.startsWith('/api/v1/admin') || req.url.startsWith('/api/v1/tickets')) {
               return 'http://localhost:8081';
            }
            if (req.url.startsWith('/api/v1/shipments') || req.url.startsWith('/api/v1/agent')) {
               return 'http://localhost:8082';
            }
            return 'http://localhost:8085'; // auth and users
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Strip any leftover JSESSIONID cookies from the browser to prevent Spring Boot CSRF 403 blocks
            proxyReq.removeHeader('Cookie');
            // Spoof Origin to prevent Spring CORS blocks
            proxyReq.setHeader('Origin', 'http://localhost:8085');
          });
        }
      }
    }
  }
})
