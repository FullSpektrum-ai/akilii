# akilii — early-access engineering preview

Current package: **0.1.0-alpha.9**, the local akilii + FlowState integration alpha, targeting the V0.1 closed beta on **5 October 2026**. This version is not evidence that the cumulative V0.1 gates have passed. André Skepple owns product, design and product acceptance; George Nangle owns engineering, feasibility and technical acceptance. Runtime, privacy, cost and release decisions require joint review.

Phase 8 review: [flagship demo path, feature flags and limitations](docs/PHASE8-FLAGSHIP-DEMO.md). Alpha.9 adds a local, authenticated FlowState execution adapter behind the canonical akilii shell. FlowState remains a replaceable runtime; akilii retains product-state authority.

Current alpha.9 verification: [reproducibility baseline](docs/ALPHA9-REPRODUCIBILITY-BASELINE.md), [runtime matrix](docs/ALPHA9-RUNTIME-MATRIX.md) and [behaviour-preserving sanitisation gates](docs/SANITISATION-GATES.md). These three documents govern the pre-sanitisation review; historical phase notes do not override their current-state claims.

FlowState is created and maintained by Yomi Colledge. The alpha.9 adapter is pinned to [baphled/FlowState](https://github.com/baphled/FlowState) revision `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d`. See the [attribution notice](NOTICE.md) and [publication gate](docs/FLOWSTATE-PROVENANCE-AND-PUBLICATION.md). This repository does not vendor or distribute FlowState source or binaries; redistribution of FlowState-derived material remains blocked until the conflicting upstream licence metadata is resolved with Yomi.

The implemented minimum personal-context lifecycle is documented in [NPR Phase 0 for alpha.9](docs/NPR-PHASE0-ALPHA9.md). It stores only user-provided context, applies bounded purpose, correction, expiry and removal controls, and keeps runtime execution separate from canonical context ownership.
## Canonical access

- Public product page: **https://fullspektrum.ai/akilii**
- Canonical application origin: **https://akilii.fullspektrum.ai**
- Original beta / rollback URL: **https://fullspektrum-ai.github.io/akilii/** (redirects to the custom domain while it is configured).

The application owns `/` on its subdomain. The GitHub Actions Pages deployment uses the repository's **Settings → Pages → Custom domain** setting. GitHub ignores artifact `CNAME` files for this workflow; `AKILII_PUBLISH_CUSTOM_DOMAIN` is only for alternative branch-based publishing and is not a production activation switch. DNS must point `akilii` to `fullspektrum-ai.github.io`. See [production cutover and rollback](docs/PRODUCTION-DOMAIN.md).

## Start here, George

1. [Current full-stack handover and architecture](docs/FULL-STACK-HANDOVER.md): what runs, where it lives, how to reproduce it, and remaining operational gates.
2. [V0.1 Design → Build Convergence](docs/V01-DESIGN-BUILD-CONVERGENCE.md): the current product tracer, Thread contract, 12-state implementation disposition, build slices and acceptance tests.
3. [Requirements and Figma reconciliation](docs/HANDOVER-ALIGNMENT-AUDIT.md): gaps against the recovered PRD, technical contracts and live design inventory.
4. [Original PRD](docs/reference/2026-08-26/akilii_definitive_mvp_prd.md) and [13-document engineering pack](docs/reference/2026-08-26/akilii_mvp_handover/00_READ_ME_FIRST.md): intended requirements, preserved unchanged. Read the reconciliation before treating historical choices as current implementation.
5. [Authentication activation](docs/AUTH-READINESS.md), [early access and metrics](docs/EARLY-ACCESS.md), [desktop installation](desktop/INSTALL.md).

The [older README](docs/history/README-before-handover-review.md) and [chronological engineering notes](docs/GEORGE-V01-REVIEW.md) retain history. They contain superseded statements and are not the current architecture reference.

Next: [ordered implementation packages and decision queue](docs/GEORGE-IMPLEMENTATION-SEQUENCE.md).

Design handoff: [bidirectional user-flow, screen and component audit](docs/USER-FLOW-DESIGN-AUDIT.md), including 22 journey gaps, canonical component references and closure criteria.

## Build and test

Use Node 24. From the repository root:

```sh
npm ci
npm run build:beta
npm test
node desktop/build-shared.mjs
npm --prefix desktop ci
npm --prefix desktop test
npm --prefix desktop start
```

`node dev.mjs` serves a **synthetic identity/in-memory Worker fixture** on localhost:4317. Never deploy it as authentication. `npm run build` builds the shared Worker implementation; `npm run build:beta` produces the hosted frontend in `dist/web`. Generated bundles are not edited directly.

## Current topology

- Public entry: [fullspektrum.ai/akilii](https://fullspektrum.ai/akilii) → canonical application origin [akilii.fullspektrum.ai](https://akilii.fullspektrum.ai) once DNS/custom-domain activation is complete.
- Current web preview: [GitHub Pages](https://fullspektrum-ai.github.io/akilii/) → Supabase Auth and Edge Function `akilii-api` → private Postgres product data → direct OpenAI/Anthropic adapters.
- Desktop cloud: the same UI → authenticated loopback host → main-process cloud session → the same Supabase API.
- Desktop local: the same UI → loopback host → local SQLite and Ollama. Local capabilities are a subset; shared appearance does not imply backend parity.
- Hybrid: separate local/cloud workspace selection, **not automatic model routing or synchronisation**.
- FlowState: adapter/research exists; no qualified active FlowState path in either application. AWS hosting is proposed, with no reproducible deployed service recorded in this checkout.
- Legacy Sites deployment uses separate identity/data. It is not upgraded by Pages publication and is not automatically migrated.

## Capability boundary

Implemented source includes streamed chat, validated response cards, user-chosen context, Work, cloud projects, document excerpt review, avatars, voice/transcript interfaces, a bounded opt-in Work lookup and early-access admission capped at 30 cloud seats with a waiting list. Provider and connector acceptance varies; see the handover matrix.

The exact cloud model allowlist is [backend/models.js](backend/models.js), including OpenAI and Claude. Local models come from Ollama discovery. Provider credentials remain server-side; adding a UI option does not prove provider availability. Request quotas are not a hard financial spending ceiling.

The full governed NPR lifecycle, outcome-to-learning loop, resumable runtime contract, hosted FlowState and complete local/cloud feature parity are **not complete**. The Phase 6 continuity tracer therefore introduces Thread as explicit product state without pretending that runtime replay or governed learning already exists. No diagnosis, passive fatigue assessment, arbitrary model-generated HTML or unrestricted external actions are claimed.

## Sources and deployment

Shared source is in `src/`; canonical exports are in `assets/`; semantic colours come from `theme-tokens.json`. Supabase routes/migrations and desktop host extensions are separate integration layers. Do not develop `desktop/ui` as another product UI.

Pages builds on main; the backend deploys separately. Review migration compatibility before deployment. No provider key, SMTP credential, OAuth secret or database password belongs in source, release archives or documentation. Public Supabase project identifiers are intentionally public.

FlowState connection preparation and the existing-hosting workaround are documented in [FLOWSTATE-CONNECTION.md](docs/FLOWSTATE-CONNECTION.md). `npm run flowstate:check -- --local` checks local connectivity without enabling FlowState for user traffic.

Figma file: [akilii canonical design](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY). Current authority is organised through **02 — Components**, **03 — Human Journeys · Validation**, **06 — Responsive & States**, **07 — V0.1 Product Authority**, **08 — Handoff · Production Mapping** and **09 — Workflow · State Trace Matrix**. Page 07 section `05 · COMMERCIAL GOLDEN PATH · V0.1 BUILD AUTHORITY` and Page 08 section `00 · PHASE 6 — V0.1 DESIGN → BUILD CONVERGENCE AUTHORITY` are the current tracer/handoff pair. Historical ASK/DISCOVER/SUPPORT screen generations are reference, not implementation authority.

[Live inventory](docs/audit/figma-inventory-2026-09-06.json) records an earlier selected-page snapshot; it does not certify the current board or visual/functional parity. Every accepted journey needs design, implementation and test evidence tied to a release.
