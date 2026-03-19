import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mkcert(),
    react(),
    tailwindcss(),
  ],
  server: {
    https: true,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@components': '/src/components',
      '@sections': '/src/sections',
      '@assets': '/src/assets',
      '@contracts': '/src/contracts',
      '@hooks': '/src/hooks',
    },
  },
})
