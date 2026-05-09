# Phase 2 Substance - Real-Data Audit

Date: 2026-05-09

Scope: v1 happy path for Reference Photo Organizer: import folder/images, generate palettes and tags, view board, export PNG/PDF.

## Ten Real-World Inputs

| #   | Input                                                                                                                        | What v1 did                                                                                                         | What it should have done                                                                                                              | Why it failed or struggled                                                                                       | Failure mode                   | Manual work v1 forces                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| 1   | Clean art-reference folder: 40 JPEG/PNG files, nested folders by subject                                                     | Imports, extracts palettes, creates fallback tags, starts CLIP when enabled, exports                                | Same, plus preserve folder grouping and confidence                                                                                    | Stable IDs use path, but UI does not expose folder clusters or per-tag confidence                                | Mostly works, low intelligence | User must search/filter manually to recover folder intent                       |
| 2   | iPhone camera dump: HEIC photos, JPEGs with EXIF orientation, burst duplicates                                               | JPEGs likely import; HEIC fails during image decode; orientation behavior depends on browser                        | Accept supported files, skip unsupported with clear reason, normalize EXIF orientation, detect near-duplicates                        | Browser `Image()` decode is the only format check; no per-file error boundary; no EXIF or duplicate intelligence | Silent or confusing failure    | User must remove HEICs, rotate/fix images elsewhere, delete duplicates manually |
| 3   | Screenshot/reference dump: PNG screenshots, long vertical web captures, UI screenshots, filenames like `Screenshot 2026-...` | Imports; shape tags call many long captures `portrait`; palette often dominated by white/black UI chrome            | Infer screenshot/web-capture/document-like images, extract central content palette, tag as screenshot/UI/reference sheet when obvious | Tags are generic shape/palette/filename plus CLIP labels; no domain-specific screenshot handling                 | Wrong-but-confident            | User must mentally ignore bad tags and palettes                                 |
| 4   | Mixed inspiration folder from Pinterest/Discord: WebP, GIF, JPEG, PNG, repeated filenames, no useful naming                  | Static formats import; GIF becomes first-frame still; repeated names can collapse if dragged without relative paths | Preserve every distinct file, mark animated files as first-frame/still, infer content from image not filename                         | Dedupe key ignores folder path when drag entries lack `webkitRelativePath`; animation is not surfaced            | Silent data loss risk          | User must check counts and notice missing/flattened files                       |
| 5   | Large DSLR folder: 150 24-48MP JPEGs, 500MB total                                                                            | Sequential decode, canvas sampling, IndexedDB writes on main path; progress exists but no cancel                    | Stream/queue in workers, generate thumbnails, allow cancel, maintain responsiveness                                                   | Palette extraction and resizing happen in the UI thread; no size budget or cancellation                          | Slow, possibly stuck           | User waits, cannot stop cleanly, may refresh and lose partial trust             |
| 6   | Huge reference archive: 1,200 images across nested subject folders                                                           | Likely imports for a long time; board renders all cards; export attempts all visible images                         | Apply import budget, progressive rendering/virtualization, clear too-many state, export selected/filtered chunks predictably          | No state for loaded-too-many; no virtualized board; export loops every image                                     | Performance cliff              | User must manually reduce folder size before using app                          |
| 7   | Corrupted/truncated JPEG in otherwise valid folder                                                                           | Import loop rejects on bad image and stops the batch; earlier images may remain                                     | Skip only the corrupt file, continue batch, report file-level reason and next step                                                    | `createAssetFromFile` errors are not isolated per file                                                           | Silent or half-loaded          | User must find the bad file by trial and error                                  |
| 8   | Transparent PNG/SVG logo, line art, alpha-heavy design references                                                            | Imports; palette may be sparse/default; export flattens over warm paper                                             | Preserve transparency intent or explicitly say it was flattened; extract line/background colors separately                            | Alpha handling skips many pixels, export fills background, no notice                                             | Wrong-but-confident            | User must inspect exports to see transparency changed                           |
| 9   | RAW/PSD/TIFF/procreate-adjacent artist assets mixed with JPEGs                                                               | Unsupported image-like files may be filtered or fail decode without clear recovery                                  | Detect unsupported creative formats before decode, list skipped files and recommended conversion                                      | Support is browser-decoder-dependent; no format taxonomy                                                         | Silent or unclear failure      | User must know which formats browsers support                                   |
| 10  | Empty folder / folder with `.DS_Store`, sidecars, hidden files, and no images                                                | Shows `No image files found.`                                                                                       | Same, plus count skipped non-images and explain accepted formats                                                                      | Current message is short but not domain-specific                                                                 | Recoverable but thin           | User must infer whether the folder was empty or files were unsupported          |

At least five inputs visibly expose v1 weaknesses today: #2, #3, #5, #6, #7, plus #8/#9 depending on the browser.

## Top 5 Logic Gaps

1. Import is not file-level resilient. One corrupt/unsupported image can stop the batch instead of producing an accepted/skipped/error ledger.
2. Format understanding is browser-accidental. HEIC, TIFF, RAW, PSD, animated GIF/WebP, transparency, color profiles, and EXIF orientation are not classified in domain terms.
3. Tag confidence is too flat. Fallback tags, CLIP tags, demo tags, filename guesses, and palette guesses appear as comparable pills even when confidence differs sharply.
4. Real folder scale is not modeled. There is no explicit state or budget for huge files, many files, cancellation, virtualization, or export chunking.
5. Exports lack provenance and uncertainty. PNG/PDF output does not carry enough metadata to reproduce the board, explain low-confidence tags, or audit skipped files.

## Top 3 Intuition Failures

1. A mixed folder can finish in a half-imported state without telling the user exactly which file caused trouble.
2. Unsupported artist formats feel like app failure rather than a clear "this browser cannot decode this format; convert to JPEG/PNG/WebP" outcome.
3. A tag pill looks authoritative even when it came from filename/shape fallback rather than CLIP or stronger image evidence.

## Top 3 "Feels Stupid" Moments

1. The user has to know which image formats the browser supports.
2. The user has to notice duplicates, missing files, animation flattening, and transparency flattening themselves.
3. The user has to manually interpret messy folders instead of the app inferring folder themes, outliers, skipped files, and confidence.

## What "Smart" Means For This Product

1. On import, the app produces a useful ledger: imported, skipped, duplicate, unsupported, corrupt, low-confidence, and still-processing.
2. Every image gets artist-relevant guesses with visible confidence: subject, composition/orientation, lighting/mood, palette temperature, medium/screenshot/animation where detectable.
3. The app continues through messy folders and tells the user exactly what happened in their language.
4. Large folders remain responsive: progress is truthful, long work is cancellable, and rendering/export does not freeze the board.
5. Exports are reproducible artifacts: stable ordering, stable metadata, source summary, app version, commit, schema version, and confidence/skipped-file notes.

## Phase 2 Substance Success Metrics

1. At least 7 of the 10 real-world fixtures complete import -> board -> PNG/PDF export with no manual intervention beyond choosing files.
2. 100% of corrupt/unsupported/empty inputs produce actionable domain-language messages and preserve already imported work.
3. 100% of inferred tags/palettes/export entries expose source and confidence.
4. Re-running the same fixture produces deterministic JSON state and byte-identical PNG/PDF exports.
5. A 150-image / 500MB fixture keeps the UI responsive, shows progress within 300ms, and offers cancellation after 5s.
6. A 1,200-image fixture enters an intentional `loaded-too-many` or chunked-processing state instead of freezing or pretending everything is normal.
7. Import pass/fail/skipped counts match fixture expectations exactly for all 10 fixtures.

## Out Of Scope

- No new product surface area beyond the existing import, board, palette/tag, PNG export, PDF export, persistence, and status flows.
- No visual polish, dark mode, command palette, landing page, OG images, or cosmetic redesign.
- No backend, auth, cloud sync, server-side CLIP, or architecture mode change.
- No new export formats beyond improving the existing PNG/PDF outputs.
- No training custom ML models.
- No marketplace/library of public reference images.
