# Phase 3 Controls Audit

Date: 2026-05-09

| Control                  | Status   | Notes                                                                                  |
| ------------------------ | -------- | -------------------------------------------------------------------------------------- |
| `Folder` button          | `yellow` | Works where `webkitdirectory` exists; no unsupported-browser guidance                  |
| `Images` button          | `green`  | Standard multi-file import                                                             |
| `Demo board` button      | `green`  | Loads sample content                                                                   |
| `CLIP auto-tags` toggle  | `yellow` | Changes current-session behavior but does not persist                                  |
| Search input             | `green`  | Filters by name, path, and tags                                                        |
| Board title input        | `yellow` | Updates current export title but does not persist                                      |
| Layout segmented control | `yellow` | Changes view, but choice does not persist                                              |
| `Run CLIP tags` button   | `yellow` | Retags current images, but failures stop early and are not fully explained             |
| `Clear library` button   | `yellow` | Clears images, but there is no full workspace reset because settings are not persisted |
| `PNG` export             | `green`  | Works on current visible board                                                         |
| `PDF` export             | `green`  | Works on current visible board                                                         |
| Tag filter buttons       | `green`  | Toggle active tag filter                                                               |
| Tag `Clear` button       | `green`  | Clears active tag filter                                                               |
| Image remove button      | `green`  | Removes image and persists removal                                                     |
| Notice dismiss button    | `green`  | Dismisses transient toast                                                              |
| GitHub / PayPal links    | `green`  | Open external links                                                                    |

## Control findings

1. There are no obvious stub buttons in production UI.
2. Several controls are only session-deep, not workspace-deep: CLIP toggle, board title, and layout.
3. Error and status controls are too shallow for real work because import outcomes collapse into one toast.
