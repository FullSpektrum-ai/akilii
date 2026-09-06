# Authentication hardening — implementation and activation gates

## Implemented in source
- Shared email-code form, Google/Microsoft icon buttons and capability-based availability.
- Desktop account-free setup without an installed model. Model-dependent AI remains unavailable until Ollama/model installation.
- Email and Microsoft desktop transport through the authenticated loopback host; credentials remain outside renderer storage.
- Provider allowlist, PKCE/state validation, bounded request bodies, code validation and resend cooldown.
- Sign-out clears the local session immediately, requests remote revocation and prevents a late verification from restoring it.
- Backend accepts verified email/Google/Microsoft identities while retaining session checks and private-beta invitation ownership. First invitation binding is atomic.
- Desktop regression tests included in CI.

## Activation still required
Email: advancedthinking.co added to Resend in Ireland. Approved DKIM and two CNAME records are published. Resend has verified the domain. A domain-scoped sending credential is stored in Supabase SMTP (465/TLS, signin@advancedthinking.co). Both Magic Link and confirmation templates now contain {{ .Token }}. Resend confirmed the authorised test email delivered on 6 September 2026; emailOtpReady is enabled for the review build. Human completion of the emailed code on both clients remains an acceptance check. Never commit SMTP credentials.

Microsoft: existing application ed108868-454a-43be-aa52-d668251dfbbb in Advanced Thinking Ltd (89384385-e85a-4ed4-b883-72bf6f17e510). The server callback https://xmesqilkgeaoqrxbooqe.supabase.co/auth/v1/callback is saved and verified. Need a server credential in Supabase, supported-account review and xms_edov/email claims before activation. Preserve the existing SPA connector callback and request only email for sign-in. Inbox/calendar/task scopes remain separate.

## Verification recorded
32 application tests; 16 desktop tests; synthetic phone-sized authentication test including invalid-code retry and no horizontal overflow. Production dependency audit reported no known production vulnerabilities at this check. These tests do not establish email delivery, Microsoft consent completion, native Windows execution or full beta readiness.

## Remaining beta gates
Authenticated live sign-in for each enabled provider on web and desktop; invitation rejection and account isolation; sign-out/restart; delivery limits, expired codes and recovery; signed native distribution; external connector and FlowState acceptance. No automatic migration or linking of existing different user IDs.

References: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/social-login/auth-azure
