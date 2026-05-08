# 0002 - Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The app needs import, tagging, palette extraction, board display, persistence, and export without a backend.

## Decision

Use feature folders under `src/features/`: `library` owns import, palette, tags, CLIP, filters, and storage; `export` owns PNG/PDF file generation. `src/components/` contains reusable UI surfaces. The CLIP model runs in `src/workers/clip.worker.ts`.

## Consequences

Feature logic is testable without rendering the whole app. Browser-only APIs stay behind explicit modules.

## Alternatives Considered

A single large React component was rejected because it would make import, tagging, and export behavior harder to test.
