/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Nom du dépôt GitHub : le site sera servi sous https://<compte>.github.io/apero-chaos/
// Si tu renommes le dépôt, change cette valeur.
const BASE_GITHUB_PAGES = '/apero-chaos/'

export default defineConfig({
  base: BASE_GITHUB_PAGES,
  plugins: [react(), tailwindcss()],
  server: {
    // Rend l'app accessible depuis le téléphone sur le même Wi-Fi.
    host: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
