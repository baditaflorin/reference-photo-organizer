# 0066 - Error-Handling Convention Canonical Pattern

## Status

Accepted

## Context

Current failures often collapse into generic toasts and can stop a batch without a per-file explanation.

## Decision

Every user-facing failure should include:

- what failed
- why it failed in artist language
- what the user can do next

Batch imports should continue on per-file failures and record structured issues. Fatal workspace-level failures may stop the operation, but they must preserve prior good state.

## Consequences

Import, URL, clipboard, and state-file routes share a common issue/report structure.

## Alternatives Considered

Continuing to surface raw decode failures or generic export toasts was rejected because it leaves strangers guessing.
