import { createAssetFromFile } from './imageProcessing';
import { mergeTags } from './tags';
import type { ImageAsset, ImageTag } from './types';

const DEMOS = [
  {
    name: 'warm-portrait-study.svg',
    tags: ['portrait', 'warm palette', 'soft lighting'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 740"><rect width="560" height="740" fill="#c99058"/><circle cx="280" cy="260" r="118" fill="#5d3f35"/><path d="M160 720c22-168 77-265 120-265s99 97 121 265z" fill="#23342d"/><circle cx="248" cy="238" r="14" fill="#f6d6b4"/><circle cx="312" cy="238" r="14" fill="#f6d6b4"/><path d="M232 323c38 30 82 30 120 0" fill="none" stroke="#f6d6b4" stroke-width="16" stroke-linecap="round"/></svg>`
  },
  {
    name: 'cool-city-reference.svg',
    tags: ['city', 'architecture', 'cool palette'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 520"><rect width="720" height="520" fill="#9bb7bd"/><path d="M0 250h720v270H0z" fill="#29393d"/><rect x="90" y="160" width="90" height="260" fill="#526f77"/><rect x="230" y="110" width="120" height="310" fill="#314e57"/><rect x="410" y="190" width="80" height="230" fill="#6f858b"/><rect x="535" y="135" width="105" height="285" fill="#415f67"/><path d="M0 420h720" stroke="#cf9b45" stroke-width="20"/></svg>`
  },
  {
    name: 'forest-light-study.svg',
    tags: ['forest', 'plant', 'dramatic lighting'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 520"><rect width="640" height="520" fill="#d7c68f"/><path d="M72 520 175 70l102 450z" fill="#33472e"/><path d="M260 520 350 34l108 486z" fill="#50624b"/><path d="M456 520 540 108l80 412z" fill="#27372b"/><path d="M0 374c128-60 250-80 640-32v178H0z" fill="#7b6d3f"/><circle cx="498" cy="116" r="46" fill="#fff0a7"/></svg>`
  },
  {
    name: 'gesture-pose-reference.svg',
    tags: ['pose reference', 'figure drawing', 'anatomy'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 760"><rect width="500" height="760" fill="#f0dfc2"/><circle cx="244" cy="152" r="45" fill="#6f4a38"/><path d="M244 197c-24 80-40 150-24 238" stroke="#6f4a38" stroke-width="34" stroke-linecap="round" fill="none"/><path d="M220 276 92 378M260 276l122-116M223 430 126 662M241 430l146 226" stroke="#6f4a38" stroke-width="30" stroke-linecap="round" fill="none"/><path d="M90 378c55 21 95 18 130-102" stroke="#cf9b45" stroke-width="8" fill="none"/></svg>`
  },
  {
    name: 'ocean-mood-reference.svg',
    tags: ['ocean', 'water', 'peaceful'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 500"><rect width="720" height="250" fill="#c8d4c9"/><rect y="250" width="720" height="250" fill="#426a75"/><path d="M0 308c96-28 150-28 250 0s170 28 250 0 130-28 220 0v192H0z" fill="#254d5a"/><path d="M0 258c110 22 192 20 300-2s224-20 420 8" fill="none" stroke="#fffaf0" stroke-width="9"/><circle cx="568" cy="116" r="58" fill="#cf9b45"/></svg>`
  },
  {
    name: 'object-still-life.svg',
    tags: ['still life', 'metal', 'high contrast'],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 520"><rect width="620" height="520" fill="#2b2925"/><ellipse cx="315" cy="400" rx="214" ry="48" fill="#11100f"/><rect x="220" y="172" width="170" height="205" rx="18" fill="#9d9a8f"/><path d="M390 226c86-10 120 108 16 124" fill="none" stroke="#c9c3b3" stroke-width="34"/><path d="M245 172h120v205H245z" fill="#d6d1c2" opacity=".45"/><circle cx="187" cy="332" r="72" fill="#9d6b53"/></svg>`
  }
];

export async function createDemoAssets() {
  const assets = await Promise.all(
    DEMOS.map(async (demo) => {
      const file = new File([demo.svg], demo.name, { type: 'image/svg+xml', lastModified: 1 });
      const asset = await createAssetFromFile(file);
      const demoTags: ImageTag[] = demo.tags.map((label) => ({ label, score: 0.95, source: 'demo' }));
      return {
        ...asset,
        tags: mergeTags(asset.tags, demoTags),
        clipStatus: 'tagged' as const
      };
    })
  );

  return assets satisfies ImageAsset[];
}
