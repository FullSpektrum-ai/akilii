# akilii alpha.9 runtime matrix

This is the current operational statement for alpha.9. Historical documents may
describe earlier or proposed states; they do not override this matrix.

| Experience | Current implementation | What is proven | What is not proven |
|---|---|---|---|
| Local web review | Shared akilii shell, synthetic identity and in-memory data | Clean build and automated behaviour | Production identity, persistence or deployment |
| Hosted web | Shared shell with Supabase and direct OpenAI/Anthropic adapters | Source and provider contract tests | Current deployment health and complete live journey |
| Desktop cloud | Shared shell through authenticated local host to cloud API | Host, authentication and proxy tests | Signed release and complete live provider journey |
| Desktop local | Shared shell, SQLite and installed Ollama models | Persistence, isolation and local-provider tests | Performance across representative machines |
| Desktop hybrid | Explicit choice between cloud and local workspaces | Mode boundary tests | Automatic synchronisation or automatic routing; neither is claimed |
| Local FlowState review | Bounded adapter and authenticated service inspection | Adapter, CSRF, origin and session contract tests | Production qualification and universal desktop execution |
| Hosted FlowState | Proposed private service boundary | Prior infrastructure preparation only | Current health, TLS, authentication, isolation and end-to-end application use |
| Specialist agents and swarms | Source-controlled staged manifests | Presence and bounded configuration | User-value evidence, production routing or autonomous operation |
| Responsive browser experience | Shared phone shell and narrow-width checks | 320, 390 and 430 CSS-pixel fixtures | Native iOS/Android application behaviour |
| Native mobile | No retained mobile project in this checkout | Nothing beyond reusable shell/API foundations | Compilation, sign-in, secure storage, native voice, signing or distribution |

## Product boundary

The person interacts with one akilii application. FlowState, provider adapters,
specialists and other execution components remain replaceable implementation
details. akilii owns identity, consent, context, Work, approvals, outcomes and
receipts.

The active MVP must not claim background autonomy, automatic psychological
assessment, silent context learning, automatic local/cloud synchronisation or a
completed native mobile product.

## Qualification language

Use these terms consistently:

- **Implemented:** source and tests exist.
- **Locally demonstrated:** a named local configuration completed the journey.
- **Production-qualified:** the deployed target completed its acceptance checks.
- **Staged:** source exists but is not part of the default user path.
- **Proposed:** design or documentation exists without an accepted implementation.

Passing an adapter test or packaging a binary is not production qualification.
