import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      // We already have a manual manifest.json in public/
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: '/forage/index.html',
        navigateFallbackDenylist: [/^\/forage\/manifest\.json$/],
        // Don't cache Google API calls — those need live data
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/sheets\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/accounts\.google\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  base: '/forage/',
  test: {
    environment: 'node',
    setupFiles: [],
  },
});
