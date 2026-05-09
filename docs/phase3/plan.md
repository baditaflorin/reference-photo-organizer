# Phase 3 Plan

Date: 2026-05-09

Prioritization rule: real-user impact first, code-health second.

## Ranked Enhancements

1. Continue batch imports when one file fails.
2. Record imported / duplicate / skipped / failed counts per batch.
3. Show file-level reasons and next steps for unsupported or corrupt images.
4. Persist workspace settings: board title, layout, CLIP preference, export-label preference.
5. Add downloadable workspace state export.
6. Add workspace state import from file.
7. Support paste of workspace state JSON.
8. Support paste of clipboard images.
9. Add clipboard-read import button with permission-aware fallback.
10. Add URL import for direct image URLs with CORS-aware guidance.
11. Add full workspace reset that clears persisted images and settings.
12. Add export manifest / provenance in workspace state and user-visible summary.
13. Add copy-to-clipboard board summary output.
14. Unify PNG and PDF export metadata formatting.
15. Create a canonical workspace model and schema version.
16. Add state migration layer for persisted workspace data.
17. Remove dead exported helpers and trim unused surface area.
18. Replace unsafe browser API casts with typed guards where possible.
19. Split `useImageLibrary` responsibilities into import/report/state helpers.
20. Add tests for import resilience, workspace round-trip, and persisted settings restore.
21. Update README to match actual inputs, outputs, and limitations.
22. Document out-of-scope outputs such as shareable URLs for binary-heavy local workspaces.
23. Add a lightweight settings panel where every setting does something real.
24. Add a stranger-test checklist and run it against a fresh browser session.

## Phase 3 Delivery Order

1. ADR batch for audit findings, input/output coverage, half-baked triage, persistence, and type-safety policy.
2. Workspace model and migration groundwork.
3. Import resilience, status ledger, and new input pathways.
4. Output completeness: state export/import, clipboard summary, provenance.
5. Settings persistence and full reset.
6. DRY and type-safety cleanup.
7. Tests, README alignment, stranger test, and postmortem.
