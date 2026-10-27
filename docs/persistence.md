# PostgreSQL persistence: implementation slice 2

## Current scope

Migration 001 adds a separate PostgreSQL implementation of the initial alert rule. The original TypeScript engine remains a reference implementation; it is not yet wired to this database. There is no HTTP API, authentication, UI, or deployment in this slice.

Database tables hold organisations, assets, readings, rule state, incidents, and incident activity. Ingestion locks the asset row, validates event ordering, stores the reading, advances the timer, and creates an incident and activity record within the caller's transaction. The partial unique index allows at most one open incident per organisation/asset. Matching event-ID retries return duplicate; changed payloads for an existing event ID raise an error.

The demonstration rule is fixed at water level >=80%, pump stopped, 30 seconds sustained, and a maximum 15-second reading interval. These arbitrary values are not safety guidance. Resolution requires an actor label and note, records activity, and resets the timer. The actor label is not yet an authenticated identity.

## Apply locally

Use a disposable PostgreSQL 16 database and an owner connection configured through standard PG environment variables. Never use production credentials or a production database for these tests.

```sh
psql -v ON_ERROR_STOP=1 -f db/migrations/001_persistence.sql
psql -v ON_ERROR_STOP=1 -f db/tests/persistence.sql
```

Migration 001 is forward-only and must run exactly once against a fresh database. A migration ledger/runner and upgrade tests remain to be added. Tests insert fixed fictional IDs and commit their fixture records; rerunning requires a fresh database.

## Automated checks added

The Database persistence checks workflow creates an ephemeral PostgreSQL service, applies the migration, checks incident creation, matching duplicate handling, payload conflict rejection, resolution, activity update protection, and committed record visibility from a new connection. This is not a database restart test, a concurrent-request test, or a complete tenant-security test. Check the actual CI result before claiming these checks passed. The existing TypeScript workflow remains unchanged. CI's database password is a disposable test value only.

## Security boundaries and limitations

Public schema/function access is revoked. A restricted runtime role, authenticated tenant mapping, grants, row-level security, and negative permission tests are still required before any network access is exposed. Organisation IDs supplied to the functions are not authentication. Composite keys prevent inconsistent cross-organisation references but do not prevent an authorised database owner from querying any organisation.

An activity trigger blocks ordinary UPDATE/DELETE operations, not privileged owner actions, trigger disabling, or TRUNCATE. This is not a tamper-proof compliance log. Sequence IDs may have gaps after rolled-back transactions. Timestamp validation does not yet enforce clock skew or future limits. There is no retention policy, rule configuration, concurrent-ingestion test, complete audit actor model, or process restart test yet.

## Next gates

1. Confirm both GitHub workflows pass.
2. Add a migration runner and PostgreSQL integration tests for ordering, gaps, recovery, concurrent retries, rollback, and restart/reconnection behaviour.
3. Add a TypeScript persistence adapter and authenticated API with restricted roles and tested tenant isolation.
4. Add the simulator, incident workflow, and dashboard after the backend gates pass.

The root README describes slice 1; this document records the additional database slice without treating the overall application as complete. Repository visibility remains private.
