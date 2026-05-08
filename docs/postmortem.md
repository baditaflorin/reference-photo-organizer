# Postmortem

## What Was Built

V1 is a static GitHub Pages app for importing local image folders, generating palette and fallback tags, lazy-running CLIP-assisted tags in a worker, arranging a mood-board, persisting the local library in IndexedDB, and exporting PNG/PDF reference sheets.

## Deployment Mode In Hindsight

Mode A was the correct choice. V1 has no accounts, shared state, secrets, or server mutations. The only caveat is browser ML: GitHub Pages cannot set cross-origin isolation headers, so the CLIP worker forces single-threaded WASM and the app keeps local fallback tags when the model cannot initialize.

## What Worked

The Pages-only approach kept deployment simple. Browser APIs cover folder import, canvas rendering, PDF generation, local persistence, and PWA behavior well enough for v1.

## What Did Not

The publish directory is also named `docs`, so the build had to be adjusted to clean generated assets without deleting ADRs and deployment docs.

## Surprises

The older Xenova Transformers package had critical npm audit findings through its ONNX/protobuf chain. The implementation moved to `@huggingface/transformers`.

## Accepted Tech Debt

CLIP labels use zero-shot classification against a curated candidate list rather than a custom vector search UI. Drag positioning is not yet a freeform PureRef-style canvas.

## Next Improvements

1. Add manual tag editing and saved board presets.
2. Add freeform drag, resize, crop, and locked composition layers.
3. Add optional OPFS storage for very large libraries.

## Time

Estimated: 6-8 hours for a polished v1 scaffold and implementation. Actual in this session: about 2 hours of focused build time.
