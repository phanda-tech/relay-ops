# Dependency review and clean-install verification

Review date: 27 October 2026.

## Evidence and scope

This record summarizes project-owner-supplied terminal output and license files reviewed in the project conversation. Commands were run by the owner, not independently executed by the reviewer. This is a bounded engineering record, not a legal opinion or a blanket license-compliance certification.

## Clean installation

After pulling the README update on Windows, the owner ran:

```sh
npm ci
npm run build:demo
npm test
npm audit
```

- npm ci succeeded: 60 packages added, 61 audited.
- TypeScript checking and the Vite 6.4.5 dashboard build passed.
- Vitest 5.0.5 passed 27 tests; 12 database integration tests were skipped locally.
- npm audit reported 0 vulnerabilities at that time, not a guarantee against unknown or future vulnerabilities.
- Separate CI integration and SQL results previously reported by the owner are not independently reverified by this local check.

Clean-install verification is complete for this reported local environment, not every platform.

## Lockfile license metadata

The owner extracted all non-root package entries from package-lock.json:

| Declared license | Entries |
| --- | ---: |
| MIT | 129 |
| Apache-2.0 | 2 |
| ISC | 3 |
| BSD-3-Clause | 1 |
| Total | 135 |

No missing license declarations were reported. Entries include platform-specific optional packages and nested dependencies; this is not 135 installed packages or unique projects. Metadata does not replace actual license/notice inspection.

## Browser-runtime notices

The supplied license files for react 19.3.1, react-dom 19.3.1, and scheduler 0.28.0 contain MIT terms and Copyright (c) Meta Platforms, Inc. and affiliates. Their complete supplied texts are preserved in [the browser notices file](../demo/public/THIRD-PARTY-NOTICES.txt).

The owner built the demo and reported identical SHA-256 hashes for the source notices file and dist/demo/THIRD-PARTY-NOTICES.txt. A later cosmetic heading correction was suggested; the byte-for-byte check was not repeated after any such edit. The notices milestone is 9a2e6769954f5a032ce2f8380c693470267b09e7 in the rewritten history.

This file covers only those three components, not all backend/tooling dependencies or independently audited bundle composition.

## Six non-MIT entries inspected

The owner supplied a UTF-8 report of installed top-level license/notice files, with all six sections and an END OF REPORT marker.

| Packages | Supplied license texts |
| --- | --- |
| expect-type, typescript | Apache License 2.0 |
| pg-int8, picocolors, split2 | ISC |
| source-map-js | BSD-3-Clause |

Apache terms require applicable redistribution license/attribution preservation, modified-file notices where relevant, and relevant upstream NOTICE attributions when supplied. ISC terms require copyright and permission notice retention. BSD terms require copyright, conditions, and disclaimer retention, including accompanying materials for binary distributions, and restrict endorsement using upstream names. Consult actual upstream texts for complete terms.

The top-level scan returned license files only for these six packages; it did not establish the absence of embedded notices elsewhere. Their texts were inspected but not added to the browser-only notices file.

## Rewritten history references

A privacy-driven author/committer email rewrite changed commit IDs without changing the current tracked-file tree. Current-history references are:

- README dependency update: c300d499310c9df1d8175bcbadd4c5c596e41582.
- Browser notices: 9a2e6769954f5a032ce2f8380c693470267b09e7.
- Initial dependency-review record and rewritten baseline: 3b34a7713963c21dff6c0e0d787329ddfa351cc8.

The current README summarizes scoped privacy and screenshot results. The owner's screenshot review is complete; independent visual inspection is not.

## Remaining limitations and release checks

- Actual license texts for all remaining MIT entries have not been individually inspected.
- Embedded third-party code, nested notices, and platform-specific optional package contents have not been comprehensively reviewed.
- Each proposed distribution's third-party contents have not been independently audited. Preserve applicable upstream licenses, copyrights, disclaimers, and notices when redistributing dependencies.
- Development tools are not automatically part of a browser distribution; lockfile presence alone does not establish bundle inclusion.
- Repeat relevant checks when versions or distribution formats change.
- The owner reported an actual-device smoke-test pass on Samsung S26 Ultra using Samsung Internet. Chrome on the same phone returned ERR_TOO_MANY_RETRIES and remains unresolved. These are owner-reported manual results, not universal mobile compatibility. See [the browser-verification record](browser-verification.md). Independent screenshot inspection remains pending. Privacy checks have explicit coverage limitations in the README.
- No deployment, visibility change, or production-readiness claim is authorized by this record.
