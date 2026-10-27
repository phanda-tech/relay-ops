# Restricted-login integration: slice 7

This slice connects the previously separate adapter and SQL privilege tests. Four integration cases use StoredPermissionTelemetry over a real, randomly named PostgreSQL login that inherits only relay_runtime. Setup checks current_user to ensure calls are not accidentally running as the migration owner.

## Disposable test setup

The suite requires RELAY_TEST_DATABASE_URL pointing to a fresh isolated PostgreSQL 16 test cluster/database whose owner can apply migrations, create roles, and grant relay_runtime. It generates a random test password in memory, creates a test login, creates a new connection using that login, and drops the login during normal cleanup. No generated password or connection string is printed intentionally or written to the repository. Database administrators should ensure server-side statement logging does not retain credential-bearing setup statements. Abrupt process termination can leave a test role behind; disposable CI service teardown removes the cluster. Do not run this suite against shared, production, or customer databases.

The same database environment variable used by the existing integration workflow enables these tests. npm run test:integration now runs both integration files. Both suites use the tracked migration runner, whose advisory lock serialises cooperating migration setup. Without the test URL, integration suites skip; the dedicated CI workflow requires the URL. Unit-only CI still runs unit tests with integration suites skipped.

## Checks added, not yet verified

1. Allowed ingestion and incident resolution through the guarded adapter, with history verified through the owner connection.
2. Restricted login cannot directly read memberships, escalate roles, or invoke unguarded ingestion.
3. Nonexistent organisation scope and revoked equipment access are rejected without stored readings.
4. Revoked operator membership cannot resolve an existing incident.

A passing run will verify these specific adapter/login/privilege paths, not complete authentication. ServerIdentity is still supplied by test code. Any holder of the trusted runtime database connection can select subject strings; verified human/equipment identity, credential revocation, and network API protections remain unfinished. The tests do not prove all possible privilege-escalation paths, login password policy, concurrent revocation behaviour, or production readiness.

The suite leaves uniquely named fictional fixture records in the disposable database. The temporary login owns no application objects, and its cleanup does not delete application data. The permanent relay_runtime group role is managed by migration 003 and is not dropped by tests. No dependency lockfile or MIT license file is added here.

Next milestone after the four workflows pass: design and implement the verified identity boundary, then connect it to the guarded write adapter before adding HTTP routes. No UI, deployment, or public-visibility change is included.
