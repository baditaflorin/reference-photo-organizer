# 0071 Stranger Test Findings And Response

- Status: accepted
- Date: 2026-05-09

## Context

Phase 3 required a stranger-style pass over the GitHub Pages build using real user actions instead of implementation assumptions. The goal was to confirm that a first-time user could move work in and out of the app without hidden knowledge.

## Decision

We ran a fresh-browser test against the Pages-style build and treated the top three confusing moments as release blockers for this phase:

1. The mixed text import field now routes through the generic text importer instead of URL-only handling.
2. Clipboard summary copy now surfaces a permission-specific failure message.
3. Folder import now explains its browser support caveat and fallback routes in the UI.

The stranger-test notes live in `docs/phase3/stranger-test.md`.

## Consequences

- The UI is more honest about what each control accepts.
- Clipboard failures now preserve user trust instead of failing mysteriously.
- Browser-dependent folder behavior is no longer an undocumented surprise.

## Alternatives Considered

- Leave the current behavior and document it only in the README.
  Rejected because the confusion occurs inside the app, at the exact moment a stranger needs help.

- Add a dedicated second text field just for workspace JSON.
  Rejected because the existing field was already intended to support both inputs; the real issue was incorrect wiring.
