# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no shared static dataset. User data is imported locally at runtime.

## Decision

There is no committed data artifact contract in v1. Runtime image metadata follows the `ImageAsset` schema in `src/features/library/types.ts`: id, path, dimensions, blob, palette, tags, CLIP status, and timestamps.

## Consequences

No `docs/data/` pipeline is needed. Future shared demo datasets must use versioned paths such as `/data/v1/`.

## Alternatives Considered

Mode B-style JSON artifacts were rejected because v1 does not ship a central reference library.
