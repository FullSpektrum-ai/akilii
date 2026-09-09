# akilii alpha.9 NPR Phase 0

This document defines the implemented alpha.9 personal-context boundary. It is
evidence for a minimum vertical slice, not a claim that the wider NPR vision is
complete.

## What is real in alpha.9

- Fast start saves the user’s stated current goal as temporary context for
  seven days after explicit onboarding consent.
- Profile focus and communication choices become structured, owner-bound
  context records.
- A preference the user explicitly keeps from a conversation becomes a
  confirmed support preference.
- Corrections are versioned and take effect in the next eligible projection.
- Removal immediately clears the value and excludes the record from future
  projections.
- Projection filters by owner, lifecycle, confirmation, permission, validity,
  expiry, sensitivity, purpose and a maximum item count.
- Disabling **Use my context** supplies no NPR projection.
- Direct providers and FlowState receive the same bounded projection. Neither
  runtime can write the canonical store.
- The user can inspect temporary goals and chosen preferences in **My akilii**.

Every saved item carries a type, tier, lifecycle state, confirmation state,
confidence, sensitivity, provenance, validity, expiry, use control, purpose,
version and schema version. Audit events contain identifiers and lifecycle
metadata without duplicating the personal value.

## Deliberate limits

Alpha.9 does not infer a diagnosis, archetype, mood, productivity score or
psychometric profile. It does not automatically promote conversational guesses
into lasting context. Outcome-linked learning proposals, contradiction review,
semantic retrieval and federation are later gates.

In the ordinary interface this appears as clear language about “what matters
now” and “preferences you chose to keep”. NPR, agents and orchestration remain
implementation terms rather than user-facing jargon.

## Verification

The release gate covers:

1. owner isolation;
2. rejection of system-authored context through the user endpoint;
3. expiry, restriction, confirmation and purpose filtering;
4. immediate exclusion after deletion;
5. corrected preference use in the next AI request;
6. fast-start creation, live response, return and narrow viewport;
7. desktop parity through the shared server and migration set.

Production requires the four NPR migrations/tables to be present before the
matching API and frontend are released. Account resets must preserve beta access
and authentication identities while removing product and NPR records.
