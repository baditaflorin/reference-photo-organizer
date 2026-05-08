# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode C deployment topology does not apply.

## Decision

Deploy only GitHub Pages from `main:/docs`. No Docker, nginx, compose, Prometheus, or backend host is used.

## Consequences

The live URL is https://baditaflorin.github.io/reference-photo-organizer/ and rollback is a git revert.

## Alternatives Considered

A Docker backend was rejected in ADR 0001.
