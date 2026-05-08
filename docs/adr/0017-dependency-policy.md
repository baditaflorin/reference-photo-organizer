# 0017 - Dependency Policy

## Status

Accepted

## Context

The app should use production-ready libraries and avoid known high/critical advisories.

## Decision

Use React, Vite, Tailwind CSS, TanStack Query, Comlink, Hugging Face Transformers, quantize, jsPDF, Vitest, Playwright, ESLint, Prettier, and vite-plugin-pwa. Run `npm audit --audit-level=high` in lint.

## Consequences

Specialized concerns use maintained libraries. Heavy code paths are lazy-loaded where possible.

## Alternatives Considered

Custom PDF, color quantization, and ML runtimes were rejected because battle-tested libraries exist.
