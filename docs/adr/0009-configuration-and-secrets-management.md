# 0009 - Configuration And Secrets Management

## Status

Accepted

## Context

The app must not commit secrets or expose secrets in the frontend.

## Decision

Configuration is limited to build-time public values: Pages base path, app version, commit SHA, repository URL, and PayPal URL. `.env.example` documents placeholders. Gitleaks runs in pre-commit.

## Consequences

There are no runtime secrets. Any future secret-requiring workflow must move to offline generation or a justified backend.

## Alternatives Considered

Encrypted or obfuscated frontend secrets were rejected.
