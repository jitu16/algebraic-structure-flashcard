/* vite.config.ts */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    // Persist your existing server settings for KaTeX/Fonts
    server: {
      fs: {
        allow: ['..']
      },
    },
    // Default base for local development (http://localhost:5173/)
    base: '/',
  };

  // CONDITIONAL CONFIG:
  // When running 'npm run build', we change the base path to match your GitHub Repo.
  // This prevents the "404 Not Found" error on the live site.
  if (command !== 'serve') {
    config.base = '/algebraic-structure-flashcard/' 
  }

  return config;
});
