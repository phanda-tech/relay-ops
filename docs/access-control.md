# Access control foundation: slice 4

## Implemented in this slice

A pure authorization policy and a guarded telemetry service. Policies default to denial and require an active, nonempty principal, matching organisation, and an allowed action. Equipment may ingest only for assets in its trusted scope. Humans cannot submit equipment telemetry. Administrators can manage resources; operators can view and handle incidents. The policy permits technicians to view/resolve assigned work, but the service deliberately denies technician resolution until assignment lookup and enforcement exist in a database transaction.

AuthorizedTelemetry wraps a TelemetryStore, such as the PostgreSQL adapter. It authorizes before calling persistence and derives resolution actor from the principal rather than accepting an independent actor argument. Ten new unit test cases exercise positive and negative policies and ensure denied service actions do not reach persistence. Existing CI discovers these tests with npm test; results must be checked. No claim of a successful run is made merely by adding tests.

## Critical trust boundary

Principal values must come from a future verified identity/session layer and server-side membership lookup. Never accept role, subject, organisation membership, active status, or equipment asset scopes directly from request JSON, unverified tokens, or browser state. The policy does not verify identities, credentials, signatures, membership freshness, or credential revocation. Client-constructed principals would bypass the intended boundary. Resource assignments likewise must be fetched from trusted storage, not accepted from a client.

This slice does NOT add login, an HTTP API, database-backed memberships, a restricted runtime database account, database row-level security, or database permission integration tests. It does not provide end-to-end tenant isolation. The original PostgresTelemetry adapter remains an internal low-level primitive that bypasses policy if used directly. No network endpoint is exposed.

## Permissions targeted

| Identity | Intended permissions | Service support now |
| --- | --- | --- |
| Administrator | Manage organisation assets/memberships; view and handle incidents | Resolve only |
| Operator | View, acknowledge, assign, resolve organisation incidents | Resolve only |
| Technician | View and resolve assigned incidents | Denied until transactional assignment support |
| Equipment | Ingest for authorised assets only | Ingest |

The acknowledge, assign, view, and manage actions exist only in the policy vocabulary; corresponding application operations are not implemented.

## Required next gates

1. Verify all existing workflows remain green.
2. Add database-backed memberships, equipment credentials, and assignment records.
3. Separate migration-owner credentials from restricted runtime credentials, with least-privilege grants and database-level isolation tests.
4. Bind guarded service calls to verified identities and transactional membership/assignment checks, including revoked/expired identities.
5. Add HTTP endpoints only after those controls pass negative integration tests.

The project is still a private, local-development showcase in progress. Nothing is deployed, and no production-security claim is made.
