# Phase 8.2 conversational demo

The normal Mac launch now installs the floating composer without requiring the Phase 8 feature flag. The shell displays Build 0.1.0-phase8.2. Empty input shows an enabled waveform opening voice choices; typed input shows Send. A separate 24px microphone keeps voice accessible with a draft.

## Demo path

1. Launch the Mac app and check its build label. Select the synthetic demo for provider-free review.
2. Choose a domain story and Start flagship story. Select Talk this through on a GenUI card: it prepares a contextual question without sending or overwriting an existing draft.
3. Choose Adjust my workspace, or type that exact request. Answer guided questions by text or supported browser speech recognition. Review all changes and explicitly confirm. Demo changes remain session-only.
4. Use the composer voice button. Guided workspace conversation works with text fallback. Full live voice supports typed turns alongside speech and Review what to keep, which opens editable notes followed by the existing Work proposal/approval flow.
5. Change the support approach or objective through the same guided review boundary.

## Verification and limits

94 automated tests passed, including confirmation boundaries, mocked speech, typed realtime transcript deduplication, default composer installation and desktop audio permission policy. Web, shared desktop and both unsigned Mac packages build successfully. Browser inspection confirms a 24px microphone and enabled waveform on empty input.

Live provider audio and native microphone permission have not been tested end-to-end. Live AI voice requires the configured cloud service and is unavailable in synthetic/local model mode; guided browser recognition depends on platform support and can use its speech service. Text and system dictation remain available. No automatic NPR learning or inferred preference persistence was added. Free-form AI-driven changes outside these guided entry points are not implemented. Notes review includes up to 14,000 characters; the completed transcript remains in Chat.

Mac packages are unsigned review builds, not notarised releases. iOS and Android sources are prepared for George; compilation and signing remain deferred by request. No website or GitHub publication occurred in this pass.
