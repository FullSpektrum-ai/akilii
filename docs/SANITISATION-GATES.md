# Behaviour-preserving sanitisation gates

## Purpose

Reduce review and maintenance cost without changing akilii's function, visual
identity, response quality, privacy boundary or supported platforms.

## Non-goals

The sanitisation does not add product capability, change the design, upgrade
dependencies, migrate production data, deploy a release, enable agent swarms or
qualify FlowState for production.

## Required evidence for every slice

Each commit must state:

1. The single problem it addresses.
2. The behaviour that must remain unchanged.
3. The files and platforms affected.
4. The tests and journeys used to verify it.
5. The performance or output measurements compared.
6. The exact rollback commit.

## Acceptance gates

- Clean installation using Node 24 and both lockfiles.
- Shared application build succeeds.
- All 88 root tests pass.
- Shared desktop server rebuilds.
- All 23 desktop tests pass.
- macOS Apple Silicon, macOS Intel and Windows x64 packages generate.
- No unexplained change to generated-output checksums or sizes.
- No unintended visual change at desktop and phone widths in both themes.
- Keyboard, focus, reduced-motion and narrow-screen checks pass.
- No additional network request or model call on the chat critical path.
- Provider and model selection remain explicit and stable.
- Authentication, tenant isolation, Work approval and saved-data behaviour remain intact.
- Humanistic-language checks continue to pass.

## Stop conditions

Stop and return to the checkpoint when:

- baseline behaviour cannot be reproduced;
- a proposed deletion is not proven unreachable;
- a refactor changes script order without an equivalence test;
- latency or output-size movement cannot be explained;
- platform-specific behaviour cannot be checked;
- a database or provider migration becomes necessary;
- clean-up begins changing product scope.

## Proposed review slices

1. Make Node 24 selection explicit and fail early on unsupported versions.
2. Remove duplicated comments and classify legacy functions without deleting them.
3. Establish the current runtime matrix as the documentation authority.
4. Prove whether the old `desktop/ui` renderer is excluded, then archive or remove it.
5. Mark generated desktop output unambiguously and verify regeneration.
6. Centralise human-facing error translation with unchanged messages.
7. Extract one backend route family behind contract tests.
8. Replace one frontend concatenation boundary with an explicit import.

Slices 7 and 8 require the complete equivalence harness and separate André and
George acceptance. They must not be bundled with the low-risk preparation work.
