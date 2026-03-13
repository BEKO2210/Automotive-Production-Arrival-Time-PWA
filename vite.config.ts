import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isCiBuild = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  base: isCiBuild && repoName ? `/${repoName}/` : '/',

  plugins: [
    react(),

    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      manifest: false,

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^(?!\/__)/],
      },

      includeAssets: [
        'icons/*.png',
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animation: ['framer-motion'],
          state: ['zustand'],
        },
      },
    },
  },

  server: {
    port: 3000,
    host: true,
  },

  preview: {
    port: 4173,
    host: true,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand'],
  },
});
