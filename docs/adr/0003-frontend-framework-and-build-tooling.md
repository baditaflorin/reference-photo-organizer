# 0003 - Frontend Framework And Build Tooling

## Status

Accepted

## Context

The app needs a responsive, interactive interface and a static Pages build.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, Vitest, Playwright, PWA support, and lazy chunks for CLIP/PDF code.

## Consequences

The app has fast local iteration and a Pages-ready output in `/docs`. React and Tailwind add familiar ergonomics while keeping the first JS payload under budget.

## Alternatives Considered

Plain HTML/JS would reduce dependencies but slow down feature work. A full meta-framework was unnecessary for a no-routing static app.
