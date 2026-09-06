# akilii v0.1 engineering review

5 September 2026. André owns product/design acceptance; George owns engineering acceptance and hardening. This is an incremental review build, not a beta release declaration.

## Desktop review scope

The bundled desktop now contains local conversations instead of only a browser launcher. It discovers installed Ollama models on 127.0.0.1:11434, streams local responses, allows stopping, and saves conversations across restart. It reuses the web canonical SVG brandmark and wordmark, supports light/dark presentation and reduced motion. Cloud workspace remains an explicitly opened browser destination.

Install/start Ollama and install a model separately before testing. No model is silently downloaded and no cloud fallback occurs. Local conversations live in the application's userData/local-v01/workspace.json, with owner-only creation permissions. They are not application-encrypted. Use fictional data for this review. The app does not currently provide tools, FlowState, voice or sign-in inside its native window.

## Reproduce

Use Node 24. Run npm ci and npm test / npm run build in the repository. In desktop, run npm ci, npm test and npm start. Package using npm run package:mac and npm run package:win. Output is under desktop/out. Packages are unsigned development artifacts, not signed installers.

## Review script

1. With Ollama stopped, open the app: see an honest unavailable state.
2. Start Ollama with an installed model; refresh and select it.
3. Ask for a fictional project plan. Confirm streaming and stop midway. Reopen history and verify partial status.
4. Quit/relaunch; verify conversation persists. Delete it and restart to verify deletion.
5. Switch light/dark, navigate by keyboard and test a narrow window.
6. Disconnect the internet while Ollama remains running; verify a local conversation still works.
7. Stop Ollama during a response; verify the error does not become a successful completion.

Automated checks cover persistence/deletion, invalid conversation IDs, fragmented stream parsing, incomplete stream rejection and IPC origin/destination restrictions. Root suite covers existing cloud behaviour. Live local generation, visual native-window checks and Windows runtime checks remain outstanding; localhost Ollama was not reachable during implementation.

## Release gates and critical path

| Priority | Deliverable | Acceptance | Owner |
|---|---|---|---|
| 1 | Local runtime verification | Above script passes on macOS and Windows with real installed models; stop latency measured | George |
| 2 | Shared workspace features | Context approval, work outcomes and learning review work in desktop without invented evidence | André + George |
| 3 | FlowState adapter | Real bounded action, approval, cancellation, isolation and unavailable-runtime tests pass; no public local-service exposure | George |
| 4 | Optional cloud features | Desktop OAuth return, account isolation, Microsoft consent, voice permissions and saved voice conversation verified | George |
| 5 | Data hardening | Recovery, retention/export, storage protection and error logging reviewed; no sensitive content in logs | George |
| 6 | Distribution | Signed/notarised macOS installer, signed Windows installer, install/uninstall and upgrade paths verified | George |
| 7 | Closed beta | Invite cohort, support route, privacy information, monitoring, cost limits and rollback rehearsed | André + George |

Keep local/cloud storage clearly separate until a reviewed migration/sync design exists. Do not present Ollama as FlowState. Do not infer diagnoses or silently approve archetype memories. Do not publish unsigned artifacts as general beta downloads. Preserve existing cloud user data.

Target remains 5 October 2026. Freeze one end-to-end useful activity before broadening integrations. If FlowState or signing gates fail, retain an explicitly scoped internal review; do not relabel incomplete capabilities beta-ready.

## 6 September: menu bar foundation

Added canonical monochrome template icon and native menu for reopening the workspace, stopping the current reply, opening cloud workspace and quitting. This is a native menu, not yet the compact conversational panel. Runtime check separately reports Ollama availability, FlowState health and disabled agentic execution. A healthy service does not imply a verified tool pipeline.

Inspected FlowState session/permission APIs in internal/api/server.go. Stream disconnection is not sufficient proof of work cancellation. Before activation, provision an isolated runtime, verify scoped permission-grant behaviour, bind each local conversation to its own session, and verify cancellation stops actual tool execution. Local services were not reachable during this pass. Native menu interaction and real provider tests remain outstanding.

## Shared interface correction — 6 September

The separate desktop renderer was rejected by André. Desktop now bundles the same src/app.template.html, styles, assets and scripts used by the web build through the shared server build. Do not develop desktop/ui as a parallel product interface. The Electron window now opens a loopback server protected with a random HttpOnly SameSite cookie. Persistent SQLite under shared-workspace stores the shared core API records. Earlier local-v01 JSON conversations remain untouched; migration is not implemented.

Core local models are injected into the shared API; the public provider path remains unchanged. Shared source does not establish feature parity: project/connector endpoints supplied only by the Supabase wrapper, cloud OAuth, microphone permissions, rich response validation and FlowState execution still need desktop adapters and integration testing. Native runtime and full visual comparison remain outstanding. The old installed application must be replaced to see the new build.

## Cloud-first alpha.2

New installations start in cloud mode. System-browser Google sign-in uses a PKCE verifier held in the desktop main process and an expiring nonce; the hosted callback returns an authorization code via the registered akilii protocol. Bearer tokens remain in main-process memory and requests go through the existing authenticated Supabase function. No AI provider key is packaged. Relaunch requires sign-in again. Test the packaged macOS and Windows callback end to end before beta distribution.

After onboarding, users choose cloud, local-first (requires installed Ollama models), or hybrid. Hybrid currently means choosing between separate cloud/local workspaces, not automatic inference routing or history synchronization. Mode preference persists locally. Existing local JSON history is retained but not migrated.

The Anthropic secret is installed on the hosted backend. A synthetic Claude Sonnet 4.6 call was rejected for insufficient provider credits. Live Claude acceptance is pending replenishment. OpenAI remains the default. This does not establish FlowState functionality.


## Consolidation and desktop sign-in — 6 September 2026

Keep package version 0.1.0-alpha.2; this is a target-version prerelease, not an accepted V0.1 milestone. Feature coverage is approximately G04–G05 with earlier cumulative acceptance still outstanding. Do not tag a ladder milestone until André and George record its gate evidence.

Priority order: complete cumulative G01–G05 verification; agree whether the project command-centre scenario replaces the original meeting-preparation scenario; qualify one real runtime workflow (G06); demonstrate outcome → approved preference → later adaptation (G07); then harden and rehearse release. No new optional feature breadth is required for these gates.

Desktop sign-in now supports an injected main-process network transport, wired to Electron net.fetch. Local proxy failures return a recoverable JSON message instead of an empty 500. Regression checks cover PKCE callback validation, transport routing, local bridge injection, Google launch, and cross-origin sign-in rejection. This is not proof of a completed real-user OAuth callback: reproduce the reported failure and complete Google sign-in on both packaged platforms before closing it.

Google uses a compact icon control with an accessible label. Sign in with ChatGPT is restricted to supported partner configurations; no akilii OAuth client registration has been established. The older Sites identity is separate and must not be presented as login to this Supabase workspace or linked by email. Leave this option unavailable until a legitimate provider registration and server-side identity mapping are configured.
