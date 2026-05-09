# 0063 - Half-Baked Feature Triage Decisions

## Status

Accepted

## Context

The audit found features that exist technically but are incomplete as workflows.

## Decision

- CLIP auto-tags: keep and finish.
- Restored workspace: keep and finish by persisting settings and adding portable workspace export/import.
- PWA/installability: keep but do not expand in Phase 3; document honestly.
- Shareable URL: keep out of scope for local binary workspaces in Mode A.
- Folder import on unsupported browsers: keep and finish with explicit guidance.

## Consequences

Phase 3 work focuses on finishing existing workflows instead of adding unrelated new surface area.

## Alternatives Considered

Deleting CLIP or restored workspace was rejected because both are central to the product promise once completed properly.
