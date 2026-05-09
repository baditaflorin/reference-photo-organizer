# 0064 - DRY Consolidation Map

## Status

Accepted

## Context

The export path duplicates metadata formatting and the library hook duplicates import/result orchestration logic.

## Decision

Consolidate:

- export metadata and manifest formatting into shared helpers
- workspace state serialization and migration into one module
- import outcome bookkeeping into one report helper

Do not force abstractions where only trivial duplication exists.

## Consequences

Exports and workspace persistence share one canonical contract, which makes tests and docs more reliable.

## Alternatives Considered

Leaving duplicated helpers in place was rejected because portability and provenance now depend on a shared schema.
