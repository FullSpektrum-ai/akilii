# app/web

The re-baselined browser application is a small module graph. It is intentionally built in parallel with the current beta bundle until transport and user-facing acceptance parity are proven.

## Structure

```text
main.js        browser composition root
state.js       one explicit application store
router.js      Home / Chat / Work routes plus secondary Context route
api-client.js  same-origin HTTP boundary only
shell.js       navigation, chrome and view composition
dom.js         tiny DOM helpers
views/         Home, Chat, Work and My akilii surfaces
```

## Rules

- Home, Chat and Work are the only primary navigation destinations.
- My akilii / Context is a trust and control surface, not another everyday workspace.
- UI code does not import `app/api`, database adapters, provider SDKs or runtime engines.
- UI state contains product-facing data only; provider/runtime objects stay behind the API.
- No global application state and no dependency on source-file execution order.
- Empty, loading and error states are first-class.
- The UI never invents progress, completion, sync or external action state.

The current `src/` bundle remains rollback/migration source until this shell reaches acceptance parity.
