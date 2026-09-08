# desktop/rebaseline

This directory is the clean desktop-host boundary for akilii. It is being introduced in parallel with the current `main.cjs` host until desktop acceptance parity is proven.

Electron is an operating environment, not another implementation of the product.

## Responsibilities

- application lifecycle and single-instance handling;
- secure BrowserWindow construction and navigation/permission guards;
- explicit local/cloud workspace mode selection;
- local OS/model capabilities;
- cloud-session hosting;
- loopback transport lifecycle;
- tray/menu/desktop affordances.

## Forbidden responsibilities

- a desktop-specific akilii system prompt;
- separate NPR/memory semantics;
- separate Thread/Work product rules;
- automatic local/cloud routing or sync;
- provider-specific objects in browser state;
- treating a FlowState health probe as enabled agentic execution;
- silently falling back from local to cloud or cloud to local.

The desktop host will consume the same `app/core` and `app/api` contracts as web/cloud after the generated desktop bundle includes those modules. Until that cutover, the current host remains rollback-only implementation authority.

## Modules

- `capabilities.cjs` — explicit runtime capability matrix.
- `mode.cjs` — local/cloud workspace-mode rules; there is no automatic hybrid execution mode.
- `host-config.cjs` — bounded loopback and host configuration.
- `window-security.cjs` — hardened BrowserWindow and navigation/window rules.
- `runtime-controller.cjs` — explicit lifecycle around local/cloud adapters with no silent fallback.

A future thin composition root may import Electron and wire these modules. The modules themselves are deliberately testable without launching Electron.
