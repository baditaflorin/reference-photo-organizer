# 0013 - Testing Strategy

## Status

Accepted

## Context

The app needs confidence in pure logic and the browser happy path.

## Decision

Use Vitest for logic modules and Playwright for the smoke path. `make test` runs unit tests. `make smoke` builds the Pages output, serves it under `/reference-photo-organizer/`, imports a fixture image, and verifies PNG export.

## Consequences

Checks stay local and fast enough for pre-push.

## Alternatives Considered

GitHub Actions were rejected by project constraint. Manual browser-only testing was too weak for exports and Pages base-path behavior.
