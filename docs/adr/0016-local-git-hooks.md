# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project does not use GitHub Actions, so local hooks carry quality gates.

## Decision

Use plain `.githooks/` wired by `make install-hooks`. Pre-commit runs lint, typecheck, format check, npm audit, and gitleaks. Commit-msg validates Conventional Commits. Pre-push runs tests, build, and smoke.

## Consequences

Checks are transparent and runnable through Makefile targets.

## Alternatives Considered

Lefthook was considered but plain hooks are sufficient for v1.
