# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Imported images and generated metadata should survive refreshes without uploading files.

## Decision

Use IndexedDB for image blobs and metadata. Object URLs are regenerated after restore. `localStorage` is avoided for image data because it is small and string-only.

## Consequences

Libraries remain private to the browser profile. Very large folders are limited by browser storage quotas.

## Alternatives Considered

OPFS was considered for very large libraries but is more complex than v1 needs. Server storage was rejected.
