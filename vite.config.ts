/* vite.config.ts */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']
    },
  },
  // FORCE the base URL. 
  // This guarantees the paths in index.html will be correct on GitHub.
  base: '/algebraic-structure-flashcard/',
})
