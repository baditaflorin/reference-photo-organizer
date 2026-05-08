# 0012 - Metrics And Observability

## Status

Accepted

## Context

Mode A has no server metrics endpoint.

## Decision

Ship no analytics in v1. Observability is local: UI import progress, CLIP status counts, and smoke/e2e tests.

## Consequences

There is no PII collection and no operational dashboard.

## Alternatives Considered

Plausible or a beacon endpoint was rejected because v1 success can be validated without tracking users.
