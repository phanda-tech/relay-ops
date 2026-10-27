# Browser verification

## Desktop smoke test — 27 October 2026

The project owner reported testing the local Relay Ops browser demo from desktop VS Code. These are user-reported manual results, not tests independently executed by the documentation author. The exact browser, operating system, viewport dimensions, and tested commit were not recorded.

| Check | Reported result |
| --- | --- |
| Simulation behaved as described, including incident creation | Passed |
| Incident resolution with a fictional note | Passed |
| Pause | Passed |
| Next reading | Passed |
| Reset | Passed |
| Long resolution note | Passed |
| Keyboard navigation | Passed |
| Narrow desktop browser window | Passed |

This record supplements the earlier README smoke-test summary with the subsequently reported long-note, keyboard, and narrow-window results. These checks are not a comprehensive accessibility audit or evidence of production readiness. A narrow desktop window does not establish actual mobile-device compatibility.

## Remaining evidence

- [ ] Test on an actual mobile device.
- [ ] Capture normal operation with readings and trend visible.
- [ ] Capture an open incident with abnormal readings and incident details.
- [ ] Capture a resolved incident with its fictional note and session activity visible.
- [ ] Add the actual screenshots to the repository and link them from the README.

Suggested screenshot paths, not yet created:

- `docs/screenshots/normal-operation.png`
- `docs/screenshots/open-incident.png`
- `docs/screenshots/resolved-incident.png`

Use only fictional demo data and exclude unrelated personal information or credentials from captures. Do not add image links until the corresponding files exist.

## Scope

The browser demo uses fictional telemetry and in-memory incidents and activity. These checks do not verify browser-to-PostgreSQL connectivity, real operator authentication, live equipment control, or durable audit logging. No screenshot evidence is included in this record.
