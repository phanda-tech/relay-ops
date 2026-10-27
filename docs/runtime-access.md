# Restricted database runtime: slice 6

## Added

Migration 003 creates relay_runtime, a non-login role with no superuser, database-creation, role-creation, replication, or row-security-bypass attributes. It grants only schema usage and execution of ingest_as and resolve_as. Direct table/sequence access and unguarded function execution are not granted. The guarded functions use SECURITY DEFINER with a fixed pg_catalog,pg_temp search path and schema-qualified references. Their owner retains the privileges needed for the underlying transaction. A future deployment should use a dedicated non-superuser function owner rather than CI's disposable superuser.

The new StoredPermissionTelemetry adapter calls the guarded SQL functions directly. Roles, active membership, equipment scopes, and assignments are loaded/checked by those database functions, not accepted as adapter parameters. The new adapter is the intended protected write path. Earlier PostgresTelemetry and AuthorizedTelemetry classes remain internal/reference paths and must not be exposed through an API. Nothing in this commit starts an application service.

## Identity is still a required trust boundary

ServerIdentity is a TypeScript data contract, not cryptographic proof. Its subject and kind must be produced by a future verified authentication layer. A caller with access to the guarded functions can supply any subject string; the database role is trusted application infrastructure, not a per-user identity boundary. Do not distribute runtime database access to end users or devices. SQL injection or compromise of the trusted application could impersonate subjects. No claim of end-to-end identity security or tenant isolation is made.

This commit provisions no login, password, or production credentials. The role is NOLOGIN. Binding a future application login to this group role requires a separate reviewed provisioning step. Never use migration-owner credentials for a runtime application.

## Migration caveat

PostgreSQL roles are cluster-wide. Migration 003 requires CREATE ROLE privileges and deliberately fails if relay_runtime already exists rather than silently adopting it. Use a fresh isolated development/test cluster for a clean install. Multiple databases in one cluster need an explicitly reviewed role-provisioning plan. Do not drop existing roles or databases to work around a failure. The migration runner records this migration like the earlier ones.

## Tests added; results pending

Five adapter unit tests check guarded query routing, bigint preservation, actor source, identity-kind rejection, and error propagation without unguarded fallback. The Stored permission checks workflow additionally switches to relay_runtime and checks forbidden direct reads, membership escalation, direct telemetry writes, unguarded function calls, and cross-organisation guarded ingestion, followed by permitted ingestion/resolution. Fixtures are checked by the owner afterwards and rolled back.

SET LOCAL ROLE tests privilege enforcement, not password login, separate operating-system processes, or identity verification. Runtime privileges are checked through SQL and the adapter routing is unit-tested; a combined adapter test using a restricted login is still pending. Membership revocation race tests, authentication, read endpoints, assignment commands, future-object grant checks, default-privilege hardening, and deployment-owner separation remain outstanding. There is no row-level security policy in this implementation.

All four workflows should be checked for this commit. Repository stays private, and no deployment or UI is added. Earlier progress documents describe earlier slices; this file records the current state.
