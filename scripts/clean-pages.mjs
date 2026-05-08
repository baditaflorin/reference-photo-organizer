import { rmSync } from 'node:fs';

for (const path of [
  'docs/assets',
  'docs/favicon.svg',
  'docs/index.html',
  'docs/404.html',
  'docs/manifest.webmanifest',
  'docs/registerSW.js',
  'docs/sw.js',
  'docs/sw.js.map',
  'docs/workbox-dcde9eb3.js',
  'docs/workbox-dcde9eb3.js.map'
]) {
  rmSync(path, { recursive: true, force: true });
}
