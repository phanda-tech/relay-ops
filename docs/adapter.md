# TypeScript PostgreSQL adapter: slice 3

## Added

PostgresTelemetry calls the database functions using parameterised queries and exposes ingestion and resolution to TypeScript callers. PostgreSQL bigint incident IDs remain strings to avoid numeric precision loss. The adapter accepts either a connection pool or an explicitly managed transaction client. It does not authenticate actors or organisations. Do not expose it to a network before implementing access controls.

The migration runner tracks file names and SHA-256 checksums in public.relay_schema_migrations. A transaction-scoped advisory lock serialises cooperating migration runners. It rejects changed or missing applied files, runs pending migrations and ledger inserts in one transaction, and skips already applied files. Migration files must have the project's BEGIN/COMMIT wrapper and must not contain other top-level transaction control. Only trusted repository migrations should be executed.

An existing relay schema created by manually running migration 001 cannot be silently adopted. For this demonstration use a fresh disposable database. Do not drop an existing database to make the runner pass. Baseline adoption requires a separately reviewed procedure.

## Local usage

Use Node.js 22 and a disposable PostgreSQL 16 database owned by a development user. Configure DATABASE_URL privately in the shell, then run:

```sh
npm install
npm run migrate
npm run build
```

For integration checks configure RELAY_TEST_DATABASE_URL to a separate disposable test database and run:

```sh
npm run test:integration
```

Integration tests skip if RELAY_TEST_DATABASE_URL is absent. The dedicated CI job requires it and fails rather than silently skipping. Tests leave fictional fixture records in the test database and use unique organisation IDs. Never point this suite at production or customer data. No environment file is loaded automatically. Do not commit connection strings.

## Checks included, results pending

- Repeated migration runs without reapplying migration 001.
- Concurrent matching retries accept one reading.
- Concurrent retries of a threshold event create one incident.
- An explicit rollback removes both the reading and rule-state change.
- Closing one application pool and opening another continues the saved timer and permits resolution.
- Gaps and normal readings reset the timer.
- Out-of-order events and conflicting replay payloads are rejected.

These are eight integration test cases, in addition to the original nine engine tests and SQL smoke assertions. CI results must be checked before claiming they pass. The pool-recreation case is not a database server restart test or a process-crash test. Concurrent different timestamps, migration failure/checksum mutation tests, restricted runtime roles, authentication, and tenant permission tests remain future work.

The original TypeScript in-memory engine remains a reference implementation, not a second active ingestion path. The persistent SQL rule is the implementation used by this adapter. A shared conformance suite is still needed to prevent the rule implementations diverging.

There is no HTTP API, simulator service, UI, deployment, or public-visibility change in this slice. A dependency lockfile and MIT license file still need to be added. Earlier documents describe previous slices; this document records the current additions.
