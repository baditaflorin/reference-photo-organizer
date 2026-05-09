# 0065 - Module Boundaries And Dependency Direction

## Status

Accepted

## Context

`useImageLibrary` currently mixes import flow, persistence, reporting, and workspace concerns.

## Decision

Keep dependency direction one-way:

- UI components -> hooks
- hooks -> library/workspace modules
- workspace modules -> browser primitives

Introduce explicit workspace modules for schema, serialization, settings, and import reporting instead of growing the hook further.

## Consequences

The hook becomes orchestration over smaller modules rather than the home for every workflow detail.

## Alternatives Considered

Moving to a new app-wide state library was rejected as unnecessary for Phase 3.
