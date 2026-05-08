import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

function readCommit() {
  if (process.env.GIT_COMMIT) {
    return process.env.GIT_COMMIT;
  }

  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'local';
  }
}

const base = process.env.PAGES_BASE ?? '/reference-photo-organizer/';

export default defineConfig({
  base,
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          query: ['@tanstack/react-query']
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_SHA__: JSON.stringify(readCommit()),
    __REPOSITORY_URL__: JSON.stringify('https://github.com/baditaflorin/reference-photo-organizer'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita')
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Reference Photo Organizer',
        short_name: 'Ref Organizer',
        description: 'Local-first artist reference organizer with CLIP tags and export tools.',
        theme_color: '#f5f2ea',
        background_color: '#f5f2ea',
        display: 'standalone',
        scope: base,
        start_url: base,
        icons: [
          {
            src: `${base}favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3_000_000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/huggingface\.co\/Xenova\/clip-vit-base-patch32\/resolve\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'clip-model-cache',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: []
  }
});
