# Phase 3 Feature Claims Audit

Date: 2026-05-09

Sources audited:

- `README.md`
- in-app text
- ADR summaries

| Claim                                                     | Status              | Notes                                                                                       |
| --------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| Drop an image folder                                      | `shipped fully`     | Works in supported browsers                                                                 |
| Auto-tagged by content                                    | `shipped partially` | CLIP path exists, but fallback tags are mixed into the same UI without confidence           |
| Color palette per image                                   | `shipped fully`     | Works for supported decoded images                                                          |
| Export PNG mood-board                                     | `shipped fully`     | Works                                                                                       |
| Export PDF reference sheet                                | `shipped fully`     | Works                                                                                       |
| Local-first and no backend                                | `shipped fully`     | True                                                                                        |
| Version and commit shown in page header                   | `shipped fully`     | True                                                                                        |
| Reference workflow replacement for PureRef/Eagle/Milanote | `shipped partially` | The core board works, but saved project portability and richer input paths are missing      |
| Quickstart in README works                                | `shipped fully`     | Current local setup path is valid                                                           |
| PWA installable                                           | `shipped partially` | Manifest and service worker exist, but install workflow is not documented or surfaced in UI |

## Mismatches to prioritize

1. "Auto-tagged by content" reads stronger than the actual mixed fallback-plus-CLIP behavior.
2. "Replacement" language is ahead of the app because portable workspace export/import is missing.
3. PWA capability exists in code, but the product does not help users understand or use it.
