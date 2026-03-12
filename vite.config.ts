/**
 * Vite Konfiguration für Autoflow Tracker
 * Enthält PWA-Setup mit vite-plugin-pwa
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';


const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isCiBuild = process.env.GITHUB_ACTIONS === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages benötigt den Repo-Pfad als Base auf CI
  base: isCiBuild && repoName ? `/${repoName}/` : '/Automotive-Production-Arrival-Time-PWA/',

  plugins: [
    // React Plugin
    react(),
    
    // PWA Plugin
    VitePWA({
      // Service Worker Strategie
      strategies: 'generateSW',
      
      // Registrierungstyp
      registerType: 'autoUpdate',
      
      // Manifest-Datei
      manifest: false, // Wir verwenden unsere eigene manifest.webmanifest
      
      // Inject Manifest Konfiguration
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      
      // Workbox Konfiguration für Caching
      workbox: {
        // Cache-Strategie: App Shell Model
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        
        // Runtime Caching für externe Ressourcen
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Jahr
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
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Jahr
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        
        // Cleanup-Strategie
        cleanupOutdatedCaches: true,
        
        // Skip Waiting für sofortige Aktivierung
        skipWaiting: true,
        
        // Clients Claim für sofortige Kontrolle
        clientsClaim: true,
      },
      
      // Dev-Options
      devOptions: {
        enabled: true,
        type: 'module',
      },
      
      // Include Assets
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
        'icons/*.png',
      ],
    }),
  ],
  
  // Pfad-Auflösung
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Build-Optionen
  build: {
    // Ziel für moderne Browser
    target: 'esnext',
    
    // Output-Verzeichnis
    outDir: 'dist',
    
    // Source Maps für Debugging
    sourcemap: true,
    
    // Chunk-Größe Warnung
    chunkSizeWarningLimit: 1000,
    
    // Rollup-Optionen
    rollupOptions: {
      output: {
        // Manuelle Chunks für besseres Caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animation: ['framer-motion'],
          state: ['zustand'],
        },
      },
    },
    
    // Minimierung
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  // CSS-Optionen
  css: {
    devSourcemap: true,
  },
  
  // Server-Optionen für Entwicklung
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  
  // Vorschau-Optionen
  preview: {
    port: 4173,
    host: true,
  },
  
  // Optimierungen
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand'],
  },
});
