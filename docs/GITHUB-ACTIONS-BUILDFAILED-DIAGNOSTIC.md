# GitHub Actions `BuildFailed` / `startup_failure` diagnostic

7 September 2026 · repository `FullSpektrum-ai/akilii` · Phase 7 acceptance blocker.

## Verdict

The current Phase 7 pull-request checks are failing **before workflow job creation**. This is not evidence that the application build or tests failed.

The strongest current diagnosis is a GitHub Actions workflow-registration / dispatch failure involving a synthetic `BuildFailed` workflow record. The repository-side workflow file used by the affected branch is byte-identical to the workflow that succeeded on `main` less than an hour earlier.

Do not weaken tests, rewrite application code, rename workflows repeatedly or merge around this blocker. Escalate the GitHub Actions registration problem and run the current branch independently on a clean machine while it is unresolved.

## Local repository evidence

### Healthy control on `main`

- Commit: `f0679c0590b1c0193a387ba4c39b00fbc957cced`
- Workflow run: `34092697639`
- Workflow name: `Validate akilii`
- Workflow id: `351104574`
- Workflow path: `.github/workflows/ci.yml`
- Event: `push`
- Conclusion: `success`
- Started: `2026-09-07T06:51:34Z`

### Broken Phase 7 PR example

- Branch: `phase7-v01-tracer`
- Commit: `ca6199656a00b2d04623bc1cf54fac272e0c67dc`
- PR: `#1` (draft)
- Workflow run: `34096598394`
- Workflow name: empty
- Workflow id: `352079463`
- Workflow path: `BuildFailed`
- Display title: `(Unknown event)`
- Event: `pull_request`
- Conclusion: `startup_failure`
- Jobs created: `0`
- Started and completed: `2026-09-07T07:40:08Z`
- Re-running failed jobs returns `403` / `This workflow run cannot be retried` because no workflow job exists.

### Workflow contents are ruled out as the differentiator

Both `main` and `phase7-v01-tracer` resolve `.github/workflows/ci.yml` to blob SHA:

`e38ecfa58f4f027ef11945456ec137b8131dc98b`

The workflow is:

```yaml
name: Validate akilii
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: node desktop/build-shared.mjs
      - run: npm --prefix desktop test
```

No Phase 7 commit changed this file.

## Why this points away from application code

A normal Actions failure creates a workflow job and then fails at checkout, setup, install, build or test. The current failing runs instead have:

- empty workflow name;
- `path = BuildFailed` rather than `.github/workflows/ci.yml`;
- a different synthetic workflow id;
- `conclusion = startup_failure`;
- zero jobs;
- no runner assignment;
- no checkout;
- no npm install/build/test;
- no job logs to inspect.

The failure therefore occurs before the repository source is executed.

## Contemporary external reports

Several GitHub Community reports in August–September 2026 describe the same signature: an orphan/deleted `BuildFailed` workflow registration intercepts otherwise valid workflow events and produces `startup_failure` with zero jobs.

Examples:

- https://github.com/orgs/community/discussions/206902
- https://github.com/orgs/community/discussions/206626
- https://github.com/orgs/community/discussions/205578
- https://github.com/orgs/community/discussions/206684
- https://github.com/orgs/community/discussions/205770

These reports are community evidence, not an official GitHub root-cause declaration. The repository evidence is nevertheless sufficiently specific to treat this as an Actions infrastructure/registration blocker until GitHub provides contrary diagnostics.

## Support / escalation packet

Use this exact packet when contacting GitHub Support or filing a GitHub Community Actions bug through the official template:

```text
Repository: FullSpektrum-ai/akilii
Visibility: public
Affected PR: #1
Affected branch: phase7-v01-tracer
Current affected head: ca6199656a00b2d04623bc1cf54fac272e0c67dc
Synthetic workflow id: 352079463
Synthetic path: BuildFailed
Synthetic name: ""
Failure: startup_failure
Jobs: 0
Example broken run: 34096598394
Event: pull_request

Last healthy control:
workflow id: 351104574
path: .github/workflows/ci.yml
run: 34092697639
commit: f0679c0590b1c0193a387ba4c39b00fbc957cced
conclusion: success

The ci.yml blob is identical on healthy main and failing branch:
e38ecfa58f4f027ef11945456ec137b8131dc98b

Please inspect/purge/re-index any orphaned or deleted BuildFailed workflow registration and restore normal dispatch to the active repository workflows. No job is being created, so this fails before runner assignment or repository code execution.
```

## Team action while GitHub is unresolved

George should independently run the exact Phase 7 branch from a clean checkout using Node 24:

```sh
npm ci
npm run build:beta
npm test
node desktop/build-shared.mjs
npm --prefix desktop ci
npm --prefix desktop test
```

Record:

- OS / architecture;
- Node/npm versions;
- exact commit SHA;
- command results;
- failing test/log excerpts if any;
- whether cloud/local setup was attempted;
- no secrets or personal transcripts in evidence.

A clean-machine pass does not repair CI, but it separates code acceptance from the GitHub infrastructure outage.

## Release rule

Keep PR #1 draft. Do not deploy the new migrations or merge Phase 7 solely on source review. Required evidence remains:

1. independent clean-clone build/tests;
2. functioning CI or an explicitly accepted temporary equivalent;
3. isolated migration rehearsal;
4. browser/device/accessibility product review;
5. André product acceptance;
6. George technical acceptance.
