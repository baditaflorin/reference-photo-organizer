# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Browser APIs can fail because of storage quotas, unsupported image formats, canvas availability, or model initialization.

## Decision

Async operations catch failures at feature boundaries and show short notices. CLIP failure is non-fatal because fallback tags are always generated first. Export failures do not mutate the library.

## Consequences

The user can keep organizing references even when browser ML is unavailable.

## Alternatives Considered

Throwing errors into a global crash view was rejected for recoverable operations like tagging and export.
