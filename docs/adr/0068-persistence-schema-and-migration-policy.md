# 0068 - Persistence Schema And Migration Policy

## Status

Accepted

## Context

Phase 3 adds durable workspace settings and portable workspace files, which require a stable schema.

## Decision

Version the workspace schema. IndexedDB stores image blobs separately from workspace metadata. Workspace file import goes through a migration layer before hydration.

## Consequences

Future changes can preserve old projects instead of silently dropping data.

## Alternatives Considered

Unversioned JSON export/import was rejected because it turns later releases into compatibility traps.
