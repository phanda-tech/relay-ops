# Relay Ops

Equipment monitoring and incident management demonstration by Phanda Tech.

## Status

First implementation slice: an in-memory TypeScript alert engine and nine automated test cases. No UI, API, database, simulator process, authentication, or live hardware integration exists yet. CI is configured, but its result must be checked before claiming verification. No deployment is configured.

## Run checks

Use Node.js 22.

```sh
npm install
npm run build
npm test
```

The build script currently performs type-checking only. A reviewed dependency lockfile is still needed; CI uses npm install until it is committed.

## Implemented rule

A pump-stopped reading at or above 80% water level begins a timer. Consecutive abnormal readings spanning 30 seconds create one open incident, provided no interval exceeds 15 seconds. A normal reading or larger gap resets the timer. Only one incident remains open per organisation/asset pair. Resolution resets the timer; continued abnormal readings may create a new incident after another full duration. These are arbitrary demonstration thresholds, not operational safety guidance.

The engine validates basic reading fields, rejects out-of-order timestamps, ignores repeated event IDs per organisation/asset, and returns copies of incident data. Duplicate IDs are treated as replays, even if payloads differ; payload conflict detection remains future work. Timestamp units are epoch milliseconds. The engine does not yet enforce clock-skew or future-timestamp limits.

Tests cover sustained thresholds, duplicates, ordering, gaps, recovery, separate state keys, invalid input/configuration, resolution/reopening, and defensive copies. Separate state keys are not a substitute for authenticated tenant isolation.

## Planned end-to-end workflow

1. A deterministic simulator sends fictional pump and water-level readings.
2. An authenticated API validates and stores readings in PostgreSQL.
3. Transactional rule evaluation creates incidents without duplicates.
4. A React dashboard receives live updates.
5. Operators acknowledge and assign incidents; technicians record actions and resolve them.
6. An append-only activity history records actor, action, time, and supporting evidence.

## Engineering roadmap

- PostgreSQL schema, migrations, durable idempotency, and transactional concurrency tests.
- Authentication, role permissions, tenant-scoped queries, and negative access tests.
- API, simulator, real-time delivery, reconnection, and historical queries.
- Dashboard, incident workflow, audit history, accessibility, and browser tests.
- Docker Compose local setup, dependency review, screenshots, and publication review.

## Limitations

All state is process-local and lost on restart. Event-ID sets grow without a retention policy. There is no durable audit trail, authorization, concurrency protection across processes, rate limiting, or production observability. This is a staged portfolio project, not a certified industrial monitoring, alarm, or machinery-control system. Use fictional data only.

## Licensing

An MIT license is intended for the showcase; the license file has not been added in this slice. Third-party dependencies retain their own terms.
