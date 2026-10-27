# Browser verification

## Desktop smoke test — 27 October 2026

The project owner reported testing the local Relay Ops browser demo from desktop VS Code. These are owner-reported manual results, not tests independently executed by the documentation author. The exact browser, desktop operating system, viewport dimensions, and tested commit were not recorded.

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

These checks are not a comprehensive accessibility audit or evidence of production readiness. A narrow desktop window does not establish actual mobile-device compatibility.

## Screenshot evidence and owner review — 27 October 2026

The owner supplied screenshots, which are committed and linked from the README:

- [Normal operation](screenshots/normal-operation.png)
- [Open incident](screenshots/open-incident.png)
- [Resolved incident](screenshots/resolved-incident.png)

The owner manually reviewed the images locally and reported:

| Check | Reported result |
| --- | --- |
| Normal operation screenshot | Passed |
| Open incident screenshot | Passed |
| Resolved status | Passed |
| Resolution note and corresponding activity visible | Yes |
| Unwanted personal or private details | None found by owner |

This is owner verification, not independent visual inspection or automated image analysis.

## Remaining evidence

- [x] Add the three screenshot files and link them from the README.
- [x] Receive owner confirmation of scenario states, resolution-note/activity evidence, and screenshot privacy review.
- [ ] Test on an actual mobile device.
- [ ] Independently inspect screenshot contents.

## Scope

The browser demo uses fictional telemetry and in-memory incidents and activity. These checks do not verify browser-to-PostgreSQL connectivity, real operator authentication, live equipment control, durable audit logging, or comprehensive accessibility. No deployment or visibility change is authorized by this record.
