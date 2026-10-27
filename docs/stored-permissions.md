# Stored permissions: slice 5

Migration 002 adds memberships with active status and roles, equipment identity-to-asset scopes, and incident assignments. These are access records, not verified identities or credentials. Credential issuance, secret hashing, expiry, login, and token validation are not implemented.

The new ingest_as function checks an active equipment scope before ingestion. resolve_as checks an active human membership and requires technicians to be assigned to the current incident. Administrators/operators may resolve organisation incidents. Actor is derived from the supplied subject. Subject must eventually come from verified server-side identity, not request data.

Checks take row locks within the write transaction. Membership/scope revocations and assignment changes update the same rows and therefore coordinate with in-flight guarded calls. An already authorised transaction may complete before a concurrent revocation commits. Concurrent revocation races have not yet been tested. The current single-asset lock order is membership/scope, asset, then assignment; future operations must be designed with consistent locking and deadlock tests.

The Stored permission checks workflow applies migrations 001 and 002 to a fresh disposable PostgreSQL instance, then tests forbidden cross-organisation ingestion/resolution, revoked equipment, unassigned technicians, revoked technician membership, no data changes from denied actions, and successful assigned technician resolution with recorded actor. Fixtures roll back. CI result is pending until checked. The migration-ledger integration test now compares the ledger before/after a rerun instead of assuming there is only one migration.

## Not complete security

The old unguarded SQL functions and TypeScript adapter remain owner-level/internal primitives. The TypeScript guarded service from slice 4 is NOT yet wired to these new SQL functions. Tests run as database owner and test the function logic, not restricted-account privileges or row-level security. Direct database owner access bypasses these checks. Public execution of new functions is revoked.

Membership provisioning, device credential verification, assignment commands, restricted runtime credentials, database grants/isolation tests, TypeScript integration with these guarded functions, and network/API authentication remain to be implemented. Assignment rows can currently be provisioned only through trusted database setup. No UI/API or deployment exists. Do not expose this database or adapter to untrusted clients.

Use the tracked migration runner to apply migration 002 to a database already tracked by the runner. Do not change applied migration 001. Earlier SQL smoke tests intentionally exercise only migration 001; the adapter integration workflow applies all migrations.
