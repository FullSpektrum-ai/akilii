# Production domain and rollback

The production application origin is `https://akilii.fullspektrum.ai`, with base path `/`.
The corporate website remains at `https://fullspektrum.ai`; its proposed product entry is `/akilii`.

## Hosting

- GoDaddy DNS: CNAME `akilii` → `fullspektrum-ai.github.io`, saved TTL 3600 seconds.
- GitHub repository Settings → Pages: custom domain `akilii.fullspektrum.ai`; enforce HTTPS after certificate issuance.
- The existing Actions workflow publishes `dist/web`. A CNAME file in this artifact is ignored by GitHub and does not configure the domain.
- The original GitHub Pages URL redirects to the custom domain while configured; it is not an independent preview deployment.

## Auth and API

- Supabase project: `xmesqilkgeaoqrxbooqe`.
- Allow exact redirect URLs `https://akilii.fullspektrum.ai/` and `https://fullspektrum-ai.github.io/akilii/`; retain the existing `https://fullspektrum.ai/akilii/` entry.
- Set the Supabase Site URL to `https://akilii.fullspektrum.ai/` once HTTPS is ready.
- Google and Azure Supabase sign-in return through `https://xmesqilkgeaoqrxbooqe.supabase.co/auth/v1/callback`; moving the frontend does not change that provider callback.
- The separate Microsoft 365 SPA connector needs `https://akilii.fullspektrum.ai/microsoft-redirect.html` added to app `ed108868-454a-43be-aa52-d668251dfbbb`, preserving its existing redirect URIs.
- Edge Function `akilii-api` must allow `https://akilii.fullspektrum.ai` in addition to all existing origins. It continues to validate sessions and enforce beta access.

## Rollback

The pre-cutover beta source is preserved in branch `rollback/beta-before-custom-domain-20260907`, commit `f0679c0590b1c0193a387ba4c39b00fbc957cced`. Its successful Pages workflow run is `34092697607`, deployment `6303514119`. The original Pages artifact and live backend version 26 were downloaded before cutover.

To restore the original beta URL, remove the custom domain in Pages settings, ensure HTTPS enforcement for the GitHub URL, and restore the saved artifact or run the Pages workflow from the rollback branch if necessary. Set Supabase Site URL to `https://fullspektrum-ai.github.io/akilii/` and retain that exact redirect URL. Remove the new `akilii` DNS CNAME if abandoning this hostname. Do not change the apex website or other DNS records.

The backend was patched from live version 26 to preserve production changes not yet present in this repository. Only the new origin was added. Do not redeploy the repository's older backend as part of a frontend rollback; restoring live version 26 is optional because the additive origin change preserves beta compatibility.

## Verification

Check authoritative/public DNS, HTTPS certificate validation, root HTML and assets, storyboard, Microsoft callback and desktop return pages. Check API OPTIONS for production and beta origins (204), unknown origins (403), and unauthenticated protected requests (401). Complete interactive sign-in and Microsoft consent separately before claiming those flows verified.
