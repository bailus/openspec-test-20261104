/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Django serves the page and the built files; django-vite reads dist/manifest.json.
  base: '/static/',
  publicDir: false,
  server: {
    origin: 'http://localhost:5173',
  },
  build: {
    outDir: 'dist',
    manifest: 'manifest.json',
    rolldownOptions: {
      input: 'src/main.tsx',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
