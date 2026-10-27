# Dependency review and clean-install verification

Review date: 27 October 2026.

## Evidence and scope

This record summarizes project-owner-supplied terminal output and license files reviewed in the project conversation. Commands were run by the owner, not independently executed by the reviewer. The reviewer parsed the uploaded JSON inventory and inspected selected collected texts and the supplied six-package follow-up. This is a bounded engineering record, not a legal opinion or a blanket license-compliance certification.

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

The initial top-level scan returned license files only for these six packages; it did not establish the absence of embedded notices elsewhere. Their texts were inspected but not added to the browser-only notices file.

## Expanded installed-package evidence review

The owner subsequently supplied relay-ops-license-evidence.json. Parsing confirmed:

- 135 non-root lockfile entries, matching the declared-license totals above.
- 60 entries reported installed, of which 54 had collected top-level license/notice files.
- 75 entries reported uninstalled, all marked optional in the supplied inventory.
- Six installed entries had no file matching the initial top-level license/notice filename filter. This was a collection gap, not proof of a license violation.

The report contains collected license texts, but collecting them does not establish an exhaustive individual or legal review of every text. Installed status was based on package.json existence; package integrity and provenance were not independently verified.

### Follow-up on the six collection gaps

The owner supplied a recursive README/license/notice follow-up for the six target package folders, excluding nested node_modules directories.

| Installed package entry | Follow-up evidence | Bounded finding |
| --- | --- | --- |
| pg-types 2.2.0 | README contains complete MIT text, Copyright (c) 2014 Brian M. Carlson | License text located in the supplied installed-package README |
| pgpass 1.0.5 | README contains complete MIT text, Copyright (c) 2013-2016 Hannes Hörl | License text located in the supplied installed-package README |
| @esbuild/win32-x64 0.28.2 | MIT metadata; binary-identifying README; matching esbuild 0.28.2 parent LICENSE.md | Supporting matching-version parent MIT text, Copyright (c) 2020 Evan Wallace |
| Vite's nested @esbuild/win32-x64 0.25.12 | MIT metadata; binary-identifying README; matching nested esbuild 0.25.12 parent LICENSE.md | Supporting matching-version parent MIT text, Copyright (c) 2020 Evan Wallace |
| @rollup/rollup-win32-x64-gnu 4.65.1 | MIT metadata; binary-identifying README; matching rollup 4.65.1 parent LICENSE.md | Supporting parent core MIT text and bundled-dependency notices |
| @rollup/rollup-win32-x64-msvc 4.65.1 | MIT metadata; binary-identifying README; matching rollup 4.65.1 parent LICENSE.md | Supporting parent core MIT text and bundled-dependency notices |

The native-package folders in the supplied follow-up contained package metadata, a brief README, and a native binary, but no complete license text. Matching parent texts provide supporting evidence; they do not independently establish every notice obligation for code compiled into those binaries. No standalone native-binary license files were added to the repository.

### Bundled-code license categories

The collected parent files show why lockfile license declarations are not a complete embedded-code inventory:

- Rollup 4.65.1: core MIT text and bundled-dependency notices listing MIT, ISC, and 0BSD.
- Vite 6.4.5: core MIT text and bundled-dependency notices listing Apache-2.0, BSD-2-Clause, CC0-1.0, ISC, and MIT.
- Vitest 5.0.5: core MIT text and additional bundled-dependency material in its collected LICENSE.md.

These tooling notices are distinct from the three-component browser-runtime notices file. Presence in a tool's package does not by itself establish inclusion in Relay Ops's browser output. No independent bundle-composition audit was performed.

## Rewritten history references

A privacy-driven author/committer email rewrite changed commit IDs without changing the current tracked-file tree. Current-history references are:

- README dependency update: c300d499310c9df1d8175bcbadd4c5c596e41582.
- Browser notices: 9a2e6769954f5a032ce2f8380c693470267b09e7.
- Initial dependency-review record and rewritten baseline: 3b34a7713963c21dff6c0e0d787329ddfa351cc8.

The current README summarizes scoped privacy and screenshot results. The owner's screenshot review is complete; independent visual inspection is not.

## Remaining limitations and release checks

- Installed-package license evidence has been expanded and the six initial filename-scan gaps investigated; exhaustive individual license-text and compliance review remains incomplete.
- Uninstalled optional-package contents, embedded third-party code, nested notices, and native-binary composition have not been comprehensively reviewed.
- Each proposed distribution's third-party contents have not been independently audited. Preserve applicable upstream licenses, copyrights, disclaimers, and notices when redistributing dependencies.
- Development tools are not automatically part of a browser distribution; lockfile presence alone does not establish bundle inclusion.
- Repeat relevant checks when versions or distribution formats change.
- The owner reported an actual-device smoke-test pass on Samsung S26 Ultra using Samsung Internet. Chrome on the same phone returned ERR_TOO_MANY_RETRIES and remains unresolved. These are owner-reported manual results, not universal mobile compatibility. See [the browser-verification record](browser-verification.md). Independent screenshot inspection remains pending. Privacy checks have explicit coverage limitations in the README.
- No deployment, visibility change, or production-readiness claim is authorized by this record.
