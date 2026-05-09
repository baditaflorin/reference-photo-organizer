# 0067 - State-Management Convention

## Status

Accepted

## Context

The app currently splits state across React local state and image-only persistence, with no canonical workspace object.

## Decision

Use one canonical workspace state model:

- images
- workspace settings
- latest import report

React keeps the live working state; IndexedDB persists the durable subset; exported workspace files serialize the same durable contract.

## Consequences

Workspace restore, export/import, and tests all target the same schema.

## Alternatives Considered

Persisting each UI field ad hoc in separate storage keys was rejected because it complicates migration and portability.
