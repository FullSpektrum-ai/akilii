# akilii — V0.1 beta build

André owns product, design and acceptance; George owns engineering and technical acceptance.

## Application and deployment

The Google-enabled application builds to `dist/web` and deploys through GitHub Pages at https://fullspektrum-ai.github.io/akilii/. Its API is Supabase Edge Function `akilii-api` in project `xmesqilkgeaoqrxbooqe`. The prior owner-only Sites application remains a separate deployment using ChatGPT identity and D1; changes to this repository do not automatically publish to Sites or migrate its users/data.

Run Node 24, `npm ci`, `npm run build:beta`, `npm test`. CI builds and tests before Pages publication. Deploy backend changes separately with `supabase functions deploy akilii-api --use-api --project-ref xmesqilkgeaoqrxbooqe`. Backend secrets stay in Supabase. Public project URL and publishable key are intentionally in the browser; service keys and database passwords never are.

`node dev.mjs` runs the Worker variant on 127.0.0.1:4317 using a fictional identity and in-memory database. This is a UI/test fixture, never production authentication. Do not commit `.env.local`. Build outputs are generated and ignored.

## Implemented

Google PKCE sign-in, verified server identity, explicit beta membership, first-run consent, user-owned Postgres data with RLS, streamed direct-provider chat, approved preferences, Work plans/version history, export/deletion, document excerpt review and browser dictation. The UI has model selection, resizable desktop navigation/context panel, collapse motion, reduced-motion support, thinking/stop controls and Context/Work/Activity views.

Model allowlist: GPT-5.4 mini, GPT-5.6 Sol, GPT-6 Astra. General quota: 30 requests/account and 60/preview per UTC day, including failures. Sol additionally caps at 5/account and 10/preview; Astra 3/account and 6/preview. Output is bounded to 1,800 or 4,096 tokens. These are request caps, not a provider-wide spending ceiling. Model output is text, never executed as HTML. All models receive the same approved context rules.

## Runtime and integration boundaries

Supabase stores runs, append-only application events, proposed actions and connection choices. Work proposal approval checks owner, exact action, expiry and current Work version in a locked transaction; repeated approval returns a receipt. Data deletion includes these records atomically. The internal JSON-RPC Work transport supports listing plans and proposing versions after opt-in, and rechecks connection status on each call. It does not expose execution as an AI tool. It is not yet a public third-party OAuth MCP endpoint. Autonomous chat tool invocation remains disabled.

FlowState research found the working `feature/dockerise` branch at `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d`, unlike the scaffold on the default branch. The local backend on 127.0.0.1:8081 reports healthy. `backend/flowstate.js` translates its actual `/api/chat` SSE contract, with fixture coverage; it is deliberately not registered for beta user traffic. Shared deployment needs an HTTPS service, isolated agents/storage, machine authentication, tool allowlisting, tenant-bound context and verified cancellation. The upstream ephemeral dispatcher uses `context.WithoutCancel`; closing HTTP alone must not be represented as stopping external work. No personal agent configuration or local private mounts have been exposed.

Google sign-in does not grant Drive/Calendar access. Those integrations require independent scopes, token storage, revocation and action approval before becoming available. No integration is labelled connected merely because Google login works.

## Database and security

Applied Postgres migrations live under `supabase/migrations`; SQLite migrations under `drizzle` belong only to the older Worker variant. The private `akilii` schema uses user ownership RLS and server-controlled role/claims per transaction. The old public demo table is preserved but its unrestricted access policy is removed. Product data is not automatically transferred between identity systems. Do not auto-link accounts by email.

API requests validate Google identity through Supabase Auth and beta membership before accessing records. CORS allows the exact app origin. Secrets are server-only. Plans/documents are untrusted source material. No neurodivergence diagnosis or psychological scoring is inferred. Raw documents are parsed locally, and only reviewed excerpts are stored/sent.

## Acceptance still required

Google login, authenticated bootstrap and first-run setup passed for André. Live structured chat, card-to-project creation and task completion surviving a refresh passed using a clearly labelled fictional workshop. Two-user end-to-end acceptance remains. Also pending: hosted FlowState isolation and cancellation; actual external connector grants and tool receipts; full-duplex voice; production security and privacy review. Unit tests and local UI checks do not establish these as complete.

## Canonical design

Figma file KPWqp1q4FYiT2X2sYEw6yY: expanded sidebar Light 4810:8090, Dark 4810:8165; collapsed rail 64 px, brand 32 px, actions 44 px, icons 24 px. `theme-tokens.json` drives semantic colours; monochrome vectors use currentColor, avoiding blanket image inversion.

## Adaptive workspace revision

The Google beta now renders validated response objects (checklists, decisions, projects, email drafts and reflections), with conversational text streamed before the completed cards. Old text conversations remain readable; clients explicitly opt into the richer response protocol. Model-authored HTML and arbitrary UI components are never executed. Card checkboxes are temporary until a user creates a persistent project.

Projects have private owner-scoped tasks, completion, pause/resume, an explicit selected-project context and optimistic version checks. Role, goal, working needs and presentation are user-entered preferences. They do not constitute a psychological assessment or automatic NPR classification. Pausing context excludes this information from the next model request. Calm mode removes decorative patterns and motion; operating-system reduced-motion preferences are respected.

Gmail is an opt-in compose connector using the dedicated Google client through Supabase OAuth. Gmail API is enabled in crypto-pulsar-398216. It creates reviewed drafts only; there is no send endpoint or inbox reader. Google’s compose scope also authorises sending at the provider level, and the connection dialog explicitly explains this. Provider access tokens are AES-GCM encrypted with the server-only EMAIL_TOKEN_KEY, bounded to one hour, never refreshed automatically, and removed on disconnect or product-data deletion. No provider tokens remain in browser storage. Draft attempts have owner-scoped idempotency receipts; uncertain results direct users to check Gmail before retrying. Previously created drafts remain in Gmail when akilii data is deleted. Users can revoke the Google grant in their Google account.

Gmail consent and actual draft creation still require account-level acceptance. The connector must not be described as end-to-end verified until that test passes. External Google users may require OAuth app verification for the restricted compose scope. The beta remains explicitly allowlisted.

Live regression fixes: qualify the Postgres response-lock conflict predicate and bind project task arrays with the driver JSON helper. Light and dark desktop appearances were visually checked. Gmail consent and draft creation remain unverified.
