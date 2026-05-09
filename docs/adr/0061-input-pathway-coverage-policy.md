# 0061 - Input Pathway Coverage Policy

## Status

Accepted

## Context

Artists commonly gather references through file uploads, folders, drag-drop, pasted screenshots, clipboard images, saved project files, and direct image URLs.

## Decision

Phase 3 supports these input routes:

- multi-image file picker
- folder picker where browser support exists
- drag-drop files and folders
- pasted images
- clipboard-read imports
- direct image URL import with CORS-aware failure messaging
- saved workspace file import
- pasted workspace JSON

Unsupported or browser-limited routes must surface an actionable explanation instead of failing silently.

## Consequences

Input logic needs typed route handlers, file-level resilience, and a shared import report contract.

## Alternatives Considered

Limiting input to file picker and folders was rejected because it leaves common real-world workflows incomplete.
