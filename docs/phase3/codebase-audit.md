# Phase 3 Codebase Audit

Date: 2026-05-09

This is a measurement-only baseline before Phase 3 changes.

## DRY Violations

1. Export metadata and export-title logic are duplicated between [moodBoardPng.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/export/moodBoardPng.ts:1) and [referencePdf.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/export/referencePdf.ts:1).
2. Image patching and persistence flow are duplicated across import, retag, remove, and clear paths in [useImageLibrary.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/useImageLibrary.ts:1).
3. Truncation helpers and presentation formatting exist separately in PNG and PDF export modules.

## SOLID Violations

1. [useImageLibrary.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/useImageLibrary.ts:1) owns restore, import, dedupe, CLIP orchestration, deletion, persistence, and toast behavior.
2. [imageProcessing.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/imageProcessing.ts:1) mixes file identity, decode, palette extraction, canvas export utilities, and blob conversion.
3. [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/App.tsx:1) owns layout plus export orchestration and workspace-level state.

## Dead Code

1. `tagMatches` in [tags.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/tags.ts:121) is exported but unused.
2. `openLibraryDb` in [storage.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/storage.ts:7) is exported, but only internal storage helpers use it.

## TODO / FIXME / XXX / HACK Count

- Count: 0 in source files and docs outside generated assets.

## Type-Safety Holes

1. Unsafe casts in [Dropzone.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/components/Dropzone.tsx:116), [fileDrop.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/fileDrop.ts:23), [imageProcessing.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/imageProcessing.ts:7), [storage.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/features/library/storage.ts:27), [clip.worker.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/src/workers/clip.worker.ts:16), and [vite.config.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-reference-photo-organizer/vite.config.ts:7).
2. `unknown` appears at boundary points without shared narrowing helpers.

## Inconsistent Patterns

1. Errors surface as generic toasts in some places and silent batch interruption in others.
2. Session state and persisted state are split ad hoc across components and hooks.
3. Export modules each define their own tiny formatting helpers instead of sharing a board-export contract.

## Test Coverage Holes

1. No tests for corrupt/unsupported image handling.
2. No tests for persistence restore behavior beyond images.
3. No tests for state export/import because the feature does not exist.
4. No tests for paste, clipboard, or URL import routes because the features do not exist.
5. No tests for shareability or canonical workspace round-trip.
