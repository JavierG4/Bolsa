import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),          // Plugin de React
    tailwindcss(),    // Plugin de Tailwind
  ],
  server: {
    proxy: {
      // Redirigir todas las llamadas API al servidor backend
      '/login': 'http://localhost:3000',
      '/signIn': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/refresh-token': 'http://localhost:3000',
    }
  }
})
