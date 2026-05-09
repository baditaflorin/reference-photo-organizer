# Reference Photo Organizer

Live site: https://baditaflorin.github.io/reference-photo-organizer/

Repository: https://github.com/baditaflorin/reference-photo-organizer

Support: https://www.paypal.com/paypalme/florinbadita

Browser-based artist reference board with local image tagging, palettes, workspace save/import, and PNG/PDF export.

![Reference Photo Organizer screenshot](public/demo-screenshot.svg)

## Why

Reference Photo Organizer gives artists a local-first replacement for lightweight PureRef, Eagle, and Milanote reference workflows: drop an image folder, get palettes and content tags, arrange a board, save the whole workspace, and export a PNG mood-board or PDF reference sheet.

## What Works

- Import images from folders, file picker, drag and drop, clipboard, direct image URLs, or saved workspace JSON
- Keep working locally with IndexedDB restore for board title, layout, filters, settings, and imported images
- Save and re-import a portable workspace file
- Export PNG mood-boards, PDF reference sheets, and a clipboard-ready board summary
- Show version and commit in the published header, plus GitHub and PayPal links

## Limitations

- Folder picking and dropped-folder traversal still depend on browser support
- Direct URL import only works when the source site allows browser fetches
- Share links and cloud sync are intentionally out of scope for the static local-first build
- CLIP and fallback tags are both shown, but they do not yet have distinct confidence styling

## Quickstart

```bash
npm install
make install-hooks
make dev
```

## Checks

```bash
make lint
make test
make smoke
```

## Architecture

Mode A: Pure GitHub Pages. There is no runtime backend, no account system, no database server, and no frontend secrets.

```mermaid
flowchart LR
  Artist["Artist browser"] --> UI["React static app"]
  UI --> IDB["IndexedDB"]
  UI --> Worker["CLIP Web Worker"]
  Worker --> HF["Hugging Face model files"]
  UI --> Export["Canvas PNG / jsPDF"]
  Pages["GitHub Pages"] --> UI
```

## Documentation

Architecture: docs/architecture.md

Deployment: docs/deploy.md

Privacy: docs/privacy.md

ADRs: docs/adr/

Postmortem: docs/postmortem.md

Phase 3 postmortem: docs/postmortem-phase3.md

## Version

The published page displays the package version and build commit in the header.
