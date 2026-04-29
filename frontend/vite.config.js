import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ── Progressive Web App Configuration ──
    // VitePWA auto-generates a service worker using Workbox under the hood.
    // It handles precaching of the app shell and runtime caching of API/images.
    VitePWA({
      // 'autoUpdate' means the new service worker activates immediately when
      // available — no "update available" prompt needed. Good for apps where
      // users shouldn't be on stale versions.
      registerType: 'autoUpdate',

      // ── App Manifest ──
      // This tells the browser how to display the app when installed to
      // the home screen (icon, splash screen, standalone window, etc.)
      manifest: {
        name: 'Tirthing — Pilgrimage Planner',
        short_name: 'Tirthing',
        description: 'Plan your sacred pilgrimage journey across India',

        // Saffron theme to match the app's identity
        theme_color: '#fb923c',
        background_color: '#fff4d6',

        // 'standalone' removes the browser chrome (address bar, tabs) so
        // the app feels native when launched from the home screen
        display: 'standalone',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            // The 'maskable' purpose ensures the icon looks correct on Android
            // devices that apply circular or squircle masks to app icons
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      // ── Workbox Runtime Caching Strategies ──
      // Each strategy is chosen based on how the data is used and how
      // tolerant we are of staleness for that resource type.
      workbox: {
        // Precache all built assets (JS, CSS, HTML) from the Vite build output.
        // These are versioned by content hash, so CacheFirst is safe.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          // ── APP SHELL (fonts, static assets loaded at runtime) ──
          // Strategy: CacheFirst
          // WHY: Fonts and static assets change only on new deployments.
          // Once cached, there's no benefit in re-fetching them on every
          // visit. The 30-day expiry ensures eventual freshness.
          {
            urlPattern: /\.(woff2?|ttf|eot|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-shell-fonts',
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },

          // ── API CALLS (places + itineraries) ──
          // Strategy: NetworkFirst
          // WHY: API data (itinerary plans, place listings) should always
          // be fresh when the user has connectivity — they may have just
          // generated a new plan. But when offline, the cached version is
          // infinitely better than an error screen. 24h expiry prevents
          // serving very stale data when the user comes back online.
          {
            urlPattern: /\/api\/(place|itinerary)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data',
              expiration: {
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              },
              // Cache successful responses only (not 404s or 500s)
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // ── IMAGES (Cloudinary place photos) ──
          // Strategy: CacheFirst
          // WHY: Place images are uploaded once and never change (same URL =
          // same photo). CacheFirst avoids re-downloading large images on
          // every visit. maxEntries prevents the cache from growing unbounded
          // on devices with limited storage.
          {
            urlPattern: /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
})
