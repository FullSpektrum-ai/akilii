# GitHub Actions `BuildFailed` / `startup_failure` diagnostic

7 September 2026 · repository `FullSpektrum-ai/akilii` · Phase 7 acceptance blocker.

## Verdict

The current Phase 7 pull-request checks are failing **before workflow job creation**. This is not evidence that the application build or tests failed.

Two platform-level explanations now require resolution before changing repository CI:

1. **Account verification is a concrete blocker to check first.** The connected GitHub identity currently rejects PR metadata/comment mutations with `At least one email address must be verified to do that.` GitHub's official email-address reference states that an account without a verified email cannot create or use GitHub Actions. Verify the GitHub account email and generate a fresh PR event before deeper repository troubleshooting.
2. **The observed Actions signature also matches a contemporary GitHub workflow-registration defect.** A synthetic/deleted `BuildFailed` workflow record is intercepting PR events with `startup_failure` and zero jobs. The repository-side workflow file is byte-identical to the workflow that succeeded on `main` less than an hour earlier.

Do not weaken tests, rewrite application code or repeatedly rename workflows in response. First verify the GitHub account email. If the same synthetic `BuildFailed` / zero-job signature persists afterwards, escalate the workflow-registration evidence to GitHub Support and run the current branch independently on a clean machine.

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
- PR: `#1` (draft)
- Representative workflow run: `34096598394`
- Newer representative run: `34098143507`
- Workflow name: empty
- Workflow id: `352079463`
- Workflow path: `BuildFailed`
- Event: `pull_request`
- Conclusion: `startup_failure`
- Jobs created: `0`
- Re-running failed jobs returns `403` because no workflow job exists.

### Account mutation evidence

Attempts through the connected GitHub API to update PR #1 metadata and add a PR conversation comment return:

```text
403
At least one email address must be verified to do that.
```

This does not prove that email verification is the only cause of the synthetic `BuildFailed` run. It does mean email verification is a documented prerequisite for Actions and should be corrected before treating the workflow registry as the sole root cause.

### Workflow contents are ruled out as the branch differentiator

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

These are community evidence, not an official GitHub root-cause declaration. GitHub's official email-address reference is separate evidence that verified email is required to create/use Actions.

## Resolution sequence

### Step 1 — verify the account

In GitHub account settings, ensure at least one email address is verified for the `andreskepple` identity used by the repository. Then create a fresh commit or re-open/synchronise the PR so GitHub receives a new workflow event.

Expected success condition: the run resolves to workflow `Validate akilii`, path `.github/workflows/ci.yml`, and creates the `build-and-test` job.

### Step 2 — if `BuildFailed` persists, escalate the registry evidence

Use this packet when contacting GitHub Support or filing a GitHub Community Actions bug through the official template:

```text
Repository: FullSpektrum-ai/akilii
Visibility: public
Affected PR: #1
Affected branch: phase7-v01-tracer
Synthetic workflow id: 352079463
Synthetic path: BuildFailed
Synthetic name: ""
Failure: startup_failure
Jobs: 0
Representative broken runs: 34096598394, 34098143507
Event: pull_request

Last healthy control:
workflow id: 351104574
path: .github/workflows/ci.yml
run: 34092697639
commit: f0679c0590b1c0193a387ba4c39b00fbc957cced
conclusion: success

The ci.yml blob is identical on healthy main and failing branch:
e38ecfa58f4f027ef11945456ec137b8131dc98b

Account email verification has been confirmed before escalation.
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

A clean-machine pass does not repair CI, but it separates code acceptance from the GitHub platform blocker.

## Release rule

Keep PR #1 draft. Do not deploy the new migrations or merge Phase 7 solely on source review. Required evidence remains:

1. verified GitHub account email and a fresh CI event;
2. independent clean-clone build/tests;
3. functioning CI or an explicitly accepted temporary equivalent;
4. isolated migration rehearsal;
5. browser/device/accessibility product review;
6. André product acceptance;
7. George technical acceptance.
