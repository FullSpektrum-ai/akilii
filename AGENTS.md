# akilii development

André owns product, design and acceptance; George owns engineering and technical acceptance. Use lowercase akilii.

This repository now contains the working early-access Worker application, replacing the older Figma Make scaffold. Read README.md before changes. Source lives in src/, canonical assets in assets/, semantic tokens in theme-tokens.json. Generated HTML, document bundles and dist/ are rebuilt, not edited.

Run npm ci, npm run build and npm test with Node 24. Never copy .env.local or credentials into source. The local server uses synthetic identity and an in-memory database; it must never be deployed as production authentication.

Supabase is the Google-enabled beta backend; Sites remains a separate older identity/database deployment. Do not apply the SQLite Drizzle migrations to Postgres. Preserve applied remote schema and existing user data. Keep Google SSO and FlowState labelled unavailable until real integration tests pass.
