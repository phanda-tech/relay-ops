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

These checks are not a comprehensive accessibility audit or evidence of production readiness. A narrow desktop window alone does not establish actual mobile-device compatibility; the separate phone test below provides bounded actual-device evidence.

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

## Actual-device smoke test — 27 October 2026

Device: Samsung S26 Ultra, as identified by the project owner. Browser: Samsung Internet. The owner accessed a locally built Vite preview from the phone over the home network, with the PC connected by Ethernet and the phone by Wi-Fi. This was a local-network preview, not a public deployment.

After receiving the manual test checklist, the owner reported that everything was working. The following results summarize that overall confirmation; the documentation author did not independently execute or observe these checks.

| Check | Owner-reported result |
| --- | --- |
| Portrait layout, readable labels and usable controls | Passed |
| Simulation and advancing readings | Passed |
| Incident creation | Passed |
| Resolution with a fictional note and visible note/activity | Passed |
| Pause | Passed |
| Next reading | Passed |
| Reset | Passed |
| Landscape rotation and return to portrait | Passed |

Exact Android and browser versions, viewport dimensions, and the tested commit were not recorded. No new phone screenshots or automated mobile-test results were supplied. This is a bounded manual pass for the reported device/browser, not universal mobile compatibility or a comprehensive accessibility audit.

### Unresolved Chrome result

On the same phone, Chrome failed to open the local preview and the owner reported ERR_TOO_MANY_RETRIES. Samsung Internet subsequently opened it successfully. The cause of the Chrome failure was not established; do not attribute it to an application defect, HTTPS, firewall, router, or browser configuration without further evidence. No passing Chrome retest was reported.

The owner reported no active VPN on either device. PC diagnostics showed a Private Ethernet profile, a listener on all IPv4 interfaces at port 4173 owned by the expected Node.js executable, and enabled inbound allow rules for that executable on the Private profile. These observations do not establish the absence of every network or security restriction. No broader firewall or router changes are required or authorized by this record.

## Remaining evidence

- [x] Add the three screenshot files and link them from the README.
- [x] Receive owner confirmation of scenario states, resolution-note/activity evidence, and screenshot privacy review.
- [x] Receive owner-reported actual-device smoke-test pass on Samsung S26 Ultra using Samsung Internet.
- [ ] Resolve or retest the reported Chrome access failure.
- [ ] Independently inspect screenshot contents.

The README and dependency-review record may retain earlier mobile-testing status until separately synchronized; this dated phone-test section records the newer owner-reported result.

## Scope

The browser demo uses fictional telemetry and in-memory incidents and activity. These checks do not verify browser-to-PostgreSQL connectivity, real operator authentication, live equipment control, durable audit logging, or comprehensive accessibility. No deployment or visibility change is authorized by this record.
