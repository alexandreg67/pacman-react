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
        // Optimized cache strategy
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

  // Build optimizations
  build: {
    // Optimized chunks for caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          game: ['./src/game/state.ts', './src/game/types.ts'],
        },
      },
    },
    // Performance optimizations
    cssCodeSplit: true,
    sourcemap: 'hidden', // Generate sourcemaps without exposing them to users
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove only console.log in production, keep error/warn
        pure_funcs: ['console.log', 'console.debug'],
        drop_debugger: true,
      },
    },
    // Optimized size limit
    chunkSizeWarningLimit: 1000,
  },

  // CSS optimizations
  css: {
    devSourcemap: true,
  },

  // Dev server optimizations
  server: {
    // HMR performance
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },

  // Resolution optimizations
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@game': '/src/game',
      '@types': '/src/types',
    },
  },

  // Dependency optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [], // Exclude heavy deps if necessary
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
    // Test optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
})
