# Relay Ops

Equipment monitoring and incident management demonstration by Phanda Tech.

## Purpose

A fictional pump-and-water-level scenario demonstrates how equipment readings can become an actionable incident with recorded supporting evidence. This is a GitHub portfolio project, not a deployed industrial product or certified safety system.

## Try the local visual demo

Use Node.js 22. From the repository root:

```sh
npm install
npm run dev
```

Open the loopback address printed by Vite. No database, credentials, API keys, or environment variables are needed for the browser demo. Nothing is hosted publicly by these commands.

1. Click Start scenario, or advance manually with Next reading.
2. Each reading advances the fictional clock by ten seconds.
3. At 00:30 the pump stops and water exceeds the threshold.
4. At 01:00 sustained abnormal readings open an incident.
5. Enter a fictional resolution note and resolve it as the demo operator.
6. Inspect the session activity and incident list. Pause/reset to repeat.

The script recovers telemetry at 01:30 and repeats every two simulated minutes. Resolving does not control machinery or alter the script; continued abnormal readings can open another incident after a full rule duration.

## Two explicit execution paths

### Browser showcase

React dashboard → deterministic fictional readings → existing TypeScript AlertEngine → in-memory incidents and session activity.

This mode is intentionally easy to run. Demo identity is visibly labelled and is not authentication. Reloading clears all state. The trend retains 36 readings, the incident list retains 30 incidents, and activity retains 60 events; internal engine event-ID tracking remains unbounded during a session.

### Separately tested PostgreSQL backend

StoredPermissionTelemetry → guarded PostgreSQL functions → readings, rule state, memberships, equipment scopes, assignments, incidents, and activity.

Database migrations, transactional duplicate handling, permission checks, and restricted-login integration tests are included. The browser does NOT call this backend. Verified identities, API routes, read endpoints, and a connected full-stack UI are unfinished. Do not represent the visual demo as proof of a connected database workflow.

## Checks

```sh
npm run build:demo
npm test
```

The demo build type-checks the project and bundles the interface into dist/demo. Existing database workflows exercise separate disposable PostgreSQL services. Integration tests require RELAY_TEST_DATABASE_URL and skip without it; the dedicated CI workflow requires that setting. For database setup and its caveats, see docs/adapter.md, docs/runtime-access.md, and docs/restricted-login-tests.md. Never use customer or production databases for these tests.

Three new scenario test cases check deterministic readings, normal/fault/recovery stages, and the expected first incident time. Following the test-discovery fix in commit d51189e, the project owner reported that all CI checks passed. This is a user-reported result, not an independently retrieved workflow report. A passing build does not establish browser accessibility, responsive layout, or visual correctness.

### Desktop browser smoke test — 27 October 2026

The project owner reported running the local demo from desktop VS Code and confirmed:

- The simulation behaved as described, including incident creation.
- An incident could be resolved with a fictional resolution note.
- Pause worked.
- Next reading worked.
- Reset worked.

These are user-reported manual results. The exact browser, operating system, and tested commit were not recorded. Long-note handling, narrow-screen/mobile layout, and keyboard navigation remain unverified. Screenshots have not yet been added. This test does not verify a browser-to-PostgreSQL workflow.

## Showcase completion checklist

- [x] Receive the project owner's report that all CI checks passed after the test-discovery fix.
- [x] Receive the project owner's desktop browser confirmation of the scenario, pause, manual stepping, reset, and incident resolution with a note.
- [ ] Test long resolution notes.
- [ ] Check mobile layout and keyboard navigation.
- [ ] Capture actual screenshots of the interface, including an open incident and its resolution history.
- [ ] Add the intended MIT license file with confirmed copyright details.
- [ ] Generate/review a dependency lockfile and review dependency advisories/licenses.
- [ ] Review code and commit history for secrets/private information before a separately approved visibility change.

No screenshots are included yet; desktop browser smoke-test results are recorded above as reported by the project owner.

## Scope and limitations

No live hardware, real client data, deployment, real operator authentication, or production-readiness claim. Thresholds are arbitrary demonstration values, not operational guidance. Session activity is editable/resettable demo memory, not a durable audit log. PostgreSQL activity protections have documented owner-level limitations.

Existing backend/security components remain available as engineering examples; further production hardening is deferred in favour of finishing the bounded showcase. Project-specific details and historical milestones are in docs/. A dependency lockfile is still outstanding. An MIT license is intended but its file has not yet been added to Relay Ops.
