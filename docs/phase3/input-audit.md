# Phase 3 Input Audit

Date: 2026-05-09

App under audit: Reference Photo Organizer `v0.1.0`

Status legend:

- `green`: works fully on real user data
- `yellow`: works partially or with important caveats
- `red`: claimed by UI or implied by workflow, but not built end-to-end
- `gray`: not currently built and not yet claimed

| Input pathway                           | Status   | Current behavior                                                               | Gaps                                                                                    |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| File picker: multi-image                | `green`  | Imports supported image files and keeps a per-file import report               | None in the current surface                                                             |
| Folder picker                           | `yellow` | Imports folders where `webkitdirectory` exists and now explains fallback       | Browser support is still uneven across engines                                          |
| Drag and drop files                     | `green`  | Imports dropped images with dedupe and per-file outcome reporting              | None in the current surface                                                             |
| Drag and drop folders                   | `yellow` | Traverses dropped directories when `webkitGetAsEntry` exists                   | Browser support is still engine-dependent                                               |
| Demo/sample loader                      | `green`  | Demo board loads through the same persistence and reporting flow               | None in the current surface                                                             |
| Restored autosave                       | `green`  | Restores images, board title, layout, active tag, selected image, and settings | None in the current surface                                                             |
| Start fresh                             | `green`  | `Clear library` clears images; `Factory reset` clears the full workspace       | None in the current surface                                                             |
| Paste image from clipboard              | `green`  | Global paste imports copied screenshots and image files                        | Browser clipboard permissions can still block access, but the app explains that clearly |
| Paste image URL or state JSON           | `green`  | Global paste and the text field route through the same import parser           | None in the current surface                                                             |
| Clipboard read button                   | `green`  | Reads image clipboard items when allowed and falls back to text                | Browser permission prompts still vary by engine                                         |
| URL import                              | `green`  | Imports direct image URLs and explains blocked/CORS cases                      | Cross-origin sites can still refuse browser fetches                                     |
| Import saved app state                  | `green`  | Imports exported workspace JSON with image blobs and workspace metadata        | None in the current surface                                                             |
| Deep link / share link restore          | `gray`   | Not built                                                                      | Explicitly out of scope for the local-first Pages mode                                  |
| Mobile picker                           | `yellow` | Standard file inputs should work; workspace/file routes are the same           | Still not tested on a physical phone in this pass                                       |
| Multi-file progress and partial success | `green`  | Shows progress, keeps good files, and reports duplicate/skipped/failed counts  | No cancel control yet for very large imports                                            |
| Unsupported format handling             | `green`  | Skips known unsupported formats with artist-language next steps                | Browser-native decode gaps remain for some niche formats                                |
| Corrupted file handling                 | `green`  | Isolates decode failures and continues the batch                               | None in the current surface                                                             |

## Summary

- `green`: 12
- `yellow`: 3
- `red`: 0
- `gray`: 1

## Highest-risk gaps

1. Folder and dropped-folder support are still browser-dependent, even with clearer fallback guidance.
2. Mobile picker behavior is still inferred rather than tested on a physical device.
3. Very large imports show progress and partial success, but not cancellation yet.
