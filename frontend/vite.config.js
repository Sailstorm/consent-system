import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Lets the same codebase be built to live under a URL prefix, e.g.
  // "/underdevelopment/" for the active-development deploy. See
  // docs/url-versioning-pipeline.md.
  base: process.env.VITE_BASE_PATH || '/',
})
