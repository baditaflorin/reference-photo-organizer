# Phase 3 Output Audit

Date: 2026-05-09

| Output pathway                    | Status   | Current behavior                             | Gaps                                                                 |
| --------------------------------- | -------- | -------------------------------------------- | -------------------------------------------------------------------- |
| PNG mood-board export             | `green`  | Produces downloadable PNG board              | No provenance metadata or deterministic export contract documented   |
| PDF reference sheet export        | `green`  | Produces downloadable PDF                    | No provenance metadata or deterministic export contract documented   |
| Copy result to clipboard          | `red`    | Not supported                                | No lightweight way to take a summary into chat, notes, or task tools |
| Downloadable workspace state file | `red`    | Not supported                                | Cannot move a board between browsers or machines                     |
| Import-after-export round trip    | `red`    | Not possible because state export is missing | No canonical project format                                          |
| Shareable URL                     | `gray`   | Not built                                    | Needs explicit static-mode constraint policy                         |
| Print-friendly view               | `gray`   | Not built                                    | PDF partly covers this, but there is no direct print route           |
| API/automation-ready export       | `gray`   | Not built                                    | Out of scope for current surface area                                |
| Screenshot / image copy workflow  | `yellow` | PNG export exists                            | No direct copy image or quick-save summary                           |
| Export summary / manifest         | `red`    | Not supported                                | User cannot inspect what was exported, with which settings           |

## Summary

- `green`: 2
- `yellow`: 1
- `red`: 4
- `gray`: 3

## Highest-risk gaps

1. No canonical workspace export/import.
2. No clipboard-friendly output.
3. No export manifest or provenance.
4. No policy for share links in a local-first app.
