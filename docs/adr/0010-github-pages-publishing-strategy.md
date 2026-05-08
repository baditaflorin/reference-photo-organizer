# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live GitHub Pages URL is a first-class deliverable. The site must work without GitHub Actions and without a runtime server.

## Decision

Publish from the `main` branch `/docs` folder. Vite builds into `/docs` with `base` set to `/reference-photo-organizer/`. Hashed assets are emitted under `/docs/assets`. `404.html` is copied from `index.html`.

## Consequences

The `/docs` directory is intentionally committed. The build cleans generated Pages assets without deleting Markdown docs. Rollback is a normal git revert.

## Alternatives Considered

A `gh-pages` branch was more moving parts for local-only publishing. Publishing from repository root would mix source files with built assets.
