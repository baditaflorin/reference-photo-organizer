# 0001 - Deployment Mode

## Status

Accepted

## Context

The app imports local artist reference images, extracts tags and palettes, creates a mood-board collage, and exports PNG/PDF files. V1 does not require accounts, collaboration, cross-device sync, server-side mutations, or runtime secrets.

## Decision

Use Mode A: Pure GitHub Pages. The app is a static Vite build served from GitHub Pages. Image import, CLIP-assisted tagging, palette extraction, collage rendering, PDF export, and persistence all happen in the browser.

## Consequences

User images stay local. The public surface is static. Large ML and PDF code is lazy-loaded. GitHub Pages cannot set custom COOP/COEP headers, so the CLIP worker uses single-threaded WASM and the app falls back to local tags if the model cannot initialize.

## Alternatives Considered

Mode B was unnecessary because v1 data is user-provided, not centrally generated. Mode C was rejected because a runtime server would add deployment, secrets, and security burden without a v1 requirement.
