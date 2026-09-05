# akilii voice and runtime delivery gates

Owner: André (experience, consent and acceptance), George (implementation and verification).

## Voice interaction preference

The current microphone provides browser dictation into an editable draft. It never sends automatically. Keep typing equally available and stop capture when the tab hides.

The next complete voice slice should use a dedicated voice session, explicit microphone start, a visible listening/speaking state, a live transcript, mute, interruption and an obvious End control. Issue short-lived provider credentials from the authenticated backend; never put the long-lived API key in the browser. Use the same approved context selection and user identity as text. Do not retain raw audio by default. Make transcript retention a visible choice before starting.

First acceptance scenario: the user starts a five-minute bounded session, asks for one practical step, interrupts halfway through the reply, switches to typing, then ends the call. No audio or billed session continues after End, tab closure or connection loss. Verify microphone-denied and unsupported-browser alternatives. Speech must not imply a diagnosis or emergency monitoring.

Voice tool calls share the existing proposal/approval boundary. A casual spoken acknowledgement must not silently approve sending, deleting, purchasing or calendar changes. Show the exact action and require explicit confirmation. Voice sessions need server-enforced duration/concurrency limits and measured usage before invitations expand.

## FlowState production gate

Verified source: baphled/FlowState feature/dockerise, commit 40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d. Local service health: 127.0.0.1:8081. The default branch alone is not the working implementation.

Blockers before enabling in the shared application:

1. Choose and provision a reachable HTTPS service with an agreed operating budget.
2. Configure a dedicated akilii agent and isolated storage. Do not mount André’s personal FlowState configuration or tools.
3. Authenticate the backend to the service; verify actual cookie/CSRF or machine-gateway behaviour rather than assuming an API-key contract.
4. Bind every run, session, connection and scoped tool credential to the authenticated akilii user. Prove two-user isolation and revocation.
5. Disable mention-based agent switching and broad filesystem/shell tools unless explicitly authorised by application policy.
6. Resolve cancellation: upstream ephemeral dispatch uses context.WithoutCancel. HTTP abort alone is insufficient proof that tool work stopped.
7. Forward only approved, bounded context. Emit durable run events, proposed actions and receipts; reconcile uncertain external outcomes without blind retries.
8. Verify two real tool workflows against test accounts, including disconnect, expired approval, stale Work version and provider outage.

## MCP delivery

The implemented internal Work JSON-RPC transport offers work_list and work_propose_version after explicit connection opt-in. It does not expose work execution as a model tool. Approval remains an authenticated UI action with a durable receipt. Third-party MCP OAuth and automatic chat invocation are not enabled yet.

For Drive/Calendar, request separate minimal scopes, store refresh tokens server-side encrypted, recheck consent before each tool call, and revoke immediately on disconnect. Google login scopes do not authorise access to these services. Start with read-only selection; add write proposals only after preview, approval, idempotency and reconciliation are verified.
