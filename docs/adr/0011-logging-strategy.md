# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Production browser console noise should be minimal.

## Decision

Do not emit routine production console logs. User-visible failures are surfaced through app notices. CLIP worker logging is set to error level.

## Consequences

Users see actionable UI messages without leaking image names to remote logging.

## Alternatives Considered

Client log collection was rejected because v1 has no analytics backend and no support workflow requiring it.
