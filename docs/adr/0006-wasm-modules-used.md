# 0006 - WASM Modules Used

## Status

Accepted

## Context

CLIP tagging needs browser-side ML. GitHub Pages cannot set COOP/COEP headers.

## Decision

Use `@huggingface/transformers` with CLIP zero-shot image classification in a Web Worker through Comlink. ONNX Runtime Web WASM is lazy-loaded behind image import or manual retagging. The worker sets `numThreads = 1`.

## Consequences

The initial app stays lightweight and private. CLIP can be slower than a server GPU path, and browsers that cannot initialize the model fall back to local palette/filename/shape tags.

## Alternatives Considered

Server-side CLIP was rejected because it would force Mode C. The older Xenova package was rejected because `npm audit` reported critical advisories.
