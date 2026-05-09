# 0062 - Output Pathway Coverage Policy

## Status

Accepted

## Context

The app already exports PNG and PDF, but users also need a portable project format and a lightweight clipboard-friendly output.

## Decision

Phase 3 keeps PNG and PDF exports, adds downloadable workspace state export/import, and adds a clipboard-ready board summary. Binary-heavy share URLs remain out of scope in static Mode A and are documented as such.

## Consequences

The workspace state format becomes a first-class contract with schema versioning and migration rules.

## Alternatives Considered

Hash-encoding full binary workspaces into URLs was rejected because local-first image boards exceed practical URL size limits quickly.
