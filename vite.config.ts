import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pacman React',
        short_name: 'Pacman',
        theme_color: '#0ea5e9',
        background_color: '#0b1020',
        display: 'standalone',
        icons: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Cache strategy optimisée
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],

  // Optimisations de build
  build: {
    // Chunks optimisés pour le cache
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          game: ['./src/game/state.ts', './src/game/types.ts'],
        },
      },
    },
    // Optimisations de performance
    cssCodeSplit: true,
    sourcemap: 'hidden', // Génère les sourcemaps sans les exposer aux utilisateurs
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },
    // Taille limite optimisée
    chunkSizeWarningLimit: 1000,
  },

  // Optimisations CSS
  css: {
    devSourcemap: true,
  },

  // Optimisations du serveur de dev
  server: {
    // Performance du HMR
    hmr: {
      overlay: false, // Désactiver l'overlay d'erreur pour de meilleures perfs
    },
  },

  // Optimisations de résolution
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@game': '/src/game',
      '@types': '/src/types',
    },
  },

  // Optimisations des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [], // Exclure des deps lourdes si nécessaire
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    },
    // Optimisations des tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
})
