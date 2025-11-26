import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),          // Plugin de React
    tailwindcss(),    // Plugin de Tailwind
  ],
  base: '/',
  server: {
    proxy: {
      '/login': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/refresh-token': 'http://localhost:3000',
      '/transactions': 'http://localhost:3000',
      '/me': 'http://localhost:3000',
      '/all-data': 'http://localhost:3000',
      '/myWatchlist': 'http://localhost:3000',
      '/addSymbol': 'http://localhost:3000',
      '/removeSymbol': 'http://localhost:3000',
      '/count': 'http://localhost:3000',
    }
  }
})
