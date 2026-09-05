# akilii: a capable, neuroinclusive companion

Product direction from André, 5 September 2026: the presence and practical assistance of JARVIS, EDITH and FRIDAY, expressed as akilii’s own identity. Product owner: André; engineering owner: George.

## The experience contract

Orient → understand the desired outcome → agree a next step → help carry it out → reflect on what helped. Adapt voice, pacing, layout and detail to explicit preferences and the current situation. Being proactive means making relevant offers and carrying out scoped permissions, not covert observation or psychological classification. Emotional warmth must coexist with honest limits and user control.

The maiden voyage starts with an optional voice conversation or typing. Ask one question at a time about name, responsibilities, objective, obstacles and helpful ways of working. A proposal opens an editable review. Only reviewed choices become workspace context. The saved conversation is evidence of what was said, not proof that every model interpretation is true.

Example: an ED&I officer wants an Excel command centre. Clarify project portfolio, stakeholders, reporting decisions, deadlines and what makes maintaining it difficult. Co-design the smallest useful tracker, offer a first work session, and later ask whether its structure helped. Never assume that example describes every user.

## Personal context vault: current and next

Current storage: private profile, role/objective/needs/preferences, approved memories, reviewed document excerpts, saved conversations and Work. Voice proposals do not silently write to it. Users can edit, remove or export their saved context.

Next evidence model: each proposed observation needs source references, user confirmation, scope (work/activity/general), date, review date, and supersession/revocation. Distinguish user statements, documentary statements and agent hypotheses. An agent may suggest a working preference, but no diagnostic or psychometric score is established by conversation. Context selection should be bounded by task relevance and user control.

## FlowState findings and integration sequence

Reviewed running local service and source feature/dockerise at 40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d. Health at 127.0.0.1:8081 succeeds. This is a local installation, not an internet-accessible backend for the hosted beta. Existing adapter translates /api/chat SSE. The engine detaches ephemeral dispatch from HTTP cancellation, and permission waits can also outlive the request. Closing a browser stream is not proof of cancellation.

The first hosted slice should be one dedicated akilii agent in an isolated deployment, with no personal configuration mounts and no shell/filesystem or mention-based agent switching. Put an authenticated gateway in front. Derive user/session identity from verified Supabase credentials, never a browser-supplied actor ID. Forward selected context, not the whole vault. Maintain owner-bound run/event records in Supabase. Persist upstream run IDs and implement explicit cancellation with acknowledgement; unresolved cancellation is displayed as uncertain.

First tools: read the user's approved Work/project context and propose a Work revision. Existing approval UI remains the only execution path. Next: reviewed Outlook draft and To Do task, with per-user delegated credentials, idempotency and provider receipts. Do not send Graph tokens to an LLM. Voice tool proposals use the same action preview as text; speech alone must not bypass it.

Before public connection: provision HTTPS hosting and budget, verify machine authentication, two-user isolation, token revocation, bounded execution, cancellation, and two real tool workflows. Until those pass, the beta stays on the direct provider and explicitly reports FlowState unavailable. Hosting and the cancellation contract are the remaining external/runtime decisions, not an icon or model-selection toggle.

## Evaluation

Measure whether users reach a useful first deliverable, understand and correct saved context, recover from interruption, and complete a second activity with less setup. Record task success and user feedback rather than invented NPR scores. Test overload-sensitive pacing, ambiguous goals, changes in preference, unavailable tools, denied permissions and conflicting documentary evidence.
