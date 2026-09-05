# akilii — working early-access application

The root route is the live application. `/storyboard` preserves the separate scripted journey and build-ladder review asset.

## What works

- ChatGPT SSO through the Sites dispatcher, with site-level access controls and server-side identity checks.
- First-run account setup: preferred name, optional focus and communication preferences, and explicit processing consent.
- Live streamed OpenAI Responses API conversations using `gpt-5.4-mini`; API credentials stay server-side.
- Durable per-user conversations, explicit memories, editable Work plans, version history, feedback and data export/deletion.
- Optional PDF/DOCX/TXT/Markdown text extraction on the user's device. Only a reviewed excerpt is sent and saved; original files are not uploaded.
- Browser dictation, attachment/mode menu, context on/off, new chats and searchable history.
- Component-specific Figma theme tokens, embedded canonical fonts and monochrome brand/icon vectors using currentColor (no blanket image inversion).

## Run and verify

Requires Node 24 and npm. Run `npm ci`, `npm run build`, then `npm test`. The checked-in generated Drizzle migrations define D1 tables; do not edit an applied migration. Run `npm run db:generate` for subsequent schema changes.

For local review, run `node dev.mjs` after building. It binds only to 127.0.0.1:4317, uses a synthetic identity and an in-memory SQLite database. This validates app behaviour but is not a local SSO implementation. It reads the ignored `.env.local` for live AI requests. Never commit that file. Production identity is supplied only by Sites, not by this development server.

`build.mjs` bundles the Worker and document reader. All required assets and source are within this checkout. The current deployment is an owner-only Sites app with a D1 DB binding. Keep its existing project id; never create a duplicate site during updates.

## Architecture and boundaries

The Worker owns authentication checks, ownership filters, consent checks, source/context selection, usage limits and provider requests. Browser input cannot select an arbitrary user id, model, API endpoint or secret. Mutations require a same-origin Origin header. All SQL input is bound. Model output is rendered as text, never executed as HTML. The provider receives only bounded recent history and enabled approved context. There are no model tools or external actions.

Storage uses profiles, conversations, messages, memories, Work items/versions, feedback, request identifiers, short-lived response locks and daily request counters. AI stream completion is required before an assistant message is saved. Stop keeps the user message; partial AI output is not persisted. Failed requests count towards the daily allowance. Limits are 30 attempts per account and 60 total per UTC day, with bounded input and 1,800 output tokens. These are application request caps, not an OpenAI account-wide monetary spend cap.

Removing a memory does not rewrite an old chat. Turning off context excludes saved preferences from the next call, but existing history in that conversation remains. Start a new conversation for a clean history. Account deletion removes product data; pseudonymous usage counters remain to prevent daily-limit evasion. Provider retention is separate and disclosed in the app.

## Validation

Automated tests cover missing authentication, consent, cross-origin writes, cross-account isolation, Work version conflict handling, export/deletion, selected-context exclusion, stream completion/persistence and quota limits. A real API smoke test and a complete local setup-to-streamed-response test passed with fictional input.

## Current limits for reviewers

- SSO is Sign in with ChatGPT. Google/Microsoft enterprise OAuth is not configured.
- Site access is owner-only until selected reviewers are granted access. No invitation emails have been sent.
- Document parsing extracts text only. Scanned PDFs need a pasted excerpt; no OCR or permanent document library is implemented. Excerpts are limited to 8,000 characters, files to 2 MB, and PDF extraction to the first 30 pages / approximately 10,000 characters before review.
- No clinical diagnosis, psychometric validation, live web search, automatic actions, billing UI or external integrations.
- Memory is user-approved context, not a verified neuropsychological profile. Work is saved only through explicit controls.
- The app supports consent and deletion controls but has not undergone a formal legal, clinical or production security review.
- Database tests use a SQLite D1 adapter. End-to-end hosted SSO and external reviewer access still need acceptance with actual reviewer identities.
- The dependency audit reports a development-only advisory in Drizzle's transitive esbuild loader. The affected esbuild development server is not run or deployed; document libraries have no reported advisory in the audit.

## Design references

Figma file `KPWqp1q4FYiT2X2sYEw6yY`: sidebar Light `4810:8090`, Dark `4810:8165`; composer set `4612:105821`; semantic collection Light `2:1`, Dark `696:0`. `theme-tokens.json` records resolved component colour values. Synthetic library content has been replaced by the signed-in user's data. No Figma source or delivery DOCX was changed by this implementation.

## Repository and Supabase handoff — 5 September 2026

This is the canonical GitHub source repository for the current build. It replaces the older Figma Make / Vite application in a normal commit, preserving previous history. CI performs a locked dependency install, production build and backend tests on main and pull requests. Generated bundles are intentionally ignored and rebuilt from source.

The remote Supabase project `xmesqilkgeaoqrxbooqe` (akilii v0.1 MVP demo build, London) was verified ACTIVE_HEALTHY and this checkout was linked successfully. For another developer: authenticate with `supabase login`, then run `supabase link --project-ref xmesqilkgeaoqrxbooqe` from this repository. `supabase init` has already been completed; do not reinitialise it. The link cache stays ignored. `supabase/config.toml` is local development configuration, not a statement that remote auth settings were changed.

The publishable key and project URL in `.env.example` are public client configuration. Copy that file to `.env.local` and set the server OpenAI key privately if live local responses are needed. Never replace a database password placeholder with a password in a tracked file. No database password is needed for the completed CLI link.

**Runtime status:** the working application still uses the Sites identity dispatcher and D1 storage. Linking Supabase does not migrate data or enable Google OAuth. No Supabase schema, data, users or provider settings were deleted or changed in this repository replacement. The former repository's SQL migration remains recoverable in Git history; it has not been replayed or rolled back remotely.

Next migration gates: choose the independent app origin; configure Supabase Google authentication for that origin; replace dispatcher-specific identity with validated Supabase sessions; migrate storage with owner isolation and data-export reconciliation; test two real users before switching the live preview. SQLite migrations under `drizzle/` cannot be applied to Postgres.

The existing `.openai/hosting.json` identifies the current private preview. GitHub CI validates source only; it does not publish to Sites. Publishing remains a separate operation using the exact validated source. The old GitHub Pages deployment workflow was removed because Pages cannot run this server-backed application. An already-published Pages site is not updated by this replacement.

FlowState remains a planned adapter: the supplied public default branch at `c6a6b22df537441ca1ff059fd47e973e35ae140c` does not implement the required agent/MCP service. Keep the direct provider working until a verified runtime can satisfy the contract.
