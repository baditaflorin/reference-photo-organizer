# Phase 3 Feature Claims Audit

Date: 2026-05-09

Sources audited:

- `README.md`
- in-app text
- ADR summaries

| Claim                                                     | Status              | Notes                                                                                |
| --------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| Drop an image folder                                      | `shipped fully`     | Works in supported browsers and now explains fallback routes                         |
| Auto-tagged by content                                    | `shipped partially` | CLIP path works, but fallback and CLIP tags still share the same visual weight       |
| Color palette per image                                   | `shipped fully`     | Works for supported decoded images                                                   |
| Export PNG mood-board                                     | `shipped fully`     | Works                                                                                |
| Export PDF reference sheet                                | `shipped fully`     | Works                                                                                |
| Local-first and no backend                                | `shipped fully`     | True                                                                                 |
| Version and commit shown in page header                   | `shipped fully`     | True                                                                                 |
| Reference workflow replacement for PureRef/Eagle/Milanote | `shipped partially` | Much closer now with workspace portability, but still limited by browser format gaps |
| Quickstart in README works                                | `shipped fully`     | Current local setup path is valid                                                    |
| PWA installable                                           | `shipped partially` | Manifest and service worker exist; install remains secondary and lightly documented  |
| Workspace portability                                     | `shipped fully`     | Save/import workspace JSON now works end to end                                      |
| Clipboard and paste import                                | `shipped fully`     | Works with permission-aware error handling                                           |
| URL import                                                | `shipped fully`     | Works for direct image URLs with clear blocked-download messaging                    |

## Mismatches to prioritize

1. "Auto-tagged by content" still reads stronger than the current mixed fallback-plus-CLIP presentation.
2. "Replacement" language is now defensible for single-user local workflows, but still not for every browser/file-format edge case.
3. PWA capability exists in code, but the product still does not actively guide people through install.
