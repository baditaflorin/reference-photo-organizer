# Phase 3 Codebase Audit

Date: 2026-05-09

This document was updated after the main Phase 3 implementation batch to show what actually moved.

## DRY Violations

1. Image patching and persistence flow still live in [useImageLibrary.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/useImageLibrary.ts:1), though import/reporting/storage contracts are now extracted.
2. Some canvas export layout formatting is still independently expressed in PNG and PDF modules.

## SOLID Violations

1. [useImageLibrary.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/useImageLibrary.ts:1) still owns restore, import orchestration, CLIP orchestration, deletion, and toast behavior.
2. [imageProcessing.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/imageProcessing.ts:1) still mixes identity, decode, palette extraction, and blob/canvas conversion helpers.
3. [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/App.tsx:1) still coordinates export actions, but less workspace logic lives there now.

## Dead Code

- None found in the kept core modules after removing the stale exports identified in the baseline audit.

## TODO / FIXME / XXX / HACK Count

- Count: 0 in source files and docs outside generated assets.

## Type-Safety Holes

1. Boundary casts remain in a few legitimate browser or config seams: [fileDrop.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/fileDrop.ts:1), [clip.worker.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/workers/clip.worker.ts:1), and [vite.config.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/vite.config.ts:1).
2. Core workspace import/export paths are now validated with shared Zod schemas instead of ad hoc casts.

## Inconsistent Patterns

1. Errors now converge more consistently on import reports plus toasts, but CLIP retry behavior still has bespoke handling.
2. Workspace state is now canonicalized under `WorkspaceMeta`, reducing the old split between session-only and persisted state.
3. Export provenance is shared, though export rendering still has per-target layout logic.

## Test Coverage Holes

1. Clipboard permission-denied flows are still not directly unit-tested.
2. Mobile picker behavior is still uncovered.
3. Share links remain out of scope and therefore untested.

## Before / After Snapshot

| Metric                                  | Before | After |
| --------------------------------------- | ------ | ----- |
| DRY findings called out                 | 3      | 2     |
| Dead exported helpers in core modules   | 2      | 0     |
| TODO / FIXME / XXX / HACK count         | 0      | 0     |
| Real-user-path unit/e2e gaps called out | 5      | 3     |
