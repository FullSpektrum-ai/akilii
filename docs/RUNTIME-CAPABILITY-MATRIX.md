# akilii runtime capability matrix

Status: **re-baseline operating contract**

The product must expose one set of domain semantics while being honest about runtime capability differences. Desktop local mode is not required to pretend it can do everything cloud mode can do. Unsupported capability is gated explicitly; it is never simulated.

| Capability | Web cloud | Desktop cloud | Desktop local | Hybrid workspace |
| --- | --- | --- | --- | --- |
| Identity / sign-in | Supabase Auth | Cloud session through desktop host | Local workspace identity only | Explicitly chosen per workspace |
| Canonical product contracts | `app/core` | `app/core` | `app/core` | Same contracts |
| Application use-cases | `app/api` | `app/api` via cloud service | `app/api` via local adapters | Explicit route, never automatic |
| Canonical storage | Postgres / Supabase | Postgres / Supabase | SQLite | Separate stores; no implicit merge |
| Personal context / NPR | Governed repository + RLS | Governed cloud repository | Governed SQLite repository | User selects which workspace/context boundary applies |
| Context Projection | Shared deterministic core | Shared deterministic core | Shared deterministic core | Shared core after workspace selection |
| SupportProfile | Shared deterministic core | Shared deterministic core | Shared deterministic core | Shared core |
| Chat provider | Server-selected OpenAI / Anthropic adapter | Same cloud API/provider path | Local provider adapter, currently Ollama-capable | Selected by workspace, not auto-routed |
| Voice | Cloud realtime adapter where enabled | Cloud realtime adapter where enabled | **Not assumed supported** until a local voice adapter is qualified | Capability-gated |
| Conversation history | Cloud repository | Cloud repository | SQLite repository | No automatic cross-store sync |
| Thread / Work | Cloud repository | Cloud repository | SQLite repository | No automatic cross-store sync |
| Episodes / outcomes | Cloud repository | Cloud repository | SQLite repository | Same domain contract, separate persistence |
| Connectors / external accounts | Explicit cloud capabilities only | Explicit cloud capabilities only | **Unavailable unless a local adapter is explicitly installed and permitted** | Never silently bridged |
| Consequential external actions | Human approval + tool/runtime receipt | Human approval + tool/runtime receipt | Human approval + qualified local tool adapter | Never inferred from mode |
| FlowState | **Unqualified / no production traffic** | **Unqualified / no production traffic** | Research/probe only until qualification | Engine behind FS boundary only after qualification |
| Runtime memory / recall | Ephemeral runtime concern | Ephemeral runtime concern | Ephemeral runtime concern | Never canonical NPR |
| Export / delete | Must include all canonical + migration-window legacy user data | Same cloud contract | Local export/delete must cover SQLite workspace data | Per-store operation; no fictional global completion |
| Telemetry | Operational only; no hidden personal profile | Operational only | Local operational telemetry only where explicitly enabled | No automatic cross-mode telemetry identity merge |

## Rules

### One product, multiple hosts

The product meaning lives in `app/core` and `app/api`. Web, Supabase and Electron are hosts/adapters. A host may expose fewer capabilities, but it cannot redefine Thread, Work, NPR, outcome or conversation semantics.

### No automatic hybrid sync

`Hybrid` means the user can deliberately choose a local or cloud workspace/runtime. It does **not** mean automatic local/cloud routing, reconciliation or personal-context synchronization. Cross-store sync is a separate future product capability with its own conflict, consent and deletion contracts.

### Capability gates are explicit

If a capability is not qualified in a runtime, the UI must state that it is unavailable in that workspace. It must not fake success, fabricate progress, silently proxy through another mode, or downgrade privacy expectations without user choice.

### FlowState remains behind the FS boundary

FlowState may become the first execution engine after qualification, but product state receives an engine-neutral `ExecutionSpec`. No FlowState manifest, swarm topology, session object or recall memory becomes canonical product/NPR state.

### Voice and text share intelligence

Voice is a modality adapter, not a separate assistant. Both modalities consume the same bounded Context Projection, SupportProfile and ConversationPolicy. Voice may alter turn length, pacing and interruption handling; it may not invent a different model of the person.

## Migration window

During the re-baseline, current production routes remain live until their replacement slice passes acceptance tests. Legacy `memories`, old Thread-rating `outcomes`, current desktop host routes and the concatenated web bundle are migration sources only. Their existence does not make them future architecture authority.
