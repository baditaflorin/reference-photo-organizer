# Phase 3 Input Audit

Date: 2026-05-09

App under audit: Reference Photo Organizer `v0.1.0`

Status legend:

- `green`: works fully on real user data
- `yellow`: works partially or with important caveats
- `red`: claimed by UI or implied by workflow, but not built end-to-end
- `gray`: not currently built and not yet claimed

| Input pathway                           | Status   | Current behavior                                             | Gaps                                                                           |
| --------------------------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| File picker: multi-image                | `green`  | Imports supported image files from local picker              | No per-file skip ledger                                                        |
| Folder picker                           | `yellow` | Imports image folders with `webkitdirectory` where supported | Browser-dependent, no unsupported-browser fallback copy                        |
| Drag and drop files                     | `green`  | Imports dropped images                                       | No per-file skip ledger                                                        |
| Drag and drop folders                   | `yellow` | Uses `webkitGetAsEntry` traversal when available             | Browser-dependent, fallback is weak                                            |
| Demo/sample loader                      | `green`  | Demo board loads and persists                                | No distinction between demo and user workspace                                 |
| Restored autosave                       | `yellow` | Restores image blobs from IndexedDB                          | Board title, filters, layout, selected tag, and CLIP preference do not restore |
| Start fresh                             | `yellow` | Clear library empties stored images                          | Does not clear non-image session state because that state is not persisted     |
| Paste image from clipboard              | `red`    | Not supported                                                | Common artist workflow missing                                                 |
| Paste image URL or state JSON           | `red`    | Not supported                                                | No paste surface at all                                                        |
| Clipboard read button                   | `red`    | Not supported                                                | No permission-aware clipboard import                                           |
| URL import                              | `red`    | Not supported                                                | No browser fetch route or CORS guidance                                        |
| Import saved app state                  | `red`    | Not supported                                                | No downloadable workspace file to re-import                                    |
| Deep link / share link restore          | `gray`   | Not built                                                    | Local-first constraints need an explicit policy                                |
| Mobile picker                           | `yellow` | Native file input should work on mobile browsers             | Not documented or tested; no mobile-specific copy                              |
| Multi-file progress and partial success | `yellow` | Batch progress exists                                        | One bad file can stop the whole import                                         |
| Unsupported format handling             | `red`    | Browser decode failure bubbles up poorly                     | No artist-language explanation or skip summary                                 |
| Corrupted file handling                 | `red`    | A bad image can break the batch                              | No isolate-and-continue behavior                                               |

## Summary

- `green`: 4
- `yellow`: 6
- `red`: 6
- `gray`: 1

## Highest-risk gaps

1. No paste or clipboard routes.
2. No import of saved workspace state.
3. No per-file resilience for corrupt or unsupported files.
4. Restored autosave is incomplete because only images persist.
5. URL import and its limitations are completely absent.
