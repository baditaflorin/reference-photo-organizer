# Phase 3 Controls Audit

Date: 2026-05-09

| Control                  | Status   | Notes                                                                                  |
| ------------------------ | -------- | -------------------------------------------------------------------------------------- |
| `Folder` button          | `yellow` | Works where folder selection is supported and now explains fallback routes             |
| `Images` button          | `green`  | Standard multi-file import                                                             |
| `Demo board` button      | `green`  | Loads sample content through the same persistence flow                                 |
| `Clipboard` button       | `green`  | Imports clipboard images or text with browser-permission messaging                     |
| `Workspace` button       | `green`  | Imports saved workspace JSON                                                           |
| `CLIP auto-tags` toggle  | `green`  | Persists and affects future imports                                                    |
| Search input             | `green`  | Filters by name, path, and tags                                                        |
| Board title input        | `green`  | Updates export title and persists                                                      |
| Layout segmented control | `green`  | Changes view and persists                                                              |
| `Run CLIP tags` button   | `yellow` | Retags current images and reports failure, but still stops after the first CLIP outage |
| `Clear library` button   | `green`  | Clears images and resets search/tag selection                                          |
| `PNG` export             | `green`  | Works on current visible board                                                         |
| `PDF` export             | `green`  | Works on current visible board                                                         |
| `Save workspace` button  | `green`  | Exports a portable workspace file                                                      |
| `Copy summary` button    | `green`  | Copies summary text or explains clipboard failure                                      |
| `Factory reset` button   | `green`  | Clears images and persisted workspace settings                                         |
| Tag filter buttons       | `green`  | Toggle active tag filter                                                               |
| Tag `Clear` button       | `green`  | Clears active tag filter                                                               |
| Image remove button      | `green`  | Removes image and persists removal                                                     |
| Notice dismiss button    | `green`  | Dismisses transient toast                                                              |
| GitHub / PayPal links    | `green`  | Open external links                                                                    |

## Control findings

1. There are no obvious stub buttons in production UI.
2. The main remaining yellow control is folder import because the browser API itself is not universal.
3. CLIP retry still halts on the first model outage, even though the failure is now clearly surfaced.
