/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Nom du dépôt GitHub : le site sera servi sous https://<compte>.github.io/apero-chaos/
// Si tu renommes le dépôt, change cette valeur.
const BASE_GITHUB_PAGES = '/apero-chaos/'

export default defineConfig({
  base: BASE_GITHUB_PAGES,
  plugins: [
    react(),
    tailwindcss(),
    // PWA : rend l'app installable sur l'écran d'accueil et jouable hors ligne.
    VitePWA({
      // Une nouvelle version mise en ligne remplace l'ancienne toute seule.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Apéro Chaos',
        short_name: 'Apéro Chaos',
        description:
          'Les jeux de soirée sur un seul téléphone : défis, vérités, roue, duels… avec ou sans alcool.',
        lang: 'fr',
        start_url: BASE_GITHUB_PAGES,
        scope: BASE_GITHUB_PAGES,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0d0718',
        theme_color: '#0d0718',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Tout ce qu'il faut pour jouer sans réseau : code, styles, polices, icônes.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  server: {
    // Rend l'app accessible depuis le téléphone sur le même Wi-Fi.
    host: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
