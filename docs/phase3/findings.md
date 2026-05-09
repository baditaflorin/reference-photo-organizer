# Phase 3 Findings

Date: 2026-05-09

## Top 5 Usability Gaps

1. Real users cannot bring work back out as a portable project. PNG and PDF exist, but the workspace itself is trapped in one browser.
2. Common input routes are missing: paste, clipboard import, and URL import.
3. Import resilience is weak. One bad file can derail a batch, and users do not get a clear per-file outcome summary.
4. Workspace settings are session-only. Title, layout, and CLIP preference do not survive reload.
5. Current status messaging is too thin. A stranger cannot easily tell what imported, what failed, what was skipped, and what to do next.

## Top 5 Half-Baked Features

1. CLIP auto-tagging: keep and finish.
   Reason: high-value feature, but it needs persisted preference, confidence surfacing, and better failure reporting.
2. Restored workspace: keep and finish.
   Reason: image restore exists, but the workspace concept is incomplete without settings and saved-project portability.
3. PWA/installability: keep but de-emphasize.
   Reason: technically present, not a top Phase 3 workflow, but docs must be honest.
4. Folder import in unsupported browsers: keep and finish.
   Reason: current behavior is browser-dependent with weak explanation.
5. "Replacement workflow" positioning: keep only if project portability and input completeness improve.

## Top 5 Codebase Pain Points

1. `useImageLibrary` is carrying too much orchestration.
2. Export behavior is duplicated across PNG and PDF code.
3. Persistence is image-only and not schema-versioned.
4. Input logic has unsafe casts and browser-specific assumptions spread across components.
5. No canonical workspace model ties together images, settings, reports, and export metadata.

## Top 5 Documentation / Reality Mismatches

1. README language around being a real replacement is ahead of saved-project portability.
2. "Auto-tagged by content" sounds more certain than the current mixed fallback-plus-CLIP model.
3. PWA capability exists but is not explained.
4. Exports exist, but provenance and reproducibility are undocumented.
5. Input caveats for unsupported browsers and unsupported image formats are missing.

## Fully Usable Means

1. A stranger can import a real local folder, including a few bad files, and still end up with a usable board plus a clear import report.
2. A stranger can leave, come back, and see the same workspace state without redoing setup.
3. A stranger can move a board to another browser or machine by exporting and importing a workspace file.
4. A stranger can get something lightweight out fast: PNG, PDF, and a clipboard-ready summary.
5. A stranger can tell what the app knows with confidence and what it could not do, without guessing.

## Phase 3 Success Metrics

1. Input audit reaches at least `green` or ADR-backed `gray` on every row.
2. Output audit reaches at least `green` or ADR-backed `gray` on every row.
3. Workspace export/import round-trip restores settings and image metadata exactly, and restores image blobs when the state file includes them.
4. Import batches survive corrupt or unsupported files and report imported / duplicate / skipped / failed counts.
5. Board title, layout, CLIP preference, and export-label preference persist across reload.
6. Every production control does exactly what its label implies on real data.
7. Codebase audit improves: fewer unsafe casts, fewer duplicated helpers, no dead exported helpers in core modules.

## Out Of Scope

- No backend, sync account system, or architecture mode change.
- No dark mode, command palette, motion polish, or visual redesign pass.
- No new export families beyond what directly improves existing workspace portability and current outputs.
- No custom training or remote inference service.
- No asset marketplace or shared cloud library.
