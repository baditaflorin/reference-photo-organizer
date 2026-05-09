# Phase 3 Postmortem

Date: 2026-05-09

## Audit Grids: Before vs After

| Audit                | Before                                               | After                                                                               |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Input audit          | 4 green / 6 yellow / 6 red / 1 gray                  | 12 green / 3 yellow / 0 red / 1 gray                                                |
| Output audit         | 2 green / 1 yellow / 4 red / 3 gray                  | 6 green / 1 yellow / 0 red / 3 gray                                                 |
| Controls audit       | 10 green / 6 yellow                                  | 18 green / 2 yellow                                                                 |
| Feature claims audit | several partial claims around portability and inputs | portability and input claims now mostly true; CLIP confidence styling still partial |

## Half-Baked Feature Triage Outcomes

- Clipboard import: finished.
- URL import: finished.
- Workspace export/import: finished.
- Persisted workspace settings and view state: finished.
- PWA/installability: kept but still secondary.
- Share links: not built, intentionally out of scope.

## Codebase Health: Before vs After

| Metric                                | Before | After |
| ------------------------------------- | ------ | ----- |
| DRY findings called out               | 3      | 2     |
| Dead exported helpers in core modules | 2      | 0     |
| TODO / FIXME / XXX / HACK count       | 0      | 0     |
| Real-user-path test gaps called out   | 5      | 3     |

## Stranger-Test Findings

Documented in `docs/phase3/stranger-test.md`.

Top 3 issues addressed in this phase:

1. The mixed text field was wired to URL import only.
2. Clipboard summary copy did not explain permission failure.
3. Folder import support caveats were implicit instead of visible.

## Documentation / Reality Mismatches Fixed

- README now mentions workspace save/import, clipboard routes, and current limitations.
- Input and output audits now reflect the shipped functionality.
- Phase 3 ADR 0071 records the stranger-test fixes.

## What Surprised Me

- The biggest usability gap was not a missing big feature. It was a mislabeled input path that quietly did the wrong thing.
- The browser-dependent folder APIs are still the most fragile part of the “drop a folder” promise.
- Workspace portability added more practical value than any visual change would have.

## Phase 3 Success Metrics Check

- Input audit green or ADR-backed gray: not fully hit. Three rows remain yellow because browser support and mobile validation are still incomplete.
- Output audit green or ADR-backed gray: effectively hit, with one honest yellow row for image-to-clipboard.
- Every production control does what the label says: mostly hit after the stranger-test fixes; folder import remains browser-conditional.
- Workspace export/import round-trip: hit, covered by unit and e2e checks.
- Persisted title/layout/settings across reload: hit.
- Import batches survive bad files and report outcomes: hit, covered by unit tests.

## The 5 Most Valuable Open Completeness Gaps

1. Distinct confidence styling for CLIP vs fallback tags.
2. Cancel support for very large imports.
3. Physical mobile-browser validation.
4. Image-to-clipboard export.
5. Further breakup of `useImageLibrary` into smaller orchestration units.

## Honest Take

Could a stranger use this app for their own real work, end to end, with zero help?

On desktop Chromium-class browsers: mostly yes.

Why yes:

- They can get images in through file picker, folder picker, drag/drop, paste, clipboard, URLs, or saved workspace files.
- They can get work back out as PNG, PDF, summary text, or a portable workspace file.
- Their board title, layout, filters, and settings survive reload.
- Bad files no longer sink the whole import.

Why not fully yes yet:

- Folder workflows still depend on browser support, and that is a real edge for strangers.
- Mobile behavior is still not field-tested in this phase.
- CLIP and fallback tags still look more equally certain than they really are.

So: it no longer feels like a toy for the core desktop local-first workflow, but it is not yet universally frictionless across every browser and device path.
