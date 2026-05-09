# 0069 - Type-Safety Policy At Boundaries

## Status

Accepted

## Context

The current app contains several browser API casts and ad hoc data assumptions around clipboard, drag-drop, persistence, and imported JSON.

## Decision

Use explicit guards for browser entry points and Zod validation for imported workspace JSON. Keep unavoidable boundary casts narrow and localized.

## Consequences

Imported workspace files and clipboard text become validated inputs instead of trusted blobs.

## Alternatives Considered

Accepting imported JSON with unchecked casts was rejected because portable workspaces are now a primary user path.
