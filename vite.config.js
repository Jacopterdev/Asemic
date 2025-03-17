import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  build: {
    outDir: 'dist', // Specify the output directory for the production build
  },
  server: {
    open: true,
  },
  base: './', // This ensures resources (like scripts, styles, etc.) are properly routed in production

})
