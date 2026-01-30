import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // This allows Vite to serve files from the node_modules folder
      allow: ['..'] 
    }
  }
})