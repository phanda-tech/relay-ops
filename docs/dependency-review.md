# Dependency review and clean-install verification

Review date: 27 October 2026.

## Evidence and scope

This record summarizes project-owner-supplied terminal output and license files reviewed in the project conversation. Commands were run by the owner, not independently executed by the reviewer. This is a bounded engineering record, not a legal opinion or a blanket license-compliance certification.

## Clean installation

After pulling README commit 1152f57 on Windows, the owner ran:

```sh
npm ci
npm run build:demo
npm test
npm audit
```

- npm ci succeeded: 60 packages added, 61 audited.
- TypeScript checking and the Vite 6.4.5 dashboard build passed.
- Vitest 5.0.5 passed 27 tests; 12 database integration tests were skipped locally.
- npm audit reported 0 vulnerabilities at that time. This is not a guarantee against unknown or future vulnerabilities.
- The separate CI integration and SQL results previously reported by the owner are not independently reverified by this local check.

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

No missing license declarations were reported. These are lockfile entries, including platform-specific optional packages and nested dependencies, not 135 installed packages or unique projects. Metadata is not a substitute for actual license and notice inspection.

## Browser-runtime notices

The supplied license files for react 19.3.1, react-dom 19.3.1, and scheduler 0.28.0 contain MIT terms and Copyright (c) Meta Platforms, Inc. and affiliates. Their complete supplied license texts are preserved in [the browser notices file](../demo/public/THIRD-PARTY-NOTICES.txt).

The owner built the demo and reported identical SHA-256 hashes for the source notices file and dist/demo/THIRD-PARTY-NOTICES.txt, establishing unchanged copying for that local build. A later cosmetic heading correction was suggested; the byte-for-byte check was not repeated after any such edit. The owner reported committing and pushing the notices file as 022ef50, followed by a clean working tree.

This notices file explicitly covers only those three components; it is not a complete backend or tooling inventory, nor an independent bundle-composition audit.

## Six non-MIT entries inspected

The owner supplied a UTF-8 report of installed top-level license and notice files. The report contains all six package sections and an END OF REPORT marker.

| Packages | Supplied license texts |
| --- | --- |
| expect-type, typescript | Apache License 2.0 |
| pg-int8, picocolors, split2 | ISC |
| source-map-js | BSD-3-Clause |

The Apache texts require applicable redistribution license and attribution preservation, modified-file notices where relevant, and preservation of relevant upstream NOTICE attributions when supplied. The ISC texts require copyright and permission notice retention. The BSD text requires copyright, conditions, and disclaimer retention, including accompanying materials for binary distributions, and restricts endorsement using upstream names. Consult the actual upstream texts for complete terms.

The top-level scan returned license files only for these six packages. It did not establish the absence of notices embedded elsewhere. Their license texts were inspected, but were not added to the browser-only notices file.

## Remaining limitations and release checks

- Actual license texts for all remaining MIT entries have not been individually inspected.
- Embedded third-party code, nested notices, and platform-specific optional package contents have not been comprehensively reviewed.
- The exact third-party contents of each proposed distribution have not been independently audited. Preserve applicable upstream licenses, copyrights, disclaimers, and notices when redistributing dependencies.
- Development tools are not automatically part of a browser distribution; dependency presence in the lockfile alone does not establish bundle inclusion.
- Repeat relevant checks when dependency versions or distribution formats change.
- Actual mobile-device testing, independent screenshot review, and code/history review for secrets or private information remain separate pending tasks.
- No deployment, repository visibility change, or production-readiness claim is authorized by this record.
