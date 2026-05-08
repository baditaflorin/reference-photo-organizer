# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B requires an offline data pipeline, but this project is Mode A.

## Decision

No data generation pipeline is implemented in v1. `make data` prints a Mode A notice.

## Consequences

There are no generated JSON, Parquet, or SQLite artifacts to refresh.

## Alternatives Considered

A demo data pipeline was rejected because demo images are bundled static assets, not external data.
