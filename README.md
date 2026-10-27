# Relay Ops

Equipment monitoring and incident management demonstration by Phanda Tech.

## Purpose

A fictional pump-and-water-level scenario demonstrates how equipment readings can become an actionable incident with recorded supporting evidence. This is a GitHub portfolio project, not a deployed industrial product or certified safety system.

## Dashboard screenshots

The project owner supplied these screenshots of the fictional browser demo. They illustrate the in-memory showcase, not a connected PostgreSQL workflow.

### Normal operation

![Normal operation in the fictional Relay Ops demo](docs/screenshots/normal-operation.png)

### Open incident

![Open incident in the fictional Relay Ops demo](docs/screenshots/open-incident.png)

### Resolved incident

![Resolved incident in the fictional Relay Ops demo](docs/screenshots/resolved-incident.png)

## Try the local visual demo

Use Node.js 22.12 or newer within the Node.js 22 line. The reported local verification used Node.js 22.14.0 and npm 10.9.2. From the repository root:

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
npm audit
```

The demo build type-checks the project and bundles the interface into dist/demo. Existing database workflows exercise separate disposable PostgreSQL services. Integration tests require RELAY_TEST_DATABASE_URL and skip without it; the dedicated CI workflow requires that setting. For database setup and its caveats, see docs/adapter.md, docs/runtime-access.md, and docs/restricted-login-tests.md. Never use customer or production databases for these tests.

Three scenario test cases check deterministic readings, normal/fault/recovery stages, and the expected first incident time. A passing build does not establish browser accessibility, responsive layout, or visual correctness.

### Dependency upgrade verification — 27 October 2026

Vitest is pinned to 5.0.5 in package.json, and package-lock.json is committed. The project owner supplied terminal output and reported CI results showing:

- TypeScript checking and the Vite 6.4.5 dashboard build passed locally.
- The regular Vitest run passed 27 tests, with 12 database integration tests skipped locally.
- The dedicated PostgreSQL adapter integration job passed those 12 integration tests under Vitest 5.0.5, with none skipped.
- Database persistence checks and Stored permission checks both showed green status for the dependency update, as reported by the project owner.
- The local npm audit reported 0 vulnerabilities after the upgrade.

These results account for 39 Vitest tests across the regular and integration jobs, plus the separate SQL checks. They are based on owner-supplied output and status reports, not independently retrieved workflow-run records. A clean audit is a point-in-time advisory result, not a guarantee that dependencies are vulnerability-free. Dependency license compliance and clean-install reproducibility have not been fully verified.

### Desktop browser smoke test — 27 October 2026

The project owner reported running the local demo from desktop VS Code and confirmed:

- The simulation behaved as described, including incident creation.
- An incident could be resolved with a fictional resolution note.
- Pause worked.
- Next reading worked.
- Reset worked.
- Long resolution notes worked.
- Keyboard navigation worked.
- The narrow desktop browser layout passed the manual check.

These are user-reported manual results. The exact browser, operating system, viewport dimensions, and tested commit were not recorded. Actual mobile-device testing remains pending; a narrow desktop window is not a phone test. These checks are not a comprehensive accessibility audit and do not verify a browser-to-PostgreSQL workflow. See [the desktop verification record](docs/browser-verification.md) for the original test record. Screenshot files have since been added and are linked above; their existence was verified, but their contents have not been independently visually reviewed.

## Showcase completion checklist

- [x] Receive the project owner's report that all CI checks passed after the test-discovery fix.
- [x] Receive the project owner's desktop browser confirmation of the scenario, pause, manual stepping, reset, and incident resolution with a note.
- [x] Receive the project owner's confirmation that long resolution notes passed.
- [x] Receive the project owner's confirmation that keyboard navigation and narrow desktop layout passed.
- [x] Add the project owner's normal-operation, open-incident, and resolved-incident screenshot files and link them above.
- [x] Add the MIT license with the confirmed copyright holder, Phanda Tech.
- [x] Commit package-lock.json and pin Vitest to 5.0.5.
- [x] Record the owner's reported successful build, 27 regular tests, 12 integration tests, SQL workflows, and clean local audit after the upgrade.
- [ ] Verify a clean installation from the committed lockfile.
- [ ] Complete the dependency license-compliance review.
- [ ] Test on an actual mobile device.
- [ ] Independently review screenshot contents and confirm the resolved-incident capture includes the intended note/activity evidence.
- [ ] Review code and commit history for secrets/private information before a separately approved visibility change.

## License

[MIT](LICENSE), Copyright (c) 2026 Phanda Tech. Third-party dependencies retain their own licenses; the project license does not replace their terms.

## Scope and limitations

No live hardware, real client data, deployment, real operator authentication, or production-readiness claim. Thresholds are arbitrary demonstration values, not operational guidance. Session activity is editable/resettable demo memory, not a durable audit log. PostgreSQL activity protections have documented owner-level limitations.

Existing backend/security components remain available as engineering examples; further production hardening is deferred in favour of finishing the bounded showcase. Project-specific details and historical milestones are in docs/.
