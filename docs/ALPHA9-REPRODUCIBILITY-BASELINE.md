# akilii alpha.9 reproducibility baseline

Recorded on 9 September 2026 before sanitisation. This is evidence for the
current checkpoint, not a production-readiness claim.

## Protected source

- Checkpoint branch: `checkpoint/alpha9-pre-sanitisation-20260909`
- Checkpoint commit: `33528ec`
- Preparation branch: `chore/alpha9-sanitisation-prep`
- Required runtime: Node 24, as declared by `.nvmrc`

The checkpoint contains the complete tracked and previously untracked alpha.9
work. No ignored environment file or provider credential was added. Sanitisation
must not rewrite the checkpoint.

## Clean-checkout result

A new local clone was created from commit `33528ec`. The following completed
successfully using Node 24:

1. Root dependency installation from `package-lock.json`.
2. Shared application build.
3. All 88 root tests.
4. Shared desktop-server generation.
5. Desktop dependency installation from `desktop/package-lock.json`.
6. All 23 desktop tests.
7. macOS Apple Silicon package generation.
8. macOS Intel package generation.
9. Windows x64 package generation.

The clean checkout remained free of tracked changes after generation.

## Baseline outputs

| Output | Size | SHA-256 |
|---|---:|---|
| `dist/server/index.js` | 5,639,456 bytes | `2af2d99b0528da958ecb9ac2ce9775b63dd071244d12922289f2f2a36d231ba9` |
| `src/app.html` | 1,822,353 bytes | `8fd2221b8be27318cf43eef5deae86f7a2897e273c10ee4595196752c8ca402c` |
| `desktop/shared-server.cjs` | 5,640,356 bytes | `52540ebfd4105adad7259d381f00a7b13b4a279dc2c38214a8add496b19b1b4e` |

Approximate unpacked package sizes were 312 MB for macOS Apple Silicon,
318 MB for macOS Intel and 373 MB for Windows x64. These are baseline
measurements, not release-size targets.

## Dependency result

- Production dependencies: no known vulnerabilities reported by `npm audit --omit=dev`.
- Development dependency tree: four moderate findings reported during root installation.
- Desktop dependency tree: no known vulnerabilities reported.
- Two deprecated esbuild-kit transitive packages were reported during installation.

Do not apply an automatic forced dependency update. Review the dependency path,
compatibility and generated output before changing versions.

## Open reproducibility issues

1. The ordinary terminal resolves to Node 22.15.1 even though the repository
   requires Node 24. The clean run succeeded only after selecting an available
   Node 24. This must become automatic or fail clearly.
2. The macOS package review generated both architectures but warned that the
   `.icns` asset was being skipped as an unrecognised icon format. Treat the
   package as a review artefact until the installed-app icon is inspected.
3. Package generation on macOS does not prove execution on Windows. A Windows
   launch and core-journey check remains required.
4. These checks used synthetic/local fixtures. They do not prove deployed
   authentication, provider credentials, hosted FlowState, production data or
   real-device voice behaviour.

## Browser evidence audit

The browser scripts are not presently one trustworthy green acceptance suite.
They were run independently in the clean clone rather than being assumed from
the unit suite.

| Check | Result | Disposition |
|---|---|---|
| Mobile sign-in, cancellation and narrow-width | Pass | Retain as baseline evidence |
| Phone shell at 320, 390 and 430 CSS pixels | Fail | Composer position differs from the stored assertion; compare with the accepted design before changing either code or test |
| Historical browser audit | Fail | Looks for an onboarding theme control that is no longer visible in the current fast-start journey; reconcile it with the accepted journey |
| Phase 8 flagship script | Fail | Looks for `phase8-objective`, which is absent from the current path; classify the script as stale or restore the intended journey |

These failures do not contradict the 111 automated test results because the
browser scripts are not included in the root or desktop test commands. They are
an important handover gap: CI currently reports green without running them.

No product code or test was changed to conceal these failures. Sanitisation must
wait until André confirms the intended journey and the browser assertions are
made authoritative.

## Equivalence rule

Every sanitisation commit must rebuild from a clean checkout and must not be
accepted if it causes an unexplained test failure, generated-output change,
package failure, visual change, additional critical-path request or measurable
increase in akilii-controlled response time.
